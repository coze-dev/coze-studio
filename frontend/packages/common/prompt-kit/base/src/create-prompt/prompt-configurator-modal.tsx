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

/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines-per-function */
import { useEffect, useRef, Suspense, lazy, useState } from 'react';

import classNames from 'classnames';
import {
  useEditor,
  ActiveLinePlaceholder,
  Placeholder,
} from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { Modal, Form, Toast, type FormApi } from '@coze-arch/coze-design';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { PlaygroundApi } from '@coze-arch/bot-api';
import {
  LibraryBlockWidget,
  type ILibraryList,
} from '@coze-common/editor-plugins/library-insert';
import { InputSlotWidget } from '@coze-common/editor-plugins/input-slot';
import { ActionBar } from '@coze-common/editor-plugins/action-bar';
import { I18n } from '@coze-arch/i18n';

import { PromptEditorRender } from '@/editor';

import { type PromptConfiguratorModalProps } from './types';
import { PromptConfiguratorProvider } from './context';
import { PromptInfoInput } from './components/prompt-info-input';
import { PromptHeader } from './components/header';
import {
  CloseModal,
  PromptDiff,
  SavePrompt,
} from './components/footer-actions';

import styles from './index.module.less';

const MAX_NAME_LENGTH = IS_OVERSEA ? 40 : 20;
const MAX_DESCRIPTION_LENGTH = IS_OVERSEA ? 100 : 50;

const NAME_ROW_LENGTH = 1;
const DESCRIPTION_ROW_LENGTH = IS_OVERSEA ? 2 : 1;

interface PromptValues {
  id?: string;
  name: string;
  description: string;
  prompt_text?: string;
}
const EMPTY_LIBRARY: ILibraryList = [];

