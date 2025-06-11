/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ApplicationStatus {
  processing = 'Processing',
  approved = 'Approved',
  rejected = 'Rejected',
}

export enum AppType {
  normal = 'Normal',
  connector = 'Connector',
}

export enum AuthorizationType {
  auth_app = 'AuthApp',
  on_behalf_of_user = 'OnBehalfOfUser',
}

export enum Certificated {
  noncertificated = 'Noncertificated',
  certificated = 'Certificated',
}

export enum CertificationType {
  uncertified = 'Uncertified',
  personal_certification = 'PersonalCertification',
  enterprise_certification = 'EnterpriseCertification',
}

export enum ChecklistItemType {
  obo = 'Obo',
  app_auth = 'AppAuth',
  personal_access_token = 'PersonalAccessToken',
}

export enum ClientType {
  legacy = 'Legacy',
  web_backend = 'WebBackend',
  single_page_or_native = 'SinglePageOrNative',
  terminal = 'Terminal',
  service = 'Service',
}

export enum CollaboratorType {
  bot_editor = 'BotEditor',
  bot_developer = 'BotDeveloper',
  bot_operator = 'BotOperator',
}

export enum DenyType {
  visitors_prohibited = 'VisitorsProhibited',
}

export enum EnterpriseRoleType {
  super_admin = 'SuperAdmin',
  admin = 'Admin',
  member = 'Member',
}

export enum EnterpriseSettingKey {
  join_enterprise_share_link_expiration_time = 'JoinEnterpriseShareLinkExpirationTime',
  sso = 'SSO',
}

export enum EnterpriseSettingValueType {
  string = 'String',
  boolean = 'Boolean',
  integer = 'Integer',
}

export enum InstallationStatus {
  pending_review_app_auth = 'pending_review_app_auth',
  pending_review_app_obo = 'pending_review_app_obo',
  approved_app_auth = 'approved_app_auth',
  approved_app_obo = 'approved_app_obo',
}

export enum InviteLinkStatus {
  can_apply = 'CanApply',
  already_applied = 'AlreadyApplied',
  joined = 'Joined',
  expired = 'Expired',
  deny = 'Deny',
}

export enum Level {
  free = 'Free',
  premium_lite = 'PremiumLite',
  premium = 'Premium',
  premium_plus = 'PremiumPlus',
  v_1_pro_instance = 'V1ProInstance',
  pro_personal = 'ProPersonal',
  team = 'Team',
  enterprise = 'Enterprise',
}

export enum PatSearchOption {
  all = 'all',
  owned = 'owned',
  others = 'others',
}

export enum Status {
  active2 = 'Active',
  deactive = 'Deactive',
}

export enum UserStatus {
  active = 'active',
  deactivated = 'deactivated',
  offboarded = 'offboarded',
}

export enum VolcanoUserType {
  root_user = 'RootUser',
  basic_user = 'BasicUser',
}

export interface AccountPermission {
  permission_list: Array<string>;
}

export interface AccountPermission1 {
  permission_list?: Array<string>;
}

export interface AddCollaboratorRequest {
  collaborator_types?: Array<CollaboratorType>;
  principal: PrincipalIdentifier;
  resource: ResourceIdentifier;
}

export interface AddCollaboratorRequest2 {
  collaborator_types?: Array<CollaboratorType>;
  principal: PrincipalIdentifier;
  resource: ResourceIdentifier;
}

export interface AddCollaboratorResponse {
  code: number;
  msg: string;
}

export interface AddEnterprisePeopleData {
  user_id: string;
  name: string;
  nick_name: string;
  avatar_url: string;
  joined: boolean;
}

export interface AppAuthorizationInfo {
  id: string;
  account: AppAuthorizationInfoAccount;
  permission?: AppAuthorizationInfoPermission;
}

export interface AppAuthorizationInfoAccount {
  account_id: string;
  account_type: string;
  account_name: string;
  account_avatar_url: string;
}

export interface AppAuthorizationInfoPermission {
  account_permission?: AppAuthorizationInfoPermissionAccountPermission;
  workspace_permission?: AppAuthorizationInfoPermissionWorkspacePermission;
}

export interface AppAuthorizationInfoPermissionAccountPermission {
  permissions: Array<string>;
}

export interface AppAuthorizationInfoPermissionWorkspacePermission {
  workspace_ids: Array<string>;
  permissions: Array<string>;
}

export interface AppDeclaredPermissionV2 {
  workspace_permission?: Array<string>;
  account_permission?: Array<string>;
}

export interface AppInstallationConsentRequest {
  appid: string;
  installation_account_hint: string;
}

export interface AppInstallationConsentRequest2 {
  appid: string;
  installation_account_hint: string;
}

export interface AppInstallationConsentResponse {
  code: number;
  msg: string;
}

export interface AppInstallationInfo {
  app_owner: AppOwnerInfo;
  app_id: string;
  app_name: string;
  permission_list: Array<string>;
  installation_status: InstallationStatus;
}

export interface AppMeta {
  appid: string;
  app_owner_id: string;
  name: string;
  description?: string;
  created_at: Int64;
  declared_permission: Array<DeclaredPermission>;
  declared_permission_v2: Array<string>;
  client_id: string;
  locked?: boolean;
  app_type: AppType;
  status: Status;
  certificated: Certificated;
  connector?: Connector;
  client_type: ClientType;
}

export interface AppOwnerInfo {
  name?: string;
  username: string;
  avator_url: string;
  icon_url?: string;
}

export interface AuthorizeAppWithDeclaredPermissionRequest {
  appid: string;
  organization_id?: string;
}

export interface AuthorizeAppWithDeclaredPermissionRequest2 {
  appid: string;
  organization_id?: string;
}

export interface AuthorizeAppWithDeclaredPermissionResponse {
  code: number;
  msg: string;
}

