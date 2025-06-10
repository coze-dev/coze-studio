import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { Collapse } from '..';

describe('Collapse', () => {
  it('render collapse correctly', () => {
    const { container } = render(<Collapse>Coze Design</Collapse>);
    expect(container.getElementsByClassName('coz-collapse')).toHaveLength(1);
  });

  it('render collapse with panel', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Panel header="This is panel header 1" itemKey="1">
          <p>Hi, bytedance dance dance. This is the docsite of coze design. </p>
        </Collapse.Panel>
        <Collapse.Panel header="This is panel header 2" itemKey="2">
          <p>Hi, bytedance dance dance. This is the docsite of coze design. </p>
        </Collapse.Panel>
      </Collapse>,
    );
    expect(container.getElementsByClassName('semi-collapse-item')).toHaveLength(
      2,
    );
  });
});
