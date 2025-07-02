import { type UploadValue } from '@coze-common/biz-components';

export type ModifyUploadValueType<T extends { icon_uri?: string }> = Omit<
  T,
  'icon_uri'
> & { icon_uri?: UploadValue };

export type RequireCopyProjectRequest<
  T extends { project_id?: string; to_space_id?: string },
> = Omit<T, 'project_id' | 'to_space_id'> & {
  project_id: string;
  to_space_id: string;
};
