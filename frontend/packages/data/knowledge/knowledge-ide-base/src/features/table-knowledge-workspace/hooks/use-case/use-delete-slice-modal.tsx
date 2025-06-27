import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { useSliceDeleteModal } from '@coze-data/knowledge-modal-base';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { delSlice } from '@/service';

import { useTableUI } from '../../context/table-ui-context';
import { useTableData } from '../../context/table-data-context';
import { useTableActions } from '../../context/table-actions-context';

export const useDeleteSliceModal = () => {
  // 外部数据
  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const setDataSetDetail = useKnowledgeStore(state => state.setDataSetDetail);
  const documentList = useKnowledgeStore(state => state.documentList);

  // 内部数据
  const { sliceListData, delSliceIds } = useTableData();
  const { tableViewRef } = useTableUI();
  const { mutateSliceListData } = useTableActions();

  const curDoc = documentList?.[0];
  const slices = sliceListData?.list;

  // 删除切片弹窗
  const { node: deleteSliceModalNode, delete: openDeleteSliceModal } =
    useSliceDeleteModal({
      onDel: async () => {
        try {
          await delSlice(delSliceIds);
          if (!curDoc) {
            return;
          }
          Toast.success({
            content: I18n.t('Delete_success'),
            showClose: false,
          });
          console.log('oldList', slices);
          const newList = (slices || []).filter(
            lItem =>
              !delSliceIds.includes(lItem.slice_id ?? '') &&
              !delSliceIds.includes(lItem.addId ?? ''),
          );
          mutateSliceListData({
            ...sliceListData,
            list: newList,
          });
          console.log('newList', newList);
          tableViewRef?.current?.resetSelected();
          if (dataSetDetail && typeof dataSetDetail.slice_count === 'number') {
            setDataSetDetail({
              ...dataSetDetail,
              slice_count:
                dataSetDetail.slice_count > -1
                  ? Math.max(
                      0,
                      dataSetDetail.slice_count - (delSliceIds?.length || 0),
                    )
                  : 0,
            });
          }
        } catch (error) {
          dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
            eventName: ReportEventNames.KnowledgeDeleteSlice,
            error: error as Error,
          });
        }
      },
    });

  return {
    deleteSliceModalNode,
    openDeleteSliceModal,
  };
};
