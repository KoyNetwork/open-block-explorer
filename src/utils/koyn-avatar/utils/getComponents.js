/**
 * Do not change this file manually! This file was generated with the "Dicebear Exporter"-Plugin for Figma.
 *
 * Plugin: https://www.figma.com/community/plugin/1005765655729342787
 */
import { pickComponent } from './pickComponent.js';
export function getComponents({ prng, options }) {
    const faceComponent = pickComponent({
        prng,
        group: 'face',
        values: options.face,
    });
    const miscComponent = pickComponent({
        prng,
        group: 'misc',
        values: options.misc,
    });
    const mouthComponent = pickComponent({
        prng,
        group: 'mouth',
        values: options.mouth,
    });
    const eyesComponent = pickComponent({
        prng,
        group: 'eyes',
        values: options.eyes,
    });
    const misc2Component = pickComponent({
        prng,
        group: 'misc2',
        values: options.misc2,
    });
    return {
        'face': faceComponent,
        'misc': prng.bool(options.miscProbability) ? miscComponent : undefined,
        'mouth': mouthComponent,
        'eyes': eyesComponent,
        'misc2': prng.bool(options.misc2Probability) ? misc2Component : undefined,
    };
}
;
