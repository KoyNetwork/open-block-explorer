<script lang="ts">
import { defineComponent, computed } from 'vue';
import ConfigManager from 'src/config/ConfigManager';

export default defineComponent({
    name: 'NumberFormat',
    props: {
        valueToFormat: {
            type: Number ||  String, // TODO: Allow only numbers, requires refactor
            required: true,
        },
        showSymbol: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const precision = ConfigManager.get().getCurrentChain().getSystemToken().precision;
        const symbol = props.showSymbol ? ConfigManager.get().getCurrentChain().getSystemToken().symbol : '';
        const totalNumber = computed(() => typeof props.valueToFormat === 'string' ? Number(props.valueToFormat) : props.valueToFormat);
        const fractionPart = computed(() => totalNumber.value.toFixed(precision).toString().split('.')[1]);
        const integerPart = computed(() => Math.floor(totalNumber.value).toLocaleString('en'));

        return {
            integerPart,
            fractionPart,
            totalNumber,
            symbol,
        };
    },
});
</script>

<template>
<span>
    <span>{{ integerPart }}</span>
    <span v-show="totalNumber > 0" class="lower-opacity">.{{ fractionPart }}</span>
    <span v-show="symbol !== ''">{{ ' ' + symbol }}</span>
</span>
</template>
<style lang="sass" scoped>
.lower-opacity
    opacity: 0.6
</style>
