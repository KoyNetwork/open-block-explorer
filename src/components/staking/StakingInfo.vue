<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { getChain } from 'src/config/ConfigManager';
import { api } from 'src/api';
import { API } from '@greymass/eosio';
import { Token, GetTableRowsParams, AccountsRows } from 'src/types';
import { useChainStore } from 'src/stores/chain';
import { useAccountStore } from 'src/stores/account';

const chain = getChain();

export default defineComponent({
    name: 'StakingInfo',
    setup() {
        const chainStore = useChainStore();
        const accountStore = useAccountStore();
        const symbol = ref<string>(chain.getSystemToken().symbol);
        const stakingAccount = ref<string>('');
        const total = ref<string>('0');
        const token = computed((): Token => chainStore.token);
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const accountName = computed((): string => accountStore.account.accountName);
        const liquidValue = ref<number>(0);
        const liquidBalance = computed(() => accountData.value.core_liquid_balance ?? liquidValue);
        const rexInfo = computed(() => accountData.value.rex_info);
        const coreRexBalance = computed(() => accountStore.coreRexBalance);
        const maturingRex = computed(() => accountStore.maturingRex);
        const maturedRex = computed(() => accountStore.maturedRex);
        const rexSavings = computed(() => accountStore.savingsRex);

        const loadLiquidBalance = async () => {
            try {
                const paramsStakedBal = {
                    code: 'eosio.token',
                    scope: accountName.value,
                    table: 'accounts',
                } as GetTableRowsParams;

                const stakedBalRow = ((await api.getTableRows(paramsStakedBal)) as AccountsRows)
                    .rows[0];

                liquidValue.value = Number(stakedBalRow.balance?.split(' ')[0]);
            } catch (e) {
                liquidValue.value = 0;
            }
        };

        onMounted(async () => {
            if (!accountStore.data.core_liquid_balance) {
                await loadLiquidBalance();
            }
        });

        return {
            symbol,
            stakingAccount,
            total,
            accountData,
            token,
            liquidBalance,
            rexInfo,
            maturingRex,
            coreRexBalance,
            maturedRex,
            rexSavings,
        };
    },
});
</script>

<template>

<div class="container text-grey-3 text-weight-light">
    <div class="row full-width">
        <div class="row full-width q-pt-md q-px-lg">
            <div class="col-6 text-h6 grey-3">LIQUID BALANCE</div>
            <div class="col-6 text-h6 text-right grey-3">{{ liquidBalance }}</div>
        </div>
        <div class="row full-width q-py-md q-px-md">
            <hr>
        </div>
        <div class="row full-width q-pb-lg">
            <div class="col-xs-12 col-sm-6 q-px-lg">
                <div class="row">
                    <div class="col-7">{{ `TOTAL ${symbol} STAKED` }}</div>
                    <div class="col-5 text-right text-weight-bold">{{coreRexBalance}}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7">SAVINGS</div>
                    <div class="col-5 text-right text-weight-bold">{{rexSavings}}</div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 q-px-lg">
                <div class="row">
                    <div class="col-7">MATURED</div>
                    <div class="col-5 text-right text-weight-bold">{{maturedRex}}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7">MATURING</div>
                    <div class="col-5 text-right text-weight-bold">{{maturingRex}}</div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style lang="sass">
.container
  border: 2px solid $grey-3
  border-radius: 13px
.grey-3
  color: $grey-3
hr
  content: ""
  display: block
  width: 100%
  border-size: 0.5rem
  border : 0px
  border-bottom: 1px solid $grey-8
  margin-left: 1rem
  margin-right: 1rem
</style>
