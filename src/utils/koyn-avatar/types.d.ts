/**
 * Do not change this file manually! This file was generated with the "Dicebear Exporter"-Plugin for Figma.
 *
 * Plugin: https://www.figma.com/community/plugin/1005765655729342787
 */
export interface Options {
    face?: ('square')[];
    misc?: ('freckles1' | 'bindi' | 'halo' | 'bandage' | 'freckles2' | 'freckles3' | 'freckles4')[];
    miscProbability?: number;
    mouth?: ('fangs' | 'tongueUp' | 'sad1' | 'zipper' | 'wavy2' | 'wavy' | 'pursed' | 'teeth' | 'bigO' | 'smallO' | 'wideSmile2' | 'wideSmile' | 'tongue4' | 'largeChin' | 'oval' | 'smileLg' | 'meh2' | 'confounded' | 'happy' | 'sad2' | 'yen' | 'pound' | 'mildySad' | 'tongue1' | 'toxicMask' | 'meh' | 'tongue2' | 'smile1' | 'blush1' | 'subtleSmile' | 'clown')[];
    eyes?: ('horns' | 'eyebrows6' | 'eyebrows5' | 'eyebrows4' | 'round' | 'sad' | 'relaxed' | 'dizzy' | 'winkWavy' | 'surprise' | 'dead1' | 'babySad' | 'coldSweat' | 'wink' | 'questioning' | 'dots' | 'squinty' | 'happy' | 'eyepatch' | 'alien' | 'redLaser2' | 'glassesShade2' | 'glassesXl' | 'underwater' | 'winter' | 'sportGlasses' | 'glassesShadeRect' | 'squinting' | 'kOYN' | 'pinkGlasses2' | 'pinkGlasses' | 'euro' | 'dollarSign' | 'anim1' | 'btc1' | 'happy1' | 'redLaser' | 'baby' | 'btc2' | 'bigEyes' | 'eyebrows1' | 'eyebrows2' | 'eyebrows3' | 'dead2' | 'triangle' | 'three3' | 'three4' | 'three5' | 'smallerCartoon' | 'three1' | 'threeGlasses2' | 'three2')[];
    misc2?: ('palms' | 'frame2' | 'frame1' | 'borderKenya' | 'borderNigeria' | 'borderSouthafrica')[];
    misc2Probability?: number;
    faceColor?: string[];
    backgroundColor?: string[];
}
export type ColorPickCollection = Record<string, string>;
export type ComponentGroup = Record<string, ComponentGroupItem>;
export type ComponentGroupCollection = Record<string, ComponentGroup>;
export type ComponentGroupItem = (components: ComponentPickCollection, colors: ColorPickCollection) => string;
export type ComponentPickCollection = Record<string, ComponentPick>;
export type ComponentPick = {
    name: string;
    value: ComponentGroupItem;
} | undefined;
