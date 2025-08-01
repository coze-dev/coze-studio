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

import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';

import { SortableList } from '@coze-studio/components/sortable-list';
import { type TItemRender } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { type CommonFieldProps } from '@coze-arch/bot-semi/Form';
import {
  IconButton,
  Tooltip,
  UIButton,
  UIInput,
  useFieldApi,
  useFieldState,
  withField,
} from '@coze-arch/bot-semi';
import {
  IconAdd,
  IconShortcutDisorder,
  IconShortcutTrash,
} from '@coze-arch/bot-icons';

import { shortid } from '../../../../utils/uuid';

export interface OptionData {
  value?: string;
  id: string;
}

export interface OptionListProps {
  options: OptionData[];
  onChange: Dispatch<SetStateAction<OptionData[]>>;
}

const dndType = Symbol.for(
  'chat-area-plugins-chat-shortcuts-component-options-dnd-list',
);

export const OptionsList: FC<OptionListProps> = ({ options, onChange }) => {
  const sortable = options.length > 1;
  const itemRender = useMemo<TItemRender<OptionData>>(
    () =>
      ({ data, connect }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const dropRef = useRef<HTMLDivElement>(null);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const handleRef = useRef<HTMLDivElement>(null);

        connect(dropRef, handleRef);
        return (
          <div ref={dropRef} className="flex items-center mb-6 last:mb-0">
            <UIInput
              className="flex-1"
              value={data.value}
              maxLength={20}
              onChange={value => {
                onChange(_options => {
                  const index = _options.findIndex(item => item.id === data.id);
                  _options.splice(index, 1, {
                    value,
                    id: data.id,
                  });
                  return [..._options];
                });
              }}
            />
            <div className="ml-2" ref={handleRef}>
              <IconButton
                size="small"
                className={sortable ? 'cursor-grab' : ''}
                icon={<IconShortcutDisorder />}
                disabled={!sortable}
                theme="borderless"
                type="tertiary"
              />
            </div>
            <div className="ml-2">
              <Tooltip content={I18n.t('Remove')}>
                <IconButton
                  size="small"
                  icon={<IconShortcutTrash />}
                  type="tertiary"
                  theme="borderless"
                  disabled={options.length <= 1}
                  onClick={() => {
                    onChange(_options =>
                      _options.filter(item => item.id !== data.id),
                    );
                  }}
                />
              </Tooltip>
            </div>
          </div>
        );
      },
    [sortable],
  );
  return (
    <SortableList
      type={dndType}
      list={options}
      itemRender={itemRender}
      onChange={onChange}
      enabled={sortable}
    />
  );
};

const MAX_OPTIONS = 20;

export interface SelectContentProps {
  value?: string[];
  onChange?: (newOptions: string[]) => void;
  hasError?: boolean;
}
export const SelectContent: FC<SelectContentProps> = ({
  value: initialValue,
  onChange,
  hasError,
}) => {
  const [options, setOptions] = useState<OptionData[]>([]);

  useEffect(() => {
    setOptions(
      (initialValue?.length ? initialValue : ['']).map<OptionData>(item => ({
        value: item,
        id: shortid(),
      })),
    );
  }, []);

  useEffect(() => {
    const values = options
      .map(option => option.value?.trim())
      .filter(value => !!value);
    onChange?.(values as string[]);
  }, [options]);

  return (
    <div className="flex flex-col items-start">
      <div className="coz-fg-plus mb-[14px] font-medium">
        {I18n.t('shortcut_modal_selector_component_options')}
      </div>
      <div className="flex justify-between">
        <UIButton
          size="small"
          type="tertiary"
          theme="borderless"
          disabled={options.length >= MAX_OPTIONS}
          icon={<IconAdd />}
          className="!coz-fg-hglt text-sm font-medium"
          onClick={() => {
            setOptions([
              ...options,
              {
                value: '',
                id: shortid(),
              },
            ]);
          }}
        >
          {I18n.t('shortcut_modal_selector_component_options')}
        </UIButton>
      </div>
      <div className="max-h-40 my-6 overflow-y-auto">
        <OptionsList options={options} onChange={setOptions} />
      </div>
    </div>
  );
};

const SelectContentFieldInner = withField(SelectContent);

export const SelectContentField: FC<
  CommonFieldProps & SelectContentProps
> = props => {
  const state = useFieldState(props.field);
  const api = useFieldApi(props.field);
  return (
    <div onMouseEnter={() => api.setError('')}>
      <SelectContentFieldInner
        {...props}
        pure
        hasError={!!state.error?.length}
        trigger="custom"
        rules={[
          {
            validator: (rules, value) => !!value?.length,
            message: I18n.t(
              'shortcut_modal_selector_component_no_options_error',
            ),
          },
        ]}
      />
    </div>
  );
};
