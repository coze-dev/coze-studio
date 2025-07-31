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

/* eslint-disable @coze-arch/max-line-per-function */

import { useMemo, type MutableRefObject } from 'react';

import { useSize } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import {
  Popconfirm,
  Radio,
  Space,
  Spin,
  Switch,
  Table,
  Tooltip,
  Typography,
  UIButton,
  UIIconButton,
} from '@coze-arch/bot-semi';
import { type MockSet, TrafficScene } from '@coze-arch/bot-api/debugger_api';
import { IconAlertCircle } from '@douyinfe/semi-icons';
import {
  builtinSuccessCallback,
  MockSetEditModal,
} from '@coze-studio/mockset-edit-modal-adapter';
import {
  IconAdd,
  IconDeleteOutline,
  IconEdit,
  IconInfo,
} from '@coze-arch/bot-icons';
import { type MockSetSelectProps } from '@coze-agent-ide/plugin-shared';
import { isRealData } from '@coze-agent-ide/bot-plugin-mock-set/util';
import { useMockSetInSettingModalController } from '@coze-agent-ide/bot-plugin-mock-set/hook/use-mock-set-in-setting-modal';

// @ts-expect-error -- linter-disable-autofix
const FormTitle = titleInfo => (
  <div className="flex items-start">
    <span className="text-[rgba(28,_29,_36,_0.80)] text-[12px] not-italic font-medium leading-[16px] whitespace-nowrap">
      {titleInfo.name}
    </span>
    {titleInfo.required ? (
      <Typography.Text className="text-red text-[12px] not-italic font-medium leading-[16px]">
        {' * '}
      </Typography.Text>
    ) : null}
    {titleInfo.toolTipText ? (
      <Tooltip content={titleInfo.toolTipText}>
        <IconInfo
          className="ml-[4px] w-[14px] h-[14px]"
          style={{
            color: '#5f5f5f9e',
          }}
        />
      </Tooltip>
    ) : null}
  </div>
);

const GAP = 200;

