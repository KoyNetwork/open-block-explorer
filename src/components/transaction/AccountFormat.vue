<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useProfileStore } from 'src/stores/profiles';
import ProfileCard from 'src/components/ProfileCard.vue';

export default defineComponent({
    name: 'AccountFormat',
    components: {
        ProfileCard,
    },
    props: {
        account: {
            type: String,
            default: () => '',
        },
        type: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const accAccount = computed(() => props.account);
        const profileStore = useProfileStore();
        const profile = computed(() => profileStore.profiles.get(accAccount.value));
        const hover = ref(false);

        onMounted(async () => {
            if (props.type !== 'transaction' && !profile.value) {
                await profileStore.setProfile(accAccount.value);
            }
        });

        return {
            accType: props.type,
            accAccount,
            profile,
            hover,
        };
    },
});
</script>

<template>
<a
    class="items-center justify-center inline q-ma-0 accountFormat__link row q-gutter-xs"
    :href=" '/' + type + '/' + accAccount"
>
    <img v-if="type !== 'transaction' && profile?.avatar" class="accountFormat__avatar" :src="profile?.avatar">
    <span class="q-ma-0"> {{type === 'transaction' ? accAccount.slice(0, 8) : accAccount}} </span>
    <q-tooltip v-if="type !== 'transaction' && profile?.avatar" :target="true">
        <ProfileCard :profile="profile"/>
    </q-tooltip>
</a>
</template>

<style lang="sass" scoped>
.accountFormat
    &__link
        text-decoration: none
        &:hover
            text-decoration: underline

    &__avatar
        height: 24px
        width: 24px
        object-fit: cover
</style>
