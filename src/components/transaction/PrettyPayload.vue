<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';

export default defineComponent({
    name: 'PrettyPayload',
    components: { AccountFormat },
    props: {
        depth: { type: Number, required: true },
        payload: { type: Object, required: false },
    },
    setup(props) {
        const { depth, payload } = toRefs(props);
        const type = payload.value === null ? 'null' : typeof payload.value;

        const list = computed(() => {
            if (type === 'object') {
                return Object.keys(payload.value);
            }
            return undefined;
        });

        function isAccount(data: string): boolean {
            const accountRegEx = [
                'account',
                'to',
                'from',
                'owner',
                'account_name',
                'voter',
                'payer_account',
                'receiver_account',
                'producer',
            ];
            return accountRegEx.includes(data);
        }

        const classObject = computed(() => ({
            'payload': true,
            'payload__indent': depth.value > 0,
        }));

        return {
            type,
            list,
            classObject,
            isAccount,
        };
    },

});
</script>

<template>
<div
    v-for="key, index in list"
    :key="index"
    :class="classObject"
>
    <template v-if="Array.isArray(payload[key])">
        <span class="text-bold">{{ key }}:</span>
        <span v-if="payload[key].length === 0">{{` [ ]`}}</span>
        <ul v-else class="payload__list">
            <li
                v-for="(item, index) in payload[key]"
                :key="index"
                class="payload__list-item"
            >
                <PrettyPayload
                    :depth="depth + 1"
                    :payload="item"
                />
            </li>
        </ul>
    </template>
    <template v-else-if="typeof payload[key] === 'object'">
        <div class="text-bold">{{ key +':'}}</div>
        <PrettyPayload
            :depth="depth + 1"
            :payload="payload[key]"
        />
    </template>
    <template v-else>
        <div class="row items-center">
            <span class="text-bold text-center">{{ key }}:&nbsp;</span>
            <AccountFormat v-if="isAccount(key)" :account="payload[key]" type="account">&nbsp;</AccountFormat>
            <span v-else>{{ payload[key] }}</span>
        </div>
    </template>
</div>
</template>

<style lang="sass" scoped>
.payload
    max-width: 100%
    white-space: normal
    &__indent
        margin-left: 1rem
    &__list
        margin: 0
        padding: 0
    &__list-item
        list-style-position: inside
        list-style: none
        margin: 0
        padding: 0

</style>
