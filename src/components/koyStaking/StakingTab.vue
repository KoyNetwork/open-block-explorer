<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { assetToAmount } from 'src/utils/string-utils';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

const chain = getChain();

export default defineComponent({
    name: 'KoyStakingTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        let openTransaction = ref<boolean>(false);
        const stakeTokens = ref<string>('');
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const transactionId = computed((): string => accountStore.TransactionId);
        const transactionError = computed(() => accountStore.TransactionError);
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const accountName = computed((): string => accountStore.accountName);

        const liquidValue = computed((): number => accountStore.liquidValue);
        const liquidBalance = computed(
            () => accountData.value?.core_liquid_balance?.value ?? liquidValue.value,
        );

        const inputRules = computed((): Array<(data: string) => boolean | string> => [
            (val: string) => +val >= 0 || 'Value must not be negative',
            (val: string) => +val <= liquidBalance.value || 'Balance too low',
        ]);

        function formatDec() {
            const precision = chainStore.token.precision;
            if (stakeTokens.value !== '') {
                stakeTokens.value = Number(stakeTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: precision,
                        minimumFractionDigits: precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        async function stake() {
            void accountStore.resetTransaction();
            if (
                stakeTokens.value === '0' ||
                Number(stakeTokens.value) >= liquidBalance.value
            ) {
                return;
            }
            await accountStore.stakeKoy({
                amount: stakeTokens.value,
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                openTransaction.value = true;
            }
        }

        function setMaxValue() {
            stakeTokens.value = liquidBalance.value.toString();
            void formatDec();
        }

        onMounted(async () => {
            if (!accountStore.account.data.core_liquid_balance) {
                await accountStore.updateKoyStakedData({ account: accountName.value });
            }
        });

        return {
            openTransaction,
            stakeTokens,
            transactionId,
            transactionError,
            accountData,
            liquidBalance,
            symbol,
            inputRules,
            formatDec,
            stake,
            assetToAmount,
            setMaxValue,
        };
    },
});
</script>

<template>

<div class="staking-form">
    <q-card-section>
        <div class="row q-col-gutter-md">
            <div class="col-12">
                <div class="row q-mb-md">
                    <div class="row q-pb-sm full-width">
                        <div class="col-8">{{ `LIQUID ${symbol}` }}</div>
                        <div class="col-4">
                            <div class="row items-center justify-end q-hoverable cursor-pointer" @click="setMaxValue">
                                <div class="text-weight-bold text-right balance-amount">{{ `${liquidBalance} AVAILABLE` }}</div>
                                <q-icon class="q-ml-xs" name="info"/>
                                <q-tooltip>Click to fill full amount</q-tooltip>
                            </div>
                        </div>
                    </div>
                    <q-input
                        v-model="stakeTokens"
                        dense
                        dark
                        class="full-width"
                        standout="bg-grey-5 text-white"
                        placeholder='0'
                        :lazy-rules='true'
                        :rules="inputRules"
                        type="text"
                        @blur='formatDec'
                    />
                    <q-btn
                        class="full-width"
                        color="primary"
                        :label='"Stake " + symbol'
                        disable
                        @click="stake"
                    />
                </div>
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
