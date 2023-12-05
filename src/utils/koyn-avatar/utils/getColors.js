/**
 * Do not change this file manually! This file was generated with the "Dicebear Exporter"-Plugin for Figma.
 *
 * Plugin: https://www.figma.com/community/plugin/1005765655729342787
 */
import { convertColor } from './convertColor.js';
export function getColors({ prng, options }) {
    var _a;
    return {
        'face': convertColor(prng.pick((_a = options.faceColor) !== null && _a !== void 0 ? _a : [], 'transparent')),
    };
}
;
