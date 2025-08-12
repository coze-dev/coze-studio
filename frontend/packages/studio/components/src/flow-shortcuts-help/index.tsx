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

import React, { type ReactNode } from 'react';

import { I18n } from '@coze-arch/i18n';
import { getIsIPad } from '@coze-arch/bot-utils';
import { Divider, Typography, Tag } from '@coze-arch/bot-semi';
import { IconCloseNoCycle } from '@coze-arch/bot-icons';

import { SHORTCUTS } from './constants';

import s from './index.module.less';

interface ShortcutItemProps {
  title: ReactNode;
  children?: ReactNode;
}

function ShortcutItem({ title, children }: ShortcutItemProps) {
  return (
    <div className={s.item}>
      <div className={s.itemTitle}>{title}</div>
      <div className={s.itemContent}>{children}</div>
    </div>
  );
}

function DividerWithMargin() {
  return <Divider style={{ margin: '12px 0' }} />;
}

function ShortcutTag({ children }: { children: ReactNode }) {
  return (
    <Tag
      style={{
        margin: '0 4px',
        height: 24,
        padding: '0 8px',
        fontSize: 14,
        backgroundColor: '#f0f0f5',
      }}
    >
      {children}
    </Tag>
  );
}

interface FlowShortcutsHelpProps {
  closable?: boolean;
  onClose?: () => void;
  isAgentFlow?: boolean;
}

const isIPad = getIsIPad();

function FlowShortcutsHelp(props: FlowShortcutsHelpProps) {
  const { closable = false, onClose, isAgentFlow = false } = props;
  return (
    <>
      {closable ? (
        <div className={s.close} onClick={() => onClose?.()}>
          <IconCloseNoCycle />
        </div>
      ) : null}

      <Typography.Title heading={5} style={{ marginBottom: 16 }}>
        {I18n.t('flowcanvas_shortcuts_shortcuts')}
      </Typography.Title>

      <ShortcutItem title={I18n.t('flowcanvas_shortcuts_move_canvas')}>
        <ShortcutTag>{I18n.t('flowcanvas_shortcuts_space')}</ShortcutTag>
        <ShortcutTag>{I18n.t('flowcanvas_shortcuts_drag')}</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      <ShortcutItem
        title={
          <>
            {I18n.t('flowcanvas_shortcuts_multiple_select')}/
            {I18n.t('flowcanvas_shortcuts_multiple_deselect')}
          </>
        }
      >
        <ShortcutTag>
          {SHORTCUTS.CTRL}/{SHORTCUTS.SHIFT}
        </ShortcutTag>
        <ShortcutTag>{I18n.t('flowcanvas_shortcuts_click')}</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      <ShortcutItem title={I18n.t('flowcanvas_shortcuts_zoom_in')}>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>+</ShortcutTag>
        <span style={{ margin: '0 6px' }}>
          {I18n.t('flowcanvas_shortcuts_or')}
        </span>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>{I18n.t('flowcanvas_shortcuts_scroll')}</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      <ShortcutItem title={I18n.t('flowcanvas_shortcuts_zoom_out')}>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>-</ShortcutTag>
        <span style={{ margin: '0 6px' }}>
          {I18n.t('flowcanvas_shortcuts_or')}
        </span>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>{I18n.t('flowcanvas_shortcuts_scroll')}</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      {isIPad || isAgentFlow ? null : (
        <>
          <ShortcutItem title={I18n.t('flowcanvas_shortcuts_duplicate')}>
            <ShortcutTag>{SHORTCUTS.ALT}</ShortcutTag>
            <ShortcutTag>{I18n.t('flowcanvas_shortcuts_drag')}</ShortcutTag>
          </ShortcutItem>
          <DividerWithMargin />
        </>
      )}

      <ShortcutItem title={I18n.t('flowcanvas_shortcuts_copy')}>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>C</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      <ShortcutItem title={I18n.t('flowcanvas_shortcuts_paste')}>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>V</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      <UndoRedoShortcuts />

      <ShortcutItem title={I18n.t('flowcanvas_shortcuts_delete')}>
        <ShortcutTag>{I18n.t('flowcanvas_shortcuts_backspace')}</ShortcutTag>
      </ShortcutItem>
    </>
  );
}

function UndoRedoShortcuts() {
  return (
    <>
      <ShortcutItem title={I18n.t('workflow_detail_undo_tooltip')}>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>Z</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />

      <ShortcutItem title={I18n.t('workflow_detail_redo_tooltip')}>
        <ShortcutTag>{SHORTCUTS.CTRL}</ShortcutTag>
        <ShortcutTag>{SHORTCUTS.SHIFT}</ShortcutTag>
        <ShortcutTag>Z</ShortcutTag>
      </ShortcutItem>

      <DividerWithMargin />
    </>
  );
}

export { FlowShortcutsHelp };
