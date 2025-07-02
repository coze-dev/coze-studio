import { I18n } from '@coze-arch/i18n';
import {
  PublishStatus,
  ResType,
  type LibraryResourceListRequest,
} from '@coze-arch/bot-api/plugin_develop';

export const LIBRARY_PAGE_SIZE = 15;

export type QueryParams = Omit<LibraryResourceListRequest, 'space_id' | 'size'>;

export const initialParam: QueryParams = {
  cursor: '',
  user_filter: 0,
  publish_status_filter: 0,
  res_type_filter: [-1],
  name: '',
};

/** 是否由当前用户创建：
 * 0-不筛选
 * 1-当前用户 */
export const getScopeOptions = () => [
  {
    label: I18n.t('library_filter_tags_all_creators'),
    value: 0,
  },
  {
    label: I18n.t('library_filter_tags_created_by_me'),
    value: 1,
  },
];

/** 发布状态：
 * 0-不筛选
 * 1-未发布
 * 2-已发布 */
export const getStatusOptions = () => [
  {
    label: I18n.t('library_filter_tags_all_status'),
    value: 0,
  },
  {
    label: I18n.t('library_filter_tags_published'),
    value: PublishStatus.Published,
  },
  {
    label: I18n.t('library_filter_tags_unpublished'),
    value: PublishStatus.UnPublished,
  },
];

/** event type */
export const eventLibraryType = {
  [ResType.Plugin]: 'plugin',
  [ResType.Workflow]: 'workflow',
  [ResType.Imageflow]: 'imageflow',
  [ResType.Knowledge]: 'knowledge',
  [ResType.UI]: 'ui',
  [ResType.Prompt]: 'prompt',
  [ResType.Database]: 'database',
  [ResType.Variable]: 'variable',
  [ResType.Voice]: 'voice',
} as const;
