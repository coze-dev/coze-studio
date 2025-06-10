import '@testing-library/jest-dom';
import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { TreeSelect } from '..';

const treeData = [
  {
    label: '亚洲',
    value: 'Asia',
    key: '0',
    children: [
      {
        label: '中国',
        value: 'China',
        key: '0-0',
        children: [
          {
            label: '北京',
            value: 'Beijing',
            key: '0-0-0',
          },
          {
            label: '上海',
            value: 'Shanghai',
            key: '0-0-1',
          },
        ],
      },
    ],
  },
  {
    label: '北美洲',
    value: 'North America',
    key: '1',
  },
];

describe('TreeSelect', () => {
  it('should render', () => {
    const { container } = render(
      <TreeSelect
        multiple
        leafOnly={true}
        treeData={treeData}
        placeholder="请选择"
        className="w-200"
      />,
    );
    const element = container.querySelector('.coz-tree-select');
    expect(element).toBeInTheDocument();
  });

  it('should click', async () => {
    const { container } = render(
      <TreeSelect
        leafOnly={true}
        treeData={treeData}
        placeholder="请选择"
        className="w-200"
      />,
    );
    const element = container.querySelector('.coz-tree-select');
    expect(element).toBeInTheDocument();
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(element);
    const treeItemShow = await screen.findByRole('tree');
    expect(
      treeItemShow.closest('.coz-tree-select-popover'),
    ).toBeInTheDocument();
    expect(treeItemShow.closest('.coz-tree-select-popover')).toBeVisible();
    const treeNode = screen.queryByText('北美洲');
    expect(treeNode).toBeInTheDocument();
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(treeNode.parentNode);
    const selectedNode = container.querySelector('.semi-tree-select-selection');
    expect(selectedNode).toBeInTheDocument();
    expect(selectedNode).toHaveTextContent('北美洲');
  });

  it('should only allow leaf node selection when onlyLeafSelectable is true', async () => {
    const { container } = render(
      <TreeSelect
        treeData={treeData}
        placeholder="请选择"
        onlyLeafSelectable
      />,
    );

    const element = container.querySelector('.coz-tree-select');
    expect(element).toBeInTheDocument();
    // @ts-expect-error -- linter-disable-autofix
    fireEvent.click(element);

    const tree = await screen.findByRole('tree');

    expect(tree.innerHTML).toMatchSnapshot();
  });
});

it('should multiple select', async () => {
  const { container } = render(
    <TreeSelect
      multiple
      leafOnly={true}
      treeData={treeData}
      placeholder="请选择"
      className="w-200"
    />,
  );
  const element = container.querySelector('.coz-tree-select');
  expect(element).toBeInTheDocument();
  // @ts-expect-error -- linter-disable-autofix
  fireEvent.click(element);
  const treeItemShow = await screen.findByRole('tree');
  expect(treeItemShow.closest('.coz-tree-select-popover')).toBeInTheDocument();
  const treeNode = screen.queryByText('亚洲');
  expect(treeNode).toBeInTheDocument();
  // @ts-expect-error -- linter-disable-autofix
  fireEvent.click(treeNode);
  const selectedNode = container.querySelector('.semi-tree-select-selection');
  expect(selectedNode).toBeInTheDocument();
  expect(selectedNode).toHaveTextContent('北京上海');
});
