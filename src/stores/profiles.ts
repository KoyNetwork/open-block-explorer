import { defineStore } from 'pinia';
import { Profile } from 'src/types/Profile';
import { createAvatar } from '@dicebear/core';
// import * as funEmoji from '@dicebear/fun-emoji';
import * as bottts from '@dicebear/bottts';
import * as koynavatar from 'src/utils/koyn-avatar';
import { api } from 'src/api/index';

export interface ProfilesStateInterface {
    // key is the account
    profiles: Map<string, Profile>;
}

export const useProfileStore = defineStore('profiles', {
    state: (): ProfilesStateInterface => ({
        profiles: new Map<string, Profile>(),
    }),
    getters: {},
    actions: {
        async setProfile(account: string) {
            try {
                const abi = await api.getABI(account);

                const avatar = () =>
                    createAvatar(koynavatar, {
                        seed: account,
                        rotate: 0,
                        radius: 28,
                        clip: true,
                        // backgroundType: ['gradientLinear', 'solid'],
                        backgroundRotation: [10, 350],
                        // translateY: -6,
                    });

                const botAvatar = () =>
                    createAvatar(bottts, {
                        seed: account,
                        radius: 28,
                        rotate: 0,
                        scale: 108,
                        backgroundColor: ['transparent'],
                        translateX: -3,
                        translateY: 3,
                        clip: true,
                        randomizeIds: false,
                        baseColor: [
                            '4369E8',
                            'E72AC7',
                            'E8DA16',
                            '98D4EB',
                            '79CD6C',
                            'EDB7C0',
                            'F0C146',
                            'D9644A',
                            '32A985',
                            'A78DDD',
                            '423FEC',
                            'AFE39C',
                            '8448E5',
                            'C9388F',
                            '42D3F3',
                        ],
                        eyes: [
                            'bulging',
                            'dizzy',
                            'eva',
                            'frame1',
                            'frame2',
                            'glow',
                            'happy',
                            'hearts',
                            'robocop',
                            'round',
                            'roundFrame01',
                            'roundFrame02',
                            'sensor',
                            'shade01',
                        ],
                        face: ['round01', 'round02', 'square01', 'square02', 'square03', 'square04'],
                        mouth: [
                            'bite',
                            'diagram',
                            'grill01',
                            'grill02',
                            'grill03',
                            'smile01',
                            'smile02',
                            'square01',
                            'square02',
                        ],
                        mouthProbability: 80,
                        sides: [
                            'antenna01',
                            'antenna02',
                            'cables01',
                            'cables02',
                            'round',
                            'square',
                            'squareAssymetric',
                        ],
                        sidesProbability: 83,
                        texture: ['grunge01', 'grunge02', 'circuits', 'dots', 'dirty02'],
                        textureProbability: 36,
                        top: [
                            'antenna',
                            'antennaCrooked',
                            'bulb01',
                            'glowingBulb01',
                            'glowingBulb02',
                            'horns',
                            'lights',
                            'pyramid',
                            'radar',
                        ],
                        topProbability: 69,
                    });

                const profile = {
                    account: account,
                    avatar: abi?.abi ? botAvatar().toDataUriSync() : avatar().toDataUriSync(),
                } as Profile;

                this.profiles.set(account, profile);
            } catch (e) {
                console.error(e);
            }
        },
    },
});
