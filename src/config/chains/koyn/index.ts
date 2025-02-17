/*
# MAINNET VALUES
# NETWORK_CHAIN_ID=4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11
# NETWORK_HOST=telos.caleos.io
# NETWORK_PORT=443
# NETWORK_PROTOCOL=https
# NETWORK_EVM_RPC=https://mainnet.telos.net/evm
# NETWORK_EVM_ENDPOINT=https://mainnet.telos.net
# NETWORK_EVM_CONTRACT=eosio.evm
# NETWORK_EVM_CHAIN_ID=40
# HYPERION_ENDPOINT=https://telos.caleos.io
# TELOS_API_ENDPOINT=https://api.telos.net/v1
 */

import BaseChain, { baseUiConfiguration } from 'src/config/BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { getEmptyPriceChartData } from 'src/api/price';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';
import { UiCustomization } from 'src/types/UiCustomization';
const CHAIN_ID =
  '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f';
const NAME = 'koyn';
const DISPLAY = 'KOYN';
const TOKEN = {
    symbol: 'KOYN',
    precision: 4,
    amount: 0,
    contract: 'koyn.token',
} as Token;
const HYPERION_ENDPOINT = 'https://hyperion.koy.network';
const RPC_ENDPOINT = {
    protocol: 'https',
    host: 'mainnet.koy.network',
    port: 443,
};
const API_ENDPOINT = 'https://mainnet.koy.network/v1';
const S3_PRODUCER_BUCKET = '';
const DISPLAY_MAP = true;
const THEME = {
    primary: '#CE1C61',
    secondary: '#82103C',
    accent: '#EE05F2',
    dark: '#131313',
    positive: '#21BA45',
    negative: '#FF0000',
    info: '#90B862',
    warning: '#FFBB69',
    'color-map': '#492030',
    'color-background': '#EE05F226',
    'color-background-gradient': 'linear-gradient(132.08deg, rgba(255, 255, 255, 0.325) 0%, rgba(255, 255, 255, 0.1235) 52.08%, rgba(255, 255, 255, 0) 100%)',
    'color-primary-gradient': 'linear-gradient(90deg, #82103C 65%, #492030 100%)',
    'color-secondary-gradient':
    'linear-gradient(180deg, #82103C 20%, #5492030 85%)',
    'color-tertiary-gradient':
    'linear-gradient(90deg, #82103C 35%, #82103C 65%)',
    'color-progress-gradient':
    'linear-gradient(90deg, #82103C 10%, #CBCAF5 75%)',
    'color-producer-card-background': '#F5F4FE',
    'color-select-box-background': '#E0DFFB',
    'color-separator-background': 'rgba(138, 101, 212, 0.1)',
    'color-header-background': '#82103C',
    'color-header-border': '#710E34',
    'color-header-support-background': 'linear-gradient(180deg, #82103C 20%, #542030 85%)',
    'color-graph-shadow': '#CE1C6128',
    'color-footer-background': '#90B862',
    'color-footer-text': '#492030',
    'color-dropdown-card': '#492030',
};
export default class Koyn extends BaseChain {
    getName(): string {
        return NAME;
    }
    getChainId(): string {
        return CHAIN_ID;
    }
    getDisplay(): string {
        return DISPLAY;
    }
    getHyperionEndpoint(): string {
        return HYPERION_ENDPOINT;
    }
    getRPCEndpoint(): RpcEndpoint {
        return RPC_ENDPOINT;
    }
    getFuelRPCEndpoint(): RpcEndpoint | null {
        return null;
    }
    getApiEndpoint(): string {
        return API_ENDPOINT;
    }
    getS3ProducerBucket(): string {
        return S3_PRODUCER_BUCKET;
    }
    getPriceData(): Promise<PriceChartData> {
        return getEmptyPriceChartData();
    }
    getUsdPrice(): Promise<number> {
        return Promise.resolve(0);
    }
    getSystemToken(): Token {
        return TOKEN;
    }
    getLargeLogoPath(): string {
        return 'chains/koyn/koyn_logo.svg';
    }
    getSmallLogoPath(): string {
        return 'chains/koyn/koyn.png';
    }
    getMapDisplay(): boolean {
        return DISPLAY_MAP;
    }
    getTheme(): Theme {
        return THEME;
    }

    useDarkMode(): boolean {
        return true;
    }

    getUiCustomization(): UiCustomization {
        return {
            ...baseUiConfiguration,
            footerLinks: [
                { label: 'PRIVACY', url: 'https://koy.network/privacy-policy' },
            ],
            headerSettings: {
                hideLoginHandler: false,

                hideNetworkTab: true,
                hideWalletTab: true,
                hideVoteTab: true,
                hideProposalTab: true,
            },
            accountPageSettings: {
                hideCpuInfo: true,
                hideNetInfo: true,
                hideRamInfo: true,
                hideRexInfo: true,
                hideRefundingInfo: true,
                hideDelegatedInfo: true,

                hideResourcesControl: true,
                hideRexControl: true,

                hideTransactionTab: false,
                hideTokensTab: true,
                hideKeysTab: false,
                hideChildrenTab: true,
                hideContractsTab: false,
                hideCreatedBy: true,
            },
            networkPageSettings: {
                hideMapData: true,
                hidePriceChart: true,
            },
        };
    }

    getFiltersSupported(prop: string): boolean {
        if (prop === 'notified') {
            return true;
        }
        return true;
    }
}
