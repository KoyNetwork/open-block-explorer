<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { API } from '@greymass/eosio';
import { Token } from 'src/types';
import { useChainStore } from 'src/stores/chain';
import { useAccountStore } from 'src/stores/account';
import { formatCurrency } from 'src/utils/string-utils';
import ConfigManager from 'src/config/ConfigManager';

export default defineComponent({
    name: 'KoyStakingInfo',
    setup() {
        const chainStore = useChainStore();
        const accountStore = useAccountStore();

        const symbol = computed(() => ConfigManager.get().getCurrentChain().getSystemToken().symbol);
        const token = computed((): Token => chainStore.token);
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const accountName = computed((): string => accountStore.accountName);
        const liquidValue = computed((): number => accountStore.liquidValue);
        const liquidBalance = computed(() => accountData.value.core_liquid_balance ?? liquidValue);
        const precision = computed(() => ConfigManager.get().getCurrentChain().getSystemToken().precision);
        const stakedValue = computed(() => formatCurrency(accountStore.stakedBal, precision.value, symbol.value));

        const withdrawSpeed = computed(() => accountStore.withdrawSpeedVal);
        const lastUnstake = computed(() => accountStore.lastUnstakeTime);
        const availableToUnstake = computed(() => formatCurrency(accountStore.availableToUnstakeVal, 4, symbol.value));

        onMounted(async () => {
            if (!accountData.value.core_liquid_balance) {
                await accountStore.updateKoyStakedData({ account: accountName.value });
            }
        });

        return {
            symbol,
            token,
            liquidBalance,
            stakedValue,
            withdrawSpeed,
            lastUnstake,
            availableToUnstake,
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
                    <div class="col-5 text-right text-weight-bold">{{stakedValue}}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7">WITHDRAW SPEED</div>
                    <div class="col-5 text-right text-weight-bold">{{ withdrawSpeed }}</div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 q-px-lg">
                <div class="row">
                    <div class="col-7">AVAILABLE TO UNSTAKE</div>
                    <div class="col-5 text-right text-weight-bold">{{ availableToUnstake }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7">LAST UNSTAKE</div>
                    <div class="col-5 text-right text-weight-bold">{{ lastUnstake.toDateString() }}</div>
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
