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

import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Modal, type ModalProps, Search, Button } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { PlaygroundApi } from '@coze-arch/bot-api';
import { LibraryBlockWidget } from '@coze-common/editor-plugins/library-insert';
import { InputSlotWidget } from '@coze-common/editor-plugins/input-slot';
import {
  PromptEditorRender,
  PromptEditorProvider,
} from '@coze-common/prompt-kit-base/editor';
import { usePromptConfiguratorModal } from '@coze-common/prompt-kit-adapter/create-prompt';

import { type LibraryInfo, getLibraryListByCategory } from './library-request';
import { LibraryList, type InfiniteListRef } from './library-list';
import { CopyPrompt, InsertToEditor, PromptDiff } from './footer-actions';
import { EmptyPrompt } from './empty';

import '@coze-common/prompt-kit-base/shared/css';
import styles from './index.module.less';

const getTabLabelMap = (isPersonal: boolean) => ({
  Recommended: I18n.t('prompt_resource_recommended'),
  Team: isPersonal
    ? I18n.t('prompt_resource_personal')
    : I18n.t('prompt_resource_team'),
});
const LIMIT_LIBRARY_SIZE = 15;

interface PromptContextInfo {
  botId?: string;
  name?: string;
  description?: string;
  contextHistory?: string;
}

export interface ActionExtraInfo {
  category: 'Recommended' | 'Team';
  id: string;
}

interface PromptLibraryProps extends ModalProps {
  spaceId: string;
  isPersonal?: boolean;
  editor: EditorAPI;
  getConversationId?: () => string | undefined;
  getPromptContextInfo?: () => PromptContextInfo;
  enableDiff?: boolean;
  importPromptWhenEmpty?: string;
  defaultActiveTab?: 'Recommended' | 'Team';
  tabs?: ('Recommended' | 'Team')[];
  /** For event tracking: page source */
  source: string;
  /** For event tracking: bot_id */
  botId?: string;
  /** For event tracking: project_id */
  projectId?: string;
  /** For event tracking: workflow_id */
  workflowId?: string;
  onInsertPrompt?: (prompt: string, selectedLibrary: ActionExtraInfo) => void;
  onUpdateSuccess?: (
    mode: 'create' | 'edit' | 'info',
    selectedLibrary: ActionExtraInfo,
  ) => void;
  onCopyPrompt?: (selectedLibrary: ActionExtraInfo) => void;
  onDeletePrompt?: (selectedLibrary: ActionExtraInfo) => void;
  onDiff?: ({
    prompt,
    libraryId,
  }: {
    prompt: string;
    libraryId: string;
  }) => void;
  onCancel?: () => void;
}

