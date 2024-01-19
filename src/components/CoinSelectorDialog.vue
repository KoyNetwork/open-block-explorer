<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { Token } from 'src/types';

export default defineComponent({
    name: 'CoinSelectorDialog',
    props: {
        availableTokens: {
            required: true,
            type: Array as PropType<Token[]>,
        },
        updateSelectedCoin: {
            type: Function,
            required: true,
        },
    },
    setup(props) {
        const search = ref('');
        const filteredTokens = ref<Token[]>([]);

        const filterTokens = () => {
            if (search.value.length > 0) {
                filterByText(tokensWithBalance());
            } else {
                filteredTokens.value = tokensWithBalance();
            }
        };

        const filterByText = (tokens: Token[]) => {
            filteredTokens.value = tokens.filter(token => (
                token.symbol.toLowerCase().includes(search.value.toLowerCase()) ||
                token.contract.toLowerCase().includes(search.value.toLowerCase())
            ));
        };

        const tokensWithBalance = () => props.availableTokens.filter(token => token.amount > 0);

        watch(search, () => {
            void filterTokens();
        });

        return {
            search,
            filteredTokens,
            filterTokens,
            filterByText,
        };
    },
});
</script>

<template>

<q-dialog class="dialogContainer" @show="filterTokens">
    <q-card class="q-pa-md dialogCard">
        <div class="q-mb-md dialogHeader">
            <div class="row justify-between items-center q-mb-sm">
                <div class="text-h6">Select a token</div>
                <q-btn
                    v-close-popup
                    size="12px"
                    dense
                    flat
                    icon="clear"
                />
            </div>
            <q-input
                v-model="search"
                debounce="500"
                outlined
                dark
                round
                placeholder="Search contract name or symbol"
                class="full-width"
            />
        </div>
        <q-separator/>
        <q-list class="dialogList">
            <q-item
                v-for="token in filteredTokens"
                :key="`${token.contract}-${token.symbol}`"
                v-close-popup
                clickable
                class="flex justify-between full-width"
                @click="updateSelectedCoin(token);"
            >
                <q-item-section>
                    <q-item-label>{{ token.symbol }}</q-item-label>
                    <q-item-label>{{ token.contract }}</q-item-label>
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-right">{{ token.amount }}</q-item-label>
                </q-item-section>
            </q-item>
            <q-item v-if="availableTokens.length == 0">No tokens found</q-item>
        </q-list>
    </q-card>
</q-dialog>
</template>

<style lang="sass" scoped>

.addToken
  text-decoration: underline
  cursor: pointer

.dialogCard
  background-image: linear-gradient(to left, var(--q-color-background), var(--q-color-background)), var(--q-color-background-gradient)
  color: white
  min-height: 50vh

  // Hide scrollbar for Chrome, Safari and Opera
  &::-webkit-scrollbar
    display: none

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none // IE and Edge
  scrollbar-width: none // Firefox

.dialogHeader
  position: sticky
  position: -webkit-sticky
  top: 0
  z-index: 1
  min-width: 290px

.dialogList
  z-index: -1
</style>
