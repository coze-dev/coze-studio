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

/* eslint-disable @coze-arch/max-line-per-function -- historical logic, dismantling one after another */
/* eslint-disable max-lines -- historical logic, dismantling one after another */

import { cloneDeep, flow, get as ObjectGet, set as ObjectSet } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { ArrayUtil } from '@coze-arch/bot-utils';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import {
  UIIconButton,
  UISelect,
  Typography,
  Tooltip,
  Switch,
  Space,
  Checkbox,
} from '@coze-arch/bot-semi';
import { IconAddChildOutlined, IconDeleteOutline } from '@coze-arch/bot-icons';
import {
  type APIParameter,
  ParameterType,
} from '@coze-arch/bot-api/plugin_develop';

import {
  defaultNode,
  deleteAllChildNode,
  deleteNode,
  findPathById,
  handleIsShowDelete,
  updateNodeById,
} from '../utils';
import {
  type UpdateNodeWithDataFn,
  type APIParameterRecord,
  type AddChildNodeFn,
} from '../types';
import s from '../index.module.less';
import {
  childrenRecordName,
  parameterLocationOptions,
  ROWKEY,
} from '../config';
import { FormTitle, InputItem } from './form-components';
import { DefaultValueInput } from './default-value-input';
import ParamTypeColRender from './columns/param-type-col';

const DEEP_INDENT_NUM = 20;
const DISABLED_REQ_SLICE = -4;
const DISABLED_RES_SLICE = -3;

export interface ColumnsProps {
  data: Array<APIParameter>;
  flag: boolean;
  checkFlag: number;
  isResponse?: boolean;
  disabled: boolean;
  setCheckFlag: (val: number) => void;
  setFlag: (val: boolean) => void;
  setData: (val: Array<APIParameter>, checkDefault?: boolean) => void;
  showSecurityCheckFailedMsg: boolean;
  setShowSecurityCheckFailedMsg: (flag: boolean) => void;
  /**
   * Whether extended file types are supported
   */
  enableFileType?: boolean;
}

