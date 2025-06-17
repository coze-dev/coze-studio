import classNames from 'classnames';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { TabBar, TabPane } from '@coze-arch/coze-design';

import { VariablesValue } from './variables-value';
import { VariablesConfig } from './variables-config';

export const VariablesPage = () => {
  const params = useKnowledgeParams();
  const { projectID = '', version } = params;
  return (
    <div
      className={classNames(
        'h-full w-full overflow-hidden',
        'border border-solid coz-stroke-primary coz-bg-max',
      )}
    >
      <TabBar
        lazyRender
        type="text"
        className={classNames(
          'h-full flex flex-col',
          // 滚动条位置调整到 tab 内容中
          '[&_.semi-tabs-content]:p-0 [&_.semi-tabs-content]:grow [&_.semi-tabs-content]:overflow-hidden',
          '[&_.semi-tabs-pane-active]:h-full',
          '[&_.semi-tabs-pane-motion-overlay]:h-full [&_.semi-tabs-pane-motion-overlay]:overflow-auto',
        )}
        tabBarClassName="flex items-center h-[56px] mx-[16px]"
      >
        <TabPane tab={I18n.t('db_optimize_033')} itemKey="config">
          <VariablesConfig projectID={projectID} version={version} />
        </TabPane>
        <TabPane tab={I18n.t('variable_Tabname_test_data')} itemKey="values">
          <VariablesValue projectID={projectID} version={version} />
        </TabPane>
      </TabBar>
    </div>
  );
};
