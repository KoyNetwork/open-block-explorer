<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed } from 'vue';
import 'vue3-openlayers/dist/vue3-openlayers.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import { easeOut } from 'ol/easing';
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';
import { BP } from 'src/types';
import VectorImageLayer from 'ol/layer/VectorImage';
import { getCssVar } from 'quasar';
import { useChainStore } from 'src/stores/chain';
import { mapActions } from 'pinia';
import { KoyBP } from 'src/types/BP';

export default defineComponent({
    name: 'WorldMap',
    components: {
        Map,
        View
    },
    setup() {
        const chainStore = useChainStore();
        const center = ref([40, 40]);
        const projection = ref('EPSG:4326');
        const zoom = ref(8);
        const rotation = ref(0);
        const producerToggle = ref<boolean>(Boolean(Number(localStorage.getItem('mapBP-toggle'))));
        const BPlist = computed((): KoyBP[] => chainStore.bpList);
        const currentBp = ref(0);
        const schedule = computed(
            (): string[] => chainStore.producerSchedule
        );
        const HeadProducer = computed(
            (): string => chainStore.head_block_producer
        );
        const currentHeadProducer = ref<string>('');
        function updateToggleOption(val: boolean) {
            localStorage.setItem('mapBP-toggle', Number(val).toString());
        }
        return {
            center,
            projection,
            zoom,
            rotation,
            BPlist,
            currentBp,
            HeadProducer,
            currentHeadProducer,
            schedule,
            producerToggle,
            updateToggleOption,
            chainStore,
        };
    },
    data() {
        return {
            map: null,
            flashGeom: null,
            listenerKey: null,
            duration: 2600,
            MapSource: null
        };
    },
    async mounted() {
        this.chainStore.updateBpList();
        await setTimeout(null, 1000);
        
        // ---- Map Styles ----
        const style = new Style({
            image: new CircleStyle({
                fill: new Fill({
                    color: getCssVar('primary')
                }),
                radius: 5
            }),
            fill: new Fill({
                color: getCssVar('color-map')
            }),
            stroke: new Stroke({
                color: getCssVar('color-map'),
                width: 1
            }),
            zIndex: 50
        });

        // BP location feature style with zIndex biggetr that map
        const producerStyle = new Style({
            image: new CircleStyle({
                fill: new Fill({
                    color: '#8276d2'
                }),
                stroke: new Stroke({
                    color: '#63C9EF',
                    width: 3
                }),
                radius: 5
            }),
            zIndex: 51
        });

        const top21Style = new Style({
            image: new CircleStyle({
                fill: new Fill({
                    color: '#8276d2'
                }),
                stroke: new Stroke({
                    color: '#FFFFFF',
                    width: 3
                }),
                radius: 5
            }),
            zIndex: 51
        });

        // Map source uses vectorLayer with vector source
        const source = new VectorSource({
            wrapX: false,
            url: 'https://openlayers.org/data/vector/ecoregions.json',
            format: new GeoJSON()
        });

        const vectorLayer = new VectorImageLayer({
            imageRatio: 1,
            source: source,
            style: style
        });

        const vectorSource = new VectorSource({
            wrapX: false
        });

        const vector = new VectorLayer({
            source: vectorSource
        });

        // ---- Overlay ----
        const container = this.$refs['popup'] as any;
        const content = this.$refs['popup-content'] as any;
        const closer = this.$refs['popup-closer'] as any;

        const producerContainer = this.$refs['producerPopup'] as any;
        const producerContent = this.$refs['producerPopup-content'] as any;
        const producerCloser = this.$refs['producerPopup-closer'] as any;

        const overlay = new Overlay({
            element: container,
            autoPan: {
                animation: {
                    duration: 250
                }
            }
        });

        const producerOverlay = new Overlay({  
            element: producerContainer
        });

        closer.onclick = function () {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };

        producerCloser.onclick = function () {
            producerOverlay.setPosition(undefined);
            producerCloser.blur();
            return false;
        };
        // ---- Overlay ----

        // ---- Map ----
        const map = new Map({
            layers: [vectorLayer, vector],
            overlays: [overlay, producerOverlay],
            target: 'map',
            view: new View({
                center: fromLonLat([25, 0]),
                zoom: 3
            }),
            controls: [],
            interactions: []
        });

        let selected = null as any;

        // Track mouse click and detect collisions with BP features for mobile
        map.on('singleclick', (evt) => {
            // Clear overlay when no collision
            if (
                selected !== null &&
                selected.getProperties().type &&
                selected.getProperties().type === 'bp'
            ) {
                overlay.setPosition(undefined);
                closer.blur();
                content.innerHTML = '&nbsp;';
                selected = null;
            }

            // Assign selected when collision occurs
            map.forEachFeatureAtPixel(evt.pixel, function (f) {
                if (f.getProperties().type && f.getProperties().type === 'bp') {
                    selected = f;
                }
            });

            // Check if it is a BP collision, as countries are also features and have to be filtered.
            if (
                selected &&
                selected.getProperties().type &&
                selected.getProperties().type === 'bp'
            ) {
                content.innerHTML =
                    
                    '<div class="owner-text text-h6 text-center text-uppercase">' +
                    selected.getId() +
                    '</div>' +
                    '<div class="country-text text-subtitle1 text-center">' +
                    selected.getProperties().country +
                    '</div>';
                overlay.setPosition(selected.getGeometry().getCoordinates());
            } else {
                // Clear overlay if is not BP collision
                content.innerHTML = '&nbsp;';
            }
        });

        // Track mouse pointer and detect collisions with BP features
        map.on('pointermove', (e) => {
            // Clear overlay when no collision
            if (
                selected !== null &&
                selected.getProperties().type &&
                selected.getProperties().type === 'bp'
            ) {
                overlay.setPosition(undefined);
                closer.blur();
                content.innerHTML = '&nbsp;';
                selected = null;
            }

            // Assign selected when collision occurs
            map.forEachFeatureAtPixel(e.pixel, function (f) {
                if (f.getProperties().type && f.getProperties().type === 'bp') {
                    selected = f;
                }
            });

            // Check if it is a BP collision, as countries are also features and have to be filtered.
            if (
                selected &&
                selected.getProperties().type &&
                selected.getProperties().type === 'bp'
            ) {
                content.innerHTML =
                    
                    '<div class="owner-text text-h6 text-center text-uppercase">' +
                    selected.getId() +
                    '</div>' +
                    '<div class="country-text text-subtitle1 text-center">' +
                    selected.getProperties().country +
                    '</div>';

                overlay.setPosition(selected.getGeometry().getCoordinates());
            } else {
                // Clear overlay if is not BP collision
                content.innerHTML = '&nbsp;';
            }
        });
        // ---- Map ----

        // Add all the BP location features from s3 bucket to map
        function addBP(BPlist: KoyBP[], schedule: string[]) {
            for (const bp of BPlist) {
                if (bp.location) {
                    const x = bp.location.longitude;
                    const y = bp.location.latitude;
                    const geom = new Point(fromLonLat([x, y]));
                    const feature = new Feature(geom);
                    if (schedule.includes(bp.owner)) {
                        feature.setStyle(top21Style);
                    } else {
                        feature.setStyle(style);
                    }
                    feature.setId(bp.owner);
                    feature.setProperties({ type: 'bp', country: bp.location.name });
                    vectorSource.addFeature(feature);
                } else {
                    const x = Math.random() * 360 - 180;
                    const y = Math.random() * 15 - 89;
                    const geom = new Point(fromLonLat([x, y]));
                    const feature = new Feature(geom);
                    if (schedule.includes(bp.owner)) {
                        feature.setStyle(top21Style);
                    } else {
                        feature.setStyle(style);
                    }
                    feature.setId(bp.owner);
                    feature.setProperties({ type: 'bp', country: 'unknown' });
                    vectorSource.addFeature(feature);
                }
            }
        }

        const duration = 2600;
        // Draw the flash animation on the BP feature location
        function flash(feature: any) {
            const start = Date.now();
            const flashGeom = feature.getGeometry().clone();
            const listenerKey = vector.on('postrender', animate);

            function animate(event: any) {
                const frameState = event.frameState;
                const elapsed = frameState.time - start;
                if (elapsed >= duration) {
                    unByKey(listenerKey);
                    return;
                }
                const vectorContext = getVectorContext(event);
                const elapsedRatio = elapsed / duration;
                // radius will be 5 at start and 30 at end.
                const radius = easeOut(elapsedRatio) * 25 + 5;
                const opacity = easeOut(1 - elapsedRatio);

                const style1 = new Style({
                    image: new CircleStyle({
                        radius: radius,
                        stroke: new Stroke({
                            color: getCssVar('primary'),
                            width: 0.25 + opacity
                        })
                    })
                });

                vectorContext.setStyle(style1);
                vectorContext.drawGeometry(flashGeom);
                // tell OpenLayers to continue postrender animation
                map.render();
            }
        }

        // Checks to see if BP has changed and adds flash animation
        const addBPflash = () => {
            const nextProducer = this.currentBp + 1 === this.BPlist.length ? 0 : this.currentBp + 1;
            const newId = this.BPlist[nextProducer].owner;
            let feature = vectorSource.getFeatureById(newId);
            this.MapSource;
            if (feature !== null) {
                flash(feature);
            }
            this.currentBp = nextProducer;
        };

        // on feature add do a flash animation
        vectorSource.on('addfeature', function (e) {
            flash(e.feature);
        });

        // Check BP every half second for changes
        window.setInterval(() => {
            addBPflash();
        }, 2000);

        addBP(this.BPlist, this.schedule);
        this.map = map;
        this.MapSource = source;
    }
});
</script>

