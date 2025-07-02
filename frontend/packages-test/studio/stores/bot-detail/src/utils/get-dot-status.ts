import {
  type PicType,
  type GetPicTaskData,
} from '@coze-arch/idl/playground_api';

import { DotStatus } from '../types/generate-image';

function getDotStatus(data: GetPicTaskData, picType: PicType) {
  const { notices = [], tasks = [] } = data || {};
  const task = tasks.find(item => item.type === picType);
  return (task?.status as number) === DotStatus.Generating ||
    notices.some(item => item.type === picType && item.un_read)
    ? task?.status ?? DotStatus.None
    : DotStatus.None;
}

export default getDotStatus;
