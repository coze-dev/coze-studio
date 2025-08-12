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
  useRef,
  type RefObject,
  useState,
  forwardRef,
  useImperativeHandle,
  type CSSProperties,
} from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import { Spin, Form, Typography } from '@coze-arch/bot-semi';
import { LazyEditorFullInput } from '@coze-common/md-editor-adapter';
import type { Editor } from '@coze-common/md-editor-adapter';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';
import { IconCozPeople } from '@coze-arch/coze-design/icons';

import { getSchema } from '@/component/onboarding-message/onboarding-editor/method/get-schema';
import { useOnEditor } from '@/component/onboarding-message/onboarding-editor/hooks/use-on-editor';

import s from '../index.module.less';
import { EditorExpendModal } from '../editor-expend-modal';
import { InsertTemplateToolItem } from './plugins/insert-template/tool-item';
import { InsertTemplate } from './plugins/insert-template';
import { sliceEditor } from './method/slice-editor';
import { initEditorByPrologue } from './method/init-editor';
import { getUploadToken } from './method/get-upload-token';
import { getImageUrl } from './method/get-image-url';
import { useModalEditorSubmit } from './hooks/use-modal-editor-submit';
import { useInitEditor } from './hooks/use-init-editor';

import styles from './index.module.less';

const EDITOR_HEIGHT = 132;
const MODAL_EDITOR_HEIGHT = 572;

export interface OnboardingEditorProps {
  initValues?: {
    prologue: string;
  };
  isReadonly?: boolean;
  // Generating
  isGenerating?: boolean;
  // Focus Expand
  focusExpand?: boolean;
  onChange?: (context: OnboardingEditorContext) => void;
  onBlur?: (context: OnboardingEditorContext) => void;
  noExpand?: boolean; // Expand icon in lower right corner
  onExpand?: () => void; // Click expand icon
  style?: CSSProperties;
  businessKey?: string; // To register the toolbar
  noLabel?: boolean;
  /**
   * When plainText mode is enabled, the input content will not be different from the native textarea, markdown support will be removed, and toolbar will be hidden (the noToolbar property will be overridden).
   * @default false
   */
  plainText?: boolean;
}

export interface OnboardingEditorAction {
  reInit: (initValues: { prologue: string }) => void;
  getEditor: () => Editor | null;
}

export interface OnboardingEditorContext {
  props: OnboardingEditorProps;
  editorRef: RefObject<Editor>;
  api: RefObject<FormApi | null>;
}

const InnerEditor = forwardRef<OnboardingEditorAction, OnboardingEditorProps>(
  (props, ref) => {
    const editorRef = useRef<Editor>(null);
    const api = useRef<FormApi | null>(null);
    const context: OnboardingEditorContext = {
      props,
      editorRef,
      api,
    };
    const [isEditorFocus, setIsEditorFocus] = useState(false);

    useInitEditor(context);

    useOnEditor({
      ...context,
      onEditorBlur: () => {
        setIsEditorFocus(false);
        props?.onBlur?.(context);
      },
      onEditorFocus: () => {
        setIsEditorFocus(true);
      },
    });

    useImperativeHandle(ref, () => ({
      reInit: (initValues: { prologue: string }) => {
        if (props.plainText) {
          return editorRef.current.setText(initValues.prologue);
        }
        initEditorByPrologue({
          prologue: initValues.prologue,
          editorRef,
        });
      },
      getEditor: () => editorRef.current,
    }));

    return (
      <>
        {!props?.noLabel ? (
          <div className={classNames(s['onboarding-message-title'], s.text)}>
            <span className="coz-fg-secondary">
              {I18n.t('bot_edit_opening_text_title')}
            </span>
          </div>
        ) : null}
        <Form<Record<string, unknown>>
          getFormApi={formApi => (api.current = formApi)}
        >
          <Spin
            data-testid="bot-editor.onboarding-editor"
            spinning={props?.isGenerating ?? false}
            tip={I18n.t('generating')}
          >
            <LazyEditorFullInput
              businessKey={props.businessKey ?? 'onboarding-editor'}
              fieldStyle={{ padding: '0' }}
              disabled={props.isReadonly}
              field="prologue"
              onChange={() => {
                sliceEditor(
                  editorRef,
                  botInputLengthService.getInputLengthLimit('onboarding'),
                );
                props?.onChange?.(context);
              }}
              noExpand={props?.noExpand ?? false}
              schema={getSchema()}
              style={{
                height: isEditorFocus ? 'unset' : EDITOR_HEIGHT,
                minHeight: EDITOR_HEIGHT,
                ...props?.style,
              }}
              getEditor={editor => {
                editorRef.current = editor;
              }}
              noToolbar={props.isReadonly}
              onExpand={props?.onExpand}
              plainText={props.plainText}
              className={styles['onboarding-editor']}
              getUploadToken={getUploadToken}
              getImgURL={getImageUrl}
              registerPlugins={(plugins, { editor }) =>
                plugins.concat([
                  [InsertTemplate, { editor, template: '{{user_name}}' }],
                ])
              }
              registerToolItem={items =>
                items.concat([
                  () => (
                    <InsertTemplateToolItem
                      tooltipText={I18n.t('add_nickname')}
                      style={{ color: 'rgba(6,7,8,0.5)', height: '22px' }}
                      pluginValue="{{user_name}}"
                    >
                      <IconCozPeople />
                    </InsertTemplateToolItem>
                  ),
                ])
              }
              noLabel
              label={I18n.t('community_Group_Title_content')}
              maxCount={botInputLengthService.getInputLengthLimit('onboarding')}
              placeholder={I18n.t(
                'community_Please_enter_please_enter_your_post',
              )}
            />
          </Spin>
        </Form>
      </>
    );
  },
);

export const OnboardingEditor = forwardRef<
  OnboardingEditorAction,
  OnboardingEditorProps
>((props, ref) => {
  const [editorModalVisible, setEditorModalVisible] = useState(false);
  const modalEditor = useRef<OnboardingEditorAction | null>(null);
  const {
    isModalEditorSubmitting,
    editorImageUploadNum,
    editorImageTotalNum,
    submitEditor,
  } = useModalEditorSubmit(
    modalEditor,
    ref as RefObject<OnboardingEditorAction>,
  );

  return (
    <>
      <EditorExpendModal
        visible={editorModalVisible}
        onCancel={() => {
          if (isModalEditorSubmitting) {
            return;
          }
          setEditorModalVisible(false);
        }}
      >
        <InnerEditor
          {...props}
          ref={modalEditor}
          noExpand={true}
          businessKey="onboarding-editor-modal"
          noLabel={true}
          style={{
            height: MODAL_EDITOR_HEIGHT,
          }}
          onChange={submitEditor}
        />
        {isModalEditorSubmitting ? (
          <Typography.Text size="small" className="coz-fg-secondary">
            {I18n.t('community_Image_uploading', {
              upload_num: editorImageUploadNum,
              total_num: editorImageTotalNum,
            })}
          </Typography.Text>
        ) : null}
      </EditorExpendModal>

      <InnerEditor
        ref={ref}
        {...props}
        onExpand={() => setEditorModalVisible(true)}
      />
    </>
  );
});
export default OnboardingEditor;
