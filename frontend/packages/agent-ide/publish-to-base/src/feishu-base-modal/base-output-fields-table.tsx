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

import ReactMarkdown from 'react-markdown';
import {
  type FC,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useMutationObserver } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button, Select } from '@coze-arch/coze-design';
import {
  type OutputTypeInfo,
  OutputSubComponentType,
} from '@coze-arch/bot-api/connector_api';

import { getIsStructOutput } from '../validate/utils';
import {
  validateOutputStructGroupByKey,
  validateOutputStructPrimaryKey,
} from '../validate';
import {
  type BaseOutputStructLineType,
  type FeishuBaseConfigFe,
  type OutputSubComponentFe,
} from '../types';
import { default as mdStyles } from '../md-tooltip/index.module.less';
import { useConfigStoreGuarded } from '../context/store-context';
import { ERROR_LINE_HEIGHT } from '../constants';
import { type HeaderItem, SortableFieldTable } from './sortable-field-table';
import { FormSubtitle } from './form-title';
import { useRequireVerifyCenter } from './field-line/require-verify-center';
import {
  BaseOutputStructLine,
  OutputLineCommonContext,
  outputStructColumnWidth,
  type OutputStructVerifyRes,
} from './field-line/output-struct-line';

import styles from './index.module.less';

export const BaseOutputFieldsTable: FC<{
  config: FeishuBaseConfigFe;
}> = ({ config }) => {
  const outputTypeId = config.output_type;
  const updateConfigByImmer = useConfigStoreGuarded()(
    state => state.updateConfigByImmer,
  );
  const outputTypeTips = getOutputInfo(
    config.output_type_list,
    outputTypeId,
  )?.tips;

  return (
    <div className="mt-[6px]">
      <Select
        style={{
          width: '100%',
        }}
        defaultValue={config.output_type}
        optionList={config.output_type_list.map(info => ({
          label: info.name,
          value: info.id,
        }))}
        onChange={val => {
          updateConfigByImmer(cfg => {
            const type = Number(val);
            cfg.output_type = type;
            if (getIsStructOutput(type)) {
              cfg.output_sub_component.type = OutputSubComponentType.Object;
              const itemList = cfg.output_sub_component.item_list;
              if (!itemList?.length) {
                cfg.output_sub_component.item_list = [
                  getDefaultStructFieldItem(),
                ];
              }
            } else {
              cfg.output_sub_component.type = OutputSubComponentType.None;
            }
          });
        }}
      />
      {getIsStructOutput(outputTypeId) ? (
        <OutputStructConfig config={config} />
      ) : null}
      {outputTypeTips ? (
        <div
          className={classNames(
            'rounded-[8px] px-[8px] py-[12px] coz-mg-hglt mt-[8px]',
            'text-[12px] leading-[16px] coz-fg-primary',
          )}
          style={{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- .
            // @ts-expect-error
            '--tooltip-content-max-width': '580px',
          }}
        >
          <ReactMarkdown className={mdStyles.md_wrap}>
            {outputTypeTips}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
};

const getOutputInfo = (
  infoList: OutputTypeInfo[],
  id: number,
): OutputTypeInfo | undefined => infoList.find(info => info.id === id);

const getDefaultStructFieldItem = (): BaseOutputStructLineType => ({
  key: '',
  output_type: undefined,
  _id: nanoid(),
});

const OutputStructConfig: FC<{
  config: FeishuBaseConfigFe;
}> = ({ config }) => {
  const structFields = config.output_sub_component.item_list;
  const updateConfigByImmer = useConfigStoreGuarded()(
    state => state.updateConfigByImmer,
  );
  const [requiredToCheck, setRequiredToCheck] = useState(false);

  const { registerVerifyFn } = useRequireVerifyCenter();
  const [errorLines, setErrorLinesRaw] = useState<string[]>([]);
  const setErrorLines = (hasError: boolean, id: string) => {
    setErrorLinesRaw(lines => {
      if (!hasError) {
        return lines.filter(lineId => lineId !== id);
      }
      const inLines = lines.includes(id);
      if (!inLines) {
        return [...lines, id];
      }
      return lines;
    });
  };

  useEffect(() => {
    const unregister = registerVerifyFn(() => setRequiredToCheck(true));
    return unregister;
  }, []);

  return (
    <>
      <div className="ml-[8px] mt-[16px]">
        <FormSubtitle
          title={I18n.t('publish_base_config_structOutputConfig')}
          required
          tooltip={config.output_sub_component.struct_output_desc}
          suffix={
            <Button
              icon={<IconCozPlus />}
              onClick={() => {
                updateConfigByImmer(cfg => {
                  const newList = cfg.output_sub_component.item_list || [];
                  newList.push(getDefaultStructFieldItem());
                  cfg.output_sub_component.item_list = newList;
                });
              }}
              color="secondary"
              size="small"
              className="ml-auto"
            >
              {I18n.t('Add_1')}
            </Button>
          }
        />
      </div>
      <OutputLineCommonContext.Provider
        value={{
          onChange: val => {
            updateConfigByImmer(cfg => {
              const fields = cfg.output_sub_component.item_list;
              if (!fields) {
                return;
              }
              const idx =
                fields?.findIndex(field => field._id === val._id) ?? -1;
              if (idx < 0) {
                return;
              }
              fields[idx] = val;
            });
          },
          list: config.object_value_type_list,
          getShowRequireWarn: curLine => {
            const res = getShowRequireWarnImpl({
              curLine,
              allFields: config.output_sub_component?.item_list || [],
              requiredToCheck,
            });
            return res;
          },
          onToggleError: (id, error) => {
            setErrorLines(error, id);
          },
        }}
      >
        <SortableFieldTable<BaseOutputStructLineType>
          linesWrapper={OutputConfigLinesWrapper}
          enabled={(structFields?.length || 0) > 1}
          headers={getBaseInfoHeaders(config.output_sub_component)}
          onChange={mix =>
            updateConfigByImmer(cfg => {
              cfg.output_sub_component.item_list = mix.map(m => m.data);
            })
          }
          getId={mix => mix.data._id}
          style={{
            marginTop: 6,
          }}
          data={(structFields || []).map(field => ({
            bizComponent: BaseOutputStructLine,
            deletable: (structFields || []).length > 1,
            data: field,
            getKey: data => data._id,
            onDelete: delItem => {
              updateConfigByImmer(cfg => {
                const list = cfg.output_sub_component.item_list;
                if (!list) {
                  return;
                }
                cfg.output_sub_component.item_list = list.filter(
                  item => item._id !== delItem._id,
                );
              });
            },
            lineStyle: {
              paddingBottom: errorLines.some(id => id.includes(field._id))
                ? ERROR_LINE_HEIGHT
                : 0,
            },
            deleteButtonStyle: {
              width: 24,
              minWidth: 0,
              height: 24,
              padding: 0,
            },
          }))}
        />
      </OutputLineCommonContext.Provider>
    </>
  );
};

const OutputConfigLinesWrapper: FC<PropsWithChildren> = ({ children }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [withScrollbar, setWithScrollbar] = useState(false);
  const detectScrollbar = () => {
    if (!wrapRef.current) {
      return;
    }
    const isVerticalScrollbar =
      wrapRef.current.scrollHeight > wrapRef.current.clientHeight;
    setWithScrollbar(isVerticalScrollbar);
  };
  useEffect(detectScrollbar, []);
  useMutationObserver(detectScrollbar, wrapRef, {
    childList: true,
  });
  return (
    <div
      ref={wrapRef}
      className={classNames(
        'overflow-x-hidden',
        !withScrollbar && 'pr-[8px]',
        styles.output_config,
      )}
    >
      {children}
    </div>
  );
};

const getBaseInfoHeaders = (
  outputComponent: OutputSubComponentFe,
): HeaderItem[] => [
  {
    name: I18n.t('publish_base_configFields_key'),
    required: true,
    width: outputStructColumnWidth.key,
  },
  {
    name: I18n.t('publish_base_configStruct_dataType'),
    required: true,
    width: outputStructColumnWidth.outputType,
  },
  {
    name: I18n.t('publish_base_configStruct_id'),
    required: true,
    width: outputStructColumnWidth.groupByKey,
    tooltip: outputComponent.struct_id_desc,
  },
  {
    name: I18n.t('publish_base_configStruct_primary'),
    required: true,
    width: outputStructColumnWidth.primary,
    tooltip: outputComponent.struct_primary_desc,
    style: I18n.language.includes('zh')
      ? {}
      : {
          fontSize: 12,
          lineHeight: '16px',
          display: 'inline-block',
        },
  },
];

const getShowRequireWarnImpl = ({
  curLine,
  allFields,
  requiredToCheck,
}: {
  curLine: BaseOutputStructLineType;
  allFields: BaseOutputStructLineType[];
  requiredToCheck: boolean;
}): OutputStructVerifyRes => {
  const idx = allFields.findIndex(line => line._id === curLine._id);
  const res: OutputStructVerifyRes = {
    groupByKey: {
      warn: false,
    },
    primary: {
      warn: false,
    },
  };
  if (!requiredToCheck || idx > 0) {
    return res;
  }
  const groupByKeyVerifyRes = validateOutputStructGroupByKey(allFields);
  const primaryKeyVerifyRes = validateOutputStructPrimaryKey(allFields);
  if (!groupByKeyVerifyRes.ok) {
    res.groupByKey.tip = groupByKeyVerifyRes.error;
    res.groupByKey.warn = true;
  }
  if (!primaryKeyVerifyRes.ok) {
    res.primary.tip = primaryKeyVerifyRes.error;
    res.primary.warn = true;
  }
  return res;
};
