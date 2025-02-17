import { defineStore } from 'pinia';
import { GetTableRowsParams, Producer, Token } from 'src/types';
import { api } from 'src/api';
import { formatCurrency } from 'src/utils/string-utils';
import { KoyBP } from 'src/types/BP';


export interface ChainStateInterface {
    token: Token;
    bpList: KoyBP[];
    producers: Producer[];
    head_block_num: number;
    last_irreversible_block_num: number;
    head_block_producer: string;
    producerSchedule: string[];
    ram_price: string;
}

// const chain: Chain = getChain();

export const useChainStore = defineStore('chain', {
    state: (): ChainStateInterface => ({
        token: {
            symbol: '',
            precision: 0,
            amount: 0,
            contract: '',
        },
        bpList: [],
        producers: [],
        head_block_num: 0,
        last_irreversible_block_num: 0,
        head_block_producer: '',
        producerSchedule: [],
        ram_price: '0',
    }),
    getters: {
        getToken({ token }): Token {
            return token;
        },
    },
    actions: {
        setToken(token: Token) {
            this.token = token;
        },
        setsSymbol(symbol: string) {
            this.token.symbol = symbol;
        },
        setPrecision(precision: number) {
            this.token.precision = precision;
        },
        setBpList(bpList: KoyBP[]) {
            this.bpList = bpList;
        },
        setHead_block_num(hbn: number) {
            this.head_block_num = hbn;
        },
        setLIB(lib: number) {
            this.last_irreversible_block_num = lib;
        },
        setHead_block_producer(hbp: string) {
            this.head_block_producer = hbp;
        },
        setProducerSchedule(schedule: string[]) {
            this.producerSchedule = schedule;
        },
        setProducers(bpList: Producer[]) {
            this.producers = bpList;
        },
        setRamPrice(price: string) {
            this.ram_price = price;
        },
        updateBpList() {
            this.setBpList([{ owner: 'seattle.1.bp', location: { name: 'USA', longitude: -122.330280, latitude: 47.603230, country: 'USA' } },
                { owner: 'nairobi.1.bp', location: { name: 'Kenya', longitude: 36.817223, latitude: -1.286389, country: 'Kenya' } },
                { owner: 'joburg.1.bp', location: { name: 'South Africa', longitude: 28.034088, latitude: -26.195246, country: 'South Africa' } },
                { owner: 'lagos.1.bp', location: { name: 'Nigeria', longitude: 3.362, latitude: 6.485, country: 'Nigeria' } },
                { owner: 'cairo.1.bp', location: { name: 'Egypt', longitude: 31.232, latitude: 30.077, country: 'Egypt' } }]);
        //     try {
        //         const producerSchedule = (await api.getSchedule()).active.producers;
        //         // const schedule = producerSchedule.map(el => el.producer_name);
        //         // this.setProducerSchedule(schedule);
        //         const objectList = await axios.get(chain.getS3ProducerBucket());
        //         const parser = new DOMParser();
        //         const contentsArray = parser
        //             .parseFromString(objectList.data, 'text/xml')
        //             .getElementsByTagName('Contents');
        //         const lastEntry = contentsArray[contentsArray.length - 1];
        //         const lastKey = lastEntry.childNodes[0].textContent;
        //         const producerData: BP[] = (
        //     await axios.get(`${chain.getS3ProducerBucket()}/${lastKey}`)
        // ).data as BP[];
        //         let producers = (await api.getProducers()).rows;
        //         producers = producers.filter(producer => producer.is_active === 1);
        //         producers = producers.map((data) => {
        //             const bp = producerData.find(
        //                 producer => producer.owner === data.owner,
        //             );
        //             if (bp) {
        //                 try {
        //                     return {
        //                         ...data,
        //                         name: bp.org.candidate_name,
        //                         location: bp.org.location.name,
        //                     };
        //                 } catch (error) {
        //                     return data;
        //                 }
        //             } else {
        //                 return {
        //                     ...data,
        //                     name: data.owner,
        //                     location: '',
        //                 };
        //             }
        //         });
        //         producerData.sort((a, b) => b.total_votes - a.total_votes);
        //         producers.sort((a, b) => b.total_votes - a.total_votes);
        //         this.setProducers(producers);
        //         this.setBpList(producerData);
        //     } catch (err) {
        //         console.error(err);
        //     }
        },
        async updateBlockData() {
            try {
                const info = await api.getInfo();
                this.head_block_num  = info.head_block_num;
                this.last_irreversible_block_num  =info.last_irreversible_block_num;
                this.head_block_producer = info.head_block_producer;
            } catch (err) {
                console.error(err);
            }
        },
        async updateRamPrice() {
            try {
                const paramsRammarket = {
                    code: 'eosio',
                    scope: 'eosio',
                    table: 'rammarket',
                    json: true,
                } as GetTableRowsParams;
                const rammarket = (
            (await api.getTableRows(paramsRammarket)) as {
                rows: {
                    supply: string;
                    base: { balance: string; weight: string };
                    quote: { balance: string; weight: string };
                }[];
            }
                ).rows[0];
                const base = Number(rammarket.base.balance.split(' ')[0]);
                const quote = Number(rammarket.quote.balance.split(' ')[0]);
                const price = (quote * 1000) / (base - 1000);
                // add 0.5% fee to the price
                const formattedPrice = formatCurrency((price / 0.995), 4, null, true);

                this.setRamPrice(formattedPrice);
            } catch (err) {
                console.error(err);
            }
        },
    },
});

