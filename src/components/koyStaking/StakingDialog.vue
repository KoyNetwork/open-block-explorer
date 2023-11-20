<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { Token } from 'src/types';
import StakingInfo from 'src/components/koyStaking/StakingInfo.vue';
import StakingTab from 'src/components/koyStaking/StakingTab.vue';
import UnstakingTab from 'src/components/koyStaking/UnstakingTab.vue';
import HistoryTab from 'src/components/koyStaking/HistoryTab.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { formatCurrency } from 'src/utils/string-utils';
import { useChainStore } from 'src/stores/chain';
import { useAccountStore } from 'src/stores/account';

const symbol = getChain().getSystemToken().symbol;

export default defineComponent({
    name: 'KoyStakingDialog',
    components: {
        StakingInfo,
        StakingTab,
        UnstakingTab,
        HistoryTab,
    },
    data() {
        return {
            sendToken: {
                symbol,
                precision: 4,
                amount: 0,
                contract: 'eosio.token',
            } as Token,
            sendDialog: false,
            apy: '--',
        };
    },
    props: {
        availableTokens: {
            type: Array as PropType<Token[]>,
            required: true,
        },
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const rexfund = computed(() => accountStore.rexfund || 0);
        const symbol = computed(() => chainStore.token.symbol);
        const transactionId = ref<string>(null);
        const transactionError = ref<string>(null);

        const withdrawRexFund = async () => {
            await accountStore.unstakeRexFund({ amount: rexfund.value });
            void accountStore.updateRexData({
                account: accountStore.accountName,
            });
        };

        const prettyRexFund = computed(() => formatCurrency(rexfund.value, 4, symbol.value));

        return {
            openCoinDialog: ref<boolean>(false),
            recievingAccount: ref<string>(''),
            sendAmount: ref<string>('0'),
            memo: ref<string>(''),
            tab: ref('stake'),
            rexfund,
            symbol,
            transactionError,
            transactionId,
            withdrawRexFund,
            prettyRexFund,
            accountStore,
            account: computed(() => accountStore.accountName),
        };
    },
    computed: {
        transactionForm(): boolean {
            return !(this.transactionError || this.transactionId);
        },
    },
    methods: {
        async sendTransaction(): Promise<void> {
            const actionAccount = this.sendToken.contract;
            const data = {
                from: this.account,
                to: this.recievingAccount,
                quantity: `${this.sendAmount} ${this.sendToken.symbol}`,
                memo: this.memo,
            };
            try {
                this.transactionId = (
                    await this.accountStore.sendAction({
                        account: actionAccount,
                        data,
                        name: 'transfer',
                    })
                ).transactionId;
            } catch (e) {
                this.transactionError = e as string;
            }
        },
        setDefaults() {
            if (this.availableTokens.length > 0) {
                this.sendToken = this.availableTokens.find(token => token.symbol === this.sendToken.symbol);
            }
        },
        updateSelectedCoin(token: Token): void {
            this.sendToken = token;
        },
        async navToTransaction() {
            await this.$router.push({
                name: 'transaction',
                params: { transaction: this.transactionId },
            });
            this.$router.go(0);
        },
        async loadAccountData(): Promise<void> {
            let data: API.v1.AccountObject;
            try {
                data = await this.$api.getAccount(this.account);
                this.accountStore.setAccountData(data);
            } catch (e) {
                return;
            }
        },
    },
    async mounted() {
        await this.loadAccountData();
    },
});
</script>

<template>

<q-dialog :persistent="true" maximized @show="setDefaults">
    <q-card class="rexCard">
        <div class="row justify-center q-pt-xl full-height full-width">
            <div class="absolute-top-right">
                <q-btn
                    v-close-popup
                    size="20px"
                    flat
                    dense
                    round
                    icon="clear"
                />
            </div>
            <div class="col-xs-12 col-sm-10 col-md-7 col-lg-7 max-dialog-width">
                <div class="row q-pl-sm">
                    <div class="text-h4 q-pb-md inline-block color-grey-3 inline">Staking</div>
                    <!-- <div class="text-h5 q-pb-md inline-block color-grey-3 inline float-right">APY: ??</div> -->
                </div>
                <div class="q-pa-sm">
                    <StakingInfo/>
                    <div v-if="rexfund > 0" class="q-pt-lg q-pl-lg">
                        <div class="row q-col-gutter-md items-center">
                            <div class="col-auto text-h6 text-white">REX fund: {{ prettyRexFund }}</div>
                            <div class="col-auto">
                                <q-btn
                                    class="full-width"
                                    label="Withdraw"
                                    flat
                                    @click="withdrawRexFund"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="q-pt-lg text-grey-3 text-weight-light">
                        <q-tabs
                            v-model="tab"
                            class="text-grey-5 tab-text text-grey"
                            dense
                            indicator-color="grey-3"
                            active-color="grey-3"
                            narrow-indicator
                            align="left"
                            :breakpoint="0"
                            no-caps
                        >
                            <q-tab name="stake" label="Stake"/>
                            <q-tab name="unstake" label="Unstake"/>
                            <q-tab name="history" label="History"/>
                        </q-tabs>
                        <q-separator color="grey-8"/>
                        <q-tab-panels v-model="tab" class="tab-panel">
                            <q-tab-panel name="stake">
                                <StakingTab/>
                            </q-tab-panel>
                            <q-tab-panel name="unstake">
                                <UnstakingTab/>
                            </q-tab-panel>
                            <q-tab-panel name="history">
                                <HistoryTab/>
                            </q-tab-panel>
                        </q-tab-panels>
                    </div>
                </div>
            </div>
        </div>
    </q-card>
</q-dialog>

</template>

<style lang="sass" scoped>
.q-dialog
  // background guarantees opacity
  background: var(--q-dark)

.rexCard
  color: $grey-6
  background-image: linear-gradient(to right, var(--q-color-background), var(--q-color-background)), var(--q-color-background-gradient)

  .send-icon
    padding-bottom: 30px

.sarrowButton
  background: rgba($grey-9, 0.1)

.selector-container
  cursor: pointer
  border-radius: 4px
  height: 40px
  margin-top: 1px
  color: var(--q-dark)
  &:hover
    background: rgba($grey-4, 0.3)
    border-color: $grey-1
    border-radius: 4px
  .arrowButton
    color: $grey-4

  .text-h6
    color: $grey-4
    font-weight: 600
    font-size: 1.1rem
  .subtitle
    color: $grey-4
.send-img
  height: 35px !important

.tab-panel
  background: inherit !important

.tab-text
  font-size: 30px !important

.q-tab-panel
  padding-left: 0 !important
  padding-right: 0 !important

.float-right
  margin-left: auto
  margin-top: auto
  padding-right: 8px
</style>