const ReactMarkdown = lazy(() => import('react-markdown'));
/* eslint-disable @coze-arch/max-line-per-function */
export const PromptConfiguratorModal = (
  props: PromptConfiguratorModalProps,
) => {
  const {
    mode,
    editId,
    spaceId,
    botId,
    projectId,
    workflowId,
    canEdit,
    onUpdateSuccess,
    promptSectionConfig,
    enableDiff,
    onDiff,
    defaultPrompt,
    source,
    containerAppendSlot,
  } = props;
  const formApiRef = useRef<FormApi | null>(null);
  const editor = useEditor<EditorAPI>();
  const [modalMode, setModalMode] = useState<'info' | 'edit' | 'create'>(mode);
  const [errMsg, setErrMsg] = useState('');
  const isSubmiting = useRef(false);
  const [actionBarVisible, setActionBarVisible] = useState(false);
  const selectionInInputSlotRef = useRef(false);
  const isReadOnly = modalMode === 'info';
  const {
    editorPlaceholder,
    editorActions,
    headerActions,
    editorActiveLinePlaceholder,
    editorExtensions,
  } = promptSectionConfig ?? {};
  const [formValues, setFormValues] = useState<PromptValues>({
    name: '',
    description: '',
    prompt_text: '',
  });
  const handleSubmit = async (e: React.MouseEvent<Element, MouseEvent>) => {
    if (isSubmiting.current) {
      return;
    }
    const submitValues = await formApiRef.current?.validate();
    if (!submitValues) {
      return;
    }
    isSubmiting.current = true;
    if (modalMode === 'info') {
      handleInfoModeAction();
      return;
    }

    if (modalMode === 'create' || modalMode === 'edit') {
      const result = await handleUpdateModeAction(e);
      isSubmiting.current = false;
      sendTeaEvent(EVENT_NAMES.prompt_library_front, {
        bot_id: botId,
        project_id: projectId,
        workflow_id: workflowId,
        space_id: spaceId,
        prompt_id: result?.id ?? '',
        prompt_type: 'workspace',
        action: mode,
        source,
      });
      return result;
    }
    isSubmiting.current = false;
  };
  const handleInfoModeAction = () => {
    const promptText = editor?.getValue();
    navigator.clipboard.writeText(promptText ?? '');
    Toast.success(I18n.t('prompt_library_prompt_copied_successfully'));
  };
  const handleUpdateModeAction = async (
    e: React.MouseEvent<Element, MouseEvent>,
  ) => {
    try {
      const submitValues = await formApiRef.current?.validate();
      if (!submitValues) {
        return;
      }
      const res = await PlaygroundApi.UpsertPromptResource(
        {
          prompt: {
            ...submitValues,
            space_id: spaceId,
            ...(modalMode === 'edit' && { id: editId }),
          },
        },
        {
          __disableErrorToast: true,
        },
      );
      props.onCancel?.(e);
      const id = modalMode === 'edit' ? editId : res?.data?.id;
      if (mode === 'create') {
        Toast.success(I18n.t('prompt_library_prompt_creat_successfully'));
      }
      onUpdateSuccess?.(mode, id);
      if (!id) {
        return;
      }
      return {
        mode,
        id,
      };
    } catch (error) {
      setErrMsg((error as Error).message);
    }
  };
  useEffect(() => {
    if (!defaultPrompt || !editor) {
      return;
    }
    editor?.$view.dispatch({
      changes: {
        from: 0,
        to: editor.$view.state.doc.length,
        insert: defaultPrompt,
      },
    });
  }, [defaultPrompt, editor]);

  useEffect(() => {
    if (!editId || !editor) {
      return;
    }
    PlaygroundApi.GetPromptResourceInfo({
      prompt_resource_id: editId,
    }).then(
      ({ data: { name = '', description = '', prompt_text = '' } = {} }) => {
        formApiRef.current?.setValues({
          prompt_text,
          name,
          description,
        });
        editor?.$view.dispatch({
          changes: {
            from: 0,
            to: editor.$view.state.doc.length,
            insert: prompt_text,
          },
        });
        setFormValues({
          name,
          description,
          prompt_text,
        });
      },
    );
  }, [editId, modalMode, editor]);

  return (
    <PromptConfiguratorProvider
      value={{
        props,
        formApiRef,
        isReadOnly,
      }}
    >
      <Modal
        title={
          <PromptHeader
            canEdit={!!canEdit}
            mode={modalMode}
            onEditIconClick={() => {
              setModalMode('edit');
            }}
          />
        }
        closeOnEsc={false}
        maskClosable={false}
        visible
        width="640px"
        footer={
          <div className="flex items-center justify-end">
            {enableDiff ? (
              <PromptDiff
                spaceId={spaceId}
                botId={botId}
                projectId={projectId}
                workflowId={workflowId}
                source={source}
                mode={modalMode}
                editor={editor}
                submitFun={handleSubmit}
                editId={editId}
                onDiff={({ prompt, libraryId }) => {
                  onDiff?.({ prompt, libraryId });
                }}
                onCancel={e => {
                  props.onCancel?.(e);
                }}
              />
            ) : (
              <CloseModal onCancel={props.onCancel} />
            )}
            <SavePrompt
              mode={modalMode}
              isSubmitting={isSubmiting.current}
              onSubmit={handleSubmit}
            />
          </div>
        }
        onCancel={props.onCancel}
        className={styles['prompt-configurator-modal']}
      >
        <div className="flex flex-col gap-4">
          <div>
            <Form<PromptValues>
              getFormApi={formApi => {
                formApiRef.current = formApi;
              }}
            >
              <PromptInfoInput
                disabled={modalMode === 'info'}
                label={I18n.t('creat_new_prompt_prompt_name')}
                placeholder={I18n.t('creat_new_prompt_name_placeholder')}
                maxLength={MAX_NAME_LENGTH}
                maxCount={MAX_NAME_LENGTH}
                initCount={formValues.name.length}
                rows={NAME_ROW_LENGTH}
                rules={[
                  {
                    required: !isReadOnly,
                    message: I18n.t('creat_new_prompt_name_placeholder'),
                  },
                ]}
                field="name"
              />
              <PromptInfoInput
                disabled={modalMode === 'info'}
                label={I18n.t('creat_new_prompt_prompt_description')}
                placeholder={I18n.t('creat_new_prompt_des_placeholder')}
                maxLength={MAX_DESCRIPTION_LENGTH}
                maxCount={MAX_DESCRIPTION_LENGTH}
                initCount={formValues.description.length}
                rows={DESCRIPTION_ROW_LENGTH}
                field="description"
              />
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <Form.Label
                    text={I18n.t('creat_new_prompt_prompt')}
                    className="mb-0"
                  />
                  {headerActions}
                </div>
                <div
                  className={classNames(
                    'rounded-lg border border-solid coz-stroke-plus h-[400px] overflow-y-auto styled-scrollbar hover-show-scrollbar',
                  )}
                >
                  <PromptEditorRender
                    readonly={modalMode === 'info'}
                    options={{
                      minHeight: 300,
                    }}
                    onChange={value => {
                      formApiRef.current?.setValue('prompt_text', value);
                    }}
                  />
                  <InputSlotWidget
                    mode="configurable"
                    onSelectionInInputSlot={selection => {
                      selectionInInputSlotRef.current = !!selection;
                    }}
                  />
                  <LibraryBlockWidget
                    librarys={EMPTY_LIBRARY}
                    readonly
                    spaceId={spaceId}
                  />
                  <ActionBar
                    trigger="custom"
                    visible={actionBarVisible}
                    onVisibleChange={visible => {
                      if (selectionInInputSlotRef.current) {
                        return;
                      }
                      setActionBarVisible(visible);
                    }}
                  >
                    {editorActions}
                  </ActionBar>
                  <Placeholder>{editorPlaceholder}</Placeholder>
                  <ActiveLinePlaceholder>
                    {editorActiveLinePlaceholder}
                  </ActiveLinePlaceholder>
                  {editorExtensions}
                </div>
              </div>
            </Form>
            {errMsg ? (
              <div className="text-red">
                <Suspense fallback={null}>
                  <ReactMarkdown skipHtml={true} linkTarget="_blank">
                    {errMsg}
                  </ReactMarkdown>
                </Suspense>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
      {containerAppendSlot}
    </PromptConfiguratorProvider>
  );
};
