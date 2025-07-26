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

import { useEffect } from 'react';

import { PublicScopeProvider } from '@coze-workflow/variable';
import { NLPromptButton } from '@coze-workflow/resources-adapter';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozExpand,
  IconCozLightbulb,
  IconCozMinimize,
  IconCozTrayArrowUp,
} from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton, Button } from '@coze-arch/coze-design';
import { UIIconButton } from '@coze-arch/bot-semi';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { CopyButton } from '@/components/copy-button';

import { useLibrariesStore } from './use-libraries-store';
import { ExpandSheetEditor } from './expand-sheet-editor';

import styles from './index.module.less';

export const PromptKitBar = props => {
  const { openPromptLibrary, readonly, value, openCreatePrompt } = props;

  const { updateLibraries } = useLibrariesStore(state => ({
    updateLibraries: state.updateLibraries,
  }));

  const { fullscreenPanel, setFullscreenPanel } = useNodeFormPanelState();
  const fullscreenPanelVisible = !!fullscreenPanel;

  useEffect(() => {
    updateLibraries(props.libraries || []);
  }, [props.libraries]);

  const handleExpandClick = () => {
    setFullscreenPanel(
      fullscreenPanelVisible ? null : (
        <PublicScopeProvider>
          <PromptEditorProvider>
            <ExpandSheetEditor {...props} />
          </PromptEditorProvider>
        </PublicScopeProvider>
      ),
    );
  };

  return (
    <div
      className={`flex justify-between items-center gap-[8px] h-[28px] ${styles['kit-button-container']}`}
    >
      {readonly ? <CopyButton value={value as string} /> : null}
      <Tooltip content={I18n.t('compare_tooltips_submit_to_the_prompt')}>
        <Button
          color="secondary"
          disabled={readonly}
          icon={<IconCozTrayArrowUp />}
          onClick={() =>
            openCreatePrompt({
              mode: 'create',
              defaultPrompt: value,
            })
          }
        ></Button>
      </Tooltip>
      <Tooltip content={I18n.t('workflow_prompt_editor_view_library')}>
        <IconButton
          onClick={e => {
            e.stopPropagation();
            openPromptLibrary();
          }}
          icon={<IconCozLightbulb />}
          color="secondary"
          disabled={readonly}
        />
      </Tooltip>

      <Tooltip
        content={I18n.t(
          fullscreenPanelVisible ? 'collapse' : 'workflow_prompt_editor_expand',
        )}
      >
        <UIIconButton
          onClick={handleExpandClick}
          icon={
            fullscreenPanelVisible ? (
              <IconCozMinimize color="#6B6D75" />
            ) : (
              <IconCozExpand color="#6B6D75" />
            )
          }
          color="#6B6D75"
        />
      </Tooltip>

      <div className={styles['nl-prompt']}>
        {/* will support soon */}
        {IS_OPEN_SOURCE ? null : (
          <NLPromptButton
            disabled={readonly}
            onlyIcon
            className="!h-6 !p-1 !rounded-[5px]"
            tooltip={I18n.t('prompt_optimization_button_hover_tooltip')}
            size="small"
            style={{ minWidth: '24px' }}
          />
        )}
      </div>
    </div>
  );
};
