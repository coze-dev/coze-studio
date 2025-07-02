/**
 * @file The open source version does not currently provide multi-person collaboration capabilities
 */
import { create } from 'zustand';

export const CollaboratorsBtn = _props => null;
export const getIsCozePro = _props => false;

interface CozeProRightsStore {
  rightsInfo: {};
  getRights: (refresh?: boolean) => Promise<{}>;
}

export const useCozeProRightsStore = create<CozeProRightsStore>(() => ({
  rightsInfo: {},
  getRights: _refresh => Promise.resolve({}),
}));
