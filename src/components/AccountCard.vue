<script lang="ts">
import { Token, GetTableRowsParams, RexbalRows, RexPoolRows } from 'src/types';
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import PercentCircle from 'src/components/PercentCircle.vue';
import SendDialog from 'src/components/SendDialog.vue';
import ResourcesDialog from 'src/components/resources/ResourcesDialog.vue';
import StakingDialog from 'src/components/staking/StakingDialog.vue';
import KoyStakingDialog from 'src/components/koyStaking/StakingDialog.vue';
import DateField from 'src/components/DateField.vue';
import NumberFormat from 'src/components/NumberFormat.vue';
import VueMarkdown from 'vue-markdown-render';
import { date, useQuasar, copyToClipboard } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
import { api } from 'src/api';
import { useRouter } from 'vue-router';
import { TableIndexType } from 'src/types/Api';
import { API, UInt64 } from '@greymass/eosio';
import { formatCurrency } from 'src/utils/string-utils';
import ConfigManager from 'src/config/ConfigManager';
import { AccountPageSettings } from 'src/types/UiCustomization';
import { useResourceStore } from 'src/stores/resources';
import { useChainStore } from 'src/stores/chain';
import { useAccountStore } from 'src/stores/account';
import { useProfileStore } from 'src/stores/profiles';

