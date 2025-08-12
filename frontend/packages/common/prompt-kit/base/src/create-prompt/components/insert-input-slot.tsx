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

import { useLayoutEffect, type PropsWithChildren } from 'react';

import { useLocalStorageState } from 'ahooks';
import { useEditor, useInjector } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { insertInputSlot } from '@coze-common/editor-plugins/actions';
import { I18n } from '@coze-arch/i18n';
import { IconCozInputSlot } from '@coze-arch/coze-design/icons';
import { Button, Tooltip } from '@coze-arch/coze-design';
import { type ButtonProps } from '@coze-arch/coze-design';
import { keymap } from '@codemirror/view';

import { useReadonly } from '../../shared/hooks/use-editor-readonly';
import InsertBlankSlotGuideEn from '../../assets/insert-blank-slot-guide-en.png';
import InsertBlankSlotGuideCn from '../../assets/insert-blank-slot-guide-cn.png';
import BlankSlotShortCutIcon from '../../assets/blank-slot-shortcut-icon.png';
type NlPromptActionProps = Pick<ButtonProps, 'className'> & {
  disabled?: boolean;
};
export const InsertInputSlotButton: React.FC<NlPromptActionProps> = props => {
  const { className, disabled } = props;
  const editor = useEditor<EditorAPI | undefined>();
  const readonly = useReadonly();
  const injector = useInjector();
  const [showActionGuide, setShowActionGuide] = useLocalStorageState(
    insertInputSlotTooltipGuideKey,
    {
      defaultValue: true,
    },
  );

  useLayoutEffect(
    () =>
      injector.inject([
        keymap.of([
          {
            key: 'Cmd-k',
            run() {
              if (!editor || readonly || disabled) {
                return false;
              }
              insertInputSlot(editor);
              return false;
            },
          },
        ]),
      ]),
    [injector, editor, readonly, disabled],
  );

  return (
    <div className="hover:coz-mg-secondary-hovered coz-icon-button coz-icon-button-default rounded-little">
      <GuideTooltip showActionGuide={!!showActionGuide}>
        <Button
          color="primary"
          size="small"
          disabled={readonly || disabled}
          icon={<IconCozInputSlot />}
          className={className}
          onMouseDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            if (!editor || readonly) {
              return;
            }
            setShowActionGuide(false);
            insertInputSlot(editor);
          }}
        >
          {I18n.t('creat_new_prompt_edit_block')}
        </Button>
      </GuideTooltip>
    </div>
  );
};

const insertInputSlotTooltipGuideKey = 'insert_input_slot_tooltip_guide';

const GuideTooltip: React.FC<
  PropsWithChildren<{
    showActionGuide: boolean;
  }>
> = ({ showActionGuide, children }) => {
  if (showActionGuide) {
    return (
      <Tooltip
        content={
          <div className="flex flex-col">
            <img
              className="w-full h-auto"
              src={
                IS_CN_REGION ? InsertBlankSlotGuideCn : InsertBlankSlotGuideEn
              }
            />
            <div className="flex flex-col mt-2 p-2 gap-1">
              <div className="flex items-center justify-between ">
                <span className="text-xxl font-medium">
                  {I18n.t('edit_block_guild_title')}
                </span>
                <img src={BlankSlotShortCutIcon} className="w-[33px] h-5" />
              </div>
              <div className="text-sm coz-fg-primary">
                {I18n.t('edit_block_guild_describe')}
              </div>
            </div>
          </div>
        }
        className="!w-[301px] !max-w-[301px]"
      >
        {children}
      </Tooltip>
    );
  }
  return (
    <Tooltip
      content={
        <div
          className="coz-fg-primary text-sm"
          style={{
            fontFamily: '-apple-system, SF Pro',
          }}
        >
          ⌘ K
        </div>
      }
      className="coz-fg-primary text-sm"
    >
      {children}
    </Tooltip>
  );
};
