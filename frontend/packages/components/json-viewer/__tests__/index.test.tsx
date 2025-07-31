/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import BigNumber from 'bignumber.js';
import { render } from '@testing-library/react';

import '@testing-library/jest-dom';

import { JsonViewer } from '../src';

describe('json-viewer', () => {
  it('test null', () => {
    const { getByText } = render(<JsonViewer data={null} />);

    expect(getByText('Null')).toBeInTheDocument();
  });

  it('test undefined', () => {
    const { getByText } = render(<JsonViewer data={null} />);

    expect(getByText('Null')).toBeInTheDocument();
  });

  it('test string render', () => {
    const { getAllByTestId } = render(
      <JsonViewer data={'第一段文本\n第二段文本'} />,
    );

    const elements = getAllByTestId('json-viewer-text-field-paragraph');

    expect(elements[0]).toHaveTextContent('第一段文本');
    expect(elements[1]).toHaveTextContent('第二段文本');
  });

  it('test empty object render', () => {
    const { getByTestId } = render(<JsonViewer data={{}} />);

    expect(getByTestId('json-viewer-wrapper')).toBeInTheDocument();
  });

  it('test json render', () => {
    const data = {
      str: '第一段文本\n第二段文本',
      bool: true,
      num: 123456,
    };

    const { getAllByTestId } = render(<JsonViewer data={data} />);

    const elements = getAllByTestId('json-viewer-field-value');

    expect(elements[0]).toHaveTextContent('第一段文本\\n第二段文本');
    expect(elements[1]).toHaveTextContent('true');
    expect(elements[2]).toHaveTextContent('123456');
  });

  it('test auto expand', () => {
    const data = {
      obj: {
        str: '',
      },
    };

    const { getByTestId } = render(<JsonViewer data={data} />);

    expect(getByTestId('json-viewer-field-value')).toBeInTheDocument();
  });

  it('test error render', () => {
    const data = {
      $error: 'errorInfo',
    };

    const { getByTestId } = render(<JsonViewer data={data} />);

    const fieldContent = getByTestId('json-viewer-field-content');
    const fieldValue = getByTestId('json-viewer-field-value');

    expect(fieldContent.className).toMatch('is-error');
    expect(fieldValue).toHaveTextContent('errorInfo');
  });

  it('test warning render', () => {
    const data = {
      $warning: 'warningInfo',
    };

    const { getByTestId } = render(<JsonViewer data={data} />);

    const fieldContent = getByTestId('json-viewer-field-content');
    const fieldValue = getByTestId('json-viewer-field-value');

    expect(fieldContent.className).toMatch('is-warning');
    expect(fieldValue).toHaveTextContent('warningInfo');
  });

  it('test number', () => {
    const data = {
      id: 123,
    };

    const { getByTestId } = render(<JsonViewer data={data} />);
    const fieldValue = getByTestId('json-viewer-field-value');
    expect(fieldValue).toHaveTextContent('123');
    expect(fieldValue.className).toMatch('field-value-number');
  });

  it('test object with bignumber', () => {
    const data = {
      id: new BigNumber('7470026866305744896'),
    };

    const { getByTestId } = render(<JsonViewer data={data} />);
    const fieldValue = getByTestId('json-viewer-field-value');
    expect(fieldValue).toHaveTextContent('7470026866305744896');
    expect(fieldValue.className).toMatch('field-value-number');
  });

  it('test simple bignumber', () => {
    const data = new BigNumber('7470026866305744896');

    const { getByTestId } = render(<JsonViewer data={data} />);
    const fieldValue = getByTestId('json-viewer-field-value');
    expect(fieldValue).toHaveTextContent('7470026866305744896');
    expect(fieldValue.className).toMatch('field-value-number');
  });
});