export interface AuthorizeAppWithSpecifiedWorkspaceRequest {
  appid: string;
  workspace_list: Array<string>;
  organization_id?: string;
}

export interface AuthorizeAppWithSpecifiedWorkspaceRequest2 {
  appid: string;
  workspace_list: Array<string>;
  organization_id?: string;
}

export interface AuthorizeAppWithSpecifiedWorkspaceResponse {
  code: number;
  msg: string;
}

export interface AuthorizedApp {
  appid: string;
  name: string;
  description?: string;
  authorized_permission: Array<string>;
  app_owner_info: AppOwnerInfo;
  authorization_type: AuthorizationType;
}

export interface AuthorizedEnterprise {
  name: string;
  icon_uri: string;
}

export interface AuthorizedWorkspace {
  name: string;
  icon_url?: string;
}

export interface BatchAddCollaboratorRequest {
  /** 1-User，2-Service */
  principal_type: number;
  resource: ResourceIdentifier;
  principal_ids: Array<string>;
  collaborator_types?: Array<CollaboratorType>;
}

export interface BatchAddCollaboratorRequest2 {
  /** 1-User，2-Service */
  principal_type: number;
  resource: ResourceIdentifier;
  principal_ids: Array<string>;
  collaborator_types?: Array<CollaboratorType>;
}

export interface BatchAddCollaboratorResponse {
  data: BatchAddCollaboratorResponseData;
}

export interface BatchAddCollaboratorResponse2 {
  code: number;
  msg: string;
  data: BatchAddCollaboratorResponseData;
}

export interface BatchAddCollaboratorResponseData {
  upgrade_info?: BatchAddCollaboratorResponseDataUpgradeInfo;
}

/** 添加失败超出限额时提示升级信息 */
export interface BatchAddCollaboratorResponseDataUpgradeInfo {
  /** 是否能升级 */
  can_upgrade: boolean;
  /** 当前计划的协作者上限 */
  current_collaborator_limit: Int64;
}

export interface BatchAddEnterprisePeopleRequest {
  enterprise_id: string;
  enterprise_people: Array<EnterprisePeopleAddData>;
  need_check_people_valid?: boolean;
}

export interface BatchAddEnterprisePeopleRequest2 {
  enterprise_id: string;
  enterprise_people: Array<EnterprisePeopleAddData>;
  need_check_people_valid?: boolean;
}

export interface BatchAddEnterprisePeopleResponse {
  code: number;
  msg: string;
}

export interface BatchMigrateAuthorizationRequest {
  authorization_list: Array<MigrateAuthorizationItem>;
}

export interface BatchMigrateAuthorizationRequest2 {
  authorization_list: Array<MigrateAuthorizationItem>;
}

export interface BatchMigrateAuthorizationResponse {
  code: number;
  msg: string;
}

export interface BindVolcanoRequest {}

export interface BindVolcanoResponse {
  /** 1-success */
  bind_result?: number;
}

export interface BindVolcanoResponse2 {
  code: number;
  msg: string;
  /** 1-success */
  bind_result?: number;
}

export interface CheckEnterpriseExistRequest {}

export interface CheckEnterpriseExistResponse {
  data: CheckEnterpriseExistResponseData;
}

export interface CheckEnterpriseExistResponse2 {
  code: number;
  msg: string;
  data: CheckEnterpriseExistResponseData;
}

export interface CheckEnterpriseExistResponseData {
  enterprise_exist: boolean;
}

export interface ChecklistItem {
  user_info?: AppOwnerInfo;
  enterprise_info?: AuthorizedEnterprise;
  id: string;
  name: string;
  affected_workspaces: Array<AuthorizedWorkspace>;
  checklist_item_type: ChecklistItemType;
}

export interface CheckPersonalAccessTokenInWorkspaceRequest {
  /** workspace id */
  workspace_id: string;
}

export interface CheckPersonalAccessTokenInWorkspaceResponse {
  data: CheckPersonalAccessTokenInWorkspaceResponseData;
}

export interface CheckPersonalAccessTokenInWorkspaceResponse2 {
  code: number;
  msg: string;
  data: CheckPersonalAccessTokenInWorkspaceResponseData;
}

export interface CheckPersonalAccessTokenInWorkspaceResponseData {
  /** PAT exist in workspace */
  exist: boolean;
}

export interface ClientSecret {
  id: string;
  mask: string;
  plaintext?: string;
}

export interface Connector {
  connector_id: string;
}

export interface CreateAppMetaRequest {
  app_type: AppType;
  client_type?: ClientType;
  name: string;
  description?: string;
  organization_id?: string;
}

export interface CreateAppMetaRequest2 {
  app_type: AppType;
  client_type?: ClientType;
  name: string;
  description?: string;
  organization_id?: string;
}

export interface CreateAppMetaResponse {
  data: CreateAppMetaResponseData;
}

export interface CreateAppMetaResponse2 {
  code: number;
  msg: string;
  data: CreateAppMetaResponseData;
}

export interface CreateAppMetaResponseData {
  app_meta: AppMeta;
}

export interface CreateClientSecretRequest {
  appid: string;
}

export interface CreateClientSecretRequest2 {
  appid: string;
}

export interface CreateClientSecretResponse {
  data: CreateClientSecretResponseData;
}

export interface CreateClientSecretResponse2 {
  code: number;
  msg: string;
  data: CreateClientSecretResponseData;
}

export interface CreateClientSecretResponseData {
  client_secret: ClientSecret;
}

export interface CreateEnterpriseInviteLinkRequest {
  enterprise_id: string;
}

export interface CreateEnterpriseInviteLinkRequest2 {
  enterprise_id: string;
}

export interface CreateEnterpriseInviteLinkResponse {
  data: CreateEnterpriseInviteLinkResponseData;
}

