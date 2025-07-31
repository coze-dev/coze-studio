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

import { useCallback, type FC } from 'react';

import { nanoid } from 'nanoid';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type UploadProps, type FileItem } from '@coze-arch/bot-semi/Upload';
import {
  UIIconButton,
  UITable,
  Popover,
  Progress,
  Upload as SemiUpload,
  Toast,
  Tooltip,
} from '@coze-arch/bot-semi';
import {
  IconDeleteOutline,
  IconUploadFileFail,
  IconUploadFileSuccess,
} from '@coze-arch/bot-icons';
import {
  ColumnType,
  type GetTableSchemaInfoResponse,
  BotTableRWMode,
  type FieldItemType,
} from '@coze-arch/bot-api/memory';
import {
  FileBizType,
  type UploadFileResponse,
  type UploadFileData,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, MemoryApi } from '@coze-arch/bot-api';

import { type SheetItem } from '../../types';
import { useStepStore } from '../../store/step';
import outerStyles from '../../index.module.less';
import { useStep } from '../../hooks/use-step';
import { getFileIcon } from '../../helpers/get-file-icon';
import { getFileExtension } from '../../helpers/get-file-extension';
import { getBase64 } from '../../helpers/get-base64';
import { ACCEPT_FILE_TYPES, ACCEPT_FILE_MAX_SIZE } from '../../const';

import styles from './index.module.less';

export const UploadStatusComp = (props: {
  record: FileItem;
  onRetry: (record: FileItem, index: number) => void;
  index: number;
}) => {
  const { record, onRetry, index } = props;
  const { status } = record;
  if (status === 'uploading' || status === 'validating' || status === 'wait') {
    return (
      <span className={styles['upload-status-wrap']}>
        <span>{I18n.t('datasets_unit_upload_state')}</span>
        <Progress percent={record.percent} />
      </span>
    );
  }
  if (status === 'success') {
    return (
      <span className={styles['upload-status-wrap']}>
        <IconUploadFileSuccess />
      </span>
    );
  }
  if (status === 'validateFail') {
    return (
      <span className={styles['upload-status-wrap']}>
        <IconUploadFileFail />
      </span>
    );
  }
  if (status === 'uploadFail') {
    return (
      <span
        className={`${styles['upload-status-wrap']} ${styles.retry}`}
        onClick={() => {
          onRetry && onRetry(record, index);
        }}
      >
        <Popover
          className={styles['fail-popover']}
          content={record.statusDescript}
          visible
          trigger="custom"
        >
          <IconUploadFileFail />
        </Popover>
        <span className={styles['retry-text']}>
          {I18n.t('datasets_unit_update_retry')}
        </span>
      </span>
    );
  }
  return null;
};

export const transformUnitList = ({
  fileList,
  data,
  fileInstance,
  index,
}: {
  fileList: FileItem[];
  data: UploadFileData | undefined;
  fileInstance: File;
  index: number;
}): FileItem[] => {
  if (!data) {
    return fileList;
  }
  const filteredList = fileList.map((file, i) => {
    if (index === i) {
      return {
        ...file,
        uri: data.upload_uri || '',
        status: 'success' as const,
        percent: 100,
        fileInstance,
      };
    }
    return file;
  });
  return filteredList;
};

