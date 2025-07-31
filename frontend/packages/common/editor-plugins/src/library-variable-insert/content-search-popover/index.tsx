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

import React, { useEffect, useState } from 'react';

import {
  CursorMirror,
  SelectionSide,
  useEditor,
} from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import {
  Tabs,
  TabPane,
  RadioGroup,
  Radio,
  Popover,
} from '@coze-arch/coze-design';

import { type ContentSearchPopoverProps } from '../types';
import { generateUniqueId, useLatest } from '../../expression/shared';
import {
  useCharacterTriggerContext,
  useInterpolationContent,
  useSelection,
} from '../../expression/popover/hooks';
import useVariablesTree from './variable/use-variables-tree';
import useLibraryList from './library/use-library-list';

import styles from './style.module.less';

enum TabEnum {
  Variables = '1',
  Skills = '2',
}

const genLibraryInsertPosition = (from?: number, to?: number) => {
  const _from = (from ?? 0) - 1 >= 0 ? (from ?? 0) - 1 : 0;

  return {
    from: _from,
    to: (to ?? _from) + 1,
  };
};

export const ContentSearchPopover = ({
  libraries = [],
  direction = 'bottomLeft',
  readonly,
  onInsert,
  variableTree = [],
}: ContentSearchPopoverProps) => {
  const [activeTab, setActiveTab] = useState<string>(TabEnum.Variables);
  const [reposKey, setReposKey] = useState('');
  const emptyLibrary = libraries.map(item => item.items).flat().length === 0;
  const editor = useEditor<EditorAPI>();
  const editorRef = useLatest(editor);
  const selection = useSelection(editor);

  const interpolationContent = useInterpolationContent(
    editor,
    selection?.anchor,
  );

  const triggerContext = useCharacterTriggerContext();

  const completionContext = interpolationContent ?? triggerContext;

  const visible = Boolean(completionContext);

  const insertPosition = genLibraryInsertPosition(
    completionContext?.from,
    completionContext?.to,
  );

  const { libraryListPanel } = useLibraryList({
    libraries,
    editor,
    onInsert,
    insertPosition,
    enableKeyboard: visible && activeTab === TabEnum.Skills,
    filterText: completionContext?.text,
  });

  const { variablesTreePanel } = useVariablesTree({
    variableTree,
    enableKeyboard: visible && activeTab === TabEnum.Variables,
    completionContext,
  });

  useEffect(() => {
    if (visible) {
      editorRef.current?.disableKeybindings(['ArrowUp', 'ArrowDown', 'Enter']);
    } else {
      editorRef.current?.disableKeybindings([]);
    }
  }, [visible]);

  return (
    <>
      <Popover
        style={{
          width: '360px',
          padding: '4px',
          minHeight: '240px',
          maxHeight: '400px',
        }}
        rePosKey={reposKey}
        visible={!readonly && visible}
        trigger="custom"
        position={emptyLibrary ? 'bottomLeft' : direction}
        autoAdjustOverflow
        content={
          <Tabs
            activeKey={activeTab}
            onChange={key => {
              setActiveTab(key);
              // Make sure the cursor is still positioned on the editor after switching tabs
              setTimeout(() => {
                editorRef.current?.$view.focus();
              }, 0);
            }}
            renderTabBar={tabBarProps => (
              <div className={styles['tab-bar-wrapper']}>
                <RadioGroup
                  value={tabBarProps.activeKey}
                  type="button"
                  buttonSize="middle"
                >
                  {tabBarProps.list?.map(tab => (
                    <span
                      onClick={event =>
                        tabBarProps.onTabClick?.(tab.itemKey, event)
                      }
                    >
                      <Radio value={tab.itemKey}>{tab.tab}</Radio>
                    </span>
                  ))}
                </RadioGroup>
              </div>
            )}
          >
            <TabPane
              tab={I18n.t('workflow_prompt_editor_variable')}
              itemKey={TabEnum.Variables}
            >
              {variablesTreePanel}
            </TabPane>
            <TabPane
              tab={I18n.t('workflow_prompt_editor_skill')}
              itemKey={TabEnum.Skills}
            >
              {libraryListPanel}
            </TabPane>
          </Tabs>
        }
      >
        <CursorMirror
          side={SelectionSide.Anchor}
          onChange={() => setReposKey(generateUniqueId())}
        />
      </Popover>
    </>
  );
};
