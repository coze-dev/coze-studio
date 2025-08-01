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

// @File open source version does not support store channel binding for future expansion
import { type MouseEventHandler } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { FormSelect, type optionRenderProps } from '@coze-arch/coze-design';

import { type StoreBindKey, useProjectPublishStore } from '@/store';
import { toDisplayScreenOption } from '@/publish-main/utils/display-screen-option';
import { useProductCategoryOptions } from '@/publish-main/hooks/use-product-category-options';

import { OptionWithTooltip } from '../option-with-tooltip';

export interface StoreBindProps {
  checked: boolean;
  record: PublishConnectorInfo;
  onClick: MouseEventHandler;
}

export const StoreBind = ({
  checked,
  record,
  onClick: inputOnClick,
}: StoreBindProps) => {
  const { bind_info, id = '', UIOptions } = record;
  const displayScreenOptions = UIOptions?.map(toDisplayScreenOption) ?? [];
  const defaultDisplayScreen = bind_info?.display_screen;
  const { connectors, setProjectPublishInfo } = useProjectPublishStore(
    useShallow(state => ({
      connectors: state.connectors,
      setProjectPublishInfo: state.setProjectPublishInfo,
    })),
  );

  const { categoryOptions } = useProductCategoryOptions(ProductEntityType.Bot);

  const handleSelect = (key: StoreBindKey, value: string) => {
    setProjectPublishInfo({
      connectors: {
        ...connectors,
        [id]: {
          ...bind_info,
          ...connectors[id],
          [key]: value,
        },
      },
    });
  };

  return (
    <div
      className={classNames('flex w-full gap-[6px] mt-auto')}
      onClick={inputOnClick}
    >
      <FormSelect
        noLabel
        field="store_display_screen"
        insetLabel={I18n.t('project_release_display_label')}
        fieldClassName="w-[50%]"
        className="w-full"
        initValue={defaultDisplayScreen}
        optionList={displayScreenOptions}
        renderOptionItem={(option: optionRenderProps) => (
          <OptionWithTooltip option={option} tooltip={option.tooltip} />
        )}
        rules={[{ required: checked }]}
        onSelect={(value: unknown) =>
          handleSelect('display_screen', value as string)
        }
      />
      <FormSelect
        noLabel
        field="store_category_id"
        insetLabel={I18n.t('mkpl_bots_category')}
        fieldClassName="w-[50%]"
        className="w-full"
        placeholder={I18n.t('select_category')}
        initValue={bind_info?.category_id}
        optionList={categoryOptions}
        rules={[
          {
            required: checked,
            message: I18n.t('select_category'),
          },
        ]}
        onSelect={(value: unknown) =>
          handleSelect('category_id', value as string)
        }
      />
    </div>
  );
};
