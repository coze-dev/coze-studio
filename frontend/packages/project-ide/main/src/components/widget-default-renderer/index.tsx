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

import React, { useCallback } from 'react';

import {
  useIDEService,
  ShortcutsService,
  CommandRegistry,
  Command,
} from '@coze-project-ide/framework';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze-arch/coze-design/icons';
import { Image, Button } from '@coze-arch/coze-design';

import EnWorkflowFrame from '@/assets/en-workflow-frame.png';
import EnUIBuilderFrame from '@/assets/en-ui-builder-frame.png';
import EnKnowledgeFrame from '@/assets/en-knowledge-frame.png';
import CnWorkflowFrame from '@/assets/cn-workflow-frame.png';
import CnUIBuilderFrame from '@/assets/cn-ui-builder-frame.png';
import CnKnowledgeFrame from '@/assets/cn-knowledge-frame.png';

import { FullScreenButton } from '../toolbar/full-screen-button';
import { SidebarExpand } from '../sidebar-expand';
import { ShortcutItem } from './shortcut-item';

import styles from './styles.module.less';

// Coze shortcut needs to bind starling copy. If there is no bound copy, it will not be displayed for the time being.
// Avoid adding shortcuts to cause new wrong display
const SHOW_SHORTCUTS: string[] = [
  Command.Default.VIEW_CLOSE_ALL_WIDGET,
  Command.Default.VIEW_CLOSE_CURRENT_WIDGET,
  Command.Default.VIEW_CLOSE_OTHER_WIDGET,
];

export const WidgetDefaultRenderer = () => {
  const shortcutsService = useIDEService<ShortcutsService>(ShortcutsService);
  const commandRegistry = useIDEService<CommandRegistry>(CommandRegistry);
  const shortcutsList = shortcutsService.shortcutsHandlers
    .filter(shortcut => SHOW_SHORTCUTS.includes(shortcut.commandId))
    .map(shortcut => ({
      key: shortcut.commandId,
      label:
        commandRegistry.getCommand(shortcut.commandId)?.label ||
        shortcut.commandId,
      keybinding: shortcutsService.getShortcutByCommandId(shortcut.commandId),
    }));

  const handleWorkflowDoc = useCallback(() => {
    window.open('/docs/guides/build_project_in_projectide');
  }, []);
  const handleUIBuilderDoc = useCallback(() => {
    window.open('/docs/guides/build_ui_interface');
  }, []);
  const handleDatabaseDoc = useCallback(() => {
    window.open('/docs/guides/add_resources_to_project');
  }, []);

  return (
    <div className={styles['default-container']}>
      <div className={styles['icon-expand']}>
        <SidebarExpand />
      </div>
      <div className={styles['full-screen']}>
        <FullScreenButton />
      </div>
      <div className={styles.title}>{I18n.t('project_ide_welcome_title')}</div>
      <div className={styles['sub-title']}>
        {I18n.t('project_ide_welcome_describe')}
      </div>
      <div className={styles.gallery}>
        <div className={styles['gallery-block']}>
          <Image
            preview={false}
            src={IS_OVERSEA ? EnWorkflowFrame : CnWorkflowFrame}
            width={320}
            height={160}
          />
          <div className={styles['gallery-title']}>
            {I18n.t('project_ide_welcome_workflow_title')}
          </div>
          <div className={styles['gallery-description']}>
            {I18n.t('project_ide_welcome_workflow_describe')}
          </div>
          <Button
            className={styles['doc-search']}
            icon={<IconCozDocument />}
            color="primary"
            onClick={handleWorkflowDoc}
          >
            {I18n.t('project_ide_view_document')}
          </Button>
        </div>
        {IS_OVERSEA || IS_OPEN_SOURCE ? null : (
          <div className={styles['gallery-block']}>
            <Image
              preview={false}
              src={IS_OVERSEA ? EnUIBuilderFrame : CnUIBuilderFrame}
              width={320}
              height={160}
            />
            <div className={styles['gallery-title']}>
              {I18n.t('project_ide_welcome_ui_builder_title')}
            </div>
            <div className={styles['gallery-description']}>
              {I18n.t('project_ide_welcome_ui_builder_describe')}
            </div>
            <Button
              className={styles['doc-search']}
              icon={<IconCozDocument />}
              color="primary"
              onClick={handleUIBuilderDoc}
            >
              {I18n.t('project_ide_view_document')}
            </Button>
          </div>
        )}
        <div className={styles['gallery-block']}>
          <Image
            preview={false}
            src={IS_OVERSEA ? EnKnowledgeFrame : CnKnowledgeFrame}
            width={320}
            height={160}
          />
          <div className={styles['gallery-title']}>
            {I18n.t('project_ide_welcome_db_title')}
          </div>
          <div className={styles['gallery-description']}>
            {I18n.t('project_ide_welcome_db_describ')}
          </div>
          <Button
            className={styles['doc-search']}
            icon={<IconCozDocument />}
            color="primary"
            onClick={handleDatabaseDoc}
          >
            {I18n.t('project_ide_view_document')}
          </Button>
        </div>
      </div>
      <div className={styles['shortcuts-list']}>
        {shortcutsList.map(item => (
          <ShortcutItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
};
