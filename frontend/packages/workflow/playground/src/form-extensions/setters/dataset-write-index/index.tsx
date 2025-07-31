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

import { useEffect, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { useVectorModelList } from '@/form-extensions/hooks';
import { CheckboxWithLabel } from '@/form-extensions/components/checkbox-with-label';

import styles from './index.module.less';

interface DatasetWriteIndexValue {
  vectorModel: {
    name: string;
  };
  vectorIndexing: boolean;
  keywordIndexing: boolean;
  hierarchicalIndexing: boolean;
}
export type DatasetWriteIndexProps =
  SetterComponentProps<DatasetWriteIndexValue>;

export const DatasetWriteIndex: FC<DatasetWriteIndexProps> = ({
  value,
  onChange,
  readonly,
}) => {
  const { vectorModellList } = useVectorModelList();
  const vectorModelOptions = vectorModellList?.map(item => ({
    label: item.name,
    value: item.name,
  }));

  useEffect(() => {
    if (vectorModellList?.length > 0) {
      const defaultModelName = vectorModellList[0].name;
      if (defaultModelName && value?.vectorModel?.name !== defaultModelName) {
        onChange({
          ...value,
          vectorModel: {
            name: defaultModelName,
          },
        });
      }
    }
  }, [value, onChange, vectorModellList]);

  return (
    <div className="mt-[4px]">
      <CheckboxWithLabel
        label={I18n.t('kl_write_017')}
        description={I18n.t('kl_write_018')}
        checked={value?.vectorIndexing}
        onChange={v =>
          onChange?.({
            ...value,
            vectorIndexing: v as boolean,
          })
        }
        readonly={readonly}
        disabled
      >
        <CheckboxWithLabel
          needCheckBox={false}
          label={I18n.t('kl_write_019')}
          style={{ paddingLeft: '22px' }}
        >
          <Select
            size="small"
            className={styles['model-select']}
            optionList={vectorModelOptions}
            style={{ width: '426px', height: '24px', borderColor: '#06070926' }}
            value={value?.vectorModel?.name}
            onChange={v =>
              onChange({
                ...value,
                vectorModel: {
                  name: v as string,
                },
              })
            }
            // The first phase only supports the default model.
            disabled={readonly || true}
          />
        </CheckboxWithLabel>
      </CheckboxWithLabel>
      <CheckboxWithLabel
        label={I18n.t('kl_write_020')}
        description={I18n.t('kl_write_021')}
        checked={value?.keywordIndexing}
        onChange={v =>
          onChange?.({
            ...value,
            keywordIndexing: v as boolean,
          })
        }
        disabled
      />
      {/* phase one ban */}
      {/* {DatasetWriteFLAG ? (
        <CheckboxWithLabel
          Label = "Hierarchical Index"
          Description = "Suitable for long documents and complex multi-step reasoning tasks."
          checked={value?.hierarchicalIndexing}
          onChange={v =>
            onChange?.({
              ...value,
              hierarchicalIndexing: v as boolean,
            })
          }
          disabled={readonly}
        />
      ) : null} */}
    </div>
  );
};
export const DatasetWriteIndexSetter = {
  key: 'DatasetWriteIndex',
  component: DatasetWriteIndex,
};
