/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';

import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash-es';
import classnames from 'classnames';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  useKnowledgeParamsStore,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import {
  ModalActionType,
  transSliceContentOutput,
  useSliceDeleteModal,
  useTableSegmentModal,
} from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import { TableView, type TableViewMethods } from '@coze-common/table-view';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { IconSegmentEmpty } from '@coze-arch/bot-icons';
import {
  FormatType,
  type DocumentInfo,
  ColumnType,
  DocumentStatus,
  SliceStatus,
} from '@coze-arch/bot-api/knowledge';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button, EmptyState, Spin, Toast, Layout } from '@coze-arch/coze-design';

import { transSliceList } from '@/utils/preview';
import { type ISliceInfo } from '@/types/slice';
import { type ProgressMap } from '@/types';
import { useCreateSlice } from '@/service/slice';
import {
  type DatasetDataScrollList,
  delSlice,
  updateSlice,
  useScrollListSliceReq,
} from '@/service';

import styles from './index.module.less';

export interface TableKnowledgeWorkspaceProps {
  onChangeDocList?: (docList: DocumentInfo[]) => void;
  reload?: () => void;
  progressMap: ProgressMap;
  isDocumentLoading: boolean;
}
const MAX_TOTAL = 10000;
const ADD_BTN_HEIGHT = 56;