<template>

<div class="map-container" id="map" ref="map-root"></div>
<div class="ol-popup" id="popup" ref="popup"><a class="ol-popup-closer" href="#" id="popup-closer" ref="popup-closer" v-show="$q.platform.is.mobile"></a>
  <div id="popup-content" ref="popup-content"></div>
</div>
<div class="ol-popup" id="producerPopup" ref="producerPopup"><a class="ol-popup-closer" href="#" id="producerPopup-closer" ref="producerPopup-closer"></a>
  <div id="producerPopup-content" ref="producerPopup-content"></div>
</div>

</template>

<style lang="sass" scoped>
.my-card
  width: 100%
  max-width: 90%
.map-container
  background-color: var(--q-dark)
  background-repeat: no-repeat
  width: 100%
  height:70vh

.ol-popup
  position: absolute
  background: #707070B3
  box-shadow: 0 1px 4px rgba(0,0,0,0.2)
  padding: 5px
  border-radius: 10px
  bottom: 12px
  left: -50px
  min-width: 200px

.ol-popup:after, .ol-popup:before
  top: 100%
  border: solid transparent
  content: " "
  height: 0
  width: 0
  position: absolute
  pointer-events: none

.ol-popup:before
  border-top-color: #707070B3
  border-width: 11px
  left: 48px
  margin-left: -11px

.ol-popup-closer
  text-decoration: none
  position: absolute
  top: 2px
  right: 8px

.ol-popup-closer:after
  content: "✖"

.owner-text
  color: var(--q-secondary)
  font-family: Actor
  font-size: 13px
  font-weight: 400
  line-height: 5px
  letter-spacing: 0em
  text-align: center

.country-text
  color: var(--q-secondary)
  font-family: Roboto
  font-size: 10px
  font-weight: 400
  line-height: 5px
  letter-spacing: 0em
  text-align: left
.producer-toggle
  right: 0
  z-index: 1

</style>