export const Upload: FC = () => {
  const { onSubmit, computingEnableGoToNextStep } = useStep();
  const { currentState, setCurrentState, tableStructure, setTableStructure } =
    useStepStore(state => ({
      currentState: state.step1_upload,
      setCurrentState: state.set_step1_upload,
      tableStructure: state.step2_tableStructure,
      setTableStructure: state.set_step2_tableStructure,
      tablePreview: state.step3_tablePreview,
    }));

  const { fileList = [] } = currentState;

  const customRequest: UploadProps['customRequest'] = async options => {
    const { onSuccess, onError, onProgress, file } = options;

    if (typeof file === 'string') {
      return;
    }

    try {
      // business
      const { name, fileInstance } = file;

      if (fileInstance) {
        const extension = getFileExtension(name);

        const base64 = await getBase64(fileInstance);

        let result: UploadFileResponse;
        try {
          result = await DeveloperApi.UploadFile(
            {
              file_head: {
                file_type: extension,
                biz_type: FileBizType.BIZ_BOT_DATASET,
              },
              data: base64,
            },
            {
              onUploadProgress: e => {
                onProgress({
                  total: e.total ?? fileInstance.size,
                  loaded: e.loaded,
                });
              },
            },
          );
        } catch (error) {
          dataReporter.errorEvent(DataNamespace.DATABASE, {
            eventName: REPORT_EVENTS.DatabaseUploadExcelFile,
            error: error as Error,
          });
          throw error;
        }
        if (result) {
          onSuccess(result.data);
        }
      } else {
        throw new Error('Failed to upload database');
      }
    } catch (e) {
      onError({
        status: 0,
      });
    }
  };

  const onRetry = async (record: FileItem, index: number) => {
    try {
      const { fileInstance } = record;
      if (fileInstance) {
        const { name } = fileInstance;
        const extension = getFileExtension(name);
        const base64 = await getBase64(fileInstance);
        const result = await DeveloperApi.UploadFile({
          file_head: {
            file_type: extension,
            biz_type: FileBizType.BIZ_BOT_DATASET,
          },
          data: base64,
        });

        setCurrentState({
          fileList: transformUnitList({
            fileList,
            data: result?.data,
            fileInstance,
            index,
          }),
        });
      }
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.DATABASE, {
        eventName: REPORT_EVENTS.DatabaseUploadExcelFile,
        error: error as Error,
      });
    }
  };

  const handleDeleteFile = (index: number) => {
    setCurrentState({
      fileList: fileList.filter((f, i) => index !== i),
    });
    // Reset configuration
    setTableStructure({
      excelBasicInfo: undefined,
      excelValue: undefined,
      tableValue: undefined,
    });
  };

  const columns = [
    {
      title: I18n.t('db_table_0126_018'),
      dataIndex: 'name',
      width: 643,
      render: (_, record) => {
        const { name } = record;
        const extension = getFileExtension(name);
        return (
          <div className={styles['file-name-wrapper']}>
            {getFileIcon(extension)}
            <span className={styles['file-name-label']}>{name}</span>
          </div>
        );
      },
    },
    {
      title: I18n.t('db_table_0126_019'),
      dataIndex: 'status',
      render: (_, record, index) => (
        <UploadStatusComp onRetry={onRetry} record={record} index={index} />
      ),
      width: 153,
    },
    {
      title: I18n.t('db_table_0126_020'),
      dataIndex: 'size',
      width: 100,
      render: (_, record) => <span>{record.size}</span>,
    },
    {
      title: I18n.t('db_table_0126_021'),
      dataIndex: 'action',
      width: 72,
      render: (_, record: FileItem, index) => {
        const disabled =
          record.status === 'uploading' ||
          record.status === 'validating' ||
          record.status === 'wait';
        return (
          <div
            className={styles['ui-action-content']}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Tooltip spacing={12} content={I18n.t('Delete')} position="top">
              <UIIconButton
                disabled={disabled}
                icon={<IconDeleteOutline className={styles.icon} />}
                style={{
                  color: disabled
                    ? 'rgba(136, 138, 142, 0.5)'
                    : 'rgba(136, 138, 142, 1)',
                }}
                onClick={() => handleDeleteFile(index)}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  onSubmit(async () => {
    if (!tableStructure.excelBasicInfo) {
      let res: GetTableSchemaInfoResponse;
      try {
        res = await MemoryApi.GetTableSchemaInfo({
          tos_uri: fileList[0].response.upload_uri,
        });
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          eventName: REPORT_EVENTS.DatabaseGetExcelInfo,
          error: error as Error,
        });
        throw error;
      }
      if (res) {
        const { sheet_list, table_meta } = res;
        setTableStructure({
          excelBasicInfo: sheet_list as SheetItem[],
          excelValue: {
            // @ts-expect-error -- linter-disable-autofix
            sheetID: sheet_list[0]?.id as number,
            headerRow: 1,
            dataStartRow: 2,
          },
          tableValue: {
            // @ts-expect-error -- linter-disable-autofix
            name: sheet_list[0].sheet_name,
            desc: '',
            tableId: '',
            readAndWriteMode: BotTableRWMode.ReadOnly,
            // @ts-expect-error -- linter-disable-autofix
            tableMemoryList: table_meta.map(i => ({
              name: i.column_name,
              nanoid: nanoid(),
              desc: '',
              type:
                i.column_type === ColumnType.Unknown
                  ? undefined
                  : (i.column_type as any as FieldItemType),
              must_required: false,
              id: i.sequence,
              disableMustRequired: i.contains_empty_value,
            })),
          },
        });
      }
    }
  });

  computingEnableGoToNextStep(
    useCallback(
      () => fileList.length > 0 && fileList.some(i => i.status === 'success'),
      [fileList],
    ),
  );

  return (
    <div className={outerStyles.stepWrapper}>
      <SemiUpload
        style={{
          height: '100%',
          /**
           * NOTE: css hiding is taken here to keep the upload process, otherwise the upload will be cancelled
           */
          ...(fileList.length > 0
            ? {
                display: 'none',
              }
            : {}),
        }}
        onAcceptInvalid={() => {
          Toast.warning({
            showClose: false,
            content: I18n.t('db_table_0126_032'),
          });
        }}
        beforeUpload={fileInfo => {
          // The reason for not limiting by the maxSize property is
          // Only the beforeUpload hook can change validateMessage
          const res = {
            fileInstance: fileInfo.file.fileInstance,
            status: fileInfo.file.status,
            validateMessage: fileInfo.file.validateMessage,
            shouldUpload: true,
            autoRemove: false,
          };
          const { fileInstance } = fileInfo.file;
          if (!fileInstance) {
            return {
              ...res,
              status: 'uploadFail',
              shouldUpload: false,
            };
          }
          if (fileInstance.size > ACCEPT_FILE_MAX_SIZE) {
            Toast.warning({
              showClose: false,
              content: I18n.t('file_too_large', {
                max_size: '20MB',
              }),
            });
            return {
              ...res,
              shouldUpload: false,
              status: 'validateFail',
              validateMessage: I18n.t('file_too_large', {
                max_size: '20MB',
              }),
            };
          }
          return res;
        }}
        limit={1}
        draggable={true}
        showUploadList={false}
        accept={ACCEPT_FILE_TYPES}
        customRequest={customRequest}
        dragMainText={I18n.t('db_table_0126_016')}
        dragSubText={I18n.t('db_table_0126_017')}
        onChange={({ fileList: files }) => {
          // It will only be uploaded if the verification is passed.
          if (files.some(f => f.shouldUpload)) {
            setCurrentState({
              fileList: files,
            });
          }
        }}
        className={styles.upload}
      />
      {fileList.length > 0 ? (
        <UITable
          tableProps={{
            dataSource: fileList,
            columns,
            className: styles['file-list-table'],
          }}
        />
      ) : null}
    </div>
  );
};
