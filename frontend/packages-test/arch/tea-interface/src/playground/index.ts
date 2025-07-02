export interface PlaygroundSettingParams {
  user_id: string;
  action: 'page_view' | 'run';
  full_url: string;
  result?: 'incomplete' | 'success' | 'fail';
  detail?: string;
}

export interface PlaygroundAuthorizeParams {
  user_id: string;
  action:
    | 'page_view'
    | 'create'
    | 'forbid'
    | 'edit'
    | 'delete'
    | 'download'
    | 'know'
    | 'check'
    | 'cancel';
  full_url: string;
  result?: 'true' | 'false';
  detail?: string;
}
