/* eslint-disable @coze-arch/max-line-per-function */
import { useMemo, useState } from 'react';

import cs from 'classnames';
import { useRequest } from 'ahooks';
import {
  type UseModalParamsCoze,
  useDataModalWithCoze,
} from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { isApiError } from '@coze-arch/bot-http';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Form } from '@coze/coze-design';

import { DATA_REFACTOR_CLASS_NAME } from '@/constant';

import { transSliceContentOutput } from '../utils';
import { SegmentEditor, SegmentationMode } from '../segment-editor';

import styles from './index.module.less';

const SLICE_CONTENT_CHECK_ERROR_CODE = 708026501;

export interface UseTextSegmentModalParams {
  title: string | JSX.Element;
  canEdit?: boolean;
  loading?: boolean;
  /** 禁用（ok按钮和TextArea输入框均要使用禁用状态） */
  disabled?: boolean;
  sliceID: string;
  onFinish: (data: string) => void;
  /**
   * 目前仅抖音分身不支持上传图片
   * @default true
   */
  enableImg?: boolean;
}

interface UseTextSegmentModalReturnValue {
  node: JSX.Element | null;
  open: (data: string, errorMsg?: string) => void;
  close: () => void;
  fetchCreateSliceContent: (docId: string, createContent: string) => void;
  fetchUpdateSliceContent: (sliceId: string, updateContent: string) => void;
}

const getFormVerification = (segmentContent: string) => {
  let isValid = true;
  let error = '';
  if (!segmentContent) {
    error = I18n.t('knowledge_table_content_empty');
    isValid = false;
  }

  return {
    isValid,
    error,
  };
};

export const useTextSegmentModal = ({
  title,
  canEdit,
  loading,
  sliceID,
  onFinish,
  enableImg = true,
}: UseTextSegmentModalParams): UseTextSegmentModalReturnValue => {
  const [segmentContent, setSegmentContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleContentCheckError = (error: Error) => {
    if (
      isApiError(error) &&
      Number(error?.code) === SLICE_CONTENT_CHECK_ERROR_CODE
    ) {
      setErrMsg(
        error?.msg || I18n.t('community_This_is_a_toast_Machine_review_failed'),
      );
    }
  };

  const onSubmit = async () => {
    const { isValid, error } = getFormVerification(segmentContent);
    setErrMsg(error);
    if (isValid && sliceID) {
      await fetchUpdateSliceContent(sliceID, segmentContent);
    }
  };
  const onCancel = () => {
    setErrMsg('');
    close();
  };
  const onOpen = (content?: string, errorMsg?: string) => {
    setErrMsg(errorMsg || '');
    setSegmentContent(content || '');
    open();
  };

  const handleTextAreaChange = (newValue: string) => {
    let error = '';
    if (!newValue) {
      error = I18n.t('knowledge_table_content_empty');
    }
    setErrMsg(error);
    setSegmentContent(newValue);
  };

  const { run: fetchCreateSliceContent, loading: createLoading } = useRequest(
    async (docId: string, createContent: string) => {
      if (!docId) {
        throw new CustomError('normal_error', 'missing doc_id');
      }

      await KnowledgeApi.CreateSlice({
        document_id: docId,
        raw_text: transSliceContentOutput(createContent),
      });
      return createContent;
    },
    {
      manual: true,
      onSuccess: data => {
        setErrMsg('');
        onFinish(data);
        onCancel();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateSlice,
          error,
        });
        handleContentCheckError(error);
      },
    },
  );

  const { run: fetchUpdateSliceContent, loading: uploadLoading } = useRequest(
    async (sliceId: string, updateContent: string) => {
      if (!sliceId) {
        throw new CustomError('normal_error', 'missing slice_id');
      }
      await KnowledgeApi.UpdateSlice({
        slice_id: sliceId,
        raw_text: transSliceContentOutput(updateContent),
      });
      return updateContent;
    },
    {
      manual: true,
      onSuccess: data => {
        onFinish(data);
        close();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeUpdateSlice,
          error,
        });
        handleContentCheckError(error);
      },
    },
  );

  const modalLoading = useMemo(
    () => createLoading || uploadLoading || loading,
    [createLoading, uploadLoading, loading],
  );
  const modalConfig = useMemo(() => {
    const config: UseModalParamsCoze = {
      title,
      width: 792,
      centered: true,
      maskClosable: false,
      cancelText: I18n.t('Cancel'),
      okText: I18n.t('datasets_segment_detailModel_save'),
      okButtonProps: {
        loading: modalLoading,
        disabled: !segmentContent || Boolean(errMsg) || uploading,
      },
      onOk: () => {
        onSubmit();
      },
      onCancel: e => {
        e.stopPropagation();
        close();
        setSegmentContent('');
      },
    };
    if (!canEdit) {
      config.footer = false;
    }
    return config;
  }, [modalLoading, segmentContent, canEdit, errMsg, uploading]);
  const { modal, open, close } = useDataModalWithCoze(modalConfig);

  return {
    fetchCreateSliceContent,
    fetchUpdateSliceContent,
    open: onOpen,
    close: onCancel,
    node: modal(
      <div
        className={cs(
          'mb-[16px]',
          !canEdit ? styles['text-area-readonly'] : null,
          DATA_REFACTOR_CLASS_NAME,
        )}
      >
        {
          <SegmentEditor
            enableImg={enableImg}
            mode={SegmentationMode.Inline}
            value={segmentContent}
            onChange={handleTextAreaChange}
            setUploading={setUploading}
          />
        }
        {errMsg ? <Form.ErrorMessage error={errMsg} /> : null}
      </div>,
    ),
  };
};