// eslint-disable-next-line max-lines-per-function
export const getColumns = ({
  data,
  checkFlag,
  isResponse = false,
  disabled,
  setCheckFlag,
  setData,
  showSecurityCheckFailedMsg,
  setShowSecurityCheckFailedMsg,
  enableFileType = false,
}: ColumnsProps) => {
  // Add sub-node
  const addChildNode: AddChildNodeFn = ({
    record,
    isArray = false,
    type,
    recordType,
  }) => {
    const newData = cloneDeep(data);
    // @ts-expect-error -- linter-disable-autofix
    const deleteArrayGlobalDefaultByPath = (obj: APIParameter[], path) => {
      const index = path[0];
      const child = obj[index];
      if (child && child.type === ParameterType.Array) {
        child.global_default = '';
        child.global_disable = false;
      } else {
        if (child && child.sub_parameters) {
          deleteArrayGlobalDefaultByPath(child.sub_parameters, path.slice(1));
        }
      }
    };
    setCheckFlag(0);
    let result: APIParameter & {
      path?: Array<number>;
    } = {};

    // 1. Find the path
    findPathById({
      data,
      callback: (item: APIParameter, path: Array<number>) => {
        if (item[ROWKEY] === record[ROWKEY]) {
          result = { ...item, path };
          // Modifying complex type structures requires resetting the default values of the array
          deleteArrayGlobalDefaultByPath(newData, path);
        }
      },
    });
    // 2. Splicing path
    const path = (result?.path || [])
      .map((v: number) => [v, childrenRecordName])
      .flat();
    // If adding a sub-node, update the type in the parent node
    if (recordType) {
      const typePath = cloneDeep(path);
      typePath.pop();
      typePath.push('type');

      // The type is 4/5. When switching nodes, you need to delete the sub-node first.
      // recordType The type of the original node
      // newData new node data
      if (ObjectGet(newData, typePath) !== recordType) {
        deleteAllChildNode(newData, record[ROWKEY] as string);
      }

      ObjectSet(newData, typePath, type);
    }
    // 3. Add a node
    if (Array.isArray(ObjectGet(newData, path))) {
      ObjectSet(newData, path, [
        ...ObjectGet(newData, path),
        // @ts-expect-error -- linter-disable-autofix
        defaultNode({ isArray, iscChildren: true, deep: record.deep + 1 }),
      ]);
    } else {
      ObjectSet(newData, path, [
        defaultNode({
          isArray,
          iscChildren: true,
          // @ts-expect-error -- linter-disable-autofix
          deep: record.deep + 1,
        }),
      ]);
    }
    setData(newData);
  };
  // Delete sub-node
  const deleteChildNode = (record: APIParameter) => {
    const cloneData = cloneDeep(data);
    const delStatsu = deleteNode(cloneData, record[ROWKEY] as string);
    if (delStatsu) {
      setData(cloneData);
    }
  };

  const updateNodeWithData: UpdateNodeWithDataFn = ({
    record,
    key,
    value,
    updateData = false,
    inherit = false,
  }) => {
    if (Array.isArray(key)) {
      key.forEach((item, idx) => {
        updateNodeById({
          data,
          targetKey: record[ROWKEY] as string,
          field: item,
          // @ts-expect-error -- linter-disable-autofix
          value: value[idx],
        });
      });
    } else {
      updateNodeById({
        data,
        targetKey: record[ROWKEY] as string,
        field: key,
        value,
        inherit,
      });
    }
    if (updateData) {
      const cloneData = cloneDeep(data);
      setData(cloneData);
    }
  };

  const columns: Array<ColumnProps<APIParameter>> = [
    {
      title: () => (
        <FormTitle
          name={I18n.t('Create_newtool_s3_table_name')}
          required
          toolTipText={
            isResponse
              ? I18n.t('Create_newtool_s3_table_name_tooltip')
              : I18n.t('Create_newtool_s2_table_name_tooltip')
          }
        />
      ),
      key: 'name',
      className: s['no-wrap-min-width'],
      render: (record: APIParameter & { deep?: number }) =>
        disabled ? (
          <Typography.Text
            component="span"
            ellipsis={{
              showTooltip: {
                type: 'tooltip',
                opts: { style: { maxWidth: '100%' } },
              },
            }}
            style={{
              maxWidth: `calc(100% - ${
                DEEP_INDENT_NUM * (record.deep || 1)
              }px)`,
            }}
          >
            {record.name}
          </Typography.Text>
        ) : (
          <InputItem
            check={checkFlag}
            val={record?.name}
            data={data}
            placeholder={I18n.t('Create_newtool_s2_table_name_empty')}
            useBlockWrap={true}
            checkSame={true}
            targetKey={record[ROWKEY]}
            dynamicWidth={true}
            deep={record.deep}
            callback={(e: string) => {
              // record.name = e;
              updateNodeWithData({
                record,
                key: 'name',
                value: e,
                updateData: true,
              });
              if (showSecurityCheckFailedMsg) {
                setShowSecurityCheckFailedMsg?.(false);
              }
            }}
          />
        ),
    },
    {
      title: () => (
        <FormTitle
          name={I18n.t('Create_newtool_s2_table_des')}
          required={!isResponse}
          toolTipText={
            isResponse
              ? I18n.t('Create_newtool_s3_table_des_tooltip')
              : I18n.t('Create_newtool_s2_table_des_tooltip')
          }
        />
      ),
      key: 'desc',
      render: (record: APIParameter) =>
        // To help users/large models better understand.
        disabled ? (
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
            {record.desc}
          </Typography.Text>
        ) : (
          <InputItem
            check={checkFlag}
            width="100%"
            placeholder={I18n.t('plugin_Parameter_des')}
            val={record?.desc}
            useCheck={false}
            checkAscii={true}
            filterSpace={false}
            max={300}
            isRequired={isResponse ? false : true}
            callback={(e: string) => {
              updateNodeWithData({
                record,
                key: 'desc',
                value: e,
              });
              if (showSecurityCheckFailedMsg) {
                setShowSecurityCheckFailedMsg?.(false);
              }
            }}
          />
        ),
    },
    {
      title: () => (
        <FormTitle name={I18n.t('Create_newtool_s3_table_type')} required />
      ),
      key: 'type',
      width: 120,
      render: (record: APIParameterRecord) => (
        <ParamTypeColRender
          record={record}
          disabled={disabled}
          data={data}
          setData={setData}
          checkFlag={checkFlag}
          updateNodeWithData={updateNodeWithData}
          addChildNode={addChildNode}
          enableFileType={enableFileType}
        />
      ),
    },
    {
      title: () => (
        <FormTitle name={I18n.t('Create_newtool_s2_table_method')} required />
      ),
      key: 'location',
      width: 120,
      render: (record: APIParameter) => {
        if (record.location === undefined) {
          return <></>;
        }
        const methodLabelMap = ArrayUtil.array2Map(
          parameterLocationOptions,
          'value',
          'label',
        );
        return disabled ? (
          methodLabelMap[record.location]
        ) : (
          <UISelect
            theme="light"
            defaultValue={record.location}
            onChange={e => {
              updateNodeWithData({
                record,
                key: 'location',
                value: e,
                updateData: true,
                inherit: true,
              });
            }}
            style={{ width: '100%' }}
          >
            {parameterLocationOptions.map(item => (
              <UISelect.Option key={record?.id + item.label} value={item.value}>
                {item.label}
              </UISelect.Option>
            ))}
          </UISelect>
        );
      },
    },
    {
      title: I18n.t('Create_newtool_s2_table_required'),
      width: 80,
      key: 'default',
      render: (record: APIParameter) => (
        <Checkbox
          style={{ position: 'relative', left: 18 }}
          disabled={disabled}
          defaultChecked={record.is_required}
          onChange={e => {
            // Required + no default = visible
            if (e.target.checked && !record.global_default) {
              updateNodeWithData({
                record,
                key: 'global_disable',
                value: false,
                updateData: true,
                inherit: true,
              });
            }
            updateNodeWithData({
              record,
              key: 'is_required',
              value: e.target.checked,
              updateData: true,
              inherit: true,
            });
          }}
        ></Checkbox>
      ),
    },
    {
      title: I18n.t('plugin_api_list_table_action'),
      key: 'addChild',
      width: 107,
      render: (record: APIParameter & { deep: number }) => (
        <Space>
          {record.type === ParameterType.Object && (
            <Tooltip content={I18n.t('plugin_form_add_child_tooltip')}>
              <UIIconButton
                disabled={disabled}
                style={{ marginLeft: '8px' }}
                onClick={() => addChildNode({ record })}
                icon={<IconAddChildOutlined />}
                type="secondary"
              />
            </Tooltip>
          )}
          {handleIsShowDelete(data, record[ROWKEY]) && (
            <Tooltip content={I18n.t('Delete')}>
              <UIIconButton
                disabled={disabled}
                style={{ marginLeft: '8px' }}
                onClick={() => deleteChildNode(record)}
                icon={<IconDeleteOutline />}
                type="secondary"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (!isResponse) {
    columns.splice(
      -1,
      0,
      ...[
        {
          title: () => (
            <FormTitle
              name={I18n.t(
                'plugin_edit_tool_default_value_config_item_default_value',
              )}
            />
          ),
          key: 'global_default',
          width: 120,
          render: (record: APIParameter) => (
            <DefaultValueInput record={record} data={data} setData={setData} />
          ),
        },
        {
          title: (
            <FormTitle
              name={I18n.t('plugin_edit_tool_default_value_config_item_enable')}
              toolTipText={I18n.t(
                'plugin_edit_tool_default_value_config_item_enable_tip',
              )}
            />
          ),
          key: 'global_disable',
          width: 78,
          render: (record: APIParameter) => {
            if (record.global_default === undefined) {
              return <></>;
            }
            const switchNode = (
              <Switch
                style={{ position: 'relative', top: 3, left: 12 }}
                defaultChecked={!record.global_disable}
                disabled={record.is_required && !record.global_default}
                onChange={e => {
                  updateNodeWithData({
                    record,
                    key: 'global_disable',
                    value: !e,
                    updateData: true,
                    inherit: true,
                  });
                }}
              />
            );
            return record.is_required && !record.global_default ? (
              <Tooltip
                content={I18n.t(
                  'plugin_edit_tool_default_value_config_item_enable_disable_tip',
                )}
              >
                {switchNode}
              </Tooltip>
            ) : (
              switchNode
            );
          },
        },
      ],
    );
  }
  //Exported parameter scene, remove required, add enabled switch

  if (isResponse) {
    const targetIndex = columns.findIndex(c => c.key === 'default');

    columns.splice(targetIndex, 1);
    columns.splice(-1, 0, {
      title: (
        <FormTitle
          name={I18n.t('plugin_edit_tool_default_value_config_item_enable')}
          toolTipText={I18n.t('plugin_edit_tool_output_param_enable_tip')}
        />
      ),
      key: 'global_disable',
      width: 78,
      render: (record: APIParameter) => {
        if (record.global_default === undefined) {
          return <></>;
        }
        const switchNode = (
          <Switch
            style={{ position: 'relative', top: 3, left: 12 }}
            defaultChecked={!record.global_disable}
            onChange={e => {
              updateNodeWithData({
                record,
                key: 'global_disable',
                value: !e,
                updateData: true,
                inherit: true,
              });
            }}
          />
        );
        return switchNode;
      },
    });
  }
  return flow(
    // The purpose of passing columns as function arguments rather than directly to the combinatorial function (flow (...) (columns)) is to facilitate type derivation
    () => columns,
    // Read-only status does not show the last four action columns
    newColumns => {
      const len = isResponse ? DISABLED_RES_SLICE : DISABLED_REQ_SLICE;
      return disabled ? newColumns.slice(0, len) : newColumns;
    },
    // Response does not require location field
    newColumns =>
      isResponse
        ? newColumns.filter(item => item.key !== 'location')
        : newColumns,
  )();
};
