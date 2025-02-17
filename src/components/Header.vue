<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import LoginHandler from 'components/LoginHandler.vue';
import HeaderSearch from 'components/HeaderSearch.vue';
import ChainsMenu from 'components/ChainsMenu.vue';
import ConfigManager, { getChain } from 'src/config/ConfigManager';
import { useRouteDataNetwork } from 'src/router';
import { HeaderSettings } from 'src/types/UiCustomization';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

export default defineComponent({
    name: 'AppHeader',
    components: {
        LoginHandler,
        HeaderSearch,
        ChainsMenu,
    },
    setup() {
        const $q = useQuasar();
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const headerSettings = computed((): HeaderSettings => ConfigManager.get().getCurrentChain().getUiCustomization().headerSettings);

        const account = computed(() => accountStore.accountName);
        const isLarge = computed((): boolean => $q.screen.gt.md);
        const showMultichainSelector = computed(() => process.env.SHOW_MULTICHAIN_SELECTOR === 'true');
        const headBlock = computed((): number => chainStore.head_block_num);

        const isTestnet = ref(getChain().isTestnet());
        const smallLogoPath = ref(getChain().getSmallLogoPath());
        const largeLogoPath = ref(getChain().getLargeLogoPath());

        const network = useRouteDataNetwork();

        onMounted(() => {
            void chainStore.updateBlockData();
        });

        watch(network, () => {
            smallLogoPath.value = getChain().getSmallLogoPath();
            largeLogoPath.value = getChain().getLargeLogoPath();
            isTestnet.value = getChain().isTestnet();
        });

        return {
            headerSettings,
            account,
            isLarge: isLarge,
            showMultichainSelector,
            headBlock,
            smallLogoPath,
            largeLogoPath,
            isTestnet,
        };
    },
});
</script>

<template>
<div class="header-background">
    <div class="row text-center q-pa-sm q-pa-sm-md q-gutter-xs-sm justify-sm-between justify-end full-width">
        <div class="row col-xs-12 col-sm-6 col-md-2 q-gutter-sm-x-md no-wrap">
            <div class="flex column no-wrap q-gutter-xs items-start justify-center col-grow col-sm-shrink">
                <div>
                    <div class="flex row justify-between no-wrap">
                        <a href="/">
                            <img v-if="isLarge" class="logo" :src="largeLogoPath">
                            <img v-else class="logo" :src="smallLogoPath">
                        </a>
                        <ChainsMenu v-if="showMultichainSelector"/>
                    </div>
                    <div v-if="isTestnet" class="testnet-text text-overline full-width q-px-xs">TESTNET</div>
                </div>
            </div>
            <div>
                <div class="col-sm-6 text-caption">Head Block</div>
                <div class="col-sm-6 text-body2 text-bold">{{headBlock}}</div>
            </div>
        </div>
        <div class="row col-8 col-sm-6 col-lg-4">
            <HeaderSearch/>
        </div>
        <LoginHandler v-if="!headerSettings.hideLoginHandler"/>
    </div>
    <div class="row justify-center col-12 q-pt-sm">
        <q-tabs
            active-class="active-tab"
            indicator-color="white"
            align="justify"
            narrow-indicator
            color="white"
        >
            <q-route-tab
                v-if="!headerSettings.hideNetworkTab"
                class="deactive"
                name="network"
                label="Network"
                to="/"
            />
            <q-route-tab
                v-if="!headerSettings.hideWalletTab && account"
                class="deactive"
                name="wallet"
                label="Wallet"
                :to="'/account/' + account"
            />
            <q-route-tab
                v-if="!headerSettings.hideVoteTab"
                class="deactive"
                name="vote"
                label="Vote"
                to="/vote"
            />
            <q-route-tab
                v-if="!headerSettings.hideProposalTab"
                class="deactive"
                name="proposal"
                label="Proposal"
                to="/proposal"
            />
        </q-tabs>
    </div>
</div>
</template>

<style lang="sass" scoped>
.q-tab
    text-transform: unset
    font-size: 1rem

.logo
  height: 40px
  object-fit: contain

.testnet-text
    color: white
    border-radius: 4px
    background-color: rgba(white, 0.1)

.active-tab
  text-decoration: none
  color: var(--q-color-header-text)
  opacity: 1 !important

.deactive
  opacity: 0.65
  font-size: 18px

.header-background
  min-height: 90px // minimal height to show testnet label

</style>
