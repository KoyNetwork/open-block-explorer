<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { DialogChainObject } from 'quasar';
import { getAuthenticators } from 'src/boot/ual';
import { useQuasar } from 'quasar';
import { useAccountStore } from 'src/stores/account';


export default defineComponent({
    name: 'WalletModal',
    setup() {
        const authenticators = getAuthenticators();
        const $q = useQuasar();
        const store = useAccountStore();
        const error = ref<string>(null);
        const account = computed(() => store.accountName);
        const loading = {};
        const walletDialog = ref<DialogChainObject>(null);
        const iconSize = computed(() => {
            if ($q.screen.width > 420) {
                return '3em';
            }
            return '1.5em';
        });

        const onLogin = async (idx: number) => {
            const authenticator = authenticators[idx];
            error.value = null;
            try {
                await store.login({
                    account: account.value,
                    authenticator,
                });
            } catch (e) {
                error.value = e as string;
            }
            walletDialog.value.hide();
        };

        // TODO: check if this is the intention of the original author
        // because the original code was not present
        const openUrl = (url: string) => window.open(url, '_blank');

        return {
            error,
            loading,
            account,
            walletDialog,
            onLogin,
            openUrl,
            iconSize,
        };
    },
});
</script>
<template>
<q-dialog ref="walletDialog" maximized class="modal-container">
    <div class="authenticatorsCard column items-center q-pt-xl full-height full-width">
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
        <div class="modal-header-container">
            <h3 class="modal-header text-h4">Choose your sign in method</h3>
        </div>
        <q-list>
            <q-item
                v-for="(wallet, idx) in $ual.getAuthenticators().availableAuthenticators"
                :key="wallet.getStyle().text"
                v-ripple
                :style="{background: wallet.getStyle().background, color: wallet.getStyle().textColor}"
            >
                <q-item-section class="cursor-pointer" avatar @click="onLogin(idx)"><img :src="wallet.getStyle().icon" width="32"></q-item-section>
                <q-item-section class="cursor-pointer text-h6" @click="onLogin(idx)">{{ wallet.getStyle().text }}</q-item-section>
                <q-item-section class="flex" avatar>
                    <q-spinner v-if="loading === wallet.getStyle().text" :color="wallet.getStyle().textColor" size="2em"/>
                    <q-btn
                        v-else
                        :color="wallet.getStyle().textColor"
                        icon="get_app"
                        target="_blank"
                        dense
                        flat
                        size="12px"
                        @click="openUrl(wallet.getOnboardingLink())"
                    >
                        <q-tooltip>Get app</q-tooltip>
                    </q-btn>
                </q-item-section>
            </q-item>
            <q-item v-if="error" :active="!!error" active-class="bg-red-1 text-grey-8">
                <q-item-section>{{ error }}</q-item-section>
            </q-item>
        </q-list>
    </div>
</q-dialog>
</template>

<style lang="sass">
.modal-container
  background: var(--q-dark)
.authenticatorsCard
  background: linear-gradient(to right, var(--q-color-background), var(--q-color-background)), var(--q-color-background-gradient)

@media screen and (max-width: 420px)
  h3.modal-header
    font-size: 1.5rem

</style>
