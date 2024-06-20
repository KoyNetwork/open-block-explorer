<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import LoginHandlerDropdown from 'src/components/LoginHandlerDropdown.vue';
import WalletModal from 'src/components/WalletModal.vue';
import { Authenticator } from 'universal-authenticator-library';
import { getAuthenticators } from 'src/boot/ual';
import { getChain } from 'src/config/ConfigManager';
import { useAccountStore } from 'src/stores/account';

export default defineComponent({
    name: 'LoginHandler',
    components: { LoginHandlerDropdown, WalletModal },
    setup() {
        const authenticators = getAuthenticators();
        const accountStore = useAccountStore();

        const showDropdown = ref(false);
        const showModal = ref(false);
        const account = computed(() => accountStore.accountName);

        onMounted(() => {
            const storedAccount = localStorage.getItem('account_' + getChain().getChainId());
            if (storedAccount) {
                void accountStore.setAccountName(storedAccount);
                const ualName = localStorage.getItem('autoLogin_' + getChain().getChainId());
                const ual: Authenticator = authenticators.find(
                    a => a.getName() === ualName,
                );
                void accountStore.login({
                    account: storedAccount,
                    authenticator: ual,
                });
            }
        });

        return {
            showDropdown,
            showModal,
            account,
        };
    },
});
</script>

<template>
<div>
    <LoginHandlerDropdown v-if="account"/>
    <q-btn
        v-else
        class="button-primary btn-login"
        label="Connect"
        @click="showModal = true"
    />
    <WalletModal v-model="showModal"/>
</div>
</template>

<style scoped lang="sass">
$small:600px

.btn-login
    width: 60%
    min-width: 120px
    max-width: 140px
    height: 40px
    @media screen and (max-width: $small)
        max-width: 100%
        min-width: unset
        width: auto
</style>
