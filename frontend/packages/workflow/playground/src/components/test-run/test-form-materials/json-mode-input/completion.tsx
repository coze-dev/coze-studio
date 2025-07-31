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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

import { nanoid } from 'nanoid';
import { toString } from 'lodash-es';
import { useSelectVoiceModal } from '@coze-workflow/resources-adapter';
import { workflowApi } from '@coze-workflow/base';
import { type EditorAPI } from '@coze-editor/editor/preset-code';
import { I18n } from '@coze-arch/i18n';
import { upLoadFile } from '@coze-arch/bot-utils';
import { IconCozUpload, IconCozPlus } from '@coze-arch/coze-design/icons';
import { Toast, Upload } from '@coze-arch/coze-design';
import { EditorSelection } from '@codemirror/state';

import { validate } from '@/hooks/use-upload/validate';
import { MAX_IMAGE_SIZE, MAX_FILE_SIZE } from '@/hooks/use-upload/constant';

import { generateUrlWithFilename, TEST_RUN_FILE_UPLOADING_KEY } from './utils';

import css from './completion.module.less';

const upload = async (file: any, fileType: 'object' | 'image') => {
  const uri = await upLoadFile({
    biz: 'workflow',
    fileType,
    file,
  });
  if (!uri) {
    throw new Error('no uri');
  }
  const { url } = await workflowApi.SignImageURL(
    {
      uri,
    },
    {
      __disableErrorToast: true,
    },
  );
  if (!url) {
    throw new Error(I18n.t('imageflow_upload_error'));
  }
  return url;
};

interface UploadButtonProps {
  editorRef: React.MutableRefObject<EditorAPI>;
  position: number;
  fileType: 'object' | 'image';
  accept: string;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  editorRef,
  position,
  fileType,
  accept,
}) => {
  const ref = useRef<any>(null);
  const changeEditor = (insert: string, from: number, to: number) => {
    if (!editorRef.current?.$view) {
      return;
    }

    editorRef.current.$view.dispatch({
      changes: {
        from,
        to,
        insert,
      },
      selection: EditorSelection.range(
        position + insert.length,
        position + insert.length,
      ),
      effects: [],
    });
  };

  const getFrom = (str: string) => {
    if (!editorRef.current?.$view) {
      return -1;
    }
    const fullText = editorRef.current.$view.state.doc.toString();
    return fullText.indexOf(str);
  };

  const handleUpload = async file => {
    const loadingFlag = `<#file:https:loading?${TEST_RUN_FILE_UPLOADING_KEY}=${nanoid()}#>`;
    changeEditor(loadingFlag, position, position);
    const { fileInstance } = file;
    const validateMsg = await validate(fileInstance, {
      maxSize: fileType === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE,
      accept,
    });
    if (validateMsg) {
      Toast.error(validateMsg);
      const from = getFrom(loadingFlag);
      if (from > -1) {
        changeEditor('', from, from + loadingFlag.length);
      }
      return;
    }

    try {
      const url = await upload(fileInstance, fileType);
      const fileFlag = `<#file:${generateUrlWithFilename(
        url,
        fileInstance.name,
      )}#>`;
      const from = getFrom(loadingFlag);
      if (from > -1) {
        changeEditor(fileFlag, from, from + loadingFlag.length);
      }
    } catch (e) {
      Toast.error(toString(e));
      const from = getFrom(loadingFlag);
      if (from > -1) {
        changeEditor('', from, from + loadingFlag.length);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      editorRef.current?.disableKeybindings(['Enter']);
    });

    const openUpload = event => {
      if (event.key === 'Enter') {
        ref.current?.openFileDialog();
      }
    };
    document.addEventListener('keydown', openUpload);
    return () => {
      setTimeout(() => {
        editorRef.current?.disableKeybindings([]);
        document.removeEventListener('keydown', openUpload);
      });
    };
  }, []);

  return (
    <Upload action="" accept={accept} customRequest={handleUpload} ref={ref}>
      <div className={css['completion-item']}>
        <IconCozUpload />
        <span>{I18n.t('plugin_file_upload')}</span>
      </div>
    </Upload>
  );
};

interface VoiceButtonProps {
  editorRef: React.MutableRefObject<EditorAPI>;
  position: number;
  spaceId: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  editorRef,
  position,
  spaceId,
}) => {
  const handleChange = (voiceId: string) => {
    if (!editorRef.current?.$view) {
      return;
    }
    const insert = `<#voice:${voiceId}#>`;
    editorRef.current.$view.dispatch({
      changes: {
        from: position,
        to: position,
        insert,
      },
      selection: EditorSelection.range(
        position + insert.length,
        position + insert.length,
      ),
      effects: [],
    });
  };

  const { open: openSelectVoiceModal, modal: selectVoiceModal } =
    useSelectVoiceModal({
      spaceId,
      onSelectVoice: v => {
        handleChange(v.voice_id);
      },
    });

  useEffect(() => {
    setTimeout(() => {
      editorRef.current?.disableKeybindings(['Enter']);
    });

    const openUpload = event => {
      if (event.key === 'Enter') {
        openSelectVoiceModal();
      }
    };
    document.addEventListener('keydown', openUpload);
    return () => {
      setTimeout(() => {
        editorRef.current?.disableKeybindings([]);
        document.removeEventListener('keydown', openUpload);
      });
    };
  }, []);

  return (
    <>
      <div className={css['completion-item']} onClick={openSelectVoiceModal}>
        <IconCozPlus />
        <span>{I18n.t('workflow_variable_select_voice')}</span>
      </div>
      {selectVoiceModal}
    </>
  );
};