/* eslint-disable @coze-arch/max-line-per-function */
export const PromptLibrary = ({
  spaceId,
  onCancel,
  defaultActiveTab = 'Recommended',
  getConversationId,
  getPromptContextInfo,
  editor: outerEditor,
  source,
  tabs = ['Recommended', 'Team'],
  botId,
  projectId,
  workflowId,
  isPersonal = false,
  importPromptWhenEmpty,
  enableDiff = false,
  onInsertPrompt,
  onUpdateSuccess,
  onCopyPrompt,
  onDeletePrompt,
  onDiff,
}: PromptLibraryProps) => {
  const [activeTab, setActiveTab] = useState<'Recommended' | 'Team'>(
    defaultActiveTab,
  );
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<LibraryInfo[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
  const [searchWord, setSearchWord] = useState<string | undefined>(undefined);
  const targetRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<InfiniteListRef<LibraryInfo>>(null);
  const editor = useEditor<EditorAPI>();
  const isEmptyList = !isLoading && dataList.length === 0;

  const { open: openPromptConfiguratorModal, node: PromptConfiguratorModal } =
    usePromptConfiguratorModal({
      spaceId,
      isPersonal,
      enableDiff,
      getConversationId,
      getPromptContextInfo,
      importPromptWhenEmpty,
      source,
      botId,
      projectId,
      workflowId,
      onDiff,
      onUpdateSuccess: (mode, id) => {
        if (tabs.includes(activeTab)) {
          setActiveTab('Team');
        }
        onUpdateSuccess?.(mode, {
          id: id || '',
          category: 'Team',
        });
        listRef.current?.reload();
      },
    });
  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.$view.dispatch({
      changes: {
        from: 0,
        to: editor.$view.state.doc.length,
        insert: prompt,
      },
    });
  }, [editor, prompt]);

  useEffect(() => {
    if (!selectedLibraryId || isLoading || !dataList.length) {
      return;
    }
    const selectedLibrary = dataList.find(
      item => item.id === selectedLibraryId,
    );
    if (!selectedLibrary) {
      return;
    }
    const { promptText } = selectedLibrary;

    if (promptText) {
      setPrompt(promptText);
      return;
    }
    PlaygroundApi.GetPromptResourceInfo({
      prompt_resource_id: selectedLibraryId,
    }).then(({ data: { prompt_text: newPrompt } = {} }) => {
      setPrompt(newPrompt ?? '');
    });
  }, [selectedLibraryId, dataList, isLoading]);

  // Switch tab, no selected prompt word, reset search term
  useEffect(() => {
    setSelectedLibraryId('');
    setPrompt('');
  }, [activeTab, isEmptyList]);

  return (
    <>
      <Modal
        title={I18n.t('prompt_library_prompt_library')}
        visible
        className={styles['prompt-library-modal']}
        width="880px"
        closeOnEsc={false}
        maskClosable={false}
        footer={
          <div className="flex justify-end">
            {enableDiff ? (
              <PromptDiff
                onDiff={() => {
                  onDiff?.({ prompt, libraryId: selectedLibraryId });
                  sendTeaEvent(EVENT_NAMES.prompt_library_front, {
                    source,
                    prompt_id: selectedLibraryId,
                    space_id: spaceId,
                    prompt_type: 'workspace',
                    action: 'compare',
                    bot_id: botId,
                    project_id: projectId,
                    workflow_id: workflowId,
                  });
                  sendTeaEvent(EVENT_NAMES.compare_mode_front, {
                    source,
                    action: 'start',
                    compare_type: 'prompts',
                    bot_id: botId,
                  });
                }}
              />
            ) : null}
            <CopyPrompt
              editor={editor}
              onCopyPrompt={() => {
                onCopyPrompt?.({ id: selectedLibraryId, category: activeTab });
                sendTeaEvent(EVENT_NAMES.prompt_library_front, {
                  source,
                  prompt_id: selectedLibraryId,
                  space_id: spaceId,
                  prompt_type: 'workspace',
                  action: 'copy',
                  bot_id: botId,
                  project_id: projectId,
                  workflow_id: workflowId,
                });
              }}
            />
            <InsertToEditor
              outerEditor={outerEditor}
              prompt={prompt}
              onInsertPrompt={insertPrompt => {
                onInsertPrompt?.(insertPrompt, {
                  id: selectedLibraryId,
                  category: activeTab,
                });
                sendTeaEvent(EVENT_NAMES.prompt_library_front, {
                  source,
                  prompt_id: selectedLibraryId,
                  space_id: spaceId,
                  prompt_type: 'workspace',
                  action: 'insert',
                  bot_id: botId,
                  project_id: projectId,
                  workflow_id: workflowId,
                });
              }}
              onCancel={() => {
                onCancel?.();
              }}
            />
          </div>
        }
        onCancel={onCancel}
      >
        <div className="flex flex-col gap-5 overflow-hidden h-[620px]">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 pl-3">
              {tabs.map(category => (
                <div
                  key={category}
                  className={classNames(
                    'coz-fg-secondary text-sm cursor-pointer font-medium',
                    {
                      '!coz-fg-hglt': activeTab === category,
                    },
                  )}
                  onClick={() => {
                    setActiveTab(category);
                  }}
                >
                  {getTabLabelMap(isPersonal)[category]}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Search
                className="w-[192px]"
                placeholder={I18n.t('Search')}
                onSearch={setSearchWord}
              />
              {isEmptyList ? null : (
                <Button
                  type="primary"
                  className="!coz-mg-hglt !coz-fg-hglt hover:!coz-mg-hglt-hovered active:!coz-mg-hglt-pressed"
                  icon={<IconCozPlus />}
                  onClick={() => {
                    openPromptConfiguratorModal({
                      mode: 'create',
                    });
                  }}
                >
                  {I18n.t('prompt_library_new_prompt')}
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-hidden flex-1">
            <div
              className="flex-1 basis-1/3 overflow-y-auto styled-scrollbar hover-show-scrollbar"
              ref={targetRef}
            >
              <LibraryList
                ref={listRef}
                targetRef={targetRef}
                spaceId={spaceId}
                category={activeTab}
                size={LIMIT_LIBRARY_SIZE}
                searchWord={searchWord}
                getData={getLibraryListByCategory}
                onChangeState={(newIsLoading, newDataList) => {
                  setIsLoading(newIsLoading);
                  setDataList(newDataList);
                }}
                onActive={id => {
                  setSelectedLibraryId(id);
                }}
                onDeleteAction={id => {
                  PlaygroundApi.DeletePromptResource({
                    prompt_resource_id: id,
                  }).then(() => {
                    onDeletePrompt?.({ id, category: 'Team' });
                    sendTeaEvent(EVENT_NAMES.prompt_library_front, {
                      source,
                      prompt_id: id,
                      space_id: spaceId,
                      prompt_type: 'workspace',
                      action: 'delete',
                      bot_id: botId,
                      project_id: projectId,
                      workflow_id: workflowId,
                    });
                    listRef.current?.reload();
                  });
                }}
                onEditAction={id => {
                  openPromptConfiguratorModal({
                    mode: 'edit',
                    editId: id,
                  });
                }}
                onEmptyClick={() => {
                  openPromptConfiguratorModal({
                    mode: 'create',
                  });
                }}
              />
            </div>
            <div className="flex-1 basis-2/3 coz-bg-max rounded-normal border-solid coz-stroke-primary border-[0.5px] p-2 empty:hidden overflow-y-auto styled-scrollbar hover-show-scrollbar">
              {isEmptyList ? null : (
                <>
                  {prompt ? (
                    <div className="relative ">
                      <PromptEditorRender defaultValue={prompt} readonly />
                      <InputSlotWidget mode="input" />
                      <LibraryBlockWidget
                        librarys={[]}
                        readonly
                        spaceId={spaceId}
                      />
                    </div>
                  ) : (
                    <EmptyPrompt className="flex justify-center items-center h-full w-full" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>
      {PromptConfiguratorModal}
    </>
  );
};

export const usePromptLibraryModal = (
  props: Omit<PromptLibraryProps, 'onClose'>,
) => {
  const [visible, setVisible] = useState(false);
  const [dynamicProps, setDynamicProps] = useState<Partial<PromptLibraryProps>>(
    {},
  );
  const close = () => {
    setVisible(false);
  };
  const open = (options?: Partial<PromptLibraryProps>) => {
    setVisible(true);
    setDynamicProps(options ?? {});
  };
  return {
    node: visible ? (
      <PromptEditorProvider>
        <PromptLibrary {...props} {...dynamicProps} onCancel={close} />
      </PromptEditorProvider>
    ) : null,
    close,
    open,
  };
};