export interface CreateEnterpriseInviteLinkResponse2 {
  code: number;
  msg: string;
  data: CreateEnterpriseInviteLinkResponseData;
}

export interface CreateEnterpriseInviteLinkResponseData {
  key: string;
  expiration_time?: Int64;
}

export interface CreateEnterpriseRequest {
  name: string;
  icon_uri: string;
}

export interface CreateEnterpriseRequest2 {
  name: string;
  icon_uri: string;
}

export interface CreateEnterpriseResponse {
  data: CreateEnterpriseResponseData;
}

export interface CreateEnterpriseResponse2 {
  code: number;
  msg: string;
  data: CreateEnterpriseResponseData;
}

export interface CreateEnterpriseResponseData {
  enterprise_id: string;
  default_organization_id?: string;
}

export interface CreateJoinApplicationRequest {
  key: string;
}

export interface CreateJoinApplicationRequest2 {
  key: string;
}

export interface CreateJoinApplicationResponse {
  code: number;
  msg: string;
}

export interface CreatePersonalAccessTokenAndPermissionRequest {
  /** PAT名称 */
  name: string;
  /** PAT自定义过期时间 */
  expire_at?: Int64;
  /** PAT用户枚举过期时间 1、30、60、90、180、365、permanent */
  duration_day?: string;
  /** organization id */
  organization_id?: string;
  workspace_permission?: WorkspacePermission;
  account_permission?: AccountPermission;
  workspace_permission_v2?: WorkspacePermissionV2;
}

