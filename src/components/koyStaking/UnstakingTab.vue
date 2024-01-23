<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { assetToAmount, formatCurrency } from 'src/utils/string-utils';
import { QInput } from 'quasar';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

const chain = getChain();

export default defineComponent({
    name: 'KoyUnstakingTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const openTransaction = ref<boolean>(false);
        const unstakeTokens = ref<string>('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const unstakeInput = ref<QInput>(null);
        const transactionId = computed(
            (): string => accountStore.TransactionId,
        );
        const transactionError = computed(
            () => accountStore.TransactionError,
        );
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const availableToUnstake = computed((): number => accountStore.availableToUnstakeVal);
        const maxUnlend = computed(() => availableToUnstake.value - .0001);

        function formatDec() {
            const precision = chainStore.token.precision;
            if (unstakeTokens.value !== '') {
                unstakeTokens.value = Number(unstakeTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: precision,
                        minimumFractionDigits: precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function unstake() {
            void accountStore.resetTransaction();
            console.log(unstakeInput.value);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
            if ((unstakeInput.value as any).hasError) {
                return;
            }
            await accountStore.unstakeKoy({
                amount: unstakeTokens.value,
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function setMaxValue() {
            unstakeTokens.value = maxUnlend.value.toString();
            void formatDec();
        }

        return {
            openTransaction,
            unstakeTokens,
            unstakeInput,
            transactionId,
            transactionError,
            formatDec,
            unstake,
            assetToAmount,
            accountData,
            availableToUnstake,
            maxUnlend,
            account: accountStore.account,
            symbol,
            setMaxValue,
            formatCurrency,
        };
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section>
        <div class="row q-col-gutter-md">
            <div class="col-12">
                <div class="row">
                    <div class="row q-pb-sm full-width">
                        <div class="col-8">AVAILABLE TO UNSTAKE</div>
                        <div class="col-4">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxValue">
                                <div class="text-weight-bold text-right balance-amount">{{ formatCurrency(maxUnlend, 4, symbol) }}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to fill full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        ref="unstakeInput"
                        v-model="unstakeTokens"
                        standout="bg-grey-5 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="[ val => val >= 0  && val < availableToUnstake || 'Invalid amount.' ]"
                        type="text"
                        dense
                        dark
                        @blur='formatDec'
                    />
                </div>
                <q-btn
                    class="full-width button-accent"
                    :label="'Unstake ' + symbol"
                    color= "primary"
                    @click="unstake"
                />
            </div>
        </div>
        <ViewTransaction
            v-model="openTransaction"
            :transactionId="transactionId"
            :transactionError="transactionError || ''"
            message="transaction complete"
        />
    </q-card-section>
</div>
</template>

<style scoped lang="sass">
.balance-amount:hover
  color: var(--q-primary)
</style>
