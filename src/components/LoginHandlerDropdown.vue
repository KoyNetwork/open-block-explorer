<script lang="ts">
import { computed, defineComponent, ref, onMounted } from 'vue';
import WalletModal from 'src/components/WalletModal.vue';
import { getAuthenticators } from 'src/boot/ual';
import { Authenticator } from 'universal-authenticator-library';
import { getChain } from 'src/config/ConfigManager';
import { useProfileStore } from 'src/stores/profiles';
import { useAccountStore } from 'src/stores/account';

export default defineComponent({
    name: 'LoginHandlerDropdown',
    components: { WalletModal },
    setup() {
        const authenticators = getAuthenticators();
        const accountStore = useAccountStore();
        const profileStore = useProfileStore();
        const avatar = computed(() => profileStore.profiles.get(accountStore.accountName)?.avatar);
        const showModal = ref(false);

        const getAuthenticator = (): Authenticator => {
            const wallet = localStorage.getItem('autoLogin_' + getChain().getChainId());
            return authenticators.find(
                auth => auth.getName() === wallet,
            );
        };

        const onLogout = async (): Promise<void> => {
            const authenticator = getAuthenticator();
            try {
                authenticator && (await authenticator.logout());
                clearAccount();
            } catch (error) {
                console.error('Authenticator logout error', error);
                clearAccount();
            }
        };

        const clearAccount = (): void => {
            void accountStore.logout();
        };

        onMounted(async () => {
            if (!avatar.value) {
                await profileStore.setProfile(accountStore.accountName);
            }
        });

        return {
            account: accountStore.accountName,
            showModal,
            disconnectLabel: 'Disconnect',
            onLogout,
            avatar,
        };
    },
});
</script>
<template>

<div class="connect-button-container">
    <q-avatar class="profile-avatar" size="32px">
        <svg v-html="avatar" />
    </q-avatar>
    <q-btn-dropdown
        class="connect-button"
        :label="account"
        :outline="true"
        icon="profile"
    >
        <q-card class="buttons-container">
            <q-card-section>
                <div class="row">
                    <div class="col-12"><a class="text-white hover-dec" :href=" '/account/' + account">{{account}}</a></div>
                </div>
            </q-card-section>
            <q-separator dark/>
            <q-card-section>
                <div class="q-px-sm q-pb-sm">
                    <q-btn
                        class="full-width"
                        color="primary"
                        label="Disconect"
                        @click="onLogout"
                    />
                </div>
            </q-card-section>
        </q-card>
    </q-btn-dropdown>
    <WalletModal v-model="showModal"/>
</div>
</template>
<style lang="sass" scoped>
.q-menu
  min-width: unset
.q-list
  width: 12rem
.account-button
  width: 110px
  margin: 15px
.connect-button
  width: fit-content
  height: 40px
  width: 180px
  text-transform: lowercase
.buttons-container
  width: 220px
  max-width: 80vw
  background: var(--q-color-dropdown-card)
.profile-avatar
    position: absolute
    top: 50%
    transform: translateY(-50%)
    left: 4px
    z-index: 10
    border-radius: 30%
    svg
        object-fit: cover
        height: 100%
        width: 100%
.connect-button-container
    position: relative
    width: 180px // Makes container width fixed
</style>
