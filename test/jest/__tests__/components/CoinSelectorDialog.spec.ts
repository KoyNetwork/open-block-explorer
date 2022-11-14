/* eslint-disable jest/no-disabled-tests */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import CoinSelectorDialog from 'src/components/CoinSelectorDialog.vue';
import { Token } from 'src/types';

installQuasarPlugin();

const mockToken = {
  symbol: 'MOCK',
  precision: 4,
  amount: 99,
  contract: 'mock.token'
} as Token;

const setMount = () => {
  return mount(CoinSelectorDialog, {
    props: {
      callback: jest.fn(),
      openCoinDialog: true,
      availableTokens: [mockToken],
      updateSelectedCoin: jest.fn()
    }
  });
};

describe('CoinSelectorDialog', () => {
  let wrapper: { vm: any };
  beforeEach(() => {
    wrapper = setMount();
  });
  describe('methods', () => {
    describe('filterTokens', () => {
      it('returns the entire available tokens list if search string is empty', () => {
        wrapper.vm.search = '';
        wrapper.vm.filterTokens();
        expect(wrapper.vm.filteredTokens).toEqual(wrapper.vm.availableTokens);
      });
      it.skip('calls filterByText', () => {
        wrapper.vm.search = 'test';
        wrapper.vm.filterByText = jest.fn();
        wrapper.vm.filterTokens();
        expect(wrapper.vm.filterByText).toHaveBeenCalled();
      });
    });
    describe('filterByText', () => {
      it.skip('returns empty array if no match', () => {
        wrapper.vm.search = 'test';
        wrapper.vm.filterByText([mockToken]);
        expect(wrapper.vm.filteredTokens).toEqual([]);
      });
      it.skip('returns token if symbol match', () => {
        wrapper.vm.search = 'MOCK';
        wrapper.vm.filterByText([mockToken]);
        expect(wrapper.vm.filteredTokens).toEqual([mockToken]);
      });
      it.skip('returns token if contract match', () => {
        wrapper.vm.search = 'mock.token';
        wrapper.vm.filterByText([mockToken]);
        expect(wrapper.vm.filteredTokens).toEqual([mockToken]);
      });
    });
  });
});
