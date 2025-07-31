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

import { type Ref, useRef } from 'react';

import classnames from 'classnames';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { concatTestId, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconNo, IconAdd } from '@coze-arch/bot-icons';
import { Button, IconButton } from '@coze-arch/coze-design';

import { withValidation } from '@/form-extensions/components/validation';

import { SortableList, DragHandle } from '../../../components/sortable-list';
import { useNormalizeValueWithRoleList } from './use-normalize-value-with-role-list';
import { type SpeakerMessageSetValue } from './types';
import { SpeakerMessageSet } from './speaker-message-set';
import { SpeakerMessageSetArrayContextProvider } from './context';

export interface SpeakerMessageSetArrayOptions {
  sortable?: boolean;
}

const MAX_LENGTH = 10;

type SpeakerMessageSetArrayProps = SetterComponentProps<
  Array<SpeakerMessageSetValue | undefined> | undefined,
  SpeakerMessageSetArrayOptions
>;
export const SpeakerMessageSetArray =
  withValidation<SpeakerMessageSetArrayProps>(props => {
    const { value: remoteValue, onChange, context, options, readonly } = props;

    const value = useNormalizeValueWithRoleList(remoteValue);

    const { getNodeSetterId } = useNodeTestId();

    const testId = getNodeSetterId(context.path);

    const { sortable } = options;

    const currentAddIndexRef = useRef<number | undefined>();

    const node = useCurrentEntity();

    const handleItemChange =
      (index: number) => (data: SpeakerMessageSetValue) => {
        currentAddIndexRef.current = undefined;
        onChange?.(
          value.map((_item, _index) => {
            if (_index === index) {
              return data;
            } else {
              return _item;
            }
          }),
        );
      };

    const handleAddItem = () => {
      currentAddIndexRef.current = value.length;
      onChange?.([...(value ?? []), undefined]);
    };
    const handleDeleteItem = index => () => {
      currentAddIndexRef.current = undefined;
      onChange?.(value.filter((_item, _index) => _index !== index));
    };
    const handleSortableChange = data => {
      currentAddIndexRef.current = undefined;
      onChange?.(data);
    };

    const handleVisibleChange = () => {
      currentAddIndexRef.current = undefined;
    };

    return (
      <SpeakerMessageSetArrayContextProvider
        value={{
          value,
          readonly,
          testId,
        }}
      >
        <div>
          <div className="flex flex-col gap-3">
            {sortable && !readonly ? (
              <SortableList
                value={value}
                onChange={handleSortableChange}
                renderItem={(item, index, dragOption) => (
                  <div className="flex gap-3 items-start">
                    {sortable ? (
                      <DragHandle
                        ref={dragOption?.dragRef as Ref<HTMLElement>}
                        testId={concatTestId(testId, 'drag')}
                        className="pt-2"
                      />
                    ) : null}
                    <SpeakerMessageSet
                      setterContext={context}
                      value={item}
                      onChange={handleItemChange(index)}
                      defaultFocused={index === currentAddIndexRef.current}
                      onVisibleChange={handleVisibleChange}
                      index={index}
                    />
                    <IconButton
                      color="secondary"
                      size="small"
                      icon={<IconNo />}
                      onClick={handleDeleteItem(index)}
                      data-testid={concatTestId(testId, 'remove')}
                      style={{
                        marginTop: 4,
                      }}
                    ></IconButton>
                  </div>
                )}
              />
            ) : (
              <>
                {value.map((item, index) => (
                  <div className="flex gap-3 items-start">
                    <SpeakerMessageSet
                      setterContext={context}
                      value={item}
                      onChange={handleItemChange(index)}
                      onVisibleChange={handleVisibleChange}
                      defaultFocused={index === currentAddIndexRef.current}
                      index={index}
                    />
                    <IconButton
                      className={classnames({
                        'pointer-events-none': readonly,
                      })}
                      color="secondary"
                      size="small"
                      icon={<IconNo />}
                      onClick={handleDeleteItem(index)}
                      data-testid={concatTestId(testId, 'remove')}
                      style={{
                        marginTop: 4,
                      }}
                    ></IconButton>
                  </div>
                ))}
              </>
            )}
          </div>
          <Button
            className={classnames('mt-3', {
              'cursor-pointer': value.length < MAX_LENGTH,
              'cursor-not-allowed': value.length === MAX_LENGTH,
              'pointer-events-none': readonly,
            })}
            color="highlight"
            icon={<IconAdd />}
            onClick={handleAddItem}
            data-testid={`playground.node.${node?.id}.${context.path}.addbutton`}
            disabled={value.length === MAX_LENGTH}
          >
            {I18n.t('workflow_add_input')}
          </Button>
        </div>
      </SpeakerMessageSetArrayContextProvider>
    );
  });