export const TableKnowledgeWorkspace = ({
  progressMap,
  isDocumentLoading,
}: TableKnowledgeWorkspaceProps) => {
  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const setDataSetDetail = useKnowledgeStore(state => state.setDataSetDetail);
  const documentList = useKnowledgeStore(state => state.documentList);
  const searchValue = useKnowledgeStore(state => state.searchValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  /**
   * 切换文档时缓存的上一篇文档id，当前主要用于加载失败后回滚用
   */
  const prevDocIdRef = useRef<string | null>(null);

  const [sliceData, setSliceData] = useState<DatasetDataScrollList>();
  const tableViewRef = useRef<TableViewMethods>(null);
  const [curSliceId, setCurSliceId] = useState('');
  const [curIndex, setCurIndex] = useState(0);
  const [delSliceIds, setDelSliceIds] = useState<string[]>([]);
  const [curDocId, setCurDocId] = useState<string>();

  const curDoc = documentList?.find(i => i.document_id === curDocId);
  const processFinished = curDocId
    ? progressMap[curDocId]?.status === DocumentStatus.Enable
    : false;
  // TODO: hzf biz的分化在Scene层维护
  const knowledgeIDEBiz = useKnowledgeParamsStore(state => state.params.biz);
  const curFormatType: FormatType | undefined = dataSetDetail?.format_type;
  const isTableFormat = curFormatType === FormatType.Table;
  const [tableH, setTableHeight] = useState<number | string>(0);
  const datasetId = dataSetDetail?.dataset_id ?? '';
  const { loading, data, loadingMore, mutate, reload, loadMore } =
    useScrollListSliceReq({
      params: {
        keyword: searchValue,
        document_id: curDocId,
      },
      reloadDeps: [searchValue, curDocId, datasetId, processFinished],
      target: (() => {
        if (isTableFormat) {
          return null;
        }
        return contentWrapperRef;
      })(),
      onError: error => {
        /** 拉取 slice 失败时,回退 curDocId，避免文档标题和内容不一致，用户迷惑 */

        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: ReportEventNames.KnowledgeGetSliceList,
          error,
        });

        Toast.error(I18n.t('knowledge_document_view'));

        if (prevDocIdRef.current) {
          setCurDocId(prevDocIdRef.current);
        }
      },
    });

  const isShowAddBtn = useMemo(
    () => canEdit && !data?.hasMore && data?.total && data?.total < MAX_TOTAL,
    [data],
  );
  useEffect(() => {
    const h = tableViewRef?.current?.getTableHeight();
    if (h) {
      setTableHeight(isShowAddBtn ? h : '100%');
    }
  }, [data]);
  useEffect(() => {
    if (documentList?.length) {
      setCurDocId(documentList[0]?.document_id);
    }
  }, [documentList]);

  useEffect(() => {
    reload();
  }, [searchValue]);
  useEffect(() => setSliceData(data), [data]);
  const isProcessing = curDoc?.status === DocumentStatus.Processing;

  const { createSlice } = useCreateSlice({
    onReload: (createItem: ISliceInfo) => {
      const list = (data?.list ?? []).filter(item => !item.addId) ?? [];
      const createSliceContent = JSON.parse(createItem.content ?? '{}');
      const itemContent = (curDoc?.table_meta ?? []).reduce(
        (
          prev: { column_name: string; column_id: string; value: string }[],
          cur,
        ) => {
          prev.push({
            column_name: cur?.column_name ?? '',
            column_id: cur?.id ?? '',
            value: cur.id ? createSliceContent[cur.id] : '',
          });
          return prev;
        },
        [],
      );
      list.push({
        ...createItem,
        content: JSON.stringify(itemContent),
      }),
        mutate({
          ...data,
          total: Number(data?.total ?? '0'),
          list,
        });
      if (dataSetDetail) {
        setDataSetDetail({
          ...dataSetDetail,
          slice_count: list?.length ?? 0,
        });
      }
    },
  });

  const { node: deleteSliceModalNode, delete: handleSliceDelete } =
    useSliceDeleteModal({
      onDel: async () => {
        try {
          await delSlice(delSliceIds);
          if (curDoc) {
            Toast.success({
              content: I18n.t('Delete_success'),
              showClose: false,
            });
            // @ts-expect-error -- linter-disable-autofix
            mutate({
              ...data,
              // @ts-expect-error -- linter-disable-autofix
              list: slices.filter(
                lItem =>
                  !delSliceIds.includes(lItem.slice_id ?? '') || !lItem.addId,
              ),
            });
            reload();
            tableViewRef?.current?.resetSelected();
            if (dataSetDetail) {
              setDataSetDetail({
                ...dataSetDetail,
                slice_count:
                  // @ts-expect-error -- linter-disable-autofix
                  dataSetDetail.slice_count > -1
                    ? // @ts-expect-error -- linter-disable-autofix
                      (dataSetDetail.slice_count - delSliceIds?.length ?? 1)
                    : 0,
              });
            }
          }
        } catch (error) {
          dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
            eventName: ReportEventNames.KnowledgeDeleteSlice,
            error: error as Error,
          });
        }
      },
    });

  const { slices } = useMemo(
    () => ({
      slices: data?.list,
      total: data?.total ?? 0,
    }),
    [data],
  );

  const {
    node: tableSegmentModalNode,
    edit: editTableSegment,
    fetchCreateTableSegment,
    fetchUpdateTableSegment,
  } = useTableSegmentModal({
    title:
      curIndex > -1 ? (
        <div className={styles['slice-modal-title']}>
          {I18n.t('datasets_segment_detailModel_title', { num: curIndex + 1 })}
        </div>
      ) : (
        I18n.t('dataset_segment_content')
      ),
    meta: curDoc?.table_meta || [],
    canEdit: true,
    onSubmit: async (actionType, tData) => {
      if (actionType === ModalActionType.Create && curDoc?.document_id) {
        await fetchCreateTableSegment(curDoc?.document_id, tData);
      } else if (actionType === ModalActionType.Edit && curSliceId) {
        await fetchUpdateTableSegment(curSliceId, tData);
      }
    },
    onFinish: (actionType, tData) => {
      if (actionType === ModalActionType.Create) {
        reload();
        // documentApi.run();
        Toast.success({
          content: I18n.t('knowledge_tableview_03'),
          showClose: false,
        });
      } else if (actionType === ModalActionType.Edit) {
        // documentApi.run();
        if (data) {
          const updateContent = JSON.stringify(tData);
          const newList = data.list;
          newList[curIndex].content = updateContent;
          newList[curIndex].status = SliceStatus.FinishVectoring;
          mutate({
            ...data,
            list: newList,
          });
        }
      }
    },
  });

  const hasShowMainContent = useMemo(() => {
    // 针对Text数据为空控制，不在外层空，由内容里面控制
    if (curFormatType === FormatType.Text) {
      return true;
    }
    // 其他类型直接跟进接口返回数据判断
    return !!slices?.length;
  }, [slices]);

  const hasShowEmptyContent = useMemo(() => {
    // 针对Text数据为空控制，不在外层空，由内容里面控制
    if (data?.ready && curFormatType === FormatType.Text) {
      return false;
    }
    if (
      curFormatType === FormatType.Table &&
      !documentList?.length &&
      !isDocumentLoading
    ) {
      return true;
    }
    return data?.ready && !slices?.length && !(loadingMore || loading);
  }, [data, slices, loadingMore, loading, isDocumentLoading, documentList]);

  const scrollTableBodyToBottom = () => {
    const bodyDom = document.querySelector(
      '.table-view-box .semi-table-container>.semi-table-body',
    );
    if (bodyDom && data?.list.length) {
      bodyDom.scrollTop = data?.list.length * ADD_BTN_HEIGHT;
    }
  };

  /** table类型-增加行 */
  const handleAddRow = () => {
    /** 先增加容器的高度 */
    setTableHeight(Number(tableH ?? '0') + ADD_BTN_HEIGHT);
    const items = JSON.parse(data?.list[0]?.content ?? '[]');

    const addItemContent = items?.map(v => ({
      ...v,
      value: '',
      char_count: 0,
      hit_count: 0,
    }));
    mutate({
      ...data,
      total: Number(data?.total ?? '0'),
      list: data?.list.concat([
        { content: JSON.stringify(addItemContent), addId: nanoid() },
      ]) as ISliceInfo[],
    });
    scrollTableBodyToBottom();
  };

  const renderSliceCardList = () => {
    // if (reloading) {
    //   return null;
    // }

    const renderData = slices;
    if (curFormatType === FormatType.Table && renderData?.length) {
      const handleDelete = indexs => {
        /** 新增的行 */
        const addIndex = indexs.filter(i => !renderData[i].slice_id);
        const addIds = addIndex.map(i => renderData[i]?.addId);
        const oldIndex = indexs.filter(v => !addIndex.includes(v));
        const sliceIds = oldIndex.map(i => renderData[i].slice_id);

        if (addIds.length && sliceIds?.length <= 0) {
          mutate({
            ...data,
            total: Number(data?.total ?? '0'),
            list: renderData.filter(item => !addIds.includes(item?.addId)),
          });
          tableViewRef?.current?.resetSelected();
        }
        if (sliceIds.length) {
          setDelSliceIds(sliceIds);
          handleSliceDelete();
        }
      };
      const handleEdit = (_record, index) => {
        setCurIndex(index);
        setCurSliceId(renderData[index]?.slice_id || '');
        editTableSegment(renderData[index]?.content || '');
      };
      const HandleCreateSlice = async (createParams: string) => {
        try {
          await createSlice({
            document_id: tableKey ?? '',
            raw_text: createParams,
          });
        } catch (error) {
          console.log('error', error);
        }
      };
      const update = async (record, index, updateValue) => {
        const oldData = cloneDeep(sliceData);
        try {
          const sliceId = renderData[index].slice_id;
          const filterRecord = Object.fromEntries(
            Object.entries(record).filter(
              ([key]) =>
                !['tableViewKey', 'char_count', 'hit_count'].includes(key),
            ),
          );
          const ImageIds: string[] = [];
          curDoc?.table_meta?.forEach(meta => {
            if (meta.column_type === ColumnType.Image) {
              ImageIds.push(meta.id as string);
            }
          });
          const formatRecord = Object.fromEntries(
            Object.entries(filterRecord).map(([key, value]) => {
              if (ImageIds.includes(key)) {
                return [key, transSliceContentOutput(value as string)];
              }
              return [key, value];
            }),
          );
          const updateParams = { ...formatRecord };
          delete updateParams.status;
          const updateContent = JSON.stringify(updateParams);

          if (sliceId) {
            await updateSlice(sliceId as string, updateContent, updateValue);
          } else {
            /** 新增分片 */
            await HandleCreateSlice(updateContent);
          }
          // 改为接口请求成功后才更新
          if (sliceData) {
            reload();
          }
        } catch (error) {
          console.log(error);
          mutate(oldData);
          throw Error(error as string);
        }
      };

      const tableKey = curDoc?.document_id;
      const { data: dataSource, columns } = transSliceList({
        sliceList: renderData,
        metaData: documentList?.[0]?.table_meta,
        handleEdit,
        handleDelete,
        update,
        // @ts-expect-error -- linter-disable-autofix
        canEdit,
        // @ts-expect-error -- linter-disable-autofix
        tableKey,
      });
      return (
        <>
          <div
            className={classnames(
              styles['table-view-container-box'],
              'table-view-box',
            )}
            style={isTableFormat ? { height: tableH } : undefined}
          >
            <TableView
              tableKey={tableKey}
              ref={tableViewRef}
              className={classnames(
                `${styles['unit-table-view']} ${
                  loadingMore ? styles['table-view-loading'] : ''
                }`,
                knowledgeIDEBiz === 'project'
                  ? styles['table-preview-max']
                  : styles['table-preview-secondary'],
              )}
              resizable
              dataSource={dataSource}
              loading={loadingMore}
              columns={columns}
              rowSelect={canEdit}
              isVirtualized
              rowOperation={canEdit}
              scrollToBottom={() => {
                if (!loading && !loadingMore) {
                  loadMore();
                }
              }}
              editProps={{
                onDelete: handleDelete,
                onEdit: handleEdit,
              }}
              // resizeTriState={resizeTriState}
            />
          </div>
          {isShowAddBtn ? (
            <div className={styles['add-row-btn']}>
              <Button
                disabled={isProcessing}
                data-testid={KnowledgeE2e.SegmentDetailContentAddRowBtn}
                color="primary"
                size="default"
                icon={<IconCozPlus />}
                onClick={handleAddRow}
              >
                {I18n.t('knowledge_optimize_0010')}
              </Button>
            </div>
          ) : null}
        </>
      );
    }

    return null;
  };

  return (
    <>
      <Layout.Content
        ref={containerRef}
        className={classnames(
          styles['slice-list-ui-content'],
          'knowledge-ide-base-slice-list-ui-content',
        )}
      >
        <Spin
          spinning={loading}
          wrapperClassName={styles.spin}
          size="large"
          style={{ width: '100%', height: '100%' }}
        >
          {hasShowMainContent ? (
            <div
              ref={contentWrapperRef}
              className={
                styles[
                  (() => {
                    if (isTableFormat) {
                      return 'slice-list-table';
                    }
                    return 'slice-article';
                  })()
                ]
              }
            >
              {renderSliceCardList()}
              {/* {!!documentList.length && loadingMore && (
                <div className={styles['loading-more']}>
                  <IconSpin
                    spin
                    style={{
                      marginRight: '4px',
                      color: 'rgba(64, 98, 255, 1)',
                    }}
                  />
                  <div>{I18n.t('Loading')}...</div>
                </div>
              )} */}
            </div>
          ) : null}
          {hasShowEmptyContent && !loading ? (
            <div className={styles['empty-content']}>
              <EmptyState
                size="large"
                icon={
                  searchValue ? (
                    <IllustrationNoResult
                      style={{ width: 150, height: '100%' }}
                    />
                  ) : (
                    <IconSegmentEmpty style={{ width: 150, height: '100%' }} />
                  )
                }
                title={
                  isProcessing
                    ? I18n.t('content_view_003')
                    : searchValue
                      ? I18n.t('knowledge_no_result')
                      : I18n.t('dataset_segment_empty_desc')
                }
              />
            </div>
          ) : null}
        </Spin>
      </Layout.Content>
      {deleteSliceModalNode}
      {tableSegmentModalNode}
    </>
  );
};