const PartMockSet = ({
  bindSubjectInfo,
  bizCtx,
  readonly,
  contentRef,
}: MockSetSelectProps & {
  contentRef: MutableRefObject<HTMLDivElement>;
}) => {
  const {
    isEnabled,
    doEnabled,
    doSetCreateModal,
    showCreateModal,
    doHandleView,
    selectedMockSet,
    mockSetData,
    isSettingLoading,
    isListLoading,
    doChangeMock,
    initialInfo,
    doSetDeleteId,
    deleteRenderTitle,
    doConfirmDelete,
  } = useMockSetInSettingModalController({ bindSubjectInfo, bizCtx, readonly });

  const size = useSize(contentRef);

  const scroll = useMemo(() => ({ y: (size?.height ?? 0) - GAP }), [size]);

  const columns: Array<ColumnProps<MockSet>> = [
    {
      title: () => <FormTitle name={I18n.t('analytic_query_name')} required />,
      key: 'name',
      width: 200,
      render: record => (
        <Typography.Text
          component="span"
          ellipsis={{
            showTooltip: {
              type: 'tooltip',
              opts: { style: { maxWidth: '100%' } },
            },
          }}
        >
          {record.name}
        </Typography.Text>
      ),
    },
    {
      title: () => <FormTitle name={I18n.t('Description')} />,
      key: 'description',
      width: 360,
      render: record => (
        <Typography.Text
          component="div"
          ellipsis={{
            showTooltip: {
              opts: {
                style: { wordBreak: 'break-word' },
              },
            },
          }}
          style={{ maxWidth: '100%' }}
        >
          {record.description ? record.description : '-'}
        </Typography.Text>
      ),
    },
    {
      title: () => <FormTitle name={I18n.t('use_in_bot')} />,
      width: 95,
      render: record => {
        const isInValid =
          !isRealData(record) &&
          (record?.schemaIncompatible || !record?.mockRuleQuantity);

        const getTooltipInfo = () => {
          if (record?.schemaIncompatible) {
            return I18n.t('tool_updated_check_mockset_compatibility');
          } else if ((record?.mockRuleQuantity || 0) <= 0) {
            return I18n.t('mockset_is_empty_add_data_before_use');
          }
          return '';
        };

        return isInValid ? (
          <Tooltip content={getTooltipInfo()} position="left">
            <Radio
              disabled={isInValid}
              checked={selectedMockSet?.id === record.id}
              onChange={() => {
                if (selectedMockSet?.id !== record.id) {
                  doChangeMock(record);
                }
              }}
            />
          </Tooltip>
        ) : (
          <Radio
            disabled={isInValid}
            checked={selectedMockSet?.id === record.id}
            onChange={() => {
              if (selectedMockSet?.id !== record.id) {
                doChangeMock(record);
              }
            }}
          />
        );
      },
    },
    {
      title: () => <FormTitle name={I18n.t('Actions')} />,
      key: 'action',
      width: 60,
      render: record => (
        <Space spacing={8}>
          <Tooltip content={I18n.t('binding_edit_card')}>
            <UIIconButton
              disabled={readonly}
              onClick={() => doHandleView(record)}
              icon={<IconEdit />}
              type="secondary"
            />
          </Tooltip>
          <Tooltip content={I18n.t('Delete')}>
            <Popconfirm
              zIndex={1051}
              okType="danger"
              style={{ width: 400 }}
              icon={
                <IconAlertCircle style={{ color: 'red' }} size="extra-large" />
              }
              trigger="click"
              position="bottomRight"
              title={deleteRenderTitle}
              content={I18n.t('operation_cannot_be_reversed')}
              onConfirm={() => doConfirmDelete()}
              onCancel={() => doSetDeleteId(undefined)}
            >
              <UIIconButton
                disabled={readonly}
                icon={<IconDeleteOutline />}
                type="secondary"
                onClick={() => doSetDeleteId(record.id)}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isListLoading) {
    return <Spin spinning style={{ height: '400px', width: '100%' }} />;
  }

  return (
    <>
      <div className="flex items-center justify-between text-[#1C1D24] text-[16px] not-italic font-semibold leading-[22px] mb-[12px] h-[32px]">
        <span>MockSet</span>
        <Tooltip
          position="left"
          className={readonly ? undefined : 'hidden'}
          content={I18n.t(
            'cannot_enable_mock_set_due_to_no_configured_return_value',
          )}
        >
          <Switch
            checked={isEnabled}
            onChange={doEnabled}
            disabled={readonly}
            loading={isSettingLoading}
          />
        </Tooltip>
      </div>
      {!isEnabled && (
        <p className="text-[rgba(29,_28,_36,_0.60)] text-[14px] leading-[20px]">
          {I18n.t('mock_enable_switch')}
        </p>
      )}
      {isEnabled ? (
        <div className="border-[1px] border-solid border-[rgba(46,46,57,0.08)] rounded-[8px] pl-[16px] pr-[16px] py-[0]">
          <Table
            bordered={!!0}
            // loading={isListLoading}
            scroll={scroll}
            pagination={false}
            columns={columns}
            dataSource={mockSetData ?? []}
            rowKey={'id'}
            expandAllRows={true}
            empty={<div></div>}
          />
          <div className="pt-[12px] mb-[12px] [border-top:1px_solid_rgba(_56,55,67_,0.08)]">
            <UIButton
              icon={<IconAdd />}
              type="tertiary"
              onClick={() => doSetCreateModal(!0)}
            >
              {I18n.t('binding_add_card')}
            </UIButton>
          </div>
        </div>
      ) : null}
      {showCreateModal ? (
        <MockSetEditModal
          zIndex={9999}
          visible={showCreateModal}
          onCancel={() => doSetCreateModal(false)}
          onSuccess={(info, config) => {
            const { id } = info || {};
            doSetCreateModal(false);
            builtinSuccessCallback(config);
            doHandleView({ id }, config);
          }}
          initialInfo={initialInfo}
          needResetPopoverContainer={
            bizCtx.trafficScene === TrafficScene.CozeWorkflowDebug
          }
        />
      ) : null}
    </>
  );
};

export { PartMockSet };
