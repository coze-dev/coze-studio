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

import { useCallback, useState } from 'react';

import dayjs from 'dayjs';
import classnames from 'classnames';
import { useLatest } from 'ahooks';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { cronJobTranslator } from '@coze-workflow/components';
import { TriggerSetType, workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozIllusEmpty,
  IconCozIllusEmptyDark,
} from '@coze-arch/coze-design/illustrations';
import {
  IconCozEye,
  IconCozPlayCircle,
  IconCozRefresh,
  IconCozTrashCan,
  IconCozTrigger,
} from '@coze-arch/coze-design/icons';
import {
  Button,
  EmptyState,
  IconButton,
  Modal,
  Table,
  Toast,
} from '@coze-arch/coze-design';

import { useGlobalState } from '@/hooks';
import { IconNameDescCard } from '@/form-extensions/components/icon-name-desc-card';

import { Notify } from '../notify';

import styles from './index.module.less';

type TriggerListProps = SetterComponentProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  {
    bindWorkflowId?: string;
  }
>;

interface TriggerInfo {
  triggerId?: string;
  triggerName?: string;
  createTime?: string;
  triggerTime?: string;
  useId?: string;
}

export const TriggerListSetter = ({
  value,
  onChange,
  options,
  readonly,
}: TriggerListProps) => {
  // const { bindWorkflowId } = options;
  const { spaceId, projectId, getProjectApi } = useGlobalState();
  const projectApi = getProjectApi();
  const [currentPage, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState<{
    list: TriggerInfo[];
    total: number;
  }>({
    list: [],
    total: 0,
  });

  const latestLoading = useLatest(loading);
  const loadTriggerList = useCallback(async (page = 1) => {
    if (latestLoading.current) {
      return;
    }
    try {
      setLoading(true);
      setPage(page);
      const triggerList = await workflowApi.ListTriggers({
        project_id: projectId ?? '',
        space_id: spaceId,
        // workflow_id: bindWorkflowId,
        trigger_id: '',
        set_type: TriggerSetType.DEBUG_USERSET,
        page_size: pageSize,
        page_num: page,
      });

      setList({
        list:
          triggerList?.data?.trigger_list?.map(d => ({
            triggerId: d.trigger_id,
            triggerName: d.name,
            createTime: dayjs(d.create_time).format('YYYY-MM-DD HH:mm:ss'),
            triggerTime: JSON.parse(d.config ?? '{}')?.crontab,
            useId: `${d.user_id}`,
          })) ?? [],
        total: Number(triggerList?.data?.total ?? 0),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const [testRunning, setTestRunning] = useState(false);
  const testRun = async (d: TriggerInfo) => {
    try {
      setTestRunning(true);

      const result = await workflowApi.TestRunTrigger({
        space_id: spaceId,
        project_id: projectId ?? '',
        trigger_id: d.triggerId ?? '',
      });

      projectApi?.sendMsgOpenWidget(`/workflow/${result?.data?.workflow_id}`, {
        name: 'process',
        data: { executeId: result?.data?.execute_id },
      });
      setVisible(false);
    } finally {
      setTestRunning(false);
    }
  };

  const columns = [
    {
      title: I18n.t('workflow_trigger_user_create_id', {}, 'id'),
      dataIndex: 'triggerId',
      // width: 400,
      render: d => `${d}`,
    },
    {
      title: I18n.t('workflow_trigger_user_create_name', {}, '名称'),
      dataIndex: 'triggerName',
      render: d => `${d}`,
    },
    {
      title: I18n.t('workflow_trigger_user_create_time', {}, '创建时间'),
      dataIndex: 'createTime',
      render: d => `${d}`,
    },
    {
      title: I18n.t('workflow_trigger_user_create_schedula', {}, '触发时间'),
      dataIndex: 'triggerTime',
      render: d => (
        <>
          <div>{`${d}`}</div>
          <div>{cronJobTranslator(d)}</div>
        </>
      ),
    },
    {
      title: I18n.t('workflow_trigger_user_create_userid', {}, '用户id'),
      dataIndex: 'useId',
      render: d => `${d}`,
    },
    {
      title: I18n.t('workflow_trigger_user_create_action', {}, '操作'),
      width: 120,
      render: d => (
        <div className="flex flex-row gap-[8px] justify-end">
          <IconButton
            color="secondary"
            icon={<IconCozPlayCircle />}
            loading={testRunning}
            onClick={() => {
              testRun(d);
            }}
          />
          {readonly ? (
            <></>
          ) : (
            <IconButton
              color="secondary"
              icon={<IconCozTrashCan />}
              onClick={async () => {
                try {
                  await workflowApi.DeleteTrigger({
                    space_id: spaceId,
                    project_id: projectId ?? '',
                    trigger_id: d.triggerId ?? '',
                    set_type: TriggerSetType.DEBUG_USERSET,
                  });

                  loadTriggerList(currentPage);
                } catch (e) {
                  Toast.error(e.message);
                }
              }}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="!p-0">
      <div className="">
        <IconNameDescCard
          icon={
            <div className="h-[32px] w-[32px] flex flex-row items-center justify-center rounded-[4px] bg-[#8E4EFF]">
              <IconCozTrigger className="text-white" />
            </div>
          }
          name={I18n.t('workflow_trigger_user_create_list', {}, '触发器列表')}
          description={I18n.t(
            'workflow_user_trigger_list_descr',
            {},
            '查看和管理已创建触发器任务',
          )}
          readonly={readonly || IS_BOT_OP}
          showDeleteBtn={false}
          alwaysShowActions={true}
          actions={
            <div className="flex flex-row gap-[2px] items-center">
              <IconCozEye />
              <Button
                color="secondary"
                theme="borderless"
                onClick={() => {
                  setVisible(true);
                  loadTriggerList(1);
                }}
                className="!p-0"
              >
                {I18n.t('workflow_trigger_user_create_list_read', {}, '查看')}
              </Button>
            </div>
          }
        />
      </div>
      <Modal
        title={I18n.t('workflow_trigger_user_create_list', {}, '触发器列表')}
        width={'80%'}
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        footer={
          <div className="flex flex-row gap-[8px] justify-end">
            <Button
              color="primary"
              onClick={() => {
                setVisible(false);
              }}
              loading={loading}
            >
              {I18n.t('workflow_trigger_user_create_close', {}, '关闭')}
            </Button>
            <Button
              icon={<IconCozRefresh />}
              color="primary"
              onClick={() => {
                loadTriggerList(1);
              }}
              className="!ml-0"
            >
              {I18n.t('workflow_trigger_user_create_refresh', {}, '刷新')}
            </Button>
          </div>
        }
      >
        <div className={classnames(styles['trigger-list'], 'flex flex-col')}>
          <div className="coz-bg-max sticky top-0 z-10 pb-[16px]">
            <Notify
              align="left"
              className="rounded-[8px]"
              isBreakLine
              text={I18n.t(
                'workflow_user_trigger_banner',
                {},
                '设置以后需要发布到对应渠道才能定时生效',
              )}
            />
          </div>
          {list?.list?.length === 0 ? (
            <div className="w-full flex-1 flex flex-col justify-center">
              <EmptyState
                size="full_screen"
                icon={<IconCozIllusEmpty />}
                darkModeIcon={<IconCozIllusEmptyDark />}
                title={I18n.t(
                  'workflow_trigger_user_create_nodata',
                  {},
                  '暂时没有数据',
                )}
                description={I18n.t(
                  'workflow_trigger_user_create_advice',
                  {},
                  '您可以使用触发器节点进行创建',
                )}
              />
            </div>
          ) : (
            <Table
              tableProps={{
                columns,
                dataSource: list.list,
                loading,
                pagination: {
                  currentPage,
                  pageSize,
                  total: list.total,
                  onPageChange: loadTriggerList,
                },
              }}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
export const triggerList = {
  key: 'TriggerList',
  component: TriggerListSetter,
};
