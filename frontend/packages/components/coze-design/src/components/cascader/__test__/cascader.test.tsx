import '@testing-library/jest-dom';
import React from 'react';

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Cascader } from '..';

const treeData = [
  {
    label: '浙江省',
    value: 'zhejiang',
    children: [
      {
        label: '杭州市',
        value: 'hangzhou',
        children: [
          {
            label: '西湖区',
            value: 'xihu',
            disabled: true,
          },
          {
            label: '萧山区',
            value: 'xiaoshan',
            disabled: true,
          },
          {
            label: '临安区',
            value: 'linan',
          },
          {
            label: '余杭区',
            value: 'yuhang',
          },
          {
            label: '拱墅区',
            value: '拱墅',
          },
        ],
      },
      {
        label: '宁波市',
        value: 'ningbo',
        disabled: true,
        children: [
          {
            label: '海曙区',
            value: 'haishu',
          },
          {
            label: '江北区',
            value: 'jiangbei',
          },
          {
            label: '江北 1 区',
            value: 'jiangbei1',
          },
          {
            label: '江北区 2 区',
            value: 'jiangbei2',
          },
          {
            label: '江北区 3 区',
            value: 'jiangbei3',
          },
          {
            label: '江北区 4 区',
            value: 'jiangbei4',
          },
          {
            label: '江北区 5 区',
            value: 'jiangbei5',
          },
        ],
      },
    ],
  },
];

describe('Cascader', () => {
  it('size small has className semi-cascader-small', () => {
    const { container } = render(
      <Cascader
        placeholder="Please select"
        treeData={treeData}
        style={{ width: '200px' }}
        size={'small'}
      />,
    );

    const element = container.getElementsByClassName('semi-cascader').item(0);
    expect(element).toHaveClass('semi-cascader-small');
  });

  it('hasError should has red border', () => {
    const { container } = render(
      <Cascader
        placeholder="Please select"
        treeData={treeData}
        style={{ width: '200px' }}
        hasError
      />,
    );

    const element = container.getElementsByClassName('semi-cascader').item(0);
    expect(element).toHaveClass('border-red-6');
  });
});
