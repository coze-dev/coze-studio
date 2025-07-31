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
  type FC,
  type RefObject,
  useMemo,
  useRef,
  useState,
} from 'react';

import { type ExpressionEditorTreeNode } from '@coze-workflow/sdk';
import { I18n } from '@coze-arch/i18n';
import { type CommonFieldProps } from '@coze-arch/coze-design';
import { withField, UIIconButton, useFormState } from '@coze-arch/bot-semi';
import { IconCopyLink } from '@coze-arch/bot-icons';
import { type shortcut_command } from '@coze-arch/bot-api/playground_api';

import { queryTip } from '../components/tip';
import FieldLabel from '../components/field-label';
import btnStyles from '../components/action-button/index.module.less';
import { type VarTreeNode } from './type';
import type { ExpressionEditorContainerRef } from './container';
import {
  ComponentsSelectPopover,
  type ValidComponents,
} from './components-select';
import VarQueryTextarea, { type UsageWithVarTextAreaProps } from '.';

const VarQueryTextareaWithField: FC<
  CommonFieldProps & UsageWithVarTextAreaProps
> = withField(VarQueryTextarea);

type VProps = CommonFieldProps & Pick<UsageWithVarTextAreaProps, 'value'>;

interface VarQueryTextareaWrapper extends VProps {
  components?: shortcut_command.Components[];
  modalRef?: RefObject<HTMLDivElement>;
}

const maxCount = 3000;

const VarQueryTextareaWrapperWithField: FC<VarQueryTextareaWrapper> = props => {
  const { components, modalRef, ...innerProps } = props;
  const { value, field } = props;
  const [showLinBtnPopup, setShowLinkBtnPopup] = useState(false);
  const editorRef = useRef<ExpressionEditorContainerRef>(null);
  const { errors } = useFormState();
  const isErrorStatus = !!(field && errors && field in errors);

  const validComponents = useMemo(() => {
    if (!components?.length) {
      return [];
    }

    return components.filter(
      (item): item is ValidComponents =>
        item.input_type !== undefined && !!item.name,
    );
  }, [components]);

  const variableList = validComponents.map(
    ({ name, input_type }) =>
      ({
        label: name,
        value: name,
        key: name,
        varInputType: input_type,
      } satisfies VarTreeNode),
  );
  const hasComponents = !!validComponents?.length;
  const placeholder = hasComponents
    ? I18n.t('shortcut_modal_query_message_placeholder')
    : I18n.t('shortcut_modal_query_content_input_placeholder');

  const onComponentsSelectChange = (component: ValidComponents) => {
    const newValue = `${value ?? ''}{{${component.name}}}`;
    editorRef.current?.model.insertText(newValue);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <FieldLabel
          tooltip={{ className: '!max-w-[370px]' }}
          tip={queryTip()}
          required
        >
          {I18n.t('shortcut_modal_query_content')}
        </FieldLabel>
        {hasComponents ? (
          <ComponentsSelectPopover
            visible={showLinBtnPopup}
            components={validComponents}
            onClose={() => {
              setShowLinkBtnPopup(false);
            }}
            onChange={onComponentsSelectChange}
          >
            <UIIconButton
              icon={<IconCopyLink />}
              wrapperClass={btnStyles.btn}
              onClick={() => {
                setShowLinkBtnPopup(!showLinBtnPopup);
              }}
            >
              {I18n.t('shortcut_modal_query_insert_component_tip')}
            </UIIconButton>
          </ComponentsSelectPopover>
        ) : null}
      </div>
      <VarQueryTextareaWithField
        {...innerProps}
        variableProps={{
          variableList: variableList as ExpressionEditorTreeNode[],
          getPopupContainer: () => modalRef?.current ?? document.body,
          editorRef,
          isErrorStatus,
        }}
        trigger={['blur', 'change']}
        rules={[
          {
            required: true,
            message: I18n.t('shortcut_modal_query_content_is_required'),
          },
          {
            max: maxCount,
            message: I18n.t(
              'shortcut_modal_query_message_max_length_reached_error',
            ),
          },
        ]}
        placeholder={placeholder}
        maxCount={maxCount}
        rows={3}
        fieldClassName="!pt-0 !pb-[16px]"
        noLabel
      />
    </>
  );
};

export default VarQueryTextareaWrapperWithField;
