<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';
import TokensPanel from 'components/TokensPanel.vue';
import KeysPanel from 'components/KeysPanel.vue';
import ChildrenPanel from 'components/ChildrenPanel.vue';
import AccountCard from 'components/AccountCard.vue';
import ContractTabs from 'components/contract/ContractTabs.vue';
import { api } from 'src/api';
import { useRoute, useRouter } from 'vue-router';
import { useAccountStore } from 'src/stores/account';
import ConfigManager from 'src/config/ConfigManager';
import { AccountPageSettings } from 'src/types/UiCustomization';

export default defineComponent({
    name: 'AccountPage',
    components: {
        TransactionsTable,
        TokensPanel,
        KeysPanel,
        ChildrenPanel,
        AccountCard,
        ContractTabs,
    },
    setup() {
        const accountStore = useAccountStore();
        const route = useRoute();
        const router = useRouter();
        const accountPageSettings = computed((): AccountPageSettings => ConfigManager.get().getCurrentChain().getUiCustomization().accountPageSettings);

        const tab = ref<string>((route.query['tab'] as string) || 'transactions');
        const account = computed(() => (route.params.account as string) || '');
        const abi = computed(() => accountStore.abi.abi);
        const tokenList = ref(api.getTokens(account.value));

        onMounted(async () => {
            await accountStore.updateABI(route.params.account as string);
        });

        watch([tab], () => {
            void router.push({
                path: router.currentRoute.value.path,
                query: {
                    tab: tab.value,
                },
            });
        });

        return {
            tab,
            account,
            abi,
            tokenList,
            accountPageSettings,
        };
    },
});
</script>

<template>
<div class="row col-12">
    <div class="column col-12 header-support">
        <div class="row">
            <AccountCard class="account-card" :account="account" :tokens="tokenList"/>
        </div>
        <q-tabs v-model="tab" class="account-view tabs" no-caps>
            <q-tab v-if="!accountPageSettings.hideTransactionTab" name="transactions" label="Transactions"/>
            <q-tab v-if="!accountPageSettings.hideContractsTab && abi" name="contract" label="Contract"/>
            <q-tab v-if="!accountPageSettings.hideTokensTab" name="tokens" label="Tokens"/>
            <q-tab v-if="!accountPageSettings.hideKeysTab" name="keys" label="Keys"/>
            <q-tab v-if="!accountPageSettings.hideChildrenTab" name="children" label="Children"/>
        </q-tabs>
    </div>
    <q-tab-panels v-model="tab" class="col-12">
        <q-tab-panel v-if="!accountPageSettings.hideTransactionTab" name="transactions">
            <TransactionsTable :account="account" :showTransferLabel="true" :show-pagination-extras="true" />
        </q-tab-panel>
        <q-tab-panel v-if="!accountPageSettings.hideContractsTab && abi" name="contract">
            <ContractTabs/>
        </q-tab-panel>
        <q-tab-panel v-if="!accountPageSettings.hideTokensTab" name="tokens">
            <TokensPanel :account="account"/>
        </q-tab-panel>
        <q-tab-panel v-if="!accountPageSettings.hideKeysTab" name="keys">
            <KeysPanel :account="account"/>
        </q-tab-panel>
        <q-tab-panel v-if="!accountPageSettings.hideChildrenTab" name="children">
            <ChildrenPanel :account="account"/>
        </q-tab-panel>
    </q-tab-panels>
</div>
</template>

<style lang="sass">
.account-card
    width: 550px
    border-radius: .5rem
    margin-top: 1rem
    margin-left: auto
    margin-right: auto
    margin-bottom: 2rem
    box-shadow: none
.tabs
    color: white

.q-tab-panels--dark
    background: unset
</style>