export interface CreatePersonalAccessTokenAndPermissionRequest2 {
  /** PAT名称 */
  name: string;
  /** PAT自定义过期时间 */
  expire_at?: Int64;
  /** PAT用户枚举过期时间 1、30、60、90、180、365、permanent */
  duration_day?: string;
  /** organization id */
  organization_id?: string;
  workspace_permission?: WorkspacePermission;
  account_permission?: AccountPermission;
  workspace_permission_v2?: WorkspacePermissionV2;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface CreatePersonalAccessTokenAndPermissionResponse {
  data: CreatePersonalAccessTokenAndPermissionResponseData;
}

export interface CreatePersonalAccessTokenAndPermissionResponse2 {
  code: number;
  msg: string;
  data: CreatePersonalAccessTokenAndPermissionResponseData;
}

export interface CreatePersonalAccessTokenAndPermissionResponseData {
  personal_access_token: PersonalAccessToken;
  /** PAT token 明文 */
  token: string;
}

export interface DeclaredPermission {
  resource_type: string;
  actions: Array<string>;
}

export interface DeleteAppRequest {
  appid: string;
}

export interface DeleteAppRequest2 {
  appid: string;
}

export interface DeleteAppResponse {
  code: number;
  msg: string;
}

export interface DeleteClientSecretRequest {
  appid: string;
  client_secret_id: string;
}

export interface DeleteClientSecretRequest2 {
  appid: string;
  client_secret_id: string;
}

export interface DeleteClientSecretResponse {
  code: number;
  msg: string;
}

export interface DeletePersonalAccessTokenAndPermissionRequest {
  /** PAT Id */
  id: string;
}

export interface DeletePersonalAccessTokenAndPermissionRequest2 {
  /** PAT Id */
  id: string;
}

export interface DeletePersonalAccessTokenAndPermissionResponse {
  code: number;
  msg: string;
}

export interface DeletePublicKeyRequest {
  fingerprint: string;
}

export interface DeletePublicKeyRequest2 {
  fingerprint: string;
}

export interface DeletePublicKeyResponse {
  code: number;
  msg: string;
}

export interface DeviceLocation {
  device_ip: string;
  device_city: string;
}

export interface EnterpriseInfo {
  enterprise_id: string;
  name: string;
  icon_uri: string;
  enterprise_role_type_list: Array<EnterpriseRoleType>;
  default_organization_id?: string;
}

export interface EnterprisePeople {
  user_id: string;
  name: string;
  nick_name: string;
  avatar_url: string;
  enterprise_role_type_list: Array<EnterpriseRoleType>;
  create_time: Int64;
  valid: boolean;
  volcano_user_info?: VolcanoUserInfo;
}

export interface EnterprisePeopleAddData {
  user_id: string;
  enterprise_role_type_list: Array<EnterpriseRoleType>;
}

export interface EnterpriseSetting {
  enterprise_setting_key: EnterpriseSettingKey;
  enterprise_setting_value: EnterpriseSettingValue;
}

export interface EnterpriseSettingValue {
  value: string;
  value_type: EnterpriseSettingValueType;
}

export interface GetAppAuthorizationRequestInfoRequest {
  /** authorize key */
  authorize_key: string;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface GetAppAuthorizationRequestInfoResponse {
  data: GetAppAuthorizationRequestInfoResponseData;
}

export interface GetAppAuthorizationRequestInfoResponse2 {
  code: number;
  msg: string;
  data: GetAppAuthorizationRequestInfoResponseData;
}

export interface GetAppAuthorizationRequestInfoResponseData {
  certificated: Certificated;
  client_type: ClientType;
  device_location?: DeviceLocation;
  authorizedWorkspace?: AuthorizedWorkspace;
  name: string;
  description?: string;
  request_permission: Array<string>;
  authorized_enterprise_list?: Array<AuthorizedEnterprise>;
}

export interface GetAppInstallationRequestInfoRequest {
  /** app to be installed */
  appid: string;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface GetAppInstallationRequestInfoResponse {
  data: GetAppInstallationRequestInfoResponseData;
}

export interface GetAppInstallationRequestInfoResponse2 {
  code: number;
  msg: string;
  data: GetAppInstallationRequestInfoResponseData;
}

export interface GetAppInstallationRequestInfoResponseData {
  certificated: Certificated;
  request_permission_v2?: AppDeclaredPermissionV2;
  name: string;
  request_permission: Array<string>;
}

export interface GetAppMetaRequest {
  /** appid */
  appid: string;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface GetAppMetaResponse {
  data: GetAppMetaResponseData;
}

export interface GetAppMetaResponse2 {
  code: number;
  msg: string;
  data: GetAppMetaResponseData;
}

export interface GetAppMetaResponseData {
  app_meta: AppMeta;
  oauth2_configuration?: OAuth2Configuration;
  public_keys?: Array<PublicKey>;
  client_secrets?: Array<ClientSecret>;
  request_permission: Array<string>;
}

export interface GetCertificationInfoRequest {}

export interface GetCertificationInfoResponse {
  data: GetCertificationInfoResponseData;
}

export interface GetCertificationInfoResponse2 {
  code: number;
  msg: string;
  data: GetCertificationInfoResponseData;
}

export interface GetCertificationInfoResponseData {
  certification_type: CertificationType;
  /** 0-Free，10-PremiumLite，15-Premium，20-PremiumPlus, 100-V1ProInstance, 110-ProPersonal, 120-Team, 130-Enterprise */
  level: Level;
  certification_info: string;
  super_admin_list: Array<UserInfo>;
}

export interface GetChecklistForWorkspaceMigrationRequest {
  workspace_id_list: Array<string>;
}

export interface GetChecklistForWorkspaceMigrationRequest2 {
  workspace_id_list: Array<string>;
}

export interface GetChecklistForWorkspaceMigrationResponse {
  data: GetChecklistForWorkspaceMigrationResponseData;
}

export interface GetChecklistForWorkspaceMigrationResponse2 {
  code: number;
  msg: string;
  data: GetChecklistForWorkspaceMigrationResponseData;
}

export interface GetChecklistForWorkspaceMigrationResponseData {
  checklist: Array<ChecklistItem>;
}

export interface GetEnterpriseRequest {
  /** Enterprise Id */
  enterprise_id: string;
}

export interface GetEnterpriseResponse {
  data: GetEnterpriseResponseData;
}

export interface GetEnterpriseResponse2 {
  code: number;
  msg: string;
  data: GetEnterpriseResponseData;
}

export interface GetEnterpriseResponseData {
  /** 0-Free，10-PremiumLite，15-Premium，20-PremiumPlus, 100-V1ProInstance, 110-ProPersonal, 120-Team, 130-Enterprise */
  level: Level;
  enterprise_id: string;
  name: string;
  icon_url: string;
  default_organization_id?: string;
  enterprise_role_type_list: Array<EnterpriseRoleType>;
  super_admin_list: Array<UserInfo>;
  create_time: Int64;
  expiration_time: Int64;
}

export interface GetEnterpriseSettingsRequest {
  enterprise_id: string;
  enterprise_setting_key_list?: Array<EnterpriseSettingKey>;
}

export interface GetEnterpriseSettingsRequest2 {
  enterprise_id: string;
  enterprise_setting_key_list?: Array<EnterpriseSettingKey>;
}

export interface GetEnterpriseSettingsResponse {
  data: GetEnterpriseSettingsResponseData;
}

export interface GetEnterpriseSettingsResponse2 {
  code: number;
  msg: string;
  data: GetEnterpriseSettingsResponseData;
}

export interface GetEnterpriseSettingsResponseData {
  enterprise_settings: Array<EnterpriseSetting>;
}

export interface GetInviteInfoRequest {
  invite_key: string;
}

export interface GetInviteInfoResponse {
  data: GetInviteInfoResponseData;
}

export interface GetInviteInfoResponse2 {
  code: number;
  msg: string;
  data: GetInviteInfoResponseData;
}

export interface GetInviteInfoResponseData {
  invite_link_status: InviteLinkStatus;
  deny_type?: DenyType;
  enterprise_id: string;
  name: string;
  icon_url: string;
  super_admin_list: Array<UserInfo>;
  create_time: Int64;
  expiration_time: Int64;
}

export interface GetPersonalAccessTokenAndPermissionRequest {
  /** PAT Id */
  id: string;
}

export interface GetPersonalAccessTokenAndPermissionResponse {
  data: GetPersonalAccessTokenAndPermissionResponseData;
}

export interface GetPersonalAccessTokenAndPermissionResponse2 {
  code: number;
  msg: string;
  data: GetPersonalAccessTokenAndPermissionResponseData;
}

export interface GetPersonalAccessTokenAndPermissionResponseData {
  personal_access_token: PersonalAccessToken;
  workspace_permission?: WorkspacePermission;
  account_permission?: AccountPermission;
  workspace_permission_v2?: WorkspacePermissionV2;
}

export interface GetSSOSettingRequest {
  enterprise_id: string;
}

export interface GetSSOSettingRequest2 {
  enterprise_id: string;
}

export interface GetSSOSettingResponse {
  data: GetSSOSettingResponseData;
}

export interface GetSSOSettingResponse2 {
  code: number;
  msg: string;
  data: GetSSOSettingResponseData;
}

export interface GetSSOSettingResponseData {
  enabled: boolean;
}

export interface GetUserProfileRequest {}

export interface GetUserProfileResponse {
  data: UserProfile;
}

export interface GetUserProfileResponse2 {
  code: number;
  msg: string;
  detail: OpenApiRespDetailDetail;
  data: UserProfile;
}

export interface GetVolcanoConnectInfoWithInsNameRequest {}

export interface GetVolcanoConnectInfoWithInsNameResponse {
  volcano_connect_info_with_ins_name?: VolcanoConnectInfoWithInsName;
}

export interface GetVolcanoConnectInfoWithInsNameResponse2 {
  code: number;
  msg: string;
  volcano_connect_info_with_ins_name?: VolcanoConnectInfoWithInsName;
}

export interface GetVolcanoMaskedMobileRequest {}

export interface GetVolcanoMaskedMobileResponse {
  /** 是否有火山账号信息 */
  have_volcano: boolean;
  /** 掩码手机号 */
  mobile?: string;
}

export interface GetVolcanoMaskedMobileResponse2 {
  code: number;
  msg: string;
  /** 是否有火山账号信息 */
  have_volcano: boolean;
  /** 掩码手机号 */
  mobile?: string;
}

export interface ImpersonateCozeUserRequest {
  duration_seconds?: Int64;
  scope?: Scope;
}

export interface ImpersonateCozeUserRequest2 {
  duration_seconds?: Int64;
  scope?: Scope;
}

export interface ImpersonateCozeUserResponse {
  data?: ImpersonateCozeUserResponseData;
}

export interface ImpersonateCozeUserResponse2 {
  code: number;
  msg: string;
  data?: ImpersonateCozeUserResponseData;
}

export interface ImpersonateCozeUserResponseData {
  access_token: string;
  expires_in: Int64;
  token_type: string;
}

export interface InlineResponse200 {
  code: number;
  msg: string;
  data: CreatePersonalAccessTokenAndPermissionResponseData;
}

export interface InlineResponse2001 {
  code: number;
  msg: string;
}

export interface InlineResponse20010 {
  code: number;
  msg: string;
  data: UploadPublicKeyResponseData;
}

export interface InlineResponse20011 {
  code: number;
  msg: string;
  data: CreateClientSecretResponseData;
}

export interface InlineResponse20012 {
  code: number;
  msg: string;
  data: ListAuthorizedAppsResponseData;
}

export interface InlineResponse20013 {
  code: number;
  msg: string;
  data: GetAppAuthorizationRequestInfoResponseData;
}

export interface InlineResponse20014 {
  code: number;
  msg: string;
  data: BatchAddCollaboratorResponseData;
}

export interface InlineResponse20015 {
  code: number;
  msg: string;
  data: GetAppInstallationRequestInfoResponseData;
}

export interface InlineResponse20016 {
  code: number;
  msg: string;
  data?: ImpersonateCozeUserResponseData;
}

export interface InlineResponse20017 {
  code: number;
  msg: string;
  volcano_connect_info_with_ins_name?: VolcanoConnectInfoWithInsName;
}

export interface InlineResponse20018 {
  code: number;
  msg: string;
  /** 是否有火山账号信息 */
  have_volcano: boolean;
  /** 掩码手机号 */
  mobile?: string;
}

export interface InlineResponse20019 {
  code: number;
  msg: string;
  /** 1-success */
  bind_result?: number;
}

export interface InlineResponse2002 {
  code: number;
  msg: string;
  data: ListPersonalAccessTokensResponseData;
}

export interface InlineResponse20020 {
  code: number;
  msg: string;
  detail: OpenApiRespDetailDetail;
  data: UserProfile;
}

export interface InlineResponse20021 {
  code: number;
  msg: string;
  detail: OpenApiRespDetailDetail;
  data: ListAppAuthorizationsResponseData;
}

export interface InlineResponse20022 {
  code: number;
  msg: string;
  data: GetCertificationInfoResponseData;
}

export interface InlineResponse20023 {
  code: number;
  msg: string;
  data: NeedCreateEnterpriseResponseData;
}

export interface InlineResponse20024 {
  code: number;
  msg: string;
  data: CreateEnterpriseResponseData;
}

export interface InlineResponse20025 {
  code: number;
  msg: string;
  data: ListEnterpriseResponseData;
}

export interface InlineResponse20026 {
  code: number;
  msg: string;
  data: GetEnterpriseResponseData;
}

export interface InlineResponse20027 {
  code: number;
  msg: string;
  data: GetEnterpriseSettingsResponseData;
}

export interface InlineResponse20028 {
  code: number;
  msg: string;
  data: GetSSOSettingResponseData;
}

export interface InlineResponse20029 {
  code: number;
  msg: string;
  data: SearchCanAddEnterprisePeopleResponseData;
}

export interface InlineResponse2003 {
  code: number;
  msg: string;
  data: GetPersonalAccessTokenAndPermissionResponseData;
}

export interface InlineResponse20030 {
  code: number;
  msg: string;
  data: SearchEnterprisePeopleResponseData;
}

export interface InlineResponse20031 {
  code: number;
  msg: string;
  data: CreateEnterpriseInviteLinkResponseData;
}

export interface InlineResponse20032 {
  code: number;
  msg: string;
  data: ListJoinApplicationResponseData;
}

export interface InlineResponse20033 {
  code: number;
  msg: string;
  data: GetInviteInfoResponseData;
}

export interface InlineResponse20034 {
  code: number;
  msg: string;
  data: ListAppInstallationsResponseData;
}

export interface InlineResponse20035 {
  code: number;
  msg: string;
  data: GetChecklistForWorkspaceMigrationResponseData;
}

export interface InlineResponse20036 {
  code: number;
  msg: string;
  data: CheckEnterpriseExistResponseData;
}

export interface InlineResponse2004 {
  code: number;
  msg: string;
  data: ListPersonalAccessTokenSupportPermissionsResponseData;
}

export interface InlineResponse2005 {
  code: number;
  msg: string;
  data: CheckPersonalAccessTokenInWorkspaceResponseData;
}

export interface InlineResponse2006 {
  code: number;
  msg: string;
  data: ListPersonalAccessTokensByCreatorResponseData;
}

export interface InlineResponse2007 {
  code: number;
  msg: string;
  data: CreateAppMetaResponseData;
}

export interface InlineResponse2008 {
  code: number;
  msg: string;
  data: ListAppMetaResponseData;
}

export interface InlineResponse2009 {
  code: number;
  msg: string;
  data: GetAppMetaResponseData;
}

export interface InstallAppOboRequest {
  appid: string;
  enterprise_id?: string;
}

export interface InstallAppOboRequest2 {
  appid: string;
  enterprise_id?: string;
}

export interface InstallAppOboResponse {
  code: number;
  msg: string;
}

export interface JoinApplicationInfo {
  applicant: UserInfo;
  application_id: string;
  create_time: Int64;
  operator?: string;
  application_status: ApplicationStatus;
}

export interface ListAppAuthorizationsRequest {
  /** appid */
  appid: string;
  /** page num */
  page_num?: Int64;
  /** page size */
  page_size?: Int64;
  /** JWT signed by OAuth App private key */
  authorization: string;
}

export interface ListAppAuthorizationsResponse {
  data: ListAppAuthorizationsResponseData;
}

export interface ListAppAuthorizationsResponse2 {
  code: number;
  msg: string;
  detail: OpenApiRespDetailDetail;
  data: ListAppAuthorizationsResponseData;
}

export interface ListAppAuthorizationsResponseData {
  items: Array<AppAuthorizationInfo>;
  has_more: boolean;
}

export interface ListAppInstallationsRequest {
  /** enterprise id */
  enterprise_id?: string;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface ListAppInstallationsResponse {
  data: ListAppInstallationsResponseData;
}

export interface ListAppInstallationsResponse2 {
  code: number;
  msg: string;
  data: ListAppInstallationsResponseData;
}

export interface ListAppInstallationsResponseData {
  installations: Array<AppInstallationInfo>;
  total: Int64;
}

export interface ListAppMetaRequest {
  /** organization id */
  organization_id?: string;
}

export interface ListAppMetaResponse {
  data: ListAppMetaResponseData;
}

export interface ListAppMetaResponse2 {
  code: number;
  msg: string;
  data: ListAppMetaResponseData;
}

export interface ListAppMetaResponseData {
  apps: Array<AppMeta>;
}

export interface ListAuthorizedAppsRequest {
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
  /** page */
  page: Int64;
  /** page size */
  size: Int64;
}

export interface ListAuthorizedAppsResponse {
  data: ListAuthorizedAppsResponseData;
}

export interface ListAuthorizedAppsResponse2 {
  code: number;
  msg: string;
  data: ListAuthorizedAppsResponseData;
}

export interface ListAuthorizedAppsResponseData {
  authorized_apps: Array<AuthorizedApp>;
  total: Int64;
}

export interface ListEnterpriseRequest {}

export interface ListEnterpriseResponse {
  data: ListEnterpriseResponseData;
}

export interface ListEnterpriseResponse2 {
  code: number;
  msg: string;
  data: ListEnterpriseResponseData;
}

export interface ListEnterpriseResponseData {
  personal_account_info: PersonalAccountInfo;
  enterprise_info_list: Array<EnterpriseInfo>;
}

export interface ListJoinApplicationRequest {
  application_status?: ApplicationStatus;
  enterprise_id: string;
  search_key?: string;
  page: number;
  page_size: number;
}

export interface ListJoinApplicationRequest2 {
  application_status?: ApplicationStatus;
  enterprise_id: string;
  search_key?: string;
  page: number;
  page_size: number;
}

export interface ListJoinApplicationResponse {
  data: ListJoinApplicationResponseData;
}

export interface ListJoinApplicationResponse2 {
  code: number;
  msg: string;
  data: ListJoinApplicationResponseData;
}

export interface ListJoinApplicationResponseData {
  join_application_list: Array<JoinApplicationInfo>;
  page: number;
  page_size: number;
  total: Int64;
}

export interface ListPersonalAccessTokensByCreatorRequest {
  /** organization id */
  organization_id: string;
}

export interface ListPersonalAccessTokensByCreatorResponse {
  data: ListPersonalAccessTokensByCreatorResponseData;
}

export interface ListPersonalAccessTokensByCreatorResponse2 {
  code: number;
  msg: string;
  data: ListPersonalAccessTokensByCreatorResponseData;
}

export interface ListPersonalAccessTokensByCreatorResponseData {
  /** PAT 列表 */
  personal_access_tokens: Array<PersonalAccessToken>;
}

export interface ListPersonalAccessTokensRequest {
  /** organization id */
  organization_id?: string;
  /** zero-indexed */
  page?: Int64;
  /** page size */
  size?: Int64;
  /** search option */
  search_option?: PatSearchOption;
}

export interface ListPersonalAccessTokensResponse {
  data: ListPersonalAccessTokensResponseData;
}

export interface ListPersonalAccessTokensResponse2 {
  code: number;
  msg: string;
  data: ListPersonalAccessTokensResponseData;
}

export interface ListPersonalAccessTokensResponseData {
  /** PAT 列表 */
  personal_access_tokens: Array<PersonalAccessTokenWithCreatorInfo>;
  /** 是否还有更多数据 */
  has_more?: boolean;
}

export interface ListPersonalAccessTokenSupportPermissionsRequest {}

export interface ListPersonalAccessTokenSupportPermissionsResponse {
  data: ListPersonalAccessTokenSupportPermissionsResponseData;
}

export interface ListPersonalAccessTokenSupportPermissionsResponse2 {
  code: number;
  msg: string;
  data: ListPersonalAccessTokenSupportPermissionsResponseData;
}

export interface ListPersonalAccessTokenSupportPermissionsResponseData {
  permission_list: Array<WorkspaceResourcePermission>;
}

export interface MigrateAuthorizationItem {
  authorization_type: ChecklistItemType;
  authorization_id: string;
}

export interface ModifyCollaboratorRequest {
  principal: PrincipalIdentifier;
  resource: ResourceIdentifier;
  collaborator_types?: Array<CollaboratorType>;
}

export interface ModifyCollaboratorRequest2 {
  principal: PrincipalIdentifier;
  resource: ResourceIdentifier;
  collaborator_types?: Array<CollaboratorType>;
}

export interface ModifyCollaboratorResponse {
  code: number;
  msg: string;
}

export interface NeedCreateEnterpriseRequest {}

export interface NeedCreateEnterpriseResponse {
  data: NeedCreateEnterpriseResponseData;
}

export interface NeedCreateEnterpriseResponse2 {
  code: number;
  msg: string;
  data: NeedCreateEnterpriseResponseData;
}

export interface NeedCreateEnterpriseResponseData {
  need_create_enterprise: boolean;
}

export interface OAuth2Configuration {
  redirect_uris: Array<string>;
}

export interface OpenApiRespDetail {
  detail: OpenApiRespDetailDetail;
}

export interface OpenApiRespDetailDetail {
  logid: string;
}

export interface PersonalAccessToken {
  id: string;
  name: string;
  created_at: Int64;
  updated_at: Int64;
  /** -1 表示未使用 */
  last_used_at: Int64;
  /** -1 表示无限期 */
  expire_at: Int64;
}

export interface PersonalAccessTokenWithCreatorInfo {
  id: string;
  name: string;
  created_at: Int64;
  updated_at: Int64;
  /** -1 表示未使用 */
  last_used_at: Int64;
  /** -1 表示无限期 */
  expire_at: Int64;
  creator_name?: string;
  creator_unique_name?: string;
  creator_avatar_url?: string;
  creator_icon_url?: string;
  locked?: boolean;
  creator_status?: UserStatus;
}

export interface PersonalAccessTokenWithCreatorInfoPartial2 {
  creator_name?: string;
  creator_unique_name?: string;
  creator_avatar_url?: string;
  creator_icon_url?: string;
  locked?: boolean;
  creator_status?: UserStatus;
}

export interface PersonalAccountInfo {
  user_label?: UserLabel;
  user_id: string;
  user_name: string;
  nick_name: string;
  avatar_url: string;
  enterprise_id?: string;
}

export interface PrincipalIdentifier {
  id: string;
  /** 1-User，2-Service */
  type: number;
}

export interface PublicKey {
  fingerprint: string;
}

export interface PutOAuth2ConfigurationRequest {
  oauth2_configuration: OAuth2Configuration;
  appid: string;
}

export interface PutOAuth2ConfigurationRequest2 {
  oauth2_configuration: OAuth2Configuration;
  appid: string;
}

export interface PutOAuth2ConfigurationResponse {
  code: number;
  msg: string;
}

export interface RemoveCollaboratorRequest {
  principal: PrincipalIdentifier;
  resource: ResourceIdentifier;
}

export interface RemoveCollaboratorRequest2 {
  principal: PrincipalIdentifier;
  resource: ResourceIdentifier;
}

export interface RemoveCollaboratorResponse {
  code: number;
  msg: string;
}

export interface RemoveEnterprisePeopleRequest {
  enterprise_id: string;
  user_id: string;
  receiver: string;
}

export interface RemoveEnterprisePeopleRequest2 {
  enterprise_id: string;
  user_id: string;
  receiver: string;
}

export interface RemoveEnterprisePeopleResponse {
  code: number;
  msg: string;
}

export interface ResourceIdentifier {
  id: string;
  /** 1-Account, 2-Workspace, 3-App, 4-Bot, 5-Plugin, 6-Workflow, 7-Knowledge, 8-PersonalAccessToken, 9-Connector, 10-Card, 11-CardTemplate */
  type: number;
}

export interface RespBaseModel {
  code: number;
  msg: string;
}

export interface RevokeAppAuthorizedPermissionRequest {
  authorization_type: AuthorizationType;
  appid: string;
  organization_id?: string;
}

export interface RevokeAppAuthorizedPermissionRequest2 {
  authorization_type: AuthorizationType;
  appid: string;
  organization_id?: string;
}

export interface RevokeAppAuthorizedPermissionResponse {
  code: number;
  msg: string;
}

export interface Scope {
  workspace_permission?: WorkspacePermission1;
  account_permission?: AccountPermission1;
}

export interface SearchCanAddEnterprisePeopleRequest {
  enterprise_id: string;
  search_key?: string;
}

export interface SearchCanAddEnterprisePeopleRequest2 {
  enterprise_id: string;
  search_key?: string;
}

export interface SearchCanAddEnterprisePeopleResponse {
  data: SearchCanAddEnterprisePeopleResponseData;
}

export interface SearchCanAddEnterprisePeopleResponse2 {
  code: number;
  msg: string;
  data: SearchCanAddEnterprisePeopleResponseData;
}

export interface SearchCanAddEnterprisePeopleResponseData {
  add_enterprise_people_data_list: Array<AddEnterprisePeopleData>;
}

export interface SearchEnterprisePeopleRequest {
  enterprise_id: string;
  search_key?: string;
  enterprise_role_type_list?: Array<EnterpriseRoleType>;
  need_volcano_user_info?: boolean;
  need_people_number?: boolean;
  page: number;
  page_size: number;
}

export interface SearchEnterprisePeopleRequest2 {
  enterprise_id: string;
  search_key?: string;
  enterprise_role_type_list?: Array<EnterpriseRoleType>;
  need_volcano_user_info?: boolean;
  need_people_number?: boolean;
  page: number;
  page_size: number;
}

export interface SearchEnterprisePeopleResponse {
  data: SearchEnterprisePeopleResponseData;
}

export interface SearchEnterprisePeopleResponse2 {
  code: number;
  msg: string;
  data: SearchEnterprisePeopleResponseData;
}

export interface SearchEnterprisePeopleResponseData {
  enterprise_people_list: Array<EnterprisePeople>;
  people_total_number?: Int64;
  page: number;
  page_size: number;
  total: Int64;
}

export interface SubmitAppOboInstallationReviewRequest {
  appid: string;
  enterprise_id?: string;
}

export interface SubmitAppOboInstallationReviewRequest2 {
  appid: string;
  enterprise_id?: string;
}

export interface SubmitAppOboInstallationReviewResponse {
  code: number;
  msg: string;
}

export interface UninstallAppOboRequest {
  appid: string;
  enterprise_id?: string;
}

export interface UninstallAppOboRequest2 {
  appid: string;
  enterprise_id?: string;
}

export interface UninstallAppOboResponse {
  code: number;
  msg: string;
}

export interface UpdateAppMetaRequest {
  status?: Status;
  oauth2_configuration?: OAuth2Configuration;
  appid: string;
  name?: string;
  description?: string;
  declared_permission?: Array<DeclaredPermission>;
  declared_permission_v2?: Array<string>;
}

export interface UpdateAppMetaRequest2 {
  status?: Status;
  oauth2_configuration?: OAuth2Configuration;
  appid: string;
  name?: string;
  description?: string;
  declared_permission?: Array<DeclaredPermission>;
  declared_permission_v2?: Array<string>;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface UpdateAppMetaResponse {
  code: number;
  msg: string;
}

export interface UpdateEnterprisePeopleRequest {
  enterprise_id: string;
  user_id: string;
  enterprise_role_type_list: Array<EnterpriseRoleType>;
}

export interface UpdateEnterprisePeopleRequest2 {
  enterprise_id: string;
  user_id: string;
  enterprise_role_type_list: Array<EnterpriseRoleType>;
}

export interface UpdateEnterprisePeopleResponse {
  code: number;
  msg: string;
}

export interface UpdateEnterpriseRequest {
  enterprise_id: string;
  name?: string;
  icon_uri?: string;
}

export interface UpdateEnterpriseRequest2 {
  enterprise_id: string;
  name?: string;
  icon_uri?: string;
}

export interface UpdateEnterpriseResponse {
  code: number;
  msg: string;
}

export interface UpdateEnterpriseSettingsRequest {
  enterprise_id: string;
  enterprise_settings: Array<EnterpriseSetting>;
}

export interface UpdateEnterpriseSettingsRequest2 {
  enterprise_id: string;
  enterprise_settings: Array<EnterpriseSetting>;
}

export interface UpdateEnterpriseSettingsResponse {
  code: number;
  msg: string;
}

export interface UpdateJoinApplicationRequest {
  application_status: ApplicationStatus;
  enterprise_id: string;
  join_application_id_list: Array<string>;
}

export interface UpdateJoinApplicationRequest2 {
  application_status: ApplicationStatus;
  enterprise_id: string;
  join_application_id_list: Array<string>;
}

export interface UpdateJoinApplicationResponse {
  code: number;
  msg: string;
}

export interface UpdatePersonalAccessTokenAndPermissionRequest {
  workspace_permission?: WorkspacePermission;
  account_permission?: AccountPermission;
  workspace_permission_v2?: WorkspacePermissionV2;
  /** PAT Id */
  id: string;
  /** PAT 名称 */
  name?: string;
}

export interface UpdatePersonalAccessTokenAndPermissionRequest2 {
  workspace_permission?: WorkspacePermission;
  account_permission?: AccountPermission;
  workspace_permission_v2?: WorkspacePermissionV2;
  /** PAT Id */
  id: string;
  /** PAT 名称 */
  name?: string;
  /** x-tt-env bytedance env tag */
  x_tt_env?: string;
}

export interface UpdatePersonalAccessTokenAndPermissionResponse {
  code: number;
  msg: string;
}

export interface UploadPublicKeyRequest {
  appid: string;
  public_key_pem: string;
}

export interface UploadPublicKeyRequest2 {
  appid: string;
  public_key_pem: string;
}

export interface UploadPublicKeyResponse {
  data: UploadPublicKeyResponseData;
}

export interface UploadPublicKeyResponse2 {
  code: number;
  msg: string;
  data: UploadPublicKeyResponseData;
}

export interface UploadPublicKeyResponseData {
  fingerprint: string;
}

export interface UserInfo {
  user_id: string;
  name: string;
  nick_name: string;
  avatar_url: string;
  user_label?: UserLabel;
}

export interface UserLabel {
  label_id?: string;
  label_name?: string;
  icon_url?: string;
  icon_uri?: string;
  jump_link?: string;
}

export interface UserProfile {
  /** user id */
  user_id: string;
  /** user name */
  user_name: string;
  /** nick name */
  nick_name: string;
  /** avatar url */
  avatar_url: string;
}

/** 火山账号信息，并且包含实例名称 */
export interface VolcanoAccountInfoWithInsName {
  /** volcano user_id */
  user_id: string;
  /** volcano instance id */
  instance_id: string;
  /** volcano account id */
  account_id: string;
  /** volcano user type, RootUser BasicUser */
  volcano_user_type: string;
  /** volcano instance name */
  instance_name: string;
}

/** 火山第三方信息，并且包含火山账号的实例名称 */
export interface VolcanoConnectInfoWithInsName {
  /** volcano open id */
  open_id: string;
  volcano_account_info: VolcanoAccountInfoWithInsName;
}

export interface VolcanoUserInfo {
  volcano_user_type: VolcanoUserType;
}

export interface WorkspacePermission {
  /** 1-Select，2-All */
  option: number;
  workspace_id_list?: Array<string>;
  permission_list: Array<WorkspaceResourcePermission>;
}

export interface WorkspacePermission1 {
  workspace_id_list?: Array<string>;
  permission_list?: Array<string>;
}

export interface WorkspacePermissionV2 {
  /** 1-Select，2-All */
  option: number;
  workspace_id_list?: Array<string>;
  permission_list: Array<string>;
}

export interface WorkspaceResourcePermission {
  resource_type: string;
  actions: Array<string>;
}
/* eslint-enable */
