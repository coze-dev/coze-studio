import '@testing-library/jest-dom';
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';

import { TabBar } from '..';

const { TabPanel } = TabBar;

describe('TabBar', () => {
  it('should has className coz-tab-bar', () => {
    const { container } = render(<TabBar />);
    expect(container.querySelector('.coz-tab-bar')).toBeInTheDocument();
  });

  it('should use default tabType when type is undefined', () => {
    const { container } = render(<TabBar />);
    // 这里假设组件在使用 'button' 类型时有一些特定的标记或类名
    expect(container.querySelector('.coz-tab-bar-button')).not.toBeNull();
  });

  it('should has className coz-tab-bar-button', () => {
    const { container } = render(
      <TabBar type="button" defaultActiveKey="1">
        <TabPanel tab="效率工具" itemKey="1">
          效率工具内容
        </TabPanel>
        <TabPanel tab="商务服务" itemKey="2">
          商务服务内容
        </TabPanel>
      </TabBar>,
    );
    expect(container.querySelector('.coz-tab-bar-button')).toBeInTheDocument();
  });

  it('should use correct tabType when type is defined', () => {
    const { container } = render(
      <TabBar type="text">
        <TabPanel tab="效率工具" itemKey="效率工具" />
        <TabPanel tab="商务服务" itemKey="商务服务" />
        <TabPanel tab="文本创作" itemKey="文本创作" />
      </TabBar>,
    );
    expect(container.querySelector('.coz-tab-bar-line')).not.toBeNull();
  });

  it('should has className coz-tab-bar-content', () => {
    const { container } = render(
      <TabBar type="text" align="left">
        <TabPanel tab="我的" itemKey="1">
          我的
        </TabPanel>
        <TabPanel tab="插件" itemKey="2">
          插件
        </TabPanel>
        <TabPanel tab="工作流" itemKey="3">
          工作流
        </TabPanel>
        <TabPanel tab="图像流" itemKey="4">
          图像流
        </TabPanel>
        <TabPanel tab="知识库" itemKey="5">
          知识库
        </TabPanel>
      </TabBar>,
    );
    expect(container.querySelector('.coz-tab-bar-left')).toBeInTheDocument();
    expect(container.querySelector('.coz-tab-bar-content')).toBeInTheDocument();
  });
});
