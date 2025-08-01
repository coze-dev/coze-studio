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

import classNames from 'classnames';
import { TabPane, Tabs, Typography, Divider } from '@coze-arch/coze-design';

const { Text } = Typography;

import { BotE2e } from '@coze-data/e2e';

import ResetBtn from './table/reset-btn';
import { DataTable, type DataTableRef } from './table';

import s from './index.module.less';

import type { DatabaseInfo, DatabaseList } from '@coze-studio/bot-detail-store';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const TablePaneContent = forwardRef<
  DataTableRef,
  {
    info: DatabaseInfo;
    botID?: string;
    workflowID?: string;
    projectID?: string;
  }
>(({ info, botID, workflowID, projectID }, ref) => {
  const _ref = useRef<DataTableRef>(null);

  useImperativeHandle(ref, () => ({
    refetch: _ref.current?.refetch,
  }));

  return (
    <>
      <DataTable
        projectID={projectID}
        database={info}
        botID={botID}
        workflowID={workflowID}
        ref={_ref}
      />
      <div
        className="absolute top-[6px] right-0"
        data-testid={BotE2e.BotDatabaseDebugModalResetBtn}
      >
        <ResetBtn
          database={info}
          botID={botID}
          workflowID={workflowID}
          projectID={projectID}
          afterReset={() => {
            _ref.current?.refetch?.();
          }}
        />
      </div>
    </>
  );
});

export interface MultiTableProps {
  botID?: string;
  workflowID?: string;
  databaseList: DatabaseList;
  projectID?: string;
  activeDatabaseID?: string;
}

const MultiTable = forwardRef<DataTableRef, MultiTableProps>(
  ({ botID, workflowID, databaseList, projectID, activeDatabaseID }, ref) => {
    const [activeKeyInner, setActiveKeyInner] = useState(
      activeDatabaseID ?? databaseList?.[0]?.tableId,
    );

    useEffect(() => {
      if (typeof activeDatabaseID !== 'undefined') {
        setActiveKeyInner(activeDatabaseID);
      }
    }, [activeDatabaseID]);

    const tableRefMap = useRef<Record<string, () => Promise<void>>>({});

    useImperativeHandle(ref, () => ({
      refetch: tableRefMap.current[activeKeyInner],
    }));

    return (
      <div
        className={classNames({
          [s['modal-content-tabs']]: true,
          ['h-full']: true,
        })}
      >
        {databaseList.length ? (
          <Tabs
            type="line"
            keepDOM={false}
            renderTabBar={tabBarProps => {
              const { list, activeKey, onTabClick } = tabBarProps;
              return (
                <div className={classNames([s['tab-bar-box'], 'mr-[108px]'])}>
                  {list?.map((item, index) => (
                    <>
                      <Text
                        data-dtestid={`${BotE2e.BotDatabaseDebugModalTableNameTab}.${item.tab}`}
                        className={classNames({
                          [s['tab-bar-item']]: true,
                          [s['tab-bar-item-active']]:
                            activeKey === item.itemKey,
                        })}
                        onClick={e => {
                          onTabClick?.(item.itemKey, e);
                        }}
                        ellipsis={{
                          showTooltip: true,
                        }}
                      >
                        {item.tab}
                      </Text>
                      {index === list.length - 1 ? null : (
                        <Divider layout="vertical" />
                      )}
                    </>
                  ))}
                </div>
              );
            }}
            activeKey={activeKeyInner}
            onChange={setActiveKeyInner}
          >
            {databaseList.map(item => (
              <TabPane tab={item.name} itemKey={item.tableId}>
                <TablePaneContent
                  projectID={projectID}
                  info={item}
                  botID={botID}
                  workflowID={workflowID}
                  ref={tableRef => {
                    if (tableRef?.refetch) {
                      tableRefMap.current[item.tableId] = tableRef.refetch;
                    }
                  }}
                />
              </TabPane>
            ))}
          </Tabs>
        ) : null}
      </div>
    );
  },
);

export default MultiTable;
