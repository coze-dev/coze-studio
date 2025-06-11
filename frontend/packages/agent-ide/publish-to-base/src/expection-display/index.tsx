import { type FC, type ReactNode } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IllustrationConstruction,
  IllustrationFailure,
} from '@douyinfe/semi-illustrations';

export const ExceptionDisplay: FC<{ title: string; image: ReactNode }> = ({
  title,
  image,
}) => (
  <div className="flex flex-col gap-[16px] justify-center items-center h-[80%]">
    {image}
    <span className="coz-fg-plus text-[16px] font-medium leading-[22px]">
      {title}
    </span>
  </div>
);

/**
 * 加载失败
 */
export const LoadFailedDisplay = () => (
  <ExceptionDisplay
    image={<IllustrationFailure className="h-[140px] w-[140px]" />}
    title={I18n.t('plugin_exception')}
  />
);

/**
 * 无数据
 */
export const NoDataDisplay = () => (
  <ExceptionDisplay
    image={<IllustrationConstruction className="h-[140px] w-[140px]" />}
    title={I18n.t('debug_asyn_task_notask')}
  />
);
