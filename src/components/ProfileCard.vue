<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'ProfileCard',
    props: {
        profile: {
            type: Object || null,
            required: true,
            default: null,
        },
    },
    setup(props) {
        const profile = computed(() => props.profile);

        return {
            avatar: profile,
        };
    },
});
</script>

<template>
<div class="profileCard__container">
    <img class="profileCard__avatar" :src="profile?.avatar">
</div>
</template>

<style lang="sass" scoped>
.profileCard
    &__container
        padding: 16px

    &__avatar
        height: 100px
        width: 100px
        object-fit: cover
        border-radius: 28%
</style>
