import { Chain } from 'src/types/Chain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';
import { UiCustomization } from 'src/types/UiCustomization';

export const DEFAULT_THEME = {
    primary: '#11589e',
    secondary: '#5d5d5d',
    accent: '#9C27B0',
    dark: '#1d1d1d',
    'dark-page': '#121212',
    positive: '#21BA45',
    negative: '#C10015',
    info: '#31CCEC',
    warning: '#F2C037',
    'color-map': '#8C8C8C',
    'color-background': '#11589e',
    'color-background-gradient': 'linear-gradient(180deg, #5d5d5d 0%, #5d5d5d 147.34%)',
    'color-sidebar-selected': '#d1d1d1',
    'color-primary-gradient': 'linear-gradient(90deg, #5d5d5d 0%, #5d5d5d 100%)',
    'color-secondary-gradient': 'linear-gradient(180deg, #5d5d5d 0%, #5d5d5d 147.34%)',
    'color-tertiary-gradient': 'linear-gradient(90deg, #CBCAF5 0%, #A9CAF3 56.77%, #63C9EF 100%)',
    'color-progress-gradient': '#11589e',
    'color-producer-card-background': '#f0f0f0',
    'color-select-box-background': '#e9e9e9',
    'color-separator-background': 'rgba(138, 101, 212, 0.1)',
    'color-card-shadow': 'rgba(37, 42, 97, 0.3)',
    'color-dropdown-card': '#172c6c',
    'color-header-background': '#4C4C4C',
    'color-header-text': '#FFFFFF',
    'color-header-border': '#777777',
    'color-header-support-background': 'linear-gradient(180deg, #4C4C4C 0%, #3B3B3B 147.34%)',
    'color-graph-shadow': '#3f65c228',
    'color-footer-background': '#000000',
    'color-footer-text': '#FFFFFF',
};

export const baseUiConfiguration: UiCustomization = {
    footerLinks: [
        { label: 'LEGAL', url: 'https://telos.net/legal' },
        { label: 'PRIVACY', url: 'https://telos.net/privacy-policy' },
        { label: 'REPOSITORY', url: 'https://github.com/telosnetwork/open-block-explorer' },
    ],
    headerSettings: {
        hideLoginHandler: false,

        hideNetworkTab: false,
        hideWalletTab: false,
        hideVoteTab: false,
        hideProposalTab: false,
    },
    accountPageSettings: {
        hideCpuInfo: false,
        hideNetInfo: false,
        hideRamInfo: false,
        hideRexInfo: false,
        hideRefundingInfo: false,
        hideDelegatedInfo: false,

        hideResourcesControl: false,
        hideRexControl: false,

        hideTransactionTab: false,
        hideTokensTab: false,
        hideKeysTab: false,
        hideChildrenTab: false,
        hideContractsTab: false,
        hideCreatedBy: false,
    },
    networkPageSettings: {
        hideMapData: false,
        hidePriceChart: false,
    },
};

export default abstract class BaseChain implements Chain {
  protected name: string;

  constructor(name: string) {
      this.name = name;
  }

  getName(): string {
      return this.name;
  }

  getLargeLogoPath(): string {
      return `~/assets/${this.name}/logo_lg.svg`;
  }

  getSmallLogoPath(): string {
      return `~/assets/${this.name}/logo_sm.svg`;
  }

  abstract getSystemToken(): Token;
  abstract getChainId(): string;
  abstract getDisplay(): string;
  abstract getHyperionEndpoint(): string;
  abstract getRPCEndpoint(): RpcEndpoint;
  abstract getFuelRPCEndpoint(): RpcEndpoint | null;
  abstract getApiEndpoint(): string;
  abstract getS3ProducerBucket(): string;
  abstract getPriceData(): Promise<PriceChartData>;
  abstract getUsdPrice(): Promise<number>;
  abstract getMapDisplay(): boolean;
  abstract getTheme(): Theme;

  useDarkMode(): boolean {
      return false;
  }

  getUiCustomization(): UiCustomization {
      return baseUiConfiguration;
  }

  abstract getFiltersSupported(prop: string): boolean;

  isTestnet(): boolean {
      return false;
  }
}
