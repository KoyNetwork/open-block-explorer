<script lang="ts">
import { defineComponent, ref } from 'vue';
import csvToJson from 'csvtojson';
import { useQuasar } from 'quasar';

export default defineComponent({
    name: 'ProposalUploadCSV',
    emits: ['actions'],
    setup(_, context) {
        const $q = useQuasar();
        const file = ref<File | null>(null);

        function handleError(message: string) {
            $q.notify({
                color: 'negative',
                message,
                actions: [
                    {
                        label: 'Dismiss',
                        color: 'white',
                    },
                ],
            });
        }

        /* eslint-disable */
        async function handleUploadCSV() {
            const csvString = await file.value.text();
            const result: any = await csvToJson().fromString(csvString);

            if (result.length === 0) {
                handleError('CSV Invalid');
                return;
            }

            const transferKeys = ['from', 'to', 'quantity', 'memo'];
            const objectKeys = Object.keys(result[0]);
            const isObjectCorrect = transferKeys.every(key => objectKeys.includes(key))

            if (!isObjectCorrect || transferKeys.length !== objectKeys.length) {
                handleError('CSV Invalid');
                return;
            }

            const actions = result.map((item: any) => {
                return {
                    account: 'eosio.token',
                    name: 'transfer',
                    authorization: [
                        {
                            actor: item.from.toLowerCase(),
                            permission: 'active'
                        }
                    ],
                    data: {
                        from: item.from.toLowerCase(),
                        to: item.to.toLowerCase(),
                        quantity: item.quantity,
                        memo: item.memo,
                    }
                }
            });

            context.emit('actions', actions)
            file.value = null;
        }
        /* eslint-enable */

        return {
            handleUploadCSV,
            file,
        };
    },
});
</script>

<template>
<ol class="q-px-lg">
    <li class="text-subtitle1 q-mb-md">Download the example
        <div class="q-mt-xs"><a
            href="/examples/msig-transfer-batch.csv"
            target="_blank"
            class="text-no-decoration"
            download="download"
        >
            <q-btn
                outline
                padding="sm md"
                color="white"
                text-color="primary"
                label="Download example"
            /></a></div>
    </li>
    <li class="text-subtitle1 q-mb-md">Edit the example csv
        <ul class="text-body2 text-grey-8 q-px-md q-mt-xs">
            <li>The quantity token must be uppercase</li>
            <li>Must have one space between the value and the token</li>
            <li>The decimal values must be separated with a dot</li>
            <li>The memo is optional</li>
        </ul><code class="block q-mt-md q-py-sm q-px-md bg-grey-3 text-body1 rounded-borders">
            payingaccount, receivingaccount, 0.1, The memo
        </code>
    </li>
    <li class="text-subtitle1">Upload the example csv
        <q-file
            v-model="file"
            outlined
            dense
            hide-bottom-space
            class="q-mt-xs"
            label="Select the CSV File"
            accept=".csv"
            max-files="1"
        >
            <template #append>
                <q-icon
                    v-if="file !== null"
                    class="cursor-pointer"
                    name="close"
                    @click.stop.prevent="file = null"
                />
            </template>
            <template #after>
                <q-btn
                    outline
                    padding="sm md"
                    color="white"
                    text-color="primary"
                    label="Upload"
                    :disabled="file === null"
                    @click="handleUploadCSV"
                />
            </template>
        </q-file>
    </li>
</ol>
</template>
