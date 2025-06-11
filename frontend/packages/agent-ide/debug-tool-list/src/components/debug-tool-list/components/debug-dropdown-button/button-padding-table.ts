import { type CSSProperties } from 'react';

interface Entry {
  withTitle: boolean;
  withDropdown: boolean;
  left: number;
  right: number;
}

const buttonPaddingTable: Entry[] = [
  {
    withDropdown: true,
    withTitle: true,
    left: 15,
    right: 9,
  },
  {
    withDropdown: true,
    withTitle: false,
    left: 8,
    right: 6,
  },
  {
    withDropdown: false,
    withTitle: true,
    left: 15,
    right: 15,
  },
  {
    withDropdown: false,
    withTitle: false,
    left: 8,
    right: 8,
  },
];

type IndexProperty = Pick<Entry, 'withTitle' | 'withDropdown'>;

const getIndexByEntry = (entry: IndexProperty) =>
  `${entry.withDropdown}-${entry.withTitle}`;

const getStyleByEntry = (entry: Entry): CSSProperties => ({
  paddingLeft: entry.left,
  paddingRight: entry.right,
});

const initial: Record<string, CSSProperties> = {};
const indexTable = buttonPaddingTable.reduce((all, entry) => {
  all[getIndexByEntry(entry)] = getStyleByEntry(entry);
  return all;
}, initial);

export const getButtonPaddingStyle = (param: {
  withDropdown: boolean;
  withTitle: boolean;
}) => {
  const index = getIndexByEntry(param);
  return indexTable[index];
};
