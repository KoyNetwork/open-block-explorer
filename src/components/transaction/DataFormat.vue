<script lang="ts">
import { defineComponent, ref, watch, toRefs, computed, onUpdated, toRaw } from 'vue';
import { TransferData } from 'src/types';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';
import PrettyPayload from 'src/components/transaction/PrettyPayload.vue';
import NumberFormat from 'src/components/NumberFormat.vue';

export default defineComponent({
    name: 'DataFormat',
    components: { AccountFormat, PrettyPayload, NumberFormat },
    props: {
        actionName: {
            type: String,
            required: true,
        },
        actionData: {
            type: Object,
            required: true,
        },
        useColor: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const { actionName, actionData } = toRefs(props);
        const dataBox = ref<null | HTMLElement>(null);
        const showOverflow = ref(false);
        const isOverflowing = ref(false);
        const transferData = computed(() => actionData.value as TransferData);
        const clientHeight = computed(() => dataBox.value?.clientHeight ?? 0);
        let currentData = ref<string | unknown>(null);
        const maxHeight = 120; // the maximum row height
        const switchHeight = 20;
        const maxHeightStyle = `calc(${maxHeight}px - ${switchHeight}px)`;

        function compareJsonObjects(obj1: unknown, obj2: unknown): boolean {
            if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
                return false;
            }

            const objectOne = obj1 as Record<string, unknown>;
            const objectTwo = obj2 as Record<string, unknown>;

            for (const key of Object.keys(obj1)) {
                if (!objectOne[key]) {
                    // this is an empty key
                    // sometimes the answer includes them, sometimes it doesn't
                    // so we won't compare them
                    continue;
                }

                if (typeof objectOne[key] !== typeof objectTwo[key]) {
                    return false;
                }

                if (typeof objectOne[key] === 'object') {
                    if (!compareJsonObjects(objectOne[key], objectTwo[key])) {
                        return false;
                    }
                } else {
                    if (objectOne[key] !== objectTwo[key]) {
                        return false;
                    }
                }
            }

            return true;
        }

        function formatGeneralData(data: unknown): unknown {
            if (currentData.value === null) {
                currentData.value = data;
                return currentData.value;
            }
            return compareJsonObjects(toRaw(currentData.value), data) ? currentData.value : data;
        }

        function formatQuantity(quantity: string) : string {
            // Removes symbol from string
            return quantity.split(' ')[0];
        }

        function updateOverflowing() {
            isOverflowing.value = (dataBox.value?.clientHeight ?? 0) > maxHeight;
        }

        watch([actionData, clientHeight], () => {
            updateOverflowing();
        });

        onUpdated(() => {
            updateOverflowing();
        });

        function toggleOverflow() {
            showOverflow.value = !showOverflow.value;
        }

        return {
            currentData,
            transferData,
            name: actionName,
            formatGeneralData,
            dataBox,
            isOverflowing,
            showOverflow,
            toggleOverflow,
            maxHeightStyle,
            formatQuantity,
        };
    },
});
</script>

<template>
<div
    class="relative-position"
    :class="{'div-compressed': !showOverflow}"
>
    <div v-if="actionName === 'transfer'" ref="dataBox" class="column full-height">
        <div class="items-center row q-gutter-sm">
            <span class="text-bold">
                <AccountFormat :account="transferData.from" type="account"/>
            </span>
            <span class="q-ma-none"> &nbsp; → &nbsp; </span>
            <span class="text-bold">
                <AccountFormat :account="transferData.to" type="account">&nbsp;</AccountFormat>
            </span>
            <span class="text-bold q-mt-none"><NumberFormat :valueToFormat="formatQuantity(String(transferData.quantity))"/></span>        </div>
        <div class="row ">
            <div class="text-weight-bold">
                memo:&nbsp;<span v-if="transferData.memo" class="text-weight-regular">{{ transferData.memo }}</span><span v-else class="text-weight-regular">n/a</span>
            </div>
        </div>
    </div>
    <div v-else ref="dataBox" class="col-12">
        <PrettyPayload :depth="0" :payload="formatGeneralData(actionData)"/>
    </div>
    <q-btn
        v-if="isOverflowing"
        flat
        size="xs"
        :icon="showOverflow ? 'expand_less' : 'expand_more'"
        :class="{ 'q-btn--use-color': useColor, 'full-width': showOverflow, 'q-btn--floating': !showOverflow }"
        @click="toggleOverflow"
    />
</div>
</template>

<style lang="sass" scoped>
.q-btn
    color: var(--q-primary)
    &--floating
        position: absolute
        bottom: 0
        right: 0
        left: 0
    &--use-color
        background: linear-gradient(0deg, #f3effbff 0%, #f3effbaa 40%, #f3effb77 80%, #f3effb33 100%)

.div-compressed
    max-height: v-bind(maxHeightStyle)

</style>
