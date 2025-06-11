import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';

import { type WorkflowGlobalStateEntity } from '@/typing';

import { type WorkflowClipboardData } from '../../type';
import { WORKFLOW_CLIPBOARD_TYPE } from '../../constant';

/** 检查数据是否合法 */
export const isValidData = (params: {
  data: WorkflowClipboardData;
  globalState: WorkflowGlobalStateEntity;
}): boolean => {
  const { data, globalState } = params;
  if (data.type !== WORKFLOW_CLIPBOARD_TYPE) {
    return false;
  }
  // 跨域名表示不同环境，上架插件不同，不能复制
  if (data.source.host !== window.location.host) {
    return false;
  }
  // 抖音空间不兼容正常空间
  if (data.source.isDouyin !== globalState.isBindDouyin) {
    Toast.warning({
      content: I18n.t(
        'workflow_node_copy_othercanva',
        {},
        '当前画布类型不一致，无法粘贴',
      ),
      showClose: false,
    });
    return false;
  }
  // 不同的画布类型不能复制
  if (data.source.flowMode !== globalState.flowMode) {
    Toast.warning({
      content: I18n.t(
        'workflow_node_copy_othercanva',
        {},
        '当前画布类型不一致，无法粘贴',
      ),
      showClose: false,
    });
    return false;
  }
  return true;
};