const chain = getChain();
export default defineComponent({
    name: 'AccountCard',
    components: {
        PercentCircle,
        SendDialog,
        ResourcesDialog,
        DateField,
        StakingDialog,
        KoyStakingDialog,
        NumberFormat,
        VueMarkdown,
    },
    props: {
        account: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const $q = useQuasar();
        const router = useRouter();
        const resourceStore = useResourceStore();
        const chainStore = useChainStore();
        const accountStore = useAccountStore();
        const profileStore = useProfileStore();

        const accountPageSettings = computed((): AccountPageSettings => ConfigManager.get().getCurrentChain().getUiCustomization().accountPageSettings);

        const isKoyChain = computed((): boolean => chain.getName() === 'koyn' || chain.getName() === 'koyn-testnet');

        const createTime = ref<string>('2019-01-01T00:00:00.000');
        const createTransaction = ref<string>('');
        const creatingAccount = ref('');
        const system_account = ref('eosio');

        const isLoading = ref<boolean>(true);
        const tokensLoading = ref<boolean>(true);
        const none = ref<UInt64>(UInt64.from(0));
        const MICRO_UNIT = ref<number>(Math.pow(10, -6));
        const KILO_UNIT = ref<number>(Math.pow(10, 3));
        const resources = ref<number>(0);
        const delegatedByOthers = ref<number>(0.0);
        const delegatedToOthers = computed(() => resourceStore.getDelegatedToOthersAggregated);
        const rexStaked = ref<number>(0);
        const rexProfits = ref<number>(0);
        const rexDeposits = ref<number>(0);
        const rex = computed(
            (): number => rexStaked.value + rexProfits.value + rexDeposits.value,
        );
        const usdPrice = ref<number>();
        const stakedCPU = ref<number>(0);
        const stakedNET = ref<number>(0);
        const cpu_used = ref<number>(0);
        const cpu_max = ref<number>(0);
        const totalTokens = ref<number | string>('');
        const net_used = ref(0);
        const net_max = ref(0);
        const ram_used = ref(0);
        const ram_max = ref(0);
        const radius = ref(44);
        const stakedResources = ref(0);

        const stakedBal = computed((): number => accountStore.stakedBal);
        const unstakedBal = computed((): number => accountStore.unstakedBal);
        const availableToUnstake = computed((): number => accountStore.availableToUnstakeVal);
        const availableToClaim = computed((): number => accountStore.claimableAmountVal);
        const lastClaim = computed((): Date => accountStore.lastClaimTime);
        const lastUnstake = computed((): Date =>  accountStore.lastUnstakeTime);

        const accountExists = ref<boolean>(true);
        const openSendDialog = ref<boolean>(false);
        const openResourcesDialog = ref<boolean>(false);
        const openStakingDialog = ref<boolean>(false);
        const openKoyStakingDialog = ref<boolean>(false);

        const accountData = ref<API.v1.AccountObject>();
        const profileData = computed(() => profileStore.profile);
        const availableTokens = ref<Token[]>([]);


        const stakedRefund = computed((): number =>
            (accountData.value?.refund_request?.cpu_amount.value ?? 0) +
            (accountData.value?.refund_request?.net_amount.value ?? 0),
        );

        const token = computed((): Token => chainStore.token);

        const liquidValue = computed((): number => accountStore.liquidValue);
        const liquidNative = computed((): number => accountData.value?.core_liquid_balance?.value
            ? accountData.value.core_liquid_balance.value
            : liquidValue.value);

        const totalValue = computed((): number => {
            if (typeof totalTokens.value === 'number') {
                return usdPrice.value * totalTokens.value;
            }
            return 0;
        });

        const totalValueString = computed((): string => {
            let result = '';

            const usd = formatCurrency(totalValue.value ?? 0, 2);
            const tokenPrice = formatCurrency(usdPrice.value ?? 0, 4);

            if (totalValue.value && usdPrice.value) {
                result = `$${usd} (@ $${tokenPrice}/${chain.getSystemToken().symbol})`;
            }
            return result;
        });

        const isAccount = computed((): boolean => accountStore.accountName === props.account);

        const createTimeFormat = computed((): string =>
            date.formatDate(createTime.value, 'DD MMMM YYYY @ hh:mm A'),
        );

        let profile = computed(() => profileStore.profiles.get(props.account));

        const showProfileData = computed(() => profileData.value.displayName !== '' || profileData.value.status !== '' || profileData.value.bio !== '');
        const setToken = (value: Token) => {
            void chainStore.setToken(value);
        };

        const loadAccountData = async (): Promise<void> => {
            try {
                isLoading.value = true;
                accountData.value = await api.getAccount(props.account);
                await profileStore.loadProfileInformation({ account: props.account });
                await loadAccountCreatorInfo();
                await loadProfile();
                await loadBalances();
                loadResources();
                await accountStore.updateKoyStakedData({ account: props.account });
                setTotalBalance();
                await updateTokenBalances();
                await updateResources({ account: props.account, force: true });
            } catch (e) {
                console.error(e);
                $q.notify(`account ${props.account} not found!`);
                accountExists.value = false;
                return;
            }
        };

        const loadProfile = async () => {
            if (!profile.value) {
                await profileStore.setProfile(props.account);
            }
        };

        const loadBalances = async () => {
            try {
                const total  = await getRexBalance();
                rexDeposits.value = await getRexFund();
                rexStaked.value = total;
            } catch (e) {
                // Koy will not use REX
                // $q.notify('REX information not available!');
            }
        };

        const loadResources = () => {
            try {
                ram_used.value = fixDec(
                    Number(accountData.value.ram_usage) / KILO_UNIT.value,
                );

                if (props.account !== system_account.value) {
                    ram_max.value = fixDec(
                        Number(accountData.value.ram_quota) / KILO_UNIT.value,
                    );
                    cpu_used.value = fixDec(
                        Number(accountData.value.cpu_limit.used) * MICRO_UNIT.value,
                    );
                    cpu_max.value = fixDec(
                        Number(accountData.value.cpu_limit.max) * MICRO_UNIT.value,
                    );
                    net_used.value = fixDec(
                        Number(accountData.value.net_limit.used) / KILO_UNIT.value,
                    );
                    net_max.value = fixDec(
                        Number(accountData.value.net_limit.max) / KILO_UNIT.value,
                    );

                    stakedResources.value =
                        Number(accountData.value.total_resources.cpu_weight.value) +
                        Number(accountData.value.total_resources.net_weight.value);

                    stakedCPU.value = Number(
                        accountData.value.self_delegated_bandwidth?.cpu_weight.value || 0,
                    );

                    stakedNET.value = Number(
                        accountData.value.self_delegated_bandwidth?.net_weight.value || 0,
                    );

                    delegatedByOthers.value = Math.abs(
                        stakedResources.value - stakedNET.value - stakedCPU.value,
                    );
                }
            } catch (e) {
            }
        };

        const setTotalBalance = () => {
            totalTokens.value = liquidNative.value + stakedBal.value;
            isLoading.value = false;
        };

        const updateTokenBalances = async () => {
            tokensLoading.value = true;
            availableTokens.value = await api.getTokens(props.account);
            tokensLoading.value = false;
        };

        const loadAccountCreatorInfo = async () => {
            try {
                const creatorData = (await api.getCreator(props.account)) as {
                    creator: string;
                    timestamp: string;
                    trx_id: string;
                };
                creatingAccount.value = creatorData.creator;
                createTime.value = creatorData.timestamp;
                createTransaction.value = creatorData.trx_id;
            } catch (e) {
                $q.notify(`creator account for ${props.account} not found!`);
            }
        };

        const updateResources = (payload: {account:string, force: boolean}) => resourceStore.updateResources(payload);

        const getRexFund = async () => {
            const paramsrexfund = {
                code: 'eosio',
                limit: '1',
                lower_bound: props.account as unknown as TableIndexType,
                scope: 'eosio',
                table: 'rexfund',
                reverse: false,
                upper_bound: props.account as unknown as TableIndexType,
            } as GetTableRowsParams;
            const rexfund = (
                (await api.getTableRows(paramsrexfund)) as {
                    rows: {
                        owner: string;
                        balance: string;
                    }[];
                }
            ).rows[0];

            const rexFundBalance =
                rexfund && rexfund.balance
                    ? Number(rexfund.balance.split(' ')[0])
                    : 0.0;
            return rexFundBalance;
        };

        const getRexBalance = async () => {
            const paramsrexbal = {
                code: 'eosio',
                limit: '2',
                lower_bound: props.account as unknown as TableIndexType,
                scope: 'eosio',
                table: 'rexbal',
                reverse: false,
                upper_bound: props.account as unknown as TableIndexType,
            } as GetTableRowsParams;

            const rexBal = ((await api.getTableRows(paramsrexbal)) as RexbalRows)
                .rows[0];

            const totalRexBalance =
                rexBal?.rex_balance
                    ? Number(rexBal.rex_balance.split(' ')[0])
                    : 0;

            const paramsrexpool = {
                code: 'eosio',
                scope: 'eosio',
                table: 'rexpool',
                json: true,
                reverse: false,
            } as GetTableRowsParams;

            const rexpool = ((await api.getTableRows(paramsrexpool)) as RexPoolRows)
                .rows[0];

            const totalRex = Number(rexpool.total_rex.split(' ')[0]);
            const totalLendable = Number(rexpool.total_lendable.split(' ')[0]);
            const tlosRexRatio = totalRex > 0 ? totalLendable / totalRex : 1;

            const total = totalRex > 0 ? tlosRexRatio * totalRexBalance : 0.0;
            return total;
        };

        const fixDec = (val: number): number => parseFloat(val.toFixed(3));

        const loadSystemToken = (): void => {
            if (token.value.symbol === '') {
                setToken(chain.getSystemToken());
            }
        };

        const loadCreatorAccount = async (): Promise<void> => {
            await router.push({
                name: 'account',
                params: {
                    account: creatingAccount.value,
                },
            });
            router.go(0);
        };

        const loadCreatorTransaction = async (): Promise<void> => {
            await router.push({
                name: 'transaction',
                params: {
                    transaction: createTransaction.value,
                },
            });
            router.go(0);
        };

        const copy = (value: string) => {
            copyToClipboard(value)
                .then((): void => {
                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    $q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        };

        const formatAsset = (val: number | string): string => {
            if (typeof val === 'undefined') {
                return '--';
            }
            console.assert(typeof val === 'number' || typeof val === 'string', val);
            return typeof val === 'string'
                ? val
                : formatCurrency(val, 4, chain.getSystemToken().symbol);
        };

        const resetBalances = () => {
            totalTokens.value = '--';
            stakedResources.value = delegatedByOthers.value = 0;
            rexStaked.value = 0;
            rexDeposits.value = 0;
        };

        const claimRewards = () => {
            console.log('claim rewards');
            void accountStore.claimRewards();
        };

        onMounted(async () => {
            try {
                usdPrice.value = await chain.getUsdPrice();
                await loadAccountData();
                if (!accountPageSettings.value.hideRexInfo) {
                    await accountStore.updateRexData({
                        account: props.account,
                    });
                }
                loadSystemToken();
                if (!accountPageSettings.value.hideRamInfo) {
                    void chainStore.updateRamPrice();
                }
            } catch(e) {
                console.error(e);
            }
        });

        watch(
            () => props.account,
            async () => {
                resetBalances();
                await loadAccountData();
                await accountStore.updateRexData({
                    account: props.account,
                });
            },
        );

        return {
            accountPageSettings,
            isKoyChain,
            MICRO_UNIT,
            KILO_UNIT,
            stakedCPU,
            stakedNET,
            cpu_used,
            cpu_max,
            net_used,
            net_max,
            ram_used,
            ram_max,
            stakedBal,
            unstakedBal,
            availableToClaim,
            availableToUnstake,
            lastUnstake,
            lastClaim,
            creatingAccount,
            isLoading,
            tokensLoading,
            liquidNative,
            stakedRefund,
            totalTokens,
            totalValue,
            totalValueString,
            rex,
            rexStaked,
            rexDeposits,
            none,
            system_account,
            radius,
            availableTokens,
            createTime,
            createTransaction,
            openSendDialog,
            openResourcesDialog,
            openStakingDialog,
            openKoyStakingDialog,
            delegatedByOthers,
            delegatedToOthers,
            isAccount,
            token,
            createTimeFormat,
            resources,
            accountExists,
            loadAccountData,
            setToken,
            fixDec,
            loadSystemToken,
            loadCreatorAccount,
            loadCreatorTransaction,
            copy,
            formatAsset,
            updateTokenBalances,
            claimRewards,
            profile,
            profileData,
            showProfileData,
        };
    },
});
</script>

<template>

<div class="q-pa-md">
    <q-card v-if="accountExists" class="account-card">
        <q-card-section class="resources-container">
            <div class="inline-section">
                <div class="items-center justify-center column full-height q-gutter-sm q-mb-md">
                    <div class="items-center row">
                        <div class="text-title">{{ account }}</div>
                        <q-btn
                            class="float-right"
                            flat
                            round
                            color="white"
                            icon="content_copy"
                            size="sm"
                            @click="copy(account)"
                        />
                    </div>
                    <div v-show="!accountPageSettings.hideCreatedBy">
                        <div
                            v-if="creatingAccount && creatingAccount !== '__self__'"
                            class="text-subtitle"
                        >
                            created by
                            <span>&nbsp;<a @click="loadCreatorAccount">{{ creatingAccount }}</a>&nbsp;</span>
                            <div>
                                <DateField :timestamp="createTime" showAge>&nbsp;</DateField>
                                <q-tooltip>{{createTimeFormat}}</q-tooltip>
                            </div><a class="q-ml-xs tx-link" @click="loadCreatorTransaction">
                                <q-icon name="fas fa-link"/></a>
                        </div>
                        <div v-else class="text-subtitle">created<span>&nbsp;</span>
                            <div>
                                <DateField :timestamp="createTime" showAge>&nbsp;</DateField>
                                <q-tooltip>{{createTimeFormat}}</q-tooltip>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="items-center justify-center row full-height q-gutter-sm text-body1">
                    <img v-if="profile?.avatar" class="avatar-image col-4" :src="profile.avatar" >
                    <div v-show="showProfileData" class="justify-center column col-8 q-ml-md">
                        <VueMarkdown v-show="profileData.displayName !== ''" class="text-h5" :source="profileData.displayName" />
                        <VueMarkdown v-show="profileData.status !== ''" :source="profileData.status" />
                        <VueMarkdown v-show="profileData.bio !== ''" :source="profileData.bio" />
                    </div>
                </div>
                <q-space/>
            </div>
            <div v-if="account !== system_account" class="resources">
                <PercentCircle
                    v-if="!accountPageSettings.hideCpuInfo"
                    :radius="radius"
                    :fraction="cpu_used"
                    :total="cpu_max"
                    label="CPU"
                    unit="s"
                />
                <PercentCircle
                    v-if="!accountPageSettings.hideNetInfo"
                    :radius="radius"
                    :fraction="net_used"
                    :total="net_max"
                    label="NET"
                    unit="kb"
                />
                <PercentCircle
                    v-if="!accountPageSettings.hideRamInfo"
                    :radius="radius"
                    :fraction="ram_used"
                    :total="ram_max"
                    label="RAM"
                    unit="kb"
                />
            </div>
            <div v-else-if="!accountPageSettings.hideRamInfo" class="resources">
                <div class="usage">RAM USED: {{ ram_used }} kb</div>
            </div>
        </q-card-section>
        <q-card-section class="resources-container">
            <div class="justify-center row q-gutter-sm">
                <div v-if="isAccount" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label="tokensLoading ? 'Loading...' : 'Send'"
                        color="primary"
                        class="full-width"
                        @click="openSendDialog = true"
                    />
                </div>
                <div v-if="isAccount && !accountPageSettings.hideResourcesControl" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label='tokensLoading ? "Loading..." : "Resources"'
                        class="full-width"
                        color="primary"
                        @click="openResourcesDialog = true"
                    />
                </div>
                <div v-if="isAccount && !accountPageSettings.hideRexControl" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label='tokensLoading ? "Loading..." : "Staking (REX)"'
                        class="ellipsis full-width"
                        color="primary"
                        @click="openStakingDialog = true"
                    />
                </div>
                <div v-if="isAccount && isKoyChain" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label='tokensLoading ? "Loading..." : "Staking"'
                        class="ellipsis full-width"
                        color="primary"
                        @click="openKoyStakingDialog = true"
                    />
                </div>
                <div v-if="isAccount && isKoyChain">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label='tokensLoading ? "Loading..." : "Claim"'
                        class="ellipsis full-width"
                        color="primary"
                        @click="claimRewards"
                    />
                </div>
            </div>
        </q-card-section>
        <q-markup-table>
            <thead>
                <tr>
                    <th class="text-left">BALANCE</th>
                </tr>
                <tbody class="table-body">
                    <tr>
                        <td class="text-left total-label">TOTAL</td>
                        <td v-if="isLoading" class="text-right total-amount total-loading-spinner">
                            <q-spinner color="white" size="1.5em"/>
                        </td>
                        <td class="text-right"><NumberFormat class="total-amount" :valueToFormat="totalTokens"/></td>                    </tr>
                    <tr v-show="!isLoading && totalValueString.length > 0" class="total-row">
                        <td class="text-left"></td>
                        <td class="text-right"><NumberFormat class="total-value" :valueToFormat="totalValueString"/></td>                    </tr>
                    <tr>
                        <td class="text-left">LIQUID</td>
                        <td class="text-right"><NumberFormat :valueToFormat="liquidNative"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideRexInfo">
                        <td class="text-left">REX staked (includes savings)</td>
                        <td class="text-right"><NumberFormat :valueToFormat="rexStaked"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideRexInfo">
                        <td class="text-left">REX liquid deposits</td>
                        <td class="text-right"><NumberFormat :valueToFormat="rexDeposits"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideCpuInfo">
                        <td class="text-left">STAKED for CPU</td>
                        <td class="text-right"><NumberFormat :valueToFormat="stakedCPU"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideNetInfo">
                        <td class="text-left">STAKED for NET</td>
                        <td class="text-right"><NumberFormat :valueToFormat="stakedNET"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideRefundingInfo">
                        <td class="text-left">REFUNDING from staking</td>
                        <td class="text-right"><NumberFormat :valueToFormat="stakedRefund"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideDelegatedInfo">
                        <td class="text-left">DELEGATED to others</td>
                        <td class="text-right"><NumberFormat :valueToFormat="delegatedToOthers"/></td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideDelegatedInfo">
                        <td class="text-left">DELEGATED by others</td>
                        <td class="text-right"><NumberFormat :valueToFormat="delegatedByOthers"/></td>
                    </tr>
                    <tr>
                        <td class="text-left">STAKED</td>
                        <td class="text-right"><NumberFormat :valueToFormat="stakedBal"/></td>
                    </tr>
                    <tr>
                        <td class="text-left">UNSTAKED</td>
                        <td class="text-right"><NumberFormat :valueToFormat="unstakedBal"/></td>
                    </tr>
                    <tr>
                        <td class="text-left">AVAILABLE TO CLAIM</td>
                        <td class="text-right">{{ formatAsset(availableToClaim) }}</td>
                    </tr>
                    <tr>
                        <td class="text-left">LAST CLAIM</td>
                        <td class="text-right">{{ lastClaim?.toDateString() }}</td>
                    </tr>
                    <tr>
                        <td class="text-left">AVAILABLE TO UNSTAKE</td>
                        <td class="text-right">{{ formatAsset(availableToUnstake) }}</td>
                    </tr>
                    <tr>
                        <td class="text-left">LAST UNSTAKE</td>
                        <td class="text-right">{{ lastUnstake?.toDateString() }}</td>
                    </tr>
                </tbody>
            </thead>
        </q-markup-table>
        <div v-if="isAccount">
            <SendDialog
                v-if="openSendDialog"
                v-model="openSendDialog"
                :availableTokens="availableTokens"
                @update-token-balances="updateTokenBalances"
            />
            <ResourcesDialog
                v-if="openResourcesDialog"
                v-model="openResourcesDialog"
            />
            <StakingDialog
                v-model="openStakingDialog"
                :availableTokens="availableTokens"
            />
            <KoyStakingDialog
                v-model="openKoyStakingDialog"
                :availableTokens="availableTokens"
            />
        </div>
    </q-card>
    <q-card v-else class="account-card">
        <q-card-section class="resources-container">
            <div class="inline-section">
                <div class="items-center justify-center row full-height">
                    <div class="col-8"></div>
                    <div class="text-center text-title">Sorry, the account {{ account }} could not be found.</div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</div>

</template>

<style lang="sass" scoped>
$medium:750px

.q-markup-table
  width: 100%
  th,td
    padding: unset

.account-card
  color: white
  font-size: 36px
  max-width: 100%
  background: unset
  margin-bottom: 16px

  .avatar-image
    height: 150px
    width: 150px
    object-fit: cover
    border-radius: 30%

  .q-table th
    font-size: 1rem
  .q-table tbody td
    font-size: 1rem
    &.total-label, &.total-value
      color: white
      font-size: 1.25rem
    &.total-amount
      font-size: 1.25rem

  .q-table__card
    background: unset
    color: rgba(255, 255, 255, 0.5)

  .q-table--horizontal-separator
    thead th
      border-bottom: 1px solid rgba(255,255,255, 0.13)
    tbody tr:not(:last-child) td
      border-bottom: none

  .q-table thead tr, .q-table tbody td
    height: 42px
    &.total-row
      height: 52px

.resources-container
  padding: 0
  margin-bottom: 1rem

.table-body
  width: 100%
  display: table
  tr
    border-width: 0

.inline-section
  width: 100%
  display: inline-block

.resources
  text-align: center
  width: 100%
  margin: 1rem auto 0 auto

.resource
  margin-right: 2rem

.text-right
  font-weight: bold
  &.total-loading-spinner
    padding-right: .5rem

.text-title, .text-subtitle
  display: flex
  align-items: center
  justify-content: center

.text-subtitle
  text-transform: uppercase
  color: rgba(255, 255, 255, 0.5)
  font-size: 12px
  a
    cursor: pointer
    text-decoration: underline

.total-amount
  color: white
  font-size: 1.25rem
  font-weight: normal

.total-value
  font-weight: normal

.usage
  text-anchor: middle
  dominant-baseline: middle
  fill: white
  font-size: 14px

@media screen and (max-width: $medium) // screen < $medium
  .account-card
    width: 100%
    padding: unset
    margin-top: unset
    height: 100%
    border-radius: unset

  .q-markup-table
    overflow: unset
    width: unset
    margin-right: .5rem
    margin-left: .5rem

  .resources
    float: unset

  .inline-section
    width: 100%

.total-row
  a
    cursor: pointer
    text-decoration: underline
    color: white
    font-size: 16px
    font-weight: normal

.tx-link
  text-decoration: none !important
</style>
