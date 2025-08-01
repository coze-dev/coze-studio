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

import React, {
  type Ref,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
} from 'react';

import { set as ObjectSet, get as ObjectGet, cloneDeep } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
import { UIButton, Table, Typography, UITag, Space } from '@coze-arch/bot-semi';
import { IconAddChildOutlined } from '@coze-arch/bot-icons';
import {
  type APIParameter,
  ParameterType,
  DebugExampleStatus,
} from '@coze-arch/bot-api/plugin_develop';
import { IconDeleteStroked } from '@douyinfe/semi-icons';

import styles from '../index.module.less';
import {
  findPathById,
  deleteNode,
  findTemplateNodeByPath,
  cloneWithRandomKey,
  handleIsShowDelete,
  checkHasArray,
  maxDeep,
} from '../../utils';
import { type APIParameterRecord } from '../../types/params';
import {
  ARRAYTAG,
  ROWKEY,
  childrenRecordName,
  getParameterTypeLabelFromRecord,
} from '../../config';
import { getColumnClass } from './columns/utils';
import { ValueColRender } from './columns/param-value-col';

const getName = (record: APIParameterRecord) => {
  const paramType = getParameterTypeLabelFromRecord(record);

  return (
    <span className={getColumnClass(record)}>
      <Typography.Text
        component="span"
        ellipsis={{
          showTooltip: {
            type: 'tooltip',
            opts: { style: { maxWidth: '100%' } },
          },
        }}
        style={{
          maxWidth: `calc(100% - ${20 * (record.deep || 1) + 49}px)`,
        }}
      >
        {record?.name}
      </Typography.Text>
      {record?.is_required ? (
        <Typography.Text style={{ color: 'red' }}>{' * '}</Typography.Text>
      ) : null}
      {paramType ? (
        <Tag
          size="mini"
          prefixIcon={null}
          className="!coz-fg-color-blue !coz-mg-color-blue shrink-0 font-normal px-6px rounded-[36px] ml-4px align-middle"
        >
          {paramType}
        </Tag>
      ) : null}
    </span>
  );
};

export interface ParamsFormProps {
  requestParams?: Array<APIParameter>;
  disabled: boolean;
  check: number;
  needCheck?: boolean;
  height?: number;
  defaultKey?: 'global_default' | 'local_default';
  debugExampleStatus?: DebugExampleStatus;
  showExampleTag?: boolean;
  supportFileTypeUpload?: boolean;
}

const getParamsTitle = (isShowExampleTag: boolean, disabled: boolean) =>
  isShowExampleTag ? (
    <Space>
      <div>
        {I18n.t(
          disabled
            ? 'mkpl_plugin_tool_parameter_description'
            : 'Create_newtool_s4_value',
        )}
      </div>
      <UITag>{I18n.t('plugin_edit_tool_test_run_example_tip')}</UITag>
    </Space>
  ) : (
    I18n.t(
      disabled
        ? 'mkpl_plugin_tool_parameter_description'
        : 'Create_newtool_s4_value',
    )
  );

// eslint-disable-next-line @coze-arch/max-line-per-function -- already dismantling
const ParamsForm = (
  props: ParamsFormProps,
  ref: Ref<{ data: Array<APIParameter> } | null>,
) => {
  const {
    requestParams,
    disabled,
    check,
    needCheck = false,
    height = 236,
    defaultKey = 'global_default',
    debugExampleStatus = DebugExampleStatus.Default,
    showExampleTag = false,
    supportFileTypeUpload = false,
  } = props;
  const [data, setData] = useState(
    cloneDeep(requestParams ? requestParams : []),
  );
  const [resourceData, setResourceData] = useState(
    cloneDeep(requestParams ? requestParams : []),
  );
  useEffect(() => {
    setData(requestParams ? cloneDeep(requestParams) : []);
    setResourceData(requestParams ? cloneDeep(requestParams) : []);
  }, [requestParams]);

  useImperativeHandle(ref, () => ({
    data,
  }));

  const [flag, setFlag] = useState<boolean>(false);
  // Add sub-node
  const addChildNode = (record: APIParameter) => {
    if (!data) {
      return;
    }
    let result: APIParameter & {
      path?: Array<number>;
    } = {};
    // 1. Find the path
    findPathById({
      data,
      callback: (item: APIParameter, path: Array<number>) => {
        if (item[ROWKEY] === record[ROWKEY]) {
          result = { ...item, path };
        }
      },
    });

    // 2. Splicing path
    const path = (result?.path || [])
      .map((v: number) => [v, childrenRecordName])
      .flat();
    // newPath is the path of the template. The following node newNode can be directly referenced from this path
    const newPath = findTemplateNodeByPath(resourceData, path);
    // 3. Add a node
    const newData = cloneDeep(data);
    if (Array.isArray(ObjectGet(newData, path))) {
      // This step is to find the corresponding root node according to newPath and clone a new node
      const newNode = cloneWithRandomKey(ObjectGet(resourceData, newPath)[0]);
      ObjectSet(newData, path, [...ObjectGet(newData, path), newNode]);
    }
    setData(newData);
  };
  const isShowExampleTag =
    disabled &&
    showExampleTag &&
    debugExampleStatus === DebugExampleStatus.Enable;
  const maxNum = maxDeep(data);

  const columns = [
    {
      title: I18n.t('Create_newtool_s4_name'),
      key: 'name',
      className: styles['no-wrap'],
      width: 180 + 20 * (maxNum - 1),
      minWidth: 220,
      render: (record: APIParameterRecord) => getName(record),
    },
    {
      title: getParamsTitle(isShowExampleTag, disabled),
      key: 'value',
      className: styles['no-wrap'],
      width: 200,
      // @ts-expect-error -- linter-disable-autofix
      render: record => (
        <ValueColRender
          record={record}
          data={data}
          disabled={disabled}
          check={check}
          needCheck={needCheck}
          defaultKey={defaultKey}
          supportFileTypeUpload={supportFileTypeUpload}
        />
      ),
    },
    {
      title: I18n.t('dataset_detail_tableTitle_actions'),
      key: 'operation',
      width: 120,
      render: (record: APIParameter) => (
        <div className={getColumnClass(record)}>
          {record?.type === ParameterType.Array && (
            <UIButton
              onClick={() => {
                addChildNode(record);
                setFlag(!flag);
              }}
              icon={<IconAddChildOutlined />}
              type="secondary"
              theme="borderless"
            />
          )}
          {record?.name === ARRAYTAG &&
            handleIsShowDelete(data, record[ROWKEY]) && (
              <UIButton
                onClick={() => {
                  const clone = cloneDeep(data);
                  if (record?.id) {
                    deleteNode(clone, record?.id);
                    setData(clone);
                  }
                }}
                icon={<IconDeleteStroked />}
                type="secondary"
                theme="borderless"
              />
            )}
        </div>
      ),
    },
  ];

  const filterColumns =
    disabled || !checkHasArray(requestParams)
      ? columns.filter(item => item.key !== 'operation')
      : columns;

  const scroll = useMemo(() => ({ y: height, x: '100%' }), []);

  return (
    <Table
      className={styles['debug-params-table']}
      pagination={false}
      columns={filterColumns}
      dataSource={data}
      rowKey={ROWKEY}
      childrenRecordName={childrenRecordName}
      expandAllRows={true}
      scroll={scroll}
      empty={
        !disabled && (
          <div className={styles.empty}>
            {I18n.t('plugin_form_no_result_desc')}
          </div>
        )
      }
    />
  );
};

export default forwardRef(ParamsForm);
