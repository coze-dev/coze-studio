/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface AbaseBinlogOptions {
  abase_database_name?: string;
  topic?: string;
  orderly?: boolean;
  sub_expr?: string;
  cluster_name?: string;
  consumer_group?: string;
  filter_source_type?: string;
  filter_source?: string;
  filter_plugin_id?: string;
  filter_plugin_version?: string;
  retry_interval_seconds?: number;
  subscribe_throughput?: number;
  /** default is rocketmq, other option is kafka */
  mq_type?: string;
}

export interface AbortBuildRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  /** Number of revision */
  revision_number: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface AbortBuildResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface ActiveFunctionFrozenInstanceRequest {
  /** cluster name */
  cluster: string;
  podname: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  zone: string;
}

export interface ActiveFunctionFrozenInstanceResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface AddImageCICDRecordsRequest {
  create_by?: string;
  image_type?: string;
  app_env?: string;
  value?: Array<TargetSetting>;
  old_record_value?: Array<TargetSetting>;
  description?: string;
}

export interface AddImageCICDRecordsResponse {
  code?: number;
  error?: string;
  data?: AddImageCICDRecordsResponseData;
}

export interface AddImageCICDRecordsResponseData {
  id?: string;
  created_by?: string;
  created_at?: string;
  image_type?: string;
  app_env?: string;
  record_diff?: Array<RecordDiff>;
  description?: string;
  rollback_id?: string;
  source?: string;
}

export interface AdminCreateUpdateFunctionBatchTaskRequest {
  clusters: Array<AdminUpdateFunctionBatchTaskClusterParams>;
  runtime: string;
  target_image: string;
  /** strategy of upgrade image, enum value: [ only_once, always ] */
  strategy: string;
  rolling_step?: number;
  /** envs array */
  format_envs?: Array<FormatEnvs>;
  /** will skip for approval while critical is true */
  critical?: boolean;
  auto_start?: boolean;
  /** Description for this upgrade, will append to lark message card */
  description?: string;
}

export interface AdminCreateUpdateFunctionBatchTaskResponse {
  code?: number;
  error?: string;
  data?: Record<string, string>;
}

export interface AdminGetAllEtcdSettingsRequest {
  cell: string;
  region: string;
}

export interface AdminGetAllEtcdSettingsResponse {
  code?: number;
  error?: string;
  data?: Array<EtcdSetting>;
}

export interface AdminGetAvailableCellsRequest {
  region: string;
}

export interface AdminGetAvailableCellsResponse {
  code?: number;
  error?: string;
  data?: Array<string>;
}

export interface AdminGetBaseImageByRuntimeAndIdRequest {
  runtime: string;
  image_id: string;
}

export interface AdminGetBaseImageByRuntimeAndIdResponse {
  code?: number;
  error?: string;
  data?: FaaSBaseImageInfo;
}

export interface AdminGetBatchTaskRequest {
  batch_task_id?: string;
  task_type?: string;
  offset?: number;
  limit?: number;
  status?: string;
}

export interface AdminGetBatchTaskResponse {
  code?: number;
  error?: string;
  data?: Array<BatchTask>;
}

export interface AdminGetClustersRequest {
  service_id?: string;
  function_id?: string;
  psm?: string;
  region?: string;
  runtime?: string;
  limit?: number;
  offset?: number;
}

export interface AdminGetClustersResponse {
  code?: number;
  error?: string;
  data?: Array<BasicCluster>;
}

export interface AdminGetEtcdSettingsRequest {
  setting_name: string;
  cell?: string;
  region?: string;
}

export interface AdminGetEtcdSettingsResponse {
  code?: number;
  error?: string;
  data?: EtcdSetting;
}

export interface AdminGetParentTaskDetailRequest {
  parent_task_id: string;
}

export interface AdminGetParentTaskDetailResponse {
  code?: number;
  error?: string;
  data?: ParentTask;
}

export interface AdminGetParentTaskRequest {
  status?: string;
  /** enum value: mqevent/function */
  task_type?: string;
  limit?: number;
  offset?: number;
}

export interface AdminGetParentTaskResponse {
  code?: number;
  error?: string;
  data?: Array<ParentTask>;
}

export interface AdminRollbackRequest {
  targets?: Array<AdminRollbackRequestTargetsMessage>;
}

export interface AdminRollbackRequestTargetsMessage {
  /** the ID of the target rollback ticket */
  ticket_id?: string;
}

export interface AdminRollbackResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface AdminUpdateBatchTaskRequset {
  parent_task_id?: string;
  batch_task_id?: string;
  /** enum: [ "initial", "approved", "dispatched", "skipped", "success", "failed" ] */
  status: string;
}

export interface AdminUpdateBatchTaskResponse {
  code?: number;
  error?: string;
  data?: BatchTask;
}

export interface AdminUpdateFunctionBatchTaskClusterParams {
  service_id: string;
  region: string;
  cluster: string;
  psm: string;
  function_id: string;
}

export interface AdminUpdateParentTaskRequest {
  batch_task_id: string;
  /** enum value: pending/failed */
  status: string;
  concurrency?: number;
}

export interface AdminUpdateParentTaskResponse {
  code?: number;
  error?: string;
  data?: Record<string, string>;
}

export interface AdminUpsertEtcdSettingRequest {
  name: string;
  value: string;
  cell: string;
  region: string;
}

export interface AdminUpsertEtcdSettingResponse {
  code?: number;
  error?: string;
  data?: EtcdSetting;
}

/** alarm model */
export interface Alarm {
  alarm_methods?: string;
  check_interval?: number;
  cluster?: string;
  end_time?: string;
  handle_suggestion?: string;
  id?: number;
  last_updated_by?: string;
  level?: string;
  name?: string;
  psm?: string;
  rule?: string;
  rule_alias?: string;
  rule_format?: string;
  start_time?: string;
  status?: string;
  threshold?: number;
  threshold_unit?: string;
  type?: string;
  unit_id?: number;
  updated_at?: string;
  zone?: string;
}

export interface AlarmParameters {
  lag_alarm_threshold?: number;
}

export interface Alias {
  alias_name?: string;
  traffic_config?: Record<string, number>;
  zone_traffic_config?: Record<string, Record<string, number>>;
  format_traffic_configs?: Array<FormatTrafficConfig>;
  format_zone_traffic_config?: Array<FormatZoneTrafficConfig>;
}

export interface AllTriggers {
  consul?: Array<ConsulTriggerResponseData>;
  eventbus?: Array<GlobalMQEventTriggerResponseData>;
  http?: Array<HttpTriggerResponse>;
  mqevents?: Array<GlobalMQEventTriggerResponseData>;
  timers?: Array<TimerTrigger>;
  tos?: Array<GlobalMQEventTriggerResponseData>;
  abase_binlog?: Array<GlobalMQEventTriggerResponseData>;
  event_bridge?: Array<EventBridgeTrigger>;
}

export interface ApiResponse {
  code?: number;
  data?: ApiResponseDataMessage2;
  error?: string;
}

export interface ApiResponseDataMessage2 {}

export interface AsyncRequestRecordResponse {
  created_at?: string;
  event_type?: string;
  execute_end_time?: string;
  execute_start_time?: string;
  execution_duration_str?: string;
  finished_time?: string;
  function_id?: string;
  kibana_link?: string;
  request_id?: string;
  response_meta?: AsyncRequestRecordResponseResponseMetaMessage2;
  revision_id?: string;
  task_status?: string;
  updated_at?: string;
  user_invoke_time?: string;
}

export interface AsyncRequestRecordResponseResponseMetaMessage2 {
  error_code?: string;
  error_message?: string;
  response_body?: string;
  response_status?: string;
}

export interface AutoMeshParams {
  mesh_enable?: boolean;
  mesh_http_egress?: boolean;
  mesh_mongo_egress?: boolean;
  mesh_mysql_egress?: boolean;
  mesh_rpc_egress?: boolean;
  mesh_sidecar_percent?: number;
  mesh_http_ingress?: boolean;
  mesh_rpc_ingress?: boolean;
  mesh_sidecars_enable?: boolean;
}

/** basic info of cluster. */
export interface BasicCluster {
  adaptive_concurrency_mode?: string;
  /** traffic aliases */
  aliases?: Record<string, Alias>;
  /** restricted access, only open to administrators. 保留字段，仅 admin 可修改 */
  async_mode?: boolean;
  /** auth switch. 鉴权开关 */
  auth_enable?: boolean;
  cell?: string;
  /** cluster name, starts with faas-. 集群名 */
  cluster: string;
  /** ID of code revision. 部署代码版本 ID */
  code_revision_id?: string;
  /** number of code revision. 部署代码版本号 */
  code_revision_number?: string;
  /** cold start switch. 冷启动开关 */
  cold_start_disabled?: boolean;
  /** CORS switch. CORS 开关 */
  cors_enable?: boolean;
  created_at: string;
  enable_colocate_scheduling?: boolean;
  enable_scale_optimise?: boolean;
  enable_scale_strategy?: boolean;
  env_name: string;
  /** exclusive mode. 独占模式 */
  exclusive_mode?: boolean;
  format_envs?: Array<FormatEnvs>;
  function_id: string;
  /** GDPR switch. GDPR 鉴权开关 */
  gdpr_enable?: boolean;
  global_kv_namespace_ids?: Array<string>;
  handler: string;
  http_trigger_disable?: boolean;
  id: string;
  initializer: string;
  initializer_sec?: number;
  is_ipv6_only?: boolean;
  /** disable zones in a region */
  is_this_zone_disabled?: Record<string, boolean>;
  latency_sec?: number;
  lazyload?: boolean;
  max_concurrency?: number;
  memory_mb?: number;
  region: string;
  /** function reserved mode switch. 函数预留模式开关 */
  reserved_dp_enabled?: boolean;
  resource_limit?: ResourceLimitWithAlias;
  /** ID of revision. 版本 ID */
  revision_id?: string;
  /** number of revision. 版本号 */
  revision_number?: number;
  /** function routing strategy. 函数路由调度策略 */
  routing_strategy?: string;
  /** runtime. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime: string;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  service_id: string;
  trace_enable?: boolean;
  updated_at: string;
  /** zone throttle log bytes */
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  /** ZTI switch. ZTI 鉴权开关 */
  zti_enable?: boolean;
  online_mode?: boolean;
  enable_runtime_file_log?: boolean;
  enable_runtime_console_log?: boolean;
  enable_runtime_stream_log?: boolean;
  enable_runtime_es_log?: boolean;
  enable_runtime_json_log?: boolean;
  enable_system_stream_log?: boolean;
  enable_system_es_log?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  enable_reserve_frozen_instance?: boolean;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
}

export interface BasicFunctionParamsVpcConfigMessage2 {
  vpc_id?: string;
}

export interface BasicRegionalMetaParams {
  /** traffic aliases */
  aliases?: Record<string, Alias>;
  async_mode?: boolean;
  auth_enable?: boolean;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  cell?: string;
  cold_start_disabled?: boolean;
  cors_enable?: boolean;
  dynamic_load_balancing_data_report_enabled?: boolean;
  dynamic_load_balancing_enabled_vdcs?: Array<string>;
  dynamic_load_balancing_weight_enabled?: boolean;
  enable_colocate_scheduling?: boolean;
  env_name?: string;
  exclusive_mode?: boolean;
  format_envs?: Array<FormatEnvs>;
  function_id?: string;
  gateway_route_enable?: boolean;
  gdpr_enable?: boolean;
  global_kv_namespace_ids?: Array<string>;
  http_trigger_disable?: boolean;
  is_ipv6_only?: boolean;
  /** disable zones in a region */
  is_this_zone_disabled?: Record<string, boolean>;
  latency_sec?: number;
  local_cache_namespace_ids?: Array<string>;
  net_class_id?: number;
  network?: string;
  owner?: string;
  protocol?: string;
  psm?: string;
  region?: string;
  reserved_dp_enabled?: boolean;
  revision_id?: string;
  revision_number?: number;
  routing_strategy?: string;
  /** Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  service_id?: string;
  trace_enable?: boolean;
  /** zone throttle log bytes */
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  zti_enable?: boolean;
  online_mode?: boolean;
  formatted_elastic_prefer_cluster?: Array<FormattedPreferCluster>;
  formatted_reserved_prefer_cluster?: Array<FormattedPreferCluster>;
  enable_reserve_frozen_instance?: boolean;
  disable_cgroup_v2?: boolean;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  enable_fed_on_demand_resource?: Record<string, boolean>;
}

export interface BatchTask {
  batch_task_id: string;
  task_id: string;
  /** json string, meta info of task, e.g.: service_id/psm/function_id */
  task_meta: string;
  /** type of task, enum value: [ function, mqevent ] */
  type: string;
  /** status of task, enum value: [ initial, reviewing, dispatched, failed, success, skipped, approved, rejected ] */
  status: string;
  /** the person who created this task */
  operator: string;
  /** all events */
  events?: Array<BatchTaskEvent>;
  dispatched_at?: string;
  approved_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BatchTaskEvent {
  name: string;
  time: string;
  message: string;
}

/** a batch ticket */
export interface BatchTicket {
  /** status of child tickets */
  status?: Record<string, EmptyObject>;
  tickets?: Array<Ticket>;
  count?: number;
}

export interface BatchUpdateTicketStepActionRequest {
  /** retry/run/cancel */
  action?: string;
  /** ticket id */
  ticket_id: string;
  /** service id */
  service_id: string;
  /** steps */
  step_ids?: Array<string>;
}

export interface BucketMeta {
  id?: string;
  name?: string;
}

export interface BuildBizData {
  request_id?: string;
  created_by?: string;
  created_user_jwt?: string;
  service_id?: string;
  region?: string;
  target_revision_id?: string;
  rebuild?: boolean;
  function_id?: string;
  created_user_type?: string;
  build_log_link?: string;
}

export interface BuildDescription {
  build_id?: string;
  build_info?: string;
  build_log_link?: string;
  status?: string;
  built_object_size?: string;
}

export interface BuildLatestRevisionRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface BuildLatestRevisionResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface BuildServiceRevisionRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  /** Number of revision */
  revision_number: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface BuildServiceRevisionResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface BurstProtectorConfig {
  instance_quota: number;
  period: number;
  redirect_service?: string;
  redirect_cluster?: string;
  redirect_idc?: string;
  stage: string;
  ratio: number;
}

export interface BurstProtectorWithMetas {
  method: string;
  caller_cluster: string;
  callee_cluster: string;
  instance_quota: number;
  period: number;
  redirect_service?: string;
  redirect_cluster?: string;
  redirect_idc?: string;
  ratio: number;
}

export interface CancelOptions {
  type?: number;
}

export interface CheckImagesVersionRequest {
  key?: string;
  scm_version?: string;
}

export interface CheckImagesVersionResponse {
  status?: string;
  message?: string;
  data?: scmVersion;
}

export interface CheckUserIsAdministratorRequest {
  user: string;
}

export interface CheckUserIsAdministratorResponse {
  code?: number;
  data?: boolean;
  error?: string;
}

export interface ClusterCPUScaleSettings {
  cluster_name?: string;
  cpu_scale_settings?: FuncCPUScaleSettings;
  zone_scale_settings?: Record<string, FuncCPUScaleSettings>;
}

export interface ClusterInfo {
  region?: string;
  cluster?: string;
  function_id?: string;
}

export interface ClusterMQConsumerMeta {
  mq_type: string;
  mq_region: string;
  topic: string;
  mq_cluster: string;
  consumer_group: string;
  kafka_options?: ClusterMQConsumerMetaKafkaOptions;
  rmq_options?: ClusterMQConsumerMetaRMQOptions;
  mq_topic_link?: string;
  mq_consumer_link?: string;
  multi_env_version: string;
}

export interface ClusterMQConsumerMetaKafkaOptions {
  orderly?: boolean;
}

export interface ClusterMQConsumerMetaRMQOptions {
  orderly?: boolean;
  sub_expr?: string;
}

export interface ClusterResourceUsageRate {
  cpu?: number;
  memory?: number;
}

/** complete info of cluster */
export interface ClusterResponseData {
  id: string;
  service_id?: string;
  psm?: string;
  cluster: string;
  region: string;
  function_id: string;
  cell?: string;
  code_revision_number?: string;
  code_revision_id?: string;
  revision_number?: number;
  revision_id?: string;
  replica_limit?: Record<string, PodReplicaLimit>;
  resource_limit?: ResourceLimitWithAlias;
  format_envs?: Array<FormatEnvs>;
  is_this_zone_disabled?: Record<string, boolean>;
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  gdpr_enable?: boolean;
  auth_enable?: boolean;
  zti_enable?: boolean;
  cors_enable?: boolean;
  cold_start_disabled?: boolean;
  async_mode?: boolean;
  online_mode?: boolean;
  exclusive_mode?: boolean;
  trace_enable?: boolean;
  is_ipv6_only?: boolean;
  reserved_dp_enabled?: boolean;
  routing_strategy?: string;
  http_trigger_disable?: boolean;
  aliases?: Record<string, Alias>;
  env_name: string;
  global_kv_namespace_i_ds?: Array<string>;
  latency_sec?: number;
  initializer_sec?: number;
  max_concurrency?: number;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  status?: string;
  memory_mb?: number;
  pod_type?: string;
  async_result_emit_event_bridge?: boolean;
  enable_runtime_file_log?: boolean;
  enable_runtime_console_log?: boolean;
  enable_runtime_stream_log?: boolean;
  enable_runtime_es_log?: boolean;
  enable_runtime_json_log?: boolean;
  enable_system_stream_log?: boolean;
  enable_system_es_log?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  enable_scale_strategy?: boolean;
  enable_colocate_scheduling?: boolean;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  gateway_route_enable?: boolean;
  container_runtime?: string;
  cold_start_sec?: number;
  enable_scale_optimise?: boolean;
  created_at: string;
  updated_at: string;
  runtime: string;
  handler: string;
  initializer: string;
  ms_unit_id?: Int64;
  ms_alarm_ids?: Array<string>;
  adaptive_concurrency_mode?: string;
  icm_region?: string;
  network_mode?: string;
  dynamic_load_balancing_data_report_enabled?: boolean;
  dynamic_load_balancing_weight_enabled?: boolean;
  dynamic_load_balancing_enabled_vdcs?: Array<string>;
  dynamic_load_balance_type?: string;
  is_bytepaas_elastic_cluster?: boolean;
  disable_service_discovery?: boolean;
  deployment_inactive?: boolean;
  is_this_zone_deployment_inactive?: Record<string, boolean>;
  instances_num?: Int64;
  triggers?: AllTriggers;
  log_link?: string;
  stream_log_link?: string;
  argos_link?: string;
  grafana_link?: string;
  metrics_links?: Array<string>;
  resource_usage_rate?: ClusterResourceUsageRate;
  zone_reserved_frozen_replicas?: Record<string, number>;
  resource_guarantee?: boolean;
  mq_trigger_limit?: number;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  mq_consumer_meta?: Array<ClusterMQConsumerMeta>;
  enable_consul_ipv6_register?: boolean;
  enable_sys_mount?: boolean;
  disable_mount_jwt_bundles?: boolean;
  termination_grace_period_seconds?: number;
  is_mq_app_cluster?: boolean;
  volc_ext?: ClusterVolcExt;
  enable_consul_register?: boolean;
  host_uniq?: HostUniq;
  soft_deleted?: boolean;
  is_cronjob_cluster?: boolean;
  active_zones?: Array<string>;
  volume_mounts?: Array<VolumeMount>;
  async_mode_max_retry?: number;
}

export interface ClusterVolcExt {
  account_id: string;
}

export interface CodeRevision {
  created_at?: string;
  created_by?: string;
  dependency?: Array<Dependency>;
  /** deploy method. 部署方式 */
  deploy_method?: string;
  description?: string;
  disable_build_install?: boolean;
  function_id?: string;
  handler?: string;
  id?: string;
  initializer?: string;
  lazyload?: boolean;
  number?: string;
  protocol?: string;
  run_cmd?: string;
  runtime?: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  service_id?: string;
  /** source of code revision. 代码版本 URI */
  source?: string;
  /** source type of code revision. 代码版本类型 */
  source_type?: string;
  plugin_function_detail?: PluginFunctionDetail;
  build_desc_map?: Record<string, BuildDescription>;
  open_image_lazyload?: boolean;
  runtime_other_container_ports?: Array<number>;
}

export interface ConcurrencyScaleSettings {
  mem_scale_in_threshold?: number;
  mem_scale_out_threshold?: number;
  mem_scale_target?: number;
}

export interface ConfirmBizData {
  confirmed_by?: string;
  confirmed_by_usertype?: string;
  comfirm_at?: string;
}

export interface ConsulTriggerResponseData {
  name?: string;
  description?: string;
  id?: string;
  function_id?: string;
  region?: string;
  psm?: string;
  runtime?: string;
  protocol?: string;
  enabled?: boolean;
  strategy?: string;
  created_at?: string;
  updated_at?: string;
  consul_cluster?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  status?: string;
  meta_synced_times?: number;
  meta_synced?: boolean;
  meta_synced_at?: string;
  _id?: string;
}

export interface ConsumeMigrateAutoLimit {
  qps_limit?: number;
  expire_at?: string;
}

export interface ContainerInfo {
  containerID?: string;
  image?: string;
  env?: Record<string, string>;
}

export interface CopyTriggerSource {
  /** timer/mqevent */
  trigger_type: string;
  trigger_id: string;
  /** default is false */
  enable?: boolean;
}

export interface CopyTriggersRequest {
  target_service_id: string;
  target_region: string;
  target_cluster: string;
  source_service_id: string;
  source_region: string;
  source_cluster: string;
  source_triggers: Array<CopyTriggerSource>;
}

export interface CpuScaleSettings {
  cpu_scale_in_threshold?: number;
  cpu_scale_out_threshold?: number;
  cpu_scale_target?: number;
}

export interface CreateClusterRequest {
  /** async mode. 异步模式 */
  async_mode?: boolean;
  /** auth switch. 鉴权开关 */
  auth_enable?: boolean;
  /** cluster name, starts with faas-. 集群名 */
  cluster: string;
  /** ID of code revision. 部署代码版本 ID */
  code_revision_id?: string;
  /** number of code revision. 部署代码版本号 */
  code_revision_number?: string;
  /** cold start switch. 冷启动开关 */
  cold_start_disabled?: boolean;
  /** CORS switch. CORS 开关 */
  cors_enable?: boolean;
  enable_colocate_scheduling?: boolean;
  enable_scale_strategy?: boolean;
  /** exclusive mode. 独占模式 */
  exclusive_mode?: boolean;
  format_envs?: Array<FormatEnvs>;
  gateway_route_enable?: boolean;
  /** GDPR switch. GDPR 鉴权开关 */
  gdpr_enable?: boolean;
  global_kv_namespace_ids?: Array<string>;
  http_trigger_disable?: boolean;
  initializer_sec?: number;
  is_ipv6_only?: boolean;
  /** disable zones in a region */
  is_this_zone_disabled?: Record<string, boolean>;
  latency_sec?: number;
  max_concurrency?: number;
  /** network mode, Optional values: empty string,bridge */
  network_mode?: string;
  /** region name */
  region: string;
  /** function reserved mode switch. 函数预留模式开关 */
  reserved_dp_enabled?: boolean;
  revision_id?: string;
  revision_number?: number;
  /** function routing strategy. 函数路由调度策略 */
  routing_strategy?: string;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  /** ID of service */
  service_id: string;
  trace_enable?: boolean;
  /** zone throttle log bytes */
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  /** ZTI switch. ZTI 鉴权开关 */
  zti_enable?: boolean;
  online_mode?: boolean;
  enable_runtime_file_log?: boolean;
  enable_runtime_console_log?: boolean;
  enable_runtime_stream_log?: boolean;
  enable_runtime_es_log?: boolean;
  enable_runtime_json_log?: boolean;
  enable_system_stream_log?: boolean;
  enable_system_es_log?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  resource_limit?: ResourceLimit;
  pod_type?: string;
  enable_reserve_frozen_instance?: boolean;
  cluster_run_cmd?: string;
  disable_service_discovery?: boolean;
  async_result_emit_event_bridge?: boolean;
  resource_guarantee?: boolean;
  mq_trigger_limit?: number;
  cell?: string;
  lazyload?: boolean;
  image_lazyload?: boolean;
  initializer?: string;
  handler?: string;
  run_cmd?: string;
  throttle_log_enabled?: boolean;
  adaptive_concurrency_mode?: string;
  env_name?: string;
  container_runtime?: string;
  protocol?: string;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  mq_consumer_meta?: Array<ClusterMQConsumerMeta>;
  enable_consul_ipv6_register?: boolean;
  enable_sys_mount?: boolean;
  disable_mount_jwt_bundles?: boolean;
  termination_grace_period_seconds?: number;
  enable_consul_register?: boolean;
  'X-Jwt-Token'?: string;
  host_uniq?: HostUniq;
}

export interface CreateClusterResponse {
  code?: number;
  data?: ClusterResponseData;
  error?: string;
}

export interface CreateCodeRevisionRequest {
  /** code dependency */
  dependency?: Array<Dependency>;
  /** deploy method. 部署方式 */
  deploy_method: string;
  description?: string;
  disable_build_install?: boolean;
  handler?: string;
  initializer?: string;
  lazyload?: boolean;
  /** code revision number, server will generate when it is empty. 版本号 */
  number?: string;
  protocol?: string;
  run_cmd?: string;
  runtime: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  /** ID of service */
  service_id: string;
  /** source of code revision. 代码版本 URI */
  source: string;
  /** source type of code revision. 代码版本类型 */
  source_type: string;
  open_image_lazyload?: boolean;
  runtime_other_container_ports?: Array<number>;
}

export interface CreateCodeRevisionResponse {
  code?: number;
  data?: Array<CodeRevision>;
  error?: string;
}

export interface CreateConsulTriggerRequest {
  /** cluster of service */
  cluster: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface CreateConsulTriggerResponse {
  code?: number;
  data?: ConsulTriggerResponseData;
  error?: string;
}

export interface CreateDiagnosisRequest {
  /** cluster name */
  cluster: string;
  diagnosis_id?: string;
  end_at?: number;
  item_id?: string;
  item_type?: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  set_time_range?: boolean;
  start_at?: number;
}

export interface CreateDiagnosisResponse {
  code?: number;
  data?: Diagnose;
  error?: string;
}

export interface CreateFilterPluginsRequest {
  /** cluster name */
  cluster: string;
  name?: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** zip file binary */
  zip_file?: CreateFilterPluginsRequestZipFileMessage2;
  zip_file_size?: number;
}

export interface CreateFilterPluginsRequestZipFileMessage2 {}

export interface CreateFilterPluginsResponse {
  code?: number;
  data?: FilterPlugin;
  error?: string;
}

export interface CreateHttpTriggerRequest {
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  /** cluster of service */
  cluster: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** url prefix */
  url_prefix?: string;
  /** type of this version. Allow to be `revision` or `alias` */
  version_type?: string;
  /** value of version type. When `version_type` is `revision`, it should be an ID of revision. */
  version_value?: string;
  runtime?: string;
  'X-Jwt-Token'?: string;
}

export interface CreateHttpTriggerResponse {
  code?: number;
  data?: HttpTriggerResponse;
  error?: string;
}

export interface CreateMqTriggerByTypeRequest {
  batch_size?: number;
  batch_flush_duration_milliseconds?: number;
  description?: string;
  enabled?: boolean;
  envs?: Record<string, string>;
  function_id?: string;
  cell?: string;
  id?: string;
  image_version?: string;
  sdk_version?: string;
  image_alias?: string;
  ms_alarm_id?: Array<string>;
  mq_type?: string;
  max_retries_from_function_status?: number;
  msg_chan_length?: number;
  name?: string;
  need_auto_sharding?: boolean;
  num_of_mq_pod_to_one_func_pod?: number;
  options?: TriggerOptions;
  qps_limit?: number;
  region?: string;
  mq_region?: string;
  runtime_agent_mode?: boolean;
  dynamic_worker_thread?: boolean;
  replica_max_limit?: Record<string, number>;
  replica_min_limit?: Record<string, number>;
  replicas?: number;
  resource?: Resource;
  scale_enabled?: boolean;
  vertical_scale_enabled?: boolean;
  enable_static_membership?: boolean;
  workers_per_pod?: number;
  alarm_params?: AlarmParameters;
  request_timeout?: number;
  disable_infinite_retry_for_timeout?: boolean;
  initial_offset_start_from?: string;
  enable_mq_debug?: boolean;
  mq_logger_limit_size?: number;
  enable_backoff?: boolean;
  disable_backoff?: boolean;
  worker_v2_num_per_half_core?: number;
  enable_concurrency_filter?: boolean;
  enable_ipc_mode?: boolean;
  enable_traffic_priority_scheduling?: boolean;
  enable_pod_colocate_scheduling?: boolean;
  enable_global_rate_limiter?: boolean;
  enable_congestion_control?: boolean;
  allow_bytesuite_debug?: boolean;
  enable_dynamic_load_balance?: boolean;
  disable_smooth_wrr?: boolean;
  dynamic_load_balance_type?: string;
  replica_force_meet_partition?: boolean;
  scale_settings?: MQEventScaleSettings;
  hot_reload?: boolean;
  mq_msg_type?: string;
  status?: string;
  in_releasing?: boolean;
  mirror_region_filter?: string;
  enable_gctuner?: boolean;
  gctuner_percent?: number;
  retry_strategy?: string;
  max_retry_time?: number;
  qps_limit_time_ranges?: Array<QPSLimitTimeRanges>;
  limit_disaster_scenario?: number;
  enable_step_rate_limit?: boolean;
  rate_limit_step_settings?: RateLimitStepSettings;
  max_dwell_time_minute?: number;
  qps_auto_limit?: ConsumeMigrateAutoLimit;
  plugin_function_param?: PluginFunctionParam;
  enable_plugin_function?: boolean;
  enable_canary_update?: boolean;
  traffic_config?: Record<string, number>;
  is_auth_info_updated?: boolean;
  pod_type?: string;
  package?: string;
  enable_filter_congestion_control?: boolean;
  enable_congestion_control_cache?: boolean;
  caller?: string;
  service_id: string;
  cluster: string;
  trigger_type: string;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface CreateMqTriggerByTypeResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface CreateMQTriggerRequest {
  alarm_params?: CreateMQTriggerRequestAlarmParamsMessage2;
  allow_bytesuite_debug?: boolean;
  batch_size?: number;
  cell?: string;
  /** cluster of service */
  cluster: string;
  deployment_inactive?: boolean;
  description?: string;
  disable_backoff?: boolean;
  disable_smooth_wrr?: boolean;
  dynamic_load_balance_type?: string;
  dynamic_worker_thread?: boolean;
  enable_backoff?: boolean;
  enable_concurrency_filter?: boolean;
  enable_congestion_control?: boolean;
  enable_dynamic_load_balance?: boolean;
  enable_global_rate_limiter?: boolean;
  enable_ipc_mode?: boolean;
  enable_mq_debug?: boolean;
  enable_pod_colocate_scheduling?: boolean;
  enable_static_membership?: boolean;
  enable_traffic_priority_scheduling?: boolean;
  enabled?: boolean;
  envs?: Record<string, string>;
  function_id?: string;
  hot_reload?: boolean;
  id?: string;
  image_alias?: string;
  image_version?: string;
  initial_offset_start_from?: string;
  is_auth_info_updated?: boolean;
  max_retries_from_function_status?: number;
  mq_logger_limit_size?: number;
  mq_msg_type?: string;
  mq_region?: string;
  mq_type?: string;
  ms_alarm_id?: Array<string>;
  msg_chan_length?: number;
  name?: string;
  need_auto_sharding?: boolean;
  num_of_mq_pod_to_one_func_pod?: number;
  options?: TriggerOptions;
  plugin_function_param?: PluginFunctionParam;
  qps_limit?: number;
  region: string;
  replica_max_limit?: number;
  replica_min_limit?: number;
  replicas?: number;
  request_timeout?: number;
  resource?: ResourceLimit;
  runtime_agent_mode?: boolean;
  scale_enabled?: boolean;
  scale_settings?: MQEventScaleSettings;
  sdk_version?: string;
  /** ID of service */
  service_id: string;
  vertical_scale_enabled?: boolean;
  worker_v2_num_per_half_core?: number;
  workers_per_pod?: number;
  enable_plugin_function?: boolean;
  disable_infinite_retry_for_timeout?: boolean;
  mirror_region_filter?: string;
  enable_gctuner?: boolean;
  gctuner_percent?: number;
  retry_strategy?: string;
  max_retry_time?: number;
  qps_limit_time_ranges?: Array<QPSLimitTimeRanges>;
  rate_limit_step_settings?: RateLimitStepSettings;
  enable_step_rate_limit?: boolean;
  batch_flush_duration_milliseconds?: number;
  replica_force_meet_partition?: boolean;
  limit_disaster_scenario?: number;
  max_dwell_time_minute?: number;
  enable_canary_update?: boolean;
  traffic_config?: Record<string, number>;
  pod_type?: string;
  package?: string;
  qps_auto_limit?: ConsumeMigrateAutoLimit;
  enable_filter_congestion_control?: boolean;
  enable_congestion_control_cache?: boolean;
}

export interface CreateMQTriggerRequestAlarmParamsMessage2 {
  lag_alarm_threshold?: number;
}

export interface CreateMQTriggerResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface CreatePluginFunctionReleaseRequest {
  /** cluster name */
  cluster: string;
  /** id */
  id: string;
  mqevent_ids?: Array<string>;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface CreatePluginFunctionReleaseResponse {
  code?: number;
  data?: ApiResponseDataMessage2;
  error?: string;
}

export interface CreatePluginFunctionRevisionRequest {
  /** cluster name */
  cluster: string;
  description?: string;
  /** the environments of the plugin */
  environments?: Record<string, string>;
  /** the timeout time of the plugin init */
  init_timeout?: number;
  /** the name of the plugin used */
  plugin_name?: string;
  /** the version of the plugin used */
  plugin_version?: string;
  /** region name */
  region: string;
  /** the timeout time of the plugin request */
  request_timeout?: number;
  /** ID of service */
  service_id: string;
}

export interface CreatePluginFunctionRevisionResponse {
  code?: number;
  data?: PluginFunctionRevision;
  error?: string;
}

export interface CreateReleaseRequest {
  /** must be `default` for now */
  alias_name?: string;
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** the ratio of traffic of each rolling from old revision to new one */
  rolling_step?: number;
  /** ID of service */
  service_id: string;
  /** container one/two revision, the key is revision id, value is the traffic ratio, [A: 20, B: 80] for example */
  target_traffic_config?: Record<string, number>;
  /** zone level traffic setting */
  zone_traffic_config?: Record<string, MapMessage>;
  /** jwt token */
  'X-Jwt-Token'?: string;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface CreateReleaseResponse {
  code?: number;
  data?: Array<ReleaseResponseData>;
  error?: string;
}

export interface CreateRevisionRequest {
  /** cluster name */
  cluster: string;
  /** code revision number, server will generate when it is empty. 版本号 */
  code_revision_number?: string;
  /** code dependency */
  dependency?: Array<Dependency>;
  /** deploy method. 部署方式 */
  deploy_method?: string;
  description?: string;
  disable_build_install?: boolean;
  envs?: Record<string, MapMessage>;
  format_envs?: Record<string, Array<FormatEnvs>>;
  handler?: string;
  initializer?: string;
  lazyload?: boolean;
  name?: string;
  /** network mode, Optional values: empty string,bridge */
  network_mode?: string;
  /** region */
  region: string;
  run_cmd?: string;
  runtime?: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  /** ID of function to create revision */
  service_id: string;
  /** source of code revision. 代码版本 URI */
  source?: string;
  /** source type of code revision. 代码版本类型 */
  source_type?: string;
  open_image_lazyload?: boolean;
  runtime_other_container_ports?: Array<number>;
  /** jwt token */
  'X-Jwt-Token'?: string;
  host_uniq?: HostUniq;
}

export interface CreateRevisionResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface CreateScaleStrategyRequest {
  /** cluster of service */
  cluster: string;
  /** when the strategy will be effective */
  effective_time?: string;
  /** strategy is enabled or not */
  enabled?: boolean;
  /** when the strategy will be expired */
  expired_time?: string;
  /** function id, no need for post/patch method, it is a path param */
  function_id?: string;
  inner_strategy?: InnerStrategy;
  /** function id or mqevent id */
  item_id?: string;
  /** function or mqevent */
  item_type?: string;
  /** region, no need for post/patch method, it is a path param */
  region: string;
  /** ID of service */
  service_id: string;
  /** strategy id, no need for post/patch method, it is a path param */
  strategy_id?: string;
  /** strategy name */
  strategy_name?: string;
  /** only cron for now */
  strategy_type?: string;
  /** ReservedInstance or FrozenReservedInstance default is ReservedInstance */
  instance_type?: string;
}

export interface CreateScaleStrategyResponse {
  code?: number;
  data?: ScaleStrategy;
  error?: string;
}

export interface CreateServiceRequest {
  /** admins. 管理员 */
  admins?: string;
  /** restricted access, only open to administrators */
  async_mode?: boolean;
  /** authorizers. 授权人 */
  authorizers?: string;
  /** base image. 基础镜像 */
  base_image?: string;
  /** category of service. 服务类型 */
  category: string;
  /** use struct type to reference only. Value is JSON string. */
  dependency?: Array<Dependency>;
  /** deploy method. 部署方式 */
  deploy_method?: string;
  /** description of function. 服务描述, 原来的函数描述 */
  description: string;
  /** environment name. 多环境标识 */
  env_name?: string;
  /** name of function. 服务名称, 原来的函数名称 */
  name: string;
  need_approve?: boolean;
  /** origin of function, from bytefaas ori light(like qingfuwu), 服务的来源，除了 faas 也有可能是来自轻服务等 */
  origin?: string;
  /** the owner of service. 服务的 Owner */
  owner: string;
  /** protocol of service, such as TTHeader etc. */
  protocol: string;
  /** psm of service. 服务唯一标识 */
  psm: string;
  /** parent id of psm, only used in create, can not be updated through faas api. 服务树父节点 */
  psm_parent_id: number;
  /** language in runtime. 运行时语言. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  /** service level, could be P0 ~ P3. 服务等级 */
  service_level: string;
  /** service purpose. 服务用途 */
  service_purpose: string;
  /** source of code. 源码 */
  source?: string;
  /** type of source. 源码类型 */
  source_type?: string;
  /** subscribers. 订阅人 */
  subscribers?: Array<string>;
  /** template name of function code. 基于代码模板创建 */
  template_name?: string;
  online_mode?: boolean;
  /** scm pathinfo */
  plugin_scm_path?: string;
  /** size of code file, unit MB, need admin permission. 代码包大小, 单位 MB, 需要管理员权限 */
  code_file_size_mb?: number;
  /** disable alarm in env function, default to false. 泳道函数关闭报警, 默认为 false */
  disable_ppe_alarm?: boolean;
  language?: string;
  run_cmd?: string;
  image_lazy_load?: boolean;
  plugin_name?: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  health_check_path?: string;
  health_check_failure_threshold?: number;
  health_check_period?: number;
  runtime_other_container_ports?: Array<number>;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  net_queue?: string;
  ms_service_meta_params?: MSServiceMetaParams;
  mount_info?: Array<string>;
  disable_build_install?: boolean;
  lazyload?: boolean;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface CreateServiceResponse {
  code?: number;
  data?: ServiceResponse;
  error?: string;
}

export interface CreateTicketRequest {
  /** approved user. 审核人 */
  approved_by?: string;
  /** type of approved user. 审核用户类型 */
  approved_by_usertype?: string;
  /** release cluster, use default cluster when without it. 发布的集群, 不填则为默认集群 */
  cluster?: string;
  /** ID of used code revision, lower priority than use_latest_code_revision. 代码版本 ID, 用指定代码版本进行发布 */
  code_revision_id?: string;
  /** description of this release. 发布描述 */
  description?: string;
  format_target_traffic_config: Array<CreateTicketRequestFormatTargetTrafficConfigMessage>;
  format_zone_traffic_config?: Array<CreateTicketRequestFormatZoneTrafficConfigMessage>;
  /** release region. 发布的 region */
  region: string;
  /** release type. 发布类型 */
  release_type?: string;
  /** replica limit. 实例数，只用作第一次发布时需要。 */
  replica_limit?: Record<string, EmptyObject>;
  /** ID of revision, only works when rollback is true, lower priority than code_revision_id. 版本 ID, 回滚至某一个 revision */
  revision_id?: string;
  /** create ticket of rollback action. 回滚 */
  rollback?: boolean;
  /** rolling step. 滚动比例 */
  rolling_step?: number;
  /** ID of service */
  service_id: string;
  /** use latest code revision. 使用最新的代码版本进行发布 */
  use_latest_code_revision?: boolean;
  /** grey mqevent config. 灰度触发器配置 */
  grey_mqevent_config?: Array<GreyMQEvent>;
  /** the code config. 发布的代码配置 */
  code_source?: string;
  /** the mqevent release type. 触发器发布类型配置 */
  mqevent_release_type?: string;
  /** whether use pipeline to drive this ticket execution */
  is_pipeline_ticket?: boolean;
  /** pipeline template type */
  pipeline_template_type?: string;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface CreateTicketRequestFormatTargetTrafficConfigMessage {
  /** filled with revision ID, default to $LATEST */
  revision_id?: string;
  traffic_value?: number;
}

export interface CreateTicketRequestFormatZoneTrafficConfigMessage {
  zone?: string;
  zone_traffic_config?: Array<CreateTicketRequestFormatZoneTrafficConfigMessageZoneTrafficConfigMessage>;
}

export interface CreateTicketRequestFormatZoneTrafficConfigMessageZoneTrafficConfigMessage {
  /** filled with code revision ID, default to $LATEST */
  revision_id?: string;
  traffic_value?: number;
}

export interface CreateTicketResponse {
  code?: number;
  data?: Ticket;
  error?: string;
}

export interface CreateTimerTriggerRequest {
  cell?: string;
  /** cluster of service */
  cluster: string;
  concurrency_limit?: number;
  created_at?: string;
  cron?: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  payload?: string;
  /** region of service */
  region: string;
  retries?: number;
  scheduled_at?: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface CreateTimerTriggerResponse {
  code?: number;
  data?: TimerTrigger;
  error?: string;
}

export interface CreateTriggerBizData {
  /** timer or mqevent */
  trigger_type: string;
  created_by: string;
  timer_trigger_request_data?: CreateTimerTriggerRequest;
  mq_trigger_request_data?: CreateMQTriggerRequest;
  trigger_id?: string;
  region: string;
  cluster: string;
  service_id: string;
  function_id: string;
  bpm_orders: Array<TriggerBizDataBPMOrderData>;
  trigger_name: string;
}

export interface CreateTriggerDebugTplRequest {
  service_id: string;
  /** 模板类型 custom/official */
  tpl_type?: string;
  cloud_event?: Array<TriggerDebugCloudEvent>;
  name: string;
  trigger_type: string;
  /** 消息类型 cloudevent/native */
  msg_type: string;
  native_event?: Array<TriggerDebugNativeEvent>;
}

export interface CreateTriggerDebugTplResponse {
  code: number;
  data: TriggerDebugTplItem;
  error: string;
}

/** should set this object if the type is cron */
export interface CronStrategy {
  /** required if bpm_status is create_pending or update_pending */
  bpm_id?: number;
  /** could be create_pending, update_pending, in_effect, rejected or empty */
  bpm_status?: string;
  /** could be daily_interval, weekly_interval, monthly_interval */
  cron_interval?: string;
  /** which days should be effective if it is monthly_interval, 1 - 31 */
  day_of_monthly?: Array<number>;
  /** which days should be effective if it is weekly_interval, 0 - 6 */
  day_of_weekly?: Array<number>;
  /** how long the strategy will be effective */
  duration_minutes?: number;
  /** how many replicas should be keep in each zone */
  min_zone_replicas?: Record<string, number>;
  start_time?: CronStrategyStartTimeMessage2;
  update_config?: UpdateConfig;
}

export interface CronStrategyStartTimeMessage2 {
  /** the hours to start */
  hours?: number;
  /** the minutes to start */
  minutes?: number;
}

export interface CrossRegionMigrationMeta {
  psm?: string;
  migration_enabled?: boolean;
  vefaas_clusters?: Array<CrossRegionVefaasCluster>;
}

export interface CrossRegionVefaasCluster {
  function_id?: string;
  region?: string;
  cluster_name?: string;
}

export interface DataMessage114 {
  additional_data?: DataMessage114AdditionalDataMessage2;
  data?: string;
}

export interface DataMessage114AdditionalDataMessage2 {
  cpuUsage?: string;
  executionDuration?: string;
  memoryUsage?: string;
  request?: string;
  response?: string;
}

export interface DataMessage130 {
  webshell_link?: string;
}

export interface DataMessage18 {}

export interface DataMessage194 {
  abase_binlog?: boolean;
  consul?: boolean;
  http?: boolean;
  mqevents?: boolean;
  timer?: boolean;
  tos?: boolean;
}

export interface DataMessage199 {
  webshell_link?: string;
}

export interface DataMessage2 {
  /** Lark Group ID */
  ID?: string;
  /** Lark Group Name */
  Name?: string;
}

export interface DataMessage20 {
  format_regions_backend?: Array<DataMessage20FormatRegionsBackendMessage>;
}

export interface DataMessage20FormatRegionsBackendMessage {
  backend?: boolean;
  frontend?: boolean;
  region?: string;
}

export interface DataMessage22 {
  env?: string;
  function_id?: string;
  psm?: string;
  region?: string;
  resource?: DataMessage22ResourceMessage2;
}

export interface DataMessage22ResourceMessage2 {
  limit?: DataMessage22ResourceMessage2LimitMessage2;
  quota?: DataMessage22ResourceMessage2QuotaMessage2;
  usage?: DataMessage22ResourceMessage2UsageMessage2;
}

export interface DataMessage22ResourceMessage2LimitMessage2 {
  cpu?: DataMessage22ResourceMessage2LimitMessage2CpuMessage2;
  mem?: DataMessage22ResourceMessage2LimitMessage2MemMessage2;
}

export interface DataMessage22ResourceMessage2LimitMessage2CpuMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage22ResourceMessage2LimitMessage2MemMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage22ResourceMessage2QuotaMessage2 {
  cpu?: DataMessage22ResourceMessage2QuotaMessage2CpuMessage2;
  mem?: DataMessage22ResourceMessage2QuotaMessage2MemMessage2;
}

export interface DataMessage22ResourceMessage2QuotaMessage2CpuMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage22ResourceMessage2QuotaMessage2MemMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage22ResourceMessage2UsageMessage2 {
  cpu?: DataMessage22ResourceMessage2UsageMessage2CpuMessage2;
  mem?: DataMessage22ResourceMessage2UsageMessage2MemMessage2;
}

export interface DataMessage22ResourceMessage2UsageMessage2CpuMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage22ResourceMessage2UsageMessage2MemMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage24 {
  reserved_replica_threshold?: number;
  resource_statistics?: DataMessage24ResourceStatisticsMessage2;
}

export interface DataMessage24ResourceStatisticsMessage2 {
  cpu?: DataMessage24ResourceStatisticsMessage2CpuMessage2;
  mem?: DataMessage24ResourceStatisticsMessage2MemMessage2;
}

export interface DataMessage24ResourceStatisticsMessage2CpuMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage24ResourceStatisticsMessage2MemMessage2 {
  avg?: number;
  max?: number;
  min?: number;
}

export interface DataMessage5 {
  /** MQ trigger announcement template content */
  content?: string;
}

export interface DataMessage55 {
  region: string;
}

export interface DataMessage71 {
  created_at?: string;
  event_type?: string;
  execute_end_time?: string;
  execute_start_time?: string;
  execution_duration_str?: string;
  finished_time?: string;
  function_id?: string;
  kibana_link?: string;
  request_id?: string;
  response_meta?: AsyncRequestRecordResponseResponseMetaMessage2;
  revision_id?: string;
  task_status?: string;
  updated_at?: string;
  user_invoke_time?: string;
  pod_name?: string;
}

export interface DataMessage85 {
  status?: string;
}

export interface DebugFunctionRequest {
  batch?: boolean;
  /** cluster name */
  cluster: string;
  data?: string;
  extensions?: Record<string, EmptyObject>;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  type?: string;
  verbose?: boolean;
  event_name?: string;
}

export interface DebugFunctionResponse {
  code?: number;
  data?: DataMessage114;
  error?: string;
}

export interface DeleteBurstProtectorRequest {
  /** Delete all burst protectors */
  is_all?: boolean;
  /** List of PSMs to delete */
  psms?: string;
  /** Single PSM to delete */
  psm?: string;
  /** Cluster to delete */
  cluster?: string;
}

export interface DeleteBurstProtectorResponse {
  /** Response code */
  code: number;
  /** Error message, if any */
  error?: string;
  /** Success or failure summary */
  message?: string;
}

export interface DeleteClusterRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** service ID */
  service_id: string;
  /** soft delete cluster if set "true" */
  soft?: boolean;
  /** reason for soft deletion */
  reason?: string;
  'X-Jwt-Token'?: string;
}

export interface DeleteClusterResponse {
  code?: number;
  data?: ClusterResponseData;
  error?: string;
}

export interface DeleteConsulTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** trigger_id of function */
  trigger_id: string;
  'X-Jwt-Token'?: string;
}

export interface DeleteConsulTriggerResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface DeleteDiagnosisByIDRequest {
  /** cluster name */
  cluster: string;
  /** diagnosis id */
  diagnosis_id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface DeleteDiagnosisByIDResponse {
  code?: number;
  data?: Diagnose;
  error?: string;
}

export interface DeleteFilterPluginsRequest {
  /** cluster name */
  cluster: string;
  /** id */
  filter_plugin_id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface DeleteFilterPluginsResponse {
  code?: number;
  data?: FilterPlugin;
  error?: string;
}

export interface DeleteFunctionRevisionRequest {
  /** cluster */
  cluster: string;
  /** region */
  region: string;
  /** Number of revision */
  revision_number: number;
  /** ID of service */
  service_id: string;
}

export interface DeleteFunctionRevisionResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface DeleteHttpTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** ID of trigger */
  trigger_id: string;
  'X-Jwt-Token'?: string;
}

export interface DeleteHttpTriggerResponse {
  code?: number;
  data?: HttpTriggerResponse;
  error?: string;
}

export interface DeleteMqTriggerByTypeRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** trigger id */
  trigger_id: string;
  /** trigger type */
  trigger_type: string;
  caller?: string;
  consumer_group?: string;
  eventbus_name?: string;
  'X-Jwt-Token'?: string;
}

export interface DeleteMqTriggerByTypeResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface DeletePluginFunctionRevisionRequest {
  /** cluster name */
  cluster: string;
  /** id */
  id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface DeletePluginFunctionRevisionResponse {
  code?: number;
  data?: PluginFunctionRevision;
  error?: string;
}

export interface DeleteScaleStrategyRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the strategy you want to delete */
  strategy_id: string;
}

export interface DeleteScaleStrategyResponse {
  code?: number;
  data?: ScaleStrategy;
  error?: string;
}

export interface DeleteServiceRequest {
  /** id of service */
  service_id: string;
  /** soft delete service if set "true" */
  soft?: boolean;
  /** reason for soft deletion */
  reason?: string;
  'X-Jwt-Token'?: string;
}

export interface DeleteServiceResponse {
  code?: number;
  data?: ServiceResponse;
  error?: string;
}

export interface DeleteTimerTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the timer trigger you want to get */
  timer_id: string;
  'X-Jwt-Token'?: string;
}

export interface DeleteTimerTriggerResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface DeleteTriggerDebugTplRequest {
  service_id: string;
  tpl_id: string;
}

export interface DeleteTriggerDebugTplResponse {
  code: number;
  data: boolean;
  error: string;
}

export interface Dependency {
  name?: string;
  sub_path?: string;
  type?: string;
  version?: string;
}

export interface Diagnose {
  created_at?: string;
  diagnosis_id?: string;
  diagnosis_items?: Array<DiagnoseDiagnosisItemsMessage>;
  end_at?: number;
  function_id?: string;
  item_id?: string;
  item_type?: string;
  language?: string;
  meta_synced?: boolean;
  meta_synced_at?: string;
  set_time_range?: boolean;
  start_at?: number;
  updated_at?: string;
}

export interface DiagnoseDiagnosisItemsMessage {
  content?: string;
  hint?: string;
  result?: string;
}

export interface DownloadCodeRevisionPackageRequest {
  revision_number: string;
  /** ID of service */
  service_id: string;
}

export interface DownloadCodeRevisionPackageResponse {
  code?: number;
  data?: ApiResponseDataMessage2;
  error?: string;
}

export interface DownloadFilterPluginsRequest {
  /** cluster name */
  cluster: string;
  /** id */
  filter_plugin_id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface DownloadFilterPluginsResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface DownloadRevisionCodeRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  revision_number: number;
  /** ID of service */
  service_id: string;
}

export interface DownloadRevisionCodeResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface DownloadTemplateByNameRequest {
  template_name: string;
}

export interface DownloadTemplateByNameResponse {}

export interface DynamicOvercommitSettings {
  disable_dynamic_overcommit?: boolean;
  reserved_overcommit_ratio?: number;
  elastic_overcommit_ratio?: number;
}

export interface Edge {
  /** source node */
  from?: number;
  /** target node */
  to?: number;
}

export interface EmergencyScaleRequest {
  service_id?: string;
  region?: string;
  cluster?: string;
  min_replicas?: Record<string, number>;
  scale_duration_minutes?: number;
}

export interface EmergencyScaleResponse {
  code?: number;
  data?: EmergencyScaleResult;
  error?: string;
}

export interface EmergencyScaleResult {
  function_id?: string;
  cluster?: string;
  region?: string;
  min_replicas?: Record<string, number>;
  expect_keep_min_begin_at?: string;
  expect_keep_min_end_at?: string;
}

export interface EmptyObject {}

export interface ErrorHelp {
  /** 是否需要展示启动日志用于排查问题 */
  show_start_logs?: boolean;
}

export interface EsLog {
  content?: string;
  datetime?: string;
  function_id?: string;
  log_class?: string;
  log_type?: string;
  pod_ip?: string;
  pod_name?: string;
  revision_id?: string;
}

export interface EtcdSetting {
  name: string;
  value: string;
  updated_by?: string;
  updated_at?: string;
}

export interface EventBridgeTrigger {
  project_uid: string;
  rule_uid: string;
  rule_name: string;
  enabled: boolean;
  event_bridge_link: string;
  event_source: string;
  event_types: Array<string>;
  created_at: string;
  updated_at: string;
}

export interface EventBusOptions {
  eventbus_name?: string;
  dispatcher_cluster?: string;
  consumer_group?: string;
  consumer_num?: number;
  retry_interval?: number;
  orderly?: boolean;
  sub_expr?: string;
  cluster?: string;
  type?: string;
  topic?: string;
  event_bus_topic_infos?: Array<EventBusTopicInfo>;
}

export interface EventBusTopicInfo {
  region?: string;
  cluster?: string;
  type?: string;
  topic?: string;
}

export interface EventBusTopicPreviewParams {
  /** eventbus event name */
  event: string;
  /** 0-时间范围 1-offset 2-key */
  search_type: number;
  start_time?: Int64;
  end_time?: Int64;
  start_offset?: Int64;
  end_offset?: Int64;
  partition?: string;
  msg_key?: string;
  storage_descriptor?: Array<string>;
}

export interface FaaSBaseImageDesc {
  image_id?: string;
  build_time_stamp?: string;
  build_runtime?: string;
  desc?: string;
}

export interface FaaSBaseImageInfo {
  build_time_stamp: string;
  image_id: string;
  runtime: string;
  /** repo name */
  runtime_agent: ScmVersionInfo;
  /** repo name */
  runtime_agent_dp: ScmVersionInfo;
}

export interface FilterPlugin {
  created_at?: string;
  file_size_mb?: number;
  function_id?: string;
  id?: string;
  name?: string;
  source?: string;
  source_type?: string;
  updated_at?: string;
  updated_user?: string;
}

export interface FormatEnvs {
  env_key: string;
  env_value: string;
}

export interface FormattedPreferCluster {
  zone?: string;
  prefer_cluster?: string;
}

export interface FormatTrafficConfig {
  revision_id?: string;
  traffic_value?: number;
}

export interface FormatZoneTrafficConfig {
  zone?: string;
  zone_traffic_config?: Array<FormatTrafficConfig>;
}

export interface FuncConcurrencyScaleSettings {
  concurrency_scale_out_threshold?: number;
  concurrency_scale_in_threshold?: number;
  concurrency_scale_target?: number;
  concurrency_continuous_down_dur_sec?: number;
}

export interface FuncCPUScaleSettings {
  cpu_scale_out_threshold?: number;
  cpu_scale_in_threshold?: number;
  cpu_scale_target?: number;
  cpu_scale_in_target?: number;
}

export interface FuncFastScaleSettings {
  enable_fast_scale?: boolean;
  unhealthy_pod_rate_to_scale?: number;
}

export interface FuncLagScaleSettings {
  lag_scale_set?: string;
}

export interface FuncMEMScaleSettings {
  mem_scale_out_threshold?: number;
  mem_scale_in_threshold?: number;
  mem_scale_target?: number;
}

export interface FuncPredictiveScalingSettings {
  enable_predictive_scaling?: boolean;
}

export interface FuncScaleSettingApiResponse {
  code?: number;
  data?: FuncScaleSettingResponse;
  error?: string;
}

export interface FuncScaleSettingResponse {
  function_id?: string;
  cluster?: string;
  region?: string;
  scale_threshold_set?: ScaleThresholdsSet;
  lag_scale_set?: string;
  overload_fast_scale_set?: OverloadFastScaleSetting;
}

export interface FuncScaleSettings {
  scale_set_name?: string;
  cpu_scale_settings?: FuncCPUScaleSettings;
  mem_scale_settings?: FuncMEMScaleSettings;
  concurrency_scale_settings?: FuncConcurrencyScaleSettings;
  fast_scale_settings?: FuncFastScaleSettings;
  predictive_scaling_setting?: FuncPredictiveScalingSettings;
  lag_scale_settings?: FuncLagScaleSettings;
  cpu_zone_scale_settings?: Record<string, FuncCPUScaleSettings>;
}

export interface FunctionMetaParams {
  adaptive_concurrency_mode?: string;
  admins?: string;
  async_mode?: boolean;
  auth_enable?: boolean;
  authorizers?: string;
  base_image?: string;
  category?: string;
  code_file_size_mb?: number;
  cold_start_disabled?: boolean;
  cold_start_sec?: number;
  cors_enable?: boolean;
  dependency?: Array<Dependency>;
  deploy_method?: string;
  description?: string;
  disable_build_install?: boolean;
  disable_ppe_alarm?: boolean;
  enable_scale_optimise?: boolean;
  enable_scale_strategy?: boolean;
  env_name?: string;
  envs?: Record<string, MapMessage>;
  exclusive_mode?: boolean;
  format_envs?: Record<string, Array<FormatEnvs>>;
  handler?: string;
  initializer?: string;
  initializer_sec?: number;
  language?: string;
  latency_sec?: number;
  lazyload?: boolean;
  max_concurrency?: number;
  memory_mb?: number;
  name?: string;
  need_approve?: boolean;
  origin?: string;
  owner?: string;
  plugin_name?: string;
  protocol?: string;
  psm?: string;
  psm_parent_id?: number;
  resource_limit?: ResourceLimit;
  run_cmd?: string;
  runtime?: string;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  service_level?: string;
  service_purpose?: string;
  source?: string;
  source_type?: string;
  template_name?: string;
  throttle_log_bytes_per_sec?: number;
  throttle_log_enabled?: boolean;
  throttle_stderr_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  trace_enable?: boolean;
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  enable_runtime_file_log?: boolean;
  enable_runtime_console_log?: boolean;
  enable_runtime_stream_log?: boolean;
  enable_runtime_es_log?: boolean;
  enable_runtime_json_log?: boolean;
  enable_system_stream_log?: boolean;
  enable_system_es_log?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
}

export interface FunctionResponseData {
  id?: string;
  service_id?: string;
  name?: string;
  description?: string;
  admins?: string;
  owner?: string;
  psm?: string;
  runtime?: string;
  language?: string;
  run_cmd?: string;
  base_image?: string;
  origin?: string;
  category?: string;
  disable_ppe_alarm?: boolean;
  initializer_sec?: number;
  latency_sec?: number;
  cold_start_sec?: number;
  cold_start_disabled?: boolean;
  need_approve?: boolean;
  auth_enable?: boolean;
  trace_enable?: boolean;
  authorizers?: string;
  subscribers?: Array<string>;
  envs?: Record<string, Record<string, string>>;
  format_envs?: Record<string, Array<FormatEnvs>>;
  memory_mb?: number;
  code_file_size_mb?: number;
  max_concurrency?: number;
  adaptive_concurrency_mode?: string;
  exclusive_mode?: boolean;
  async_mode?: boolean;
  cors_enable?: boolean;
  disable_build_install?: boolean;
  max_revision_number?: number;
  ms_register_suc?: boolean;
  enable_runtime_file_log?: boolean;
  enable_runtime_console_log?: boolean;
  enable_runtime_stream_log?: boolean;
  enable_runtime_es_log?: boolean;
  enable_runtime_json_log?: boolean;
  enable_system_stream_log?: boolean;
  enable_system_es_log?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  lazyload?: boolean;
  plugin_name?: string;
  plugin_scm_id?: number;
  env_name?: string;
  replica_limit?: Record<string, Record<string, PodReplicaLimit>>;
  resource_limit?: Resource;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  enable_scale_optimise?: boolean;
  enable_scale_strategy?: boolean;
  source_type?: string;
  source?: string;
  dependency?: Array<Dependency>;
  global_kv_namespace_ids?: Array<string>;
  local_cache_namespace_ids?: Array<string>;
  protocol?: string;
  argos_link?: string;
  created_at?: string;
  updated_at?: string;
  revision_id?: string;
  net_queue?: string;
  mount_info?: Array<string>;
}

export interface FunctionScaleRecordListItem {
  record_id: string;
  request_id: string;
  function_id: string;
  cluster: string;
  region: string;
  cell: string;
  zone: string;
  deploy_name: string;
  effect_strategy: string;
  scale_at: string;
  scale_operation: string;
  replicas_from: Int64;
  replicas_to: Int64;
  detail_reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  env_name: string;
  psm: string;
  mq_app_replicas_from: Record<string, Int64>;
  mq_app_replicas_to: Record<string, Int64>;
}

export interface FunctionScaleSettings {
  scale_set_name?: string;
  concurrency_scale_settings?: ConcurrencyScaleSettings;
  cpu_scale_settings?: CpuScaleSettings;
  mem_scale_settings?: MEMScaleSettings;
  fast_scale_settings?: FuncFastScaleSettings;
  predictive_scaling_setting?: FuncPredictiveScalingSettings;
  lag_scale_settings?: FuncLagScaleSettings;
}

export interface FunctionTemplate {
  description?: string;
  document?: string;
  language?: string;
  name?: string;
  protocol?: string;
  /** runtime. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  source_location?: string;
  template_author?: string;
}

export interface getAllAdministratorRequest {}

export interface GetAllAdministratorResponse {
  code?: number;
  data?: Array<string>;
  error?: string;
}

export interface GetAllServiceByPsmRequest {
  /** PSM of service */
  psm: string;
  no_auth_info?: string;
}

export interface GetAllServiceByPsmResponse {
  code?: number;
  data?: Array<ServiceResponse>;
  error?: string;
}

export interface GetAllTriggersRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
  /** split mqevents into eventbus, default to false */
  split_eventbus?: string;
  /** include prod service's mqtrigger when set to true, only works when this service is env services, e.g.: boe-xx/ppe-xx */
  with_env_trigger?: string;
  /** if true, will not return event_bridge type trigger */
  not_show_eb_trigger?: string;
  'X-Jwt-Token'?: string;
}

export interface GetAllTriggersResponse {
  code?: number;
  data?: AllTriggers;
  error?: string;
}

export interface GetAsyncRequestRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the request id you want */
  'x-bytefaas-request-id': string;
}

export interface GetAsyncRequestResponse {
  code?: number;
  data?: AsyncRequestRecordResponse;
  error?: string;
}

export interface GetBatchTicketDetailByIDRequest {
  /** Parent ID of a ticket, ie, the ID of a batch ticket */
  id: string;
}

export interface GetBatchTicketDetailByIDResponse {
  code?: number;
  data?: BatchTicket;
  error?: string;
}

export interface GetBurstProtectorSwitchRequest {
  /** PSM to fetch */
  psm?: string;
  /** Cluster to fetch */
  cluster?: string;
}

export interface GetBurstProtectorSwitchResponse {
  /** Response code */
  code: number;
  /** Error message, if any */
  error?: string;
  /** Burst protector configurations */
  data?: Array<BurstProtectorWithMetas>;
}

export interface GetClusterAlarmRequest {
  /** cluster */
  cluster: string;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetClusterAlarmResponse {
  code?: number;
  data?: Array<Alarm>;
  error?: string;
}

export interface GetClusterAllMqTriggerInstancesRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetClusterAllMqTriggerInstancesResponse {
  code?: number;
  data?: Record<string, Array<MqTriggerInstance>>;
  error?: string;
}

export interface GetClusterAutoMeshRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetClusterAutoMeshResponse {
  code?: number;
  data?: AutoMeshParams;
  error?: string;
}

export interface GetClusterDeployedStatusRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetClusterDeployedStatusResponse {
  code?: number;
  data?: DataMessage85;
  error?: string;
}

export interface GetClusterListByPsmRequest {
  env: string;
  psm: string;
  region: string;
}

export interface GetClusterListByPsmResponse {
  code?: number;
  data?: Array<ClusterResponseData>;
  error?: string;
}

export interface GetClusterRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** whether use argos iframe */
  'use-argos-iframe'?: boolean;
  /** with verbose data */
  verbose?: boolean;
  'X-Jwt-Token'?: string;
}

export interface GetClusterResponse {
  code?: number;
  data?: ClusterResponseData;
  error?: string;
}

export interface GetClusterRevisionsRequest {
  /** cluster name */
  cluster: string;
  /** description */
  description?: string;
  /** format response */
  format?: boolean;
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
  /** region */
  region: string;
  /** ID of function to create revision */
  service_id: string;
  /** true or false */
  with_status?: string;
  'X-Jwt-Token'?: string;
}

export interface GetClusterRevisionsResponse {
  code?: number;
  data?: Array<Revision>;
  error?: string;
}

export interface GetClustersListRequest {
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** with verbose data */
  verbose?: boolean;
  'X-Jwt-Token'?: string;
}

export interface GetClustersListResponse {
  code?: number;
  data?: Array<ClusterResponseData>;
  error?: string;
}

export interface GetClustersListWithPaginationRequest {
  /** cluster name */
  cluster?: string;
  /** limit for per page */
  limit?: number;
  /** offset */
  offset?: number;
  /** region name */
  region?: string;
  /** get released cluster in resource_lit page */
  resource_list?: boolean;
  /** fuzzy search in cluster id and cluster name */
  search?: string;
  /** ID of service */
  service_id: string;
  /** with verbose data */
  verbose?: boolean;
  /** filter soft deleted cluster */
  soft_deleted?: boolean;
}

export interface GetClustersListWithPaginationResponse {
  code?: number;
  data?: Array<ClusterResponseData>;
  error?: string;
}

export interface GetCodeRevisionByNumberRequest {
  /** Number of revision */
  revision_number: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetCodeRevisionByNumberResponse {
  code?: number;
  data?: CodeRevision;
  error?: string;
}

export interface GetCodeRevisionsRequest {
  /** limit in pagination */
  limit?: string;
  /** offset in pagination */
  offset?: string;
  /** ID of service */
  service_id: string;
}

export interface GetCodeRevisionsResponse {
  code?: number;
  data?: Array<CodeRevision>;
  error?: string;
}

export interface GetConsulTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** trigger_id of function */
  trigger_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetConsulTriggerResponse {
  code?: number;
  data?: ConsulTriggerResponseData;
  error?: string;
}

export interface GetCrossRegionMigrationRequest {
  psm: string;
}

export interface GetCrossRegionMigrationResponse {
  code?: number;
  data?: CrossRegionMigrationMeta;
  error?: string;
}

export interface GetDeployedRegionsRequest {
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetDeployedRegionsResponse {
  code?: number;
  data?: Array<DataMessage55>;
  error?: string;
}

export interface GetDiagnosisByIDRequest {
  /** cluster name */
  cluster: string;
  /** diagnosis id */
  diagnosis_id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetDiagnosisByIDResponse {
  code?: number;
  data?: Diagnose;
  error?: string;
}

export interface GetDiagnosisRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetDiagnosisResponse {
  code?: number;
  data?: Array<Diagnose>;
  error?: string;
}

export interface GetFilterPluginsDetailRequest {
  /** cluster name */
  cluster: string;
  /** id */
  filter_plugin_id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetFilterPluginsDetailResponse {
  code?: number;
  data?: FilterPlugin;
  error?: string;
}

export interface GetFilterPluginsRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  offset?: number;
  limit?: number;
}

export interface GetFilterPluginsResponse {
  code?: number;
  data?: Array<FilterPlugin>;
  error?: string;
}

export interface GetFunctionResourcePackagesRequest {
  is_plugin_function?: boolean;
  is_worker?: boolean;
  runtime?: string;
  region?: string;
  cluster?: boolean;
  category?: string;
}

export interface GetFunctionResourcePackagesResponse {
  code?: number;
  data?: Array<ResourceLimitWithAlias>;
  error?: string;
}

export interface GetFunctionRevisionRequest {
  /** cluster */
  cluster: string;
  /** format response */
  format: boolean;
  /** region */
  region: string;
  /** Number of revision */
  revision_number: number;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetFunctionRevisionResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface GetFunctionScaleRecordListReq {
  service_id: string;
  region: string;
  offset?: string;
  limit?: string;
  /** second level timestamp */
  start_time?: string;
  /** second level timestamp */
  end_time?: string;
  cluster?: string;
  strategy?: string;
}

export interface GetFunctionScaleRecordListRes {
  code: number;
  data: Array<FunctionScaleRecordListItem>;
  error: string;
}

export interface GetFunctionScaleThresholdsSettingRequest {
  service_id?: string;
  region?: string;
  cluster?: string;
}

export interface getFunctionTemplatesRequest {}

export interface GetFunctionTemplatesResponse {
  code?: number;
  data?: Array<FunctionTemplate>;
  error?: string;
}

export interface GetGlobalPluginFunctionsRequest {
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
}

export interface GetGlobalPluginVersionsRequest {
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
  /** name of plugin */
  plugin_name: string;
  /** ID of service */
  service_id: string;
}

export interface GetHttpTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** ID of trigger */
  trigger_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetHttpTriggerResponse {
  code?: number;
  data?: HttpTriggerResponse;
  error?: string;
}

export interface GetHttpTriggersRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetHttpTriggersResponse {
  code?: number;
  data?: Array<HttpTriggerResponse>;
  error?: string;
}

export interface GetICMBaseImagesListRequest {}

export interface GetICMBaseImagesListResponse {
  code?: number;
  error?: string;
  data?: Array<ICMBaseImage>;
}

export interface GetInstancesLogsRequest {
  /** cluster name */
  cluster: string;
  podname: string;
  /** region name */
  region: string;
  revision_id?: string;
  /** ID of service */
  service_id: string;
  zone: string;
}

export interface GetInstancesLogsResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface GetInstancesPodInfoRequest {
  podname: string;
  /** region name */
  region: string;
  zone: string;
  cell?: string;
}

export interface GetInstancesPodInfoResponse {
  code?: number;
  data?: PodInfo;
  error?: string;
}

export interface GetInstancesRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetInstancesResponse {
  code?: number;
  data?: Array<Instance>;
  error?: string;
}

export interface GetInstancesWebshellRequest {
  /** cluster name */
  cluster: string;
  podname: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  zone: string;
}

export interface GetInstancesWebshellResponse {
  code?: number;
  data?: DataMessage199;
  error?: string;
}

export interface getLarkBotChatGroupsRequest {}

export interface GetLarkBotChatGroupsResponse {
  code?: number;
  data?: Array<DataMessage2>;
  error?: string;
}

export interface GetLatestReleaseRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetLatestReleaseResponse {
  code?: number;
  data?: ReleaseResponseData;
  error?: string;
}

export interface GetLatestRevisionRequest {
  /** cluster */
  cluster: string;
  /** format response */
  format?: boolean;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetLatestRevisionResponse {
  code?: number;
  data?: Array<LatestRevisionResponseData>;
  error?: string;
}

export interface GetLogsRequest {
  advanced?: boolean;
  ascend?: boolean;
  /** cluster name */
  cluster: string;
  from?: string;
  include_system?: boolean;
  log_type: string;
  pod_ip?: string;
  pod_name?: string;
  /** region name */
  region: string;
  revision_id?: string;
  search?: string;
  /** ID of service */
  service_id: string;
  size?: number;
  to?: string;
}

export interface GetLogsResponse {
  code?: number;
  data?: Array<EsLog>;
  error?: string;
}

export interface GetMqClustersRequest {
  mq_type: string;
  region: string;
  'X-Jwt-Token'?: string;
}

export interface GetMqClustersResponse {
  code?: number;
  data?: Record<string, Record<string, Array<string>>>;
  error?: string;
}

export interface GetMQeventAdvancedConfigRequest {
  /** faas cluster region */
  region?: string;
}

export interface GetMQeventAdvancedConfigResponse {
  code?: number;
  error?: string;
  data?: Array<MQEventAdvancedConfigData>;
}

export interface GetMQEventResourceRequest {
  /** ID of service */
  service_id: string;
  /** Target env name */
  env?: string;
}

export interface GetMqTriggerByTypeRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** trigger id */
  trigger_id: string;
  /** trigger type */
  trigger_type: string;
  'X-Jwt-Token'?: string;
}

export interface GetMqTriggerByTypeResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface GetMqTriggerInstancesRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** mq trigger id */
  trigger_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetMqTriggerInstancesResponse {
  code?: number;
  data?: Array<MqTriggerInstance>;
  error?: string;
}

export interface GetMqTriggerInstancesWebshellRequest {
  /** cluster name */
  cluster: string;
  podname: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** mq trigger id */
  trigger_id: string;
  zone: string;
}

export interface GetMqTriggerInstancesWebshellResponse {
  code?: number;
  data?: DataMessage130;
  error?: string;
}

export interface GetMQTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** filter enable plugin function mq triggers */
  enable_plugin_function?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** filter mq triggers by plugin function version */
  plugin_function_version?: string;
}

export interface GetMQTriggerResponse {
  code?: number;
  data?: Array<GlobalMQEventTriggerResponseData>;
  error?: string;
}

export interface GetMQTriggerScaleRecordListReq {
  service_id: string;
  region: string;
  offset?: string;
  limit?: string;
  /** second level timestamp */
  start_time?: string;
  /** second level timestamp */
  end_time?: string;
  cluster?: string;
  strategy?: string;
  search?: string;
}

export interface GetMQTriggerScaleRecordListRes {
  code: number;
  data: Array<MQTriggerScaleRecordListItem>;
  error: string;
}

export interface GetMQTriggerScaleThresholdSetRequest {
  service_id: string;
  region: string;
  cluster: string;
  trigger_id: string;
}

export interface GetMQTriggerScaleThresholdSetResponse {
  code: number;
  data: MQTriggerScaleThresholdData;
  error: string;
}

export interface GetMQTriggersListWithPaginationRequest {
  /** cluster name */
  cluster?: string;
  /** limit for per page */
  limit?: number;
  /** offset */
  offset?: number;
  /** region name */
  region?: string;
  /** fuzzy search in cluster id and cluster name */
  search?: string;
  /** ID of service */
  service_id: string;
}

export interface GetMQTriggersListWithPaginationResponse {
  code?: number;
  data?: Array<GlobalMQEventTriggerResponseData>;
  error?: string;
}

export interface getMQTriggerTemplateRequest {}

export interface GetMQTriggerTemplateResponse {
  code?: number;
  data?: DataMessage5;
  error?: string;
}

export interface GetOnlineCodeRevisionRequest {
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetOnlineCodeRevisionResponse {
  code?: number;
  data?: Record<string, OnlineCodeRevision>;
  error?: string;
}

export interface GetOnlineRevisionRequest {
  /** cluster */
  cluster: string;
  /** format response */
  format?: boolean;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetOnlineRevisionResponse {
  code?: number;
  data?: Array<OnlineRevision>;
  error?: string;
}

export interface GetPackageListRequest {
  region?: string;
}

export interface GetPackageListResponse {
  code?: number;
  data?: Array<Package>;
  error?: string;
}

export interface GetPluginFunctionRevisionDetailRequest {
  /** cluster name */
  cluster: string;
  /** id */
  id: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetPluginFunctionRevisionDetailResponse {
  code?: number;
  data?: PluginFunctionRevisionDetail;
  error?: string;
}

export interface GetPluginFunctionRevisionsRequest {
  /** cluster name */
  cluster: string;
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetPluginFunctionRevisionsResponse {
  code?: number;
  data?: Array<PluginFunctionRevision>;
  error?: string;
}

export interface GetPluginFunctionsRequest {
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
  /** ID of service */
  service_id: string;
}

export interface GetPluginFunctionsResponse {
  code?: number;
  data?: Array<PluginFunction>;
  error?: string;
}

export interface GetPluginVersionsRequest {
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
  /** name of plugin */
  plugin_name: string;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetPluginVersionsResponse {
  code?: number;
  data?: Array<PluginVersion>;
  error?: string;
}

export interface GetRealtimeResourceUsageRequest {
  /** get all regions */
  all_region?: boolean;
  /** Target env name */
  env?: string;
  /** psm */
  psm?: string;
  /** Target region name */
  region?: string;
}

export interface GetRealtimeResourceUsageResponse {
  code?: number;
  data?: Array<GetResourceRealtimeClusterData>;
  error?: string;
}

export interface GetRegionalMetaRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface GetRegionalMetaResponse {
  code?: number;
  data?: RegionalMetaResponseData;
  error?: string;
}

export interface getRegionsEnabledRequest {}

export interface GetRegionsEnabledResponse {
  code?: number;
  data?: DataMessage20;
  error?: string;
}

export interface getRegionZonesRequest {}

export interface GetRegionZonesResponse {
  code?: number;
  data?: Record<string, Array<string>>;
  error?: string;
}

export interface GetReleaseByIDRequest {
  cluster: string;
  region: string;
  release_id: string;
  /** ID of service */
  service_id: string;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface GetReleaseByIDResponse {
  code?: number;
  data?: ReleaseResponseData;
  error?: string;
}

export interface GetReleaseOverviewRequest {
  /** 格式 2024-01-04T06:49:59+00:00 */
  start_time?: string;
  /** 格式 2024-01-04T06:49:59+00:00 */
  end_time?: string;
}

export interface GetReleaseOverviewResponse {
  code?: number;
  data?: Array<ReleaseOverviewItem>;
  error?: string;
}

export interface GetReleaseRequest {
  /** cluster name */
  cluster: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetReleaseResponse {
  code?: number;
  data?: Array<ReleaseRecord>;
  error?: string;
}

export interface GetReleaseStartInfoByIDRequest {
  cluster: string;
  region: string;
  release_id: string;
  /** ID of service */
  service_id: string;
  /** ID of revision */
  revision_id?: string;
}

export interface GetReleaseStartInfoByIDResponse {
  code?: number;
  data?: Array<PodStartInfo>;
  error?: string;
}

export interface GetReservedReplicaThresholdRequest {
  cluster: string;
  /** only required for cron strategy */
  duration_minutes?: string;
  /** efficient start hours of cron strategy,only required for cron strategy */
  hours?: string;
  /** efficient start minutes of cron strategy,only required for cron strategy */
  minutes?: string;
  region: string;
  service_id: string;
}

export interface GetReservedReplicaThresholdResponse {
  code?: number;
  data?: DataMessage24;
  error?: string;
}

export interface GetResourceRealtimeClusterData {
  cluster?: string;
  zones?: Array<ResourceRealtimeZoneData>;
}

export interface GetResourceRequest {
  /** get all regions */
  all_region?: boolean;
  /** Target env name */
  env?: string;
  /** ID of function */
  function_id?: string;
  /** psm */
  psm?: string;
  /** Target region name */
  region?: string;
}

export interface GetResourceResponse {
  code?: number;
  data?: DataMessage22;
  error?: string;
}

export interface getRuntimeRequest {}

export interface GetRuntimeResponse {
  code?: number;
  /** region will be key name */
  data?: Record<string, Array<Runtime>>;
  error?: string;
}

export interface GetScaleStrategiesRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetScaleStrategiesResponse {
  code?: number;
  data?: Array<ScaleStrategy>;
  error?: string;
}

export interface GetScaleStrategyRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the strategy you want to get */
  strategy_id: string;
}

export interface GetScaleStrategyResponse {
  code?: number;
  data?: ScaleStrategy;
  error?: string;
}

export interface GetServiceByPsmAndEnvRequest {
  /** get service information by psm and env */
  env_name: string;
  /** PSM of service */
  psm: string;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface GetServiceByPsmAndEnvResponse {
  code?: number;
  data?: ServiceResponse;
  error?: string;
}

export interface GetServiceRequest {
  /** region */
  region?: string;
  /** ID of service */
  service_id: string;
  /** get detail information with clusters when it is true */
  verbose?: boolean;
  /** filter soft-deleted service */
  soft_deleted?: boolean;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface GetServiceResponse {
  code?: number;
  data?: ServiceResponse;
  error?: string;
}

export interface GetServicesListRequest {
  /** is all, default to false */
  all?: string;
  /** env name. Optional values: prod/ppe/boe_feature */
  env?: string;
  /** search by service id */
  id?: string;
  /** limit number of pagination */
  limit?: number;
  /** search by name */
  name?: string;
  /** without worker function */
  no_worker?: boolean;
  /** offset number of pagination */
  offset?: number;
  /** search by owner */
  owner?: string;
  /** search by psm prefix matching. Only works when querystring `all` is not empty */
  psm?: string;
  /** prefix search, cache multi field */
  search?: string;
  /** search type: all/admin/own/subscribe */
  search_type?: string;
  /** sort by field in service model */
  sort_by?: string;
  /** supported search fields: cluster_id/id/name/psm */
  search_fields?: string;
}

export interface GetServicesListResponse {
  code?: number;
  data?: Array<ServiceResponse>;
  error?: string;
}

export interface GetServiceTicketByIDRequest {
  /** ID of service */
  service_id: string;
  /** ID of ticket */
  ticket_id: string;
}

export interface GetServiceTicketByIDResponse {
  code?: number;
  data?: Ticket;
  error?: string;
}

export interface GetServiceTreesRequest {}

export interface GetServiceTreesResponse {
  code: number;
  data: Array<ServiceTreeNode>;
  error: string;
}

export interface GetTCEClusterListItem {
  cluster_id: Int64;
  name: string;
  vregion: string;
  idcs: Array<string>;
  is_faas_vregion_support: boolean;
  link: string;
  replica_total: number;
  replica: Record<string, number>;
}

export interface GetTCEClusterListRequest {
  tce_psm: string;
}

export interface GetTCEClusterListResponse {
  code?: number;
  error?: string;
  data?: Array<GetTCEClusterListItem>;
}

export interface GetTCEMigrateMQAppParamsData {
  service: CreateServiceRequest;
  cluster: CreateClusterRequest;
}

export interface GetTCEMigrateMQAppParamsRequest {
  tce_psm: string;
  tce_cluster_id: Int64;
}

export interface GetTCEMigrateMQAppParamsResponse {
  code?: number;
  error?: string;
  data?: GetTCEMigrateMQAppParamsData;
}

export interface GetTemplateByNameRequest {
  template_name: string;
}

export interface GetTemplateByNameResponse {
  code?: number;
  data?: FunctionTemplate;
  error?: string;
}

export interface GetTicketDetailByTicketIDRequest {
  ticket_id: string;
}

export interface GetTicketDetailByTicketIDResponse {
  code?: number;
  data?: Ticket;
  error?: string;
}

export interface GetTicketsByFilterRequest {
  category?: string;
  change_type?: string;
  cluster?: string;
  /** ID of function. */
  function_id?: string;
  /** ID of ticket. */
  id?: string;
  max_create_time?: string;
  min_create_time?: string;
  /** If set true, only return admin tickets */
  only_admin_ticket?: boolean;
  /** Parent ID of a ticket, ie, the ID of a batch ticket */
  parent_id?: string;
  region: string;
  /** ID of service */
  service_id: string;
  /** status of ticket. */
  status?: string;
  trigger_id?: string;
  trigger_type?: string;
  /** ticket type. */
  type?: string;
  /** pagination query, specify the number for one page */
  limit?: number;
  /** pagination query, specify the offset, default 0 */
  offset?: number;
}

export interface GetTicketsByFilterResponse {
  code?: number;
  data?: Array<Ticket>;
  error?: string;
}

export interface GetTicketsRequest {
  category?: string;
  change_type?: string;
  cluster?: string;
  id?: string;
  max_create_time?: string;
  min_create_time?: string;
  region: string;
  /** ID of service */
  service_id: string;
  status?: string;
  trigger_id?: string;
  trigger_type?: string;
  /** type of tickets */
  type?: string;
  contains_multi_clusters?: boolean;
  offset?: number;
  limit?: number;
}

export interface GetTicketsResponse {
  code?: number;
  data?: Array<Ticket>;
  error?: string;
  count?: number;
}

export interface GetTimerTriggerRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the timer trigger you want to get */
  timer_id: string;
  'X-Jwt-Token'?: string;
}

export interface GetTimerTriggerResponse {
  code?: number;
  data?: TimerTrigger;
  error?: string;
}

export interface GetTosBucketsRequest {
  /** region of service */
  region: string;
  'X-Jwt-Token'?: string;
}

export interface GetTosBucketsResponse {
  code?: number;
  data?: Array<BucketMeta>;
  error?: string;
}

export interface GetTriggerDebugTplRequest {
  service_id: string;
  /** 模板类型 custom/official */
  tpl_type?: string;
  /** 触发器类型 timer/http/rocketmq/kafka/eventbus */
  trigger_type?: string;
}

export interface GetTriggerDebugTplResponse {
  code: number;
  data: Array<TriggerDebugTplItem>;
  error: string;
}

export interface GetTriggerReservedReplicaThresholdRequest {
  cluster: string;
  /** only required for cron strategy */
  duration_minutes?: string;
  /** efficient start hours of cron strategy,only required for cron strategy */
  hours?: string;
  /** efficient start minutes of cron strategy,only required for cron strategy */
  minutes?: string;
  region: string;
  service_id: string;
  trigger_type: string;
  trigger_id: string;
}

export interface GetTriggerReservedReplicaThresholdResponse {
  code?: number;
  data?: DataMessage24;
  error?: string;
}

export interface GetTriggersEnabledRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface GetTriggersEnabledResponse {
  code?: number;
  data?: DataMessage194;
  error?: string;
}

export interface GetVefaasTrafficSchedulingRequest {}

export interface GetVefaasTrafficSchedulingResponse {
  code?: number;
  data?: VefaasTrafficSchedulingData;
  error?: string;
}

export interface GetVolcSigninTokenRequest {
  service_id?: string;
  region?: string;
  cluster?: string;
}

export interface GetVolcSigninTokenResponse {
  code?: number;
  data?: GetVolcSigninTokenResponseData;
  error?: string;
}

export interface GetVolcSigninTokenResponseData {
  signin_token: string;
}

export interface GetVolcTlsConfigRequest {
  service_id?: string;
  region?: string;
  cluster?: string;
}

export interface GetVolcTlsConfigResponse {
  code?: number;
  data?: GetVolcTlsConfigResponseData;
  error?: string;
}

export interface GetVolcTlsConfigResponseData {
  enable_log: boolean;
  tls_project_id?: string;
  tls_topic_id?: string;
}

export interface GlobalMQEventTriggerResponseData {
  batch_size?: number;
  batch_flush_duration_milliseconds?: number;
  description?: string;
  enabled?: boolean;
  function_id?: string;
  cell?: string;
  service_id?: string;
  cluster?: string;
  id?: string;
  ms_alarm_id?: Array<string>;
  mq_type?: string;
  max_retries_from_function_status?: number;
  qps_limit?: number;
  name?: string;
  options?: TriggerOptions;
  region?: string;
  mq_region?: string;
  runtime_agent_mode?: boolean;
  dynamic_worker_thread?: boolean;
  replica_max_limit?: Record<string, number>;
  replica_min_limit?: Record<string, number>;
  replicas?: number;
  scale_enabled?: boolean;
  vertical_scale_enabled?: boolean;
  enable_static_membership?: boolean;
  status?: string;
  status_message?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  meta_synced?: boolean;
  meta_synced_at?: string;
  enable_mq_debug?: boolean;
  mq_logger_limit_size?: number;
  enable_backoff?: boolean;
  disable_backoff?: boolean;
  worker_v2_num_per_half_core?: number;
  enable_concurrency_filter?: boolean;
  mq_msg_type?: string;
  in_releasing?: boolean;
  mirror_region_filter?: string;
  retry_strategy?: string;
  max_retry_time?: number;
  qps_limit_time_ranges?: Array<QPSLimitTimeRanges>;
  rate_limit_step_settings?: RateLimitStepSettings;
  enable_step_rate_limit?: boolean;
  workers_per_pod?: number;
  msg_chan_length?: number;
  num_of_mq_pod_to_one_func_pod?: number;
  need_auto_sharding?: boolean;
  enable_traffic_priority_scheduling?: boolean;
  enable_pod_colocate_scheduling?: boolean;
  enable_global_rate_limiter?: boolean;
  enable_congestion_control?: boolean;
  allow_bytesuite_debug?: boolean;
  enable_dynamic_load_balance?: boolean;
  disable_smooth_wrr?: boolean;
  dynamic_load_balance_type?: string;
  enable_gctuner?: boolean;
  gctuner_percent?: number;
  deployment_inactive?: boolean;
  replica_force_meet_partition?: boolean;
  plugin_function_param?: PluginFunctionParam;
  mqevent_revision?: MQEventRevision;
  enable_plugin_function?: boolean;
  enable_canary_update?: boolean;
  traffic_config?: Record<string, number>;
  envs?: Record<string, string>;
  image_version?: string;
  image_alias?: string;
  sdk_version?: string;
  offset_reset_result?: ResetOffsetResult;
  kafka_reset_offset_user_data?: ResetOffsetReq;
  request_timeout?: number;
  disable_infinite_retry_for_timeout?: boolean;
  initial_offset_start_from?: string;
  kafka_metric_prefix?: string;
  scale_settings?: MQEventScaleSettings;
  hot_reload?: boolean;
  enable_rmq_lease?: boolean;
  package?: string;
  pod_type?: string;
  id_volc?: string;
  resource?: Resource;
  latest_image_alias?: string;
  latest_sdk_version?: string;
  log_link?: string;
  streaming_log_link?: string;
  argos_link?: string;
  grafana_link?: string;
  grafana_eventbus_link?: string;
  mq_topic_link?: string;
  mq_consumer_link?: string;
  ticket_id?: string;
  enable_filter_congestion_control?: boolean;
  enable_congestion_control_cache?: boolean;
}

export interface GPU {
  accelerator?: string;
  partitions?: number;
}

export interface GrayConfig {
  psms?: GrayKeys;
  clusters?: GrayKeys;
  dcs?: GrayKeys;
  stages?: GrayKeys;
}

export interface GrayKeys {
  gray_all?: boolean;
  keys?: Array<string>;
}

export interface GreyMQEvent {
  mqevent_id: string;
  grey_percentage: number;
  region: string;
  cluster: string;
}

export interface HostUniq {
  host_unique_type?: string;
  unique_tolerance?: number;
}

export interface HttpTriggerResponse {
  name?: string;
  description?: string;
  id?: string;
  cell?: string;
  function_id?: string;
  url_prefix?: string;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  runtime?: string;
  version_type?: string;
  version_value?: string;
  region?: string;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  zone_urls?: Record<string, string>;
  url?: string;
  secondary_url?: string;
}

export interface ICMBaseImage {
  base_version?: string;
  name?: string;
  labels?: Array<string>;
  image_id?: number;
  recommend?: boolean;
  eol?: boolean;
}

export interface InnerStrategy {
  cron_strategy?: CronStrategy;
}

export interface Instance {
  function_id?: string;
  revision_id?: string;
  pod_name?: string;
  pod_uid?: string;
  container_ids?: Array<string>;
  host?: string;
  ipv6?: string;
  pod_ip?: string;
  port?: string;
  runtime_debug_port?: string;
  runtime_other_ports?: Array<OtherRoutes>;
  deploy_env?: string;
  region?: string;
  zone?: string;
  status?: string;
  message?: string;
  cpu?: number;
  memory?: number;
  created_at?: string;
  instance_type?: string;
  instance_metric_link?: string;
  host_metric_link?: string;
  lidar_profile_link?: string;
  sd_disabled?: boolean;
  revision_dependency?: Array<Dependency>;
  runtime_container_port?: string;
}

export interface KafkaMQOptions {
  topic?: string;
  cluster_name?: string;
  consumer_group?: string;
  enable_filter?: boolean;
  filter_source_type?: string;
  filter_source?: string;
  filter_plugin_id?: string;
  filter_plugin_version?: string;
  consumer_fetch_buffer?: number;
  retry_interval_seconds?: number;
  enable_multi_env_v2?: boolean;
  multi_env_version?: string;
  close_multi_env?: boolean;
  fetch_limit?: boolean;
  enable_cooperative?: boolean;
  config_center_url_custom?: string;
  config_center_region?: string;
  orderly?: boolean;
  enable_non_compression_consume?: boolean;
}

export interface KafkaTopicPreviewParams {
  cluster_name: string;
  topic_name: string;
  /** 数据类型 str/pb */
  schema_type: string;
  /** whence/offset */
  consumer_type: string;
  /** latest/earliest/random */
  whence?: string;
  /** 偏移量 */
  relative_offset?: Int64;
  /** partition  不传则为all */
  partition?: string;
}

export interface KillAsyncRequestsRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the request id you want to kill */
  'x-bytefaas-request-id': string;
}

export interface KillAsyncRequestsResponse {}

export interface LatestRevisionResponseData {
  /** revision id */
  id?: string;
  /** revision number */
  number?: number;
  /** region, no need for post/patch method, it is a path param */
  region?: string;
  /** release time */
  released_at?: string;
}

export interface ListAsyncRequestsRequest {
  /** begin_time */
  begin_time?: string;
  /** cluster of service */
  cluster: string;
  /** end_time */
  end_time?: string;
  /** limit */
  limit?: string;
  /** offset */
  offset?: string;
  /** region of service */
  region: string;
  /** request_id */
  request_id?: string;
  /** ID of service */
  service_id: string;
  /** task_status */
  task_status?: string;
}

export interface ListAsyncRequestsResponse {
  code?: number;
  data?: Array<DataMessage71>;
  error?: string;
}

export interface ListFuncScaleSettingApiRequest {
  service_id?: string;
  region?: string;
  cluster?: string;
  offset?: string;
  limit?: string;
}

export interface ListFuncScaleSettingApiResponse {
  code?: number;
  data?: Array<ListFuncScaleSettingResult>;
  error?: string;
}

export interface ListFuncScaleSettingResult {
  function_id?: string;
  cluster?: string;
  region?: string;
  scale_threshold_set?: ScaleThresholdsSet;
  lag_scale_set?: string;
  overload_fast_scale_set?: OverloadFastScaleSetting;
  cron_scale_strategies?: Array<ScaleStrategy>;
}

export interface ListMQTriggerScaleSettingData {
  mqtrigger_id: string;
  trigger_type: string;
  trigger_name: string;
  cluster: string;
  service_id: string;
  function_id: string;
  scale_threshold_set: ScaleThresholdsSet;
  lag_scale_set: string;
  vertical_scale_enabled: boolean;
  cron_scale_strategies: Array<ScaleStrategy>;
  region: string;
}

export interface ListMQTriggerScaleThresholdsSettingRequest {
  service_id: string;
  offset?: string;
  limit?: string;
  search?: string;
  region?: string;
  cluster?: string;
}

export interface ListMQTriggerScaleThresholdsSettingResponse {
  code: number;
  data: Array<ListMQTriggerScaleSettingData>;
  error: string;
}

export interface ListPipelineTemplatesRequest {
  'X-Jwt-Token'?: string;
}

export interface ListPipelineTemplatesResponse {
  code?: number;
  data?: Array<PipelineTemplate>;
  error?: string;
}

export interface LogItem {
  content?: string;
  category?: string;
  level?: string;
}

export interface MapMessage {
  additional_properties?: Record<string, number>;
}

export interface MEMScaleSettings {
  mem_scale_in_threshold?: number;
  mem_scale_out_threshold?: number;
  mem_scale_target?: number;
}

export interface MigrateInstancesRequest {
  /** cluster name */
  cluster: string;
  podname: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  zone: string;
  env?: string;
  'X-Jwt-Token'?: string;
}

export interface MigrateInstancesResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface MigrateMqTriggerInstanceRequest {
  /** cluster name */
  cluster: string;
  podname: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** mq trigger id */
  trigger_id: string;
  zone: string;
  'X-Jwt-Token'?: string;
}

export interface MigrateMqTriggerInstanceResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface MigrationRecord {
  psm?: string;
  service_id?: string;
  cluster_id?: string;
  pod_ip?: string;
  pod_ipv6?: string;
  pod_port?: string;
  pod_status?: string;
  zone?: string;
  region?: string;
  delete_time?: Int64;
  delete_by?: string;
  migration_result?: string;
  report_message?: string;
  cluster_name?: string;
  pod_name?: string;
  detector?: string;
  migration_type?: string;
  env?: string;
}

export interface MigrationRecordsRequest {
  region?: string;
  cluster?: string;
  delete_by?: string;
  pod_name?: string;
  service_id: string;
  page_size?: number;
  page_num?: number;
  start?: Int64;
  end?: Int64;
  detector?: string;
  zone?: string;
  ip?: string;
  pod_type?: string;
}

export interface MigrationRecordsResponse {
  code?: number;
  data?: Array<MigrationRecord>;
  error?: string;
}

export interface MQEventAdvancedConfigData {
  name_zh: string;
  name_en: string;
  des_zh: string;
  des_en: string;
  field: string;
  value_type: string;
  expect_value: Record<string, string>;
  show_condition: string;
}

export interface MQEventCPUScaleSettings {
  cpu_scale_out_threshold?: number;
  cpu_scale_in_threshold?: number;
  cpu_scale_target?: number;
}

export interface MQEventMEMScaleSettings {
  mem_scale_out_threshold?: number;
  mem_scale_in_threshold?: number;
  mem_scale_target?: number;
}

export interface MQEventRevision {
  revision_id?: string;
  request_timeout_ms?: number;
  plugin_function_param?: PluginFunctionParam2;
}

export interface MQEventScaleSettings {
  scale_set_name?: string;
  cpu_scale_settings?: MQEventCPUScaleSettings;
  mem_scale_settings?: MQEventMEMScaleSettings;
  predictive_scale_settings?: MQPredictiveScalingSetting;
  lag_scale_settings?: MQPredictiveScalingSetting;
}

export interface MqPermissionRequest {
  cluster?: string;
  /** cluster of service */
  cluster_name: string;
  mq_region?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  topic?: string;
  /** kafka/rocketmq/eventbus */
  type?: string;
  /** psm/user, default is psm */
  auth_type?: string;
}

export interface MqPermissionResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface MQPredictiveScalingSetting {
  enable_periodic_traffic_prediction?: boolean;
}

export interface MQQueueBaseInfo {
  broker_name: string;
  queue_id: number;
  topic: string;
}

export interface MQQueueInfoData {
  queue: Array<MQQueueItem>;
  dc: Array<string>;
}

export interface MQQueueInfoRequest {
  mq_region: string;
  region: string;
  /** mq cluster name */
  cluster_name: string;
  topic_name: string;
}

export interface MQQueueInfoResponse {
  code: number;
  data: MQQueueInfoData;
  error: string;
}

export interface MQQueueItem {
  earliest_msg_store_time: Int64;
  max_offset: Int64;
  min_offset: Int64;
  message_queue: MQQueueBaseInfo;
}

export interface MQTopicPreviewData {
  /** mq消息的json串 */
  mq_msg?: string;
  /** 转换之后的cloudevent，如果数组里有多个元素则为批量消息 */
  cloud_event?: Array<TriggerDebugCloudEvent>;
  native_event?: Array<TriggerDebugNativeEvent>;
}

export interface MQTopicPreviewRequest {
  mq_type: string;
  mq_region: string;
  service_id: string;
  region: string;
  cluster: string;
  is_batch_msg: boolean;
  kafka_topic_preview_params?: KafkaTopicPreviewParams;
  rocket_mq_topic_preview_params?: RocketmqTopicPreviewParams;
  eventbus_topic_preview_params?: EventBusTopicPreviewParams;
  is_native_msg?: boolean;
}

export interface MQTopicPreviewResponse {
  code: number;
  data: MQTopicPreviewData;
  error: string;
}

export interface MQTriggerEmergencyScaleRequest {
  service_id: string;
  region: string;
  cluster: string;
  trigger_id: string;
  min_replicas: Record<string, number>;
  scale_duration_minutes: number;
}

export interface MQTriggerEmergencyScaleResponse {
  code: number;
  data: MQTriggerEmergencyScaleResult;
  error: string;
}

export interface MQTriggerEmergencyScaleResult {
  function_id?: string;
  cluster?: string;
  region?: string;
  min_replicas?: Record<string, number>;
  expect_keep_min_begin_at?: string;
  expect_keep_min_end_at?: string;
  mqtrigger_id?: string;
}

export interface MqTriggerInstance {
  cpu?: number;
  created_at?: string;
  function_id?: string;
  host?: string;
  host_ipv6?: string;
  host_metric_link?: string;
  instance_log_link?: string;
  instance_metric_link?: string;
  memory?: number;
  message?: string;
  mqevent_agent_port?: string;
  mqevent_id?: string;
  pod_ip?: string;
  pod_ipv6?: string;
  pod_name?: string;
  port?: string;
  profile_link?: string;
  region?: string;
  status?: string;
  zone?: string;
  plugin_function_version?: string;
  container_ids?: string;
}

export interface MQTriggerRestartRequest {
  service_id: string;
  region: string;
  /** cluster of service */
  cluster: string;
  trigger_type: string;
  /** type of trigger */
  trigger_id: string;
  max_surge_percent?: number;
}

export interface MQTriggerRestartResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface MQTriggerScaleRecordListItem {
  record_id: string;
  request_id: string;
  function_id: string;
  cluster: string;
  region: string;
  cell: string;
  mqevent_id: string;
  deploy_name: string;
  effect_strategy: string;
  scale_at: string;
  scale_operation: string;
  replicas_from: Record<string, Int64>;
  replicas_to: Record<string, Int64>;
  resource_from: Record<string, Record<string, Int64>>;
  resource_to: Record<string, Record<string, Int64>>;
  detail_reason: string;
  status: string;
  created_at: string;
  updated_at: string;
  env_name: string;
  psm: string;
  trigger_name: string;
}

export interface MQTriggerScaleThresholdData {
  mqtrigger_id: string;
  trigger_type: string;
  trigger_name: string;
  cluster: string;
  service_id: string;
  function_id: string;
  scale_threshold_set: ScaleThresholdsSet;
  lag_scale_set: string;
  vertical_scale_enabled: boolean;
  region: string;
}

/** this params is used to create/update service meta(ms platform), will not store in db */
export interface MSServiceMetaParams {
  endpoints?: Array<string>;
  framework?: string;
  language?: string;
}

export interface MultiCusterReleaseInfo {
  region?: string;
  cluster?: string;
  rolling_step?: number;
  replica_limit?: Record<string, EmptyObject>;
  format_traffic_config: Array<CreateTicketRequestFormatTargetTrafficConfigMessage>;
  format_zone_traffic_config?: Array<CreateTicketRequestFormatZoneTrafficConfigMessage>;
  grey_mqevent_config?: Array<GreyMQEvent>;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface MultiCusterReleaseTicketRequest {
  /** approved user. 审核人 */
  approved_by?: string;
  /** type of approved user. 审核用户类型 */
  approved_by_usertype?: string;
  /** ID of used code revision, lower priority than use_latest_code_revision. 代码版本 ID, 用指定代码版本进行发布 */
  code_revision_id?: string;
  /** description of this release. 发布描述 */
  description?: string;
  /** create ticket of rollback action. 回滚 */
  rollback?: boolean;
  /** use latest code revision. 使用最新的代码版本进行发布 */
  use_latest_code_revision?: boolean;
  /** the code config. 发布的代码配置 */
  code_source?: string;
  /** the mqevent release type. 触发器发布类型配置 */
  mqevent_release_type?: string;
  /** pipeline template type */
  pipeline_template_type?: string;
  clusters?: Array<MultiCusterReleaseInfo>;
  rollback_revisions?: Array<RollbackRevisions>;
  service_id?: string;
}

export interface NSQOptions {}

export interface OnlineCodeRevision {
  created_at?: string;
  created_by?: string;
  /** deploy method. 部署方式 */
  deploy_method?: string;
  description?: string;
  disable_build_install?: boolean;
  function_id?: string;
  handler?: string;
  id?: string;
  initializer?: string;
  is_zone_traffic_exist?: boolean;
  lazyload?: boolean;
  number?: string;
  protocol?: string;
  run_cmd?: string;
  runtime?: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  service_id?: string;
  /** source of code revision. 代码版本 URI */
  source?: string;
  /** source type of code revision. 代码版本类型 */
  source_type?: string;
  traffic_value?: number;
  open_image_lazyload?: boolean;
  runtime_other_container_ports?: Array<number>;
}

export interface OnlineRevision {
  adaptive_concurrency_mode?: boolean;
  auth_enable?: boolean;
  base_image?: string;
  build_desc_map?: Record<string, BuildDescription>;
  built_region_package_keys?: Record<string, string>;
  /** cluster name. 集群名 */
  cluster?: string;
  /** new field: ID of code revision. 新增字段, 代码版本 ID */
  code_revision_id?: string;
  /** new field: number of code revision. 新增字段, 代码版本号 */
  code_revision_number?: string;
  cold_start_disabled?: boolean;
  cold_start_sec?: number;
  cors_enable?: boolean;
  created_at?: string;
  created_by?: string;
  deploy_method?: string;
  /** description. 版本概述 */
  description?: string;
  disable_build_install?: boolean;
  envs?: Record<string, MapMessage>;
  exclusive_mode?: boolean;
  format_envs?: Record<string, Array<FormatEnvs>>;
  /** ID of function. 原来的函数 ID */
  function_id?: string;
  gdpr_enable?: boolean;
  handler?: string;
  /** revision id. 版本 ID */
  id?: string;
  images?: Record<string, string>;
  initializer?: string;
  initializer_sec?: number;
  is_this_zone_disabled?: Record<string, boolean>;
  last_ticket_status?: string;
  latency_sec?: number;
  lazyload?: boolean;
  max_concurrency?: number;
  name?: string;
  number?: number;
  psm?: string;
  resource_limit?: ResourceLimit;
  run_cmd?: string;
  /** runtime. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  /** ID of service. 服务 ID */
  service_id?: string;
  /** source code. 源码 */
  source?: string;
  source_download_url?: string;
  /** type of source code. 源码保存方式 */
  source_type?: string;
  throttle_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  traffic_value?: number;
  updated_at?: string;
  worker_built_region_package_keys?: Record<string, EmptyObject>;
  online_mode?: boolean;
  open_image_lazyload?: boolean;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  enable_consul_ipv6_register?: boolean;
  enable_sys_mount?: boolean;
  disable_mount_jwt_bundles?: boolean;
  termination_grace_period_seconds?: number;
  enable_consul_register?: boolean;
}

export interface OtherRoutes {
  access_port?: string;
  service_port?: string;
}

export interface OverloadFastScaleSetting {
  online_revision_setting_enabled?: boolean;
  latest_setting_enabled?: boolean;
}

export interface Package {
  /** package name */
  name?: string;
  resource_limit?: ResourceLimitWithAlias;
}

export interface ParentTask {
  batch_task_id: string;
  operator?: string;
  type?: string;
  /** enum value: pending/running/failed/success */
  status?: string;
  concurrency?: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  status_group?: Array<ParentTaskStatusGroup>;
  total?: number;
}

export interface ParentTaskStatusGroup {
  status: string;
  count: number;
}

export interface PartitionDetail {
  name?: string;
  new_offset?: number;
  old_offset?: number;
}

export interface PatchHttpTriggerRequest {
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  /** cluster of service */
  cluster: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** ID of trigger */
  trigger_id: string;
  /** url prefix */
  url_prefix?: string;
  /** type of this version. Allow to be `revision` or `alias` */
  version_type?: string;
  /** value of version type. When `version_type` is `revision`, it should be an ID of revision. */
  version_value?: string;
}

export interface PatchHttpTriggerResponse {
  code?: number;
  data?: HttpTriggerResponse;
  error?: string;
}

export interface PatchMqTriggerByTypeRequest {
  alarm_params?: PatchMqTriggerByTypeRequestAlarmParamsMessage2;
  allow_bytesuite_debug?: boolean;
  batch_size?: number;
  cell?: string;
  /** cluster of service */
  cluster: string;
  deployment_inactive?: boolean;
  description?: string;
  disable_backoff?: boolean;
  disable_smooth_wrr?: boolean;
  dynamic_load_balance_type?: string;
  dynamic_worker_thread?: boolean;
  enable_backoff?: boolean;
  enable_concurrency_filter?: boolean;
  enable_congestion_control?: boolean;
  enable_dynamic_load_balance?: boolean;
  enable_global_rate_limiter?: boolean;
  enable_ipc_mode?: boolean;
  enable_mq_debug?: boolean;
  enable_pod_colocate_scheduling?: boolean;
  enable_static_membership?: boolean;
  enable_traffic_priority_scheduling?: boolean;
  enabled?: boolean;
  envs?: Record<string, string>;
  function_id?: string;
  hot_reload?: boolean;
  id?: string;
  image_alias?: string;
  image_version?: string;
  initial_offset_start_from?: string;
  is_auth_info_updated?: boolean;
  max_retries_from_function_status?: number;
  mq_logger_limit_size?: number;
  mq_msg_type?: string;
  mq_region?: string;
  mq_type?: string;
  ms_alarm_id?: Array<string>;
  msg_chan_length?: number;
  name?: string;
  need_auto_sharding?: boolean;
  num_of_mq_pod_to_one_func_pod?: number;
  options?: TriggerOptions;
  plugin_function_param?: PluginFunctionParam;
  qps_limit?: number;
  region: string;
  replica_max_limit?: number;
  replica_min_limit?: number;
  replicas?: number;
  request_timeout?: number;
  resource?: ResourceLimit;
  runtime_agent_mode?: boolean;
  scale_enabled?: boolean;
  scale_settings?: MQEventScaleSettings;
  sdk_version?: string;
  /** ID of service */
  service_id: string;
  /** trigger id */
  trigger_id: string;
  /** trigger type */
  trigger_type: string;
  vertical_scale_enabled?: boolean;
  worker_v2_num_per_half_core?: number;
  workers_per_pod?: number;
  enable_plugin_function?: boolean;
  disable_infinite_retry_for_timeout?: boolean;
  mirror_region_filter?: string;
  enable_gctuner?: boolean;
  gctuner_percent?: number;
  retry_strategy?: string;
  max_retry_time?: number;
  qps_limit_time_ranges?: Array<QPSLimitTimeRanges>;
  rate_limit_step_settings?: RateLimitStepSettings;
  enable_step_rate_limit?: boolean;
  enable_filter_congestion_control?: boolean;
  enable_congestion_control_cache?: boolean;
}

export interface PatchMqTriggerByTypeRequestAlarmParamsMessage2 {
  lag_alarm_threshold?: number;
}

export interface PatchMqTriggerByTypeResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface PatchMqTriggerRestrictedMetaByTypeRequest {
  /** ID of service */
  service_id: string;
  /** trigger id */
  trigger_id: string;
  /** trigger type */
  trigger_type: string;
  /** target cluster name */
  cluster?: string;
  /** region of function */
  region: string;
}

export interface PatchMQTriggerScaleThresholdSetRequest {
  service_id: string;
  region: string;
  cluster: string;
  trigger_id: string;
  scale_set_name?: string;
  lag_scale_set_name?: string;
  vertical_scale_enabled?: boolean;
}

export interface PatchMQTriggerScaleThresholdSetResponse {
  code: number;
  data: MQTriggerScaleThresholdData;
  error: string;
}

export interface PatchReleaseRequest {
  action?: string;
  alias_name?: string;
  cluster: string;
  format_target_traffic_config?: Array<RevisionTraffic>;
  format_zone_traffic_config?: Array<PatchReleaseRequestFormatZoneTrafficConfigMessage>;
  region: string;
  release_id: string;
  rolling_step?: number;
  /** ID of service */
  service_id: string;
  target_traffic_config?: Record<string, number>;
  zone_traffic_config?: Record<string, MapMessage>;
  'X-Jwt-Token'?: string;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface PatchReleaseRequestFormatZoneTrafficConfigMessage {
  zone?: string;
  zone_traffic_config?: Array<RevisionTraffic>;
}

export interface PatchReleaseResponse {
  code?: number;
  data?: ReleaseResponseData;
  error?: string;
}

export interface PatchScaleStrategyRequest {
  /** required for inner bpm operation */
  bpm_update_type?: string;
  /** cluster of service */
  cluster: string;
  /** when the strategy will be effective */
  effective_time?: string;
  /** strategy is enabled or not */
  enabled?: boolean;
  /** when the strategy will be expired */
  expired_time?: string;
  /** function id, no need for post/patch method, it is a path param */
  function_id?: string;
  inner_strategy?: InnerStrategy;
  /** function id or mqevent id */
  item_id?: string;
  /** function or mqevent */
  item_type?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** the strategy you want to patch */
  strategy_id: string;
  /** strategy name */
  strategy_name?: string;
  /** only cron for now */
  strategy_type?: string;
  /** ReservedInstance or FrozenReservedInstance default is ReservedInstance */
  instance_type?: string;
}

export interface PatchScaleStrategyResponse {
  code?: number;
  data?: ScaleStrategy;
  error?: string;
}

export interface PatchTriggerDebugTplRequest {
  service_id: string;
  tpl_id: string;
  name?: string;
  cloud_event?: Array<TriggerDebugCloudEvent>;
  msg_type?: string;
  native_event?: Array<TriggerDebugNativeEvent>;
}

export interface PatchTriggerDebugTplResponse {
  code: number;
  data: TriggerDebugTplItem;
  error: string;
}

export interface PipelineCompileStepBizData {
  request_id?: string;
  created_by?: string;
  service_id?: string;
  target_revision_id?: string;
  rebuild?: boolean;
  plugin_scm_id?: string;
  plugin_scm_version?: string;
}

export interface PipelineErrorResponse {
  errno?: number;
  error_code?: string;
  error_message?: string;
}

export interface PipelineReleaseMQEventStepBizData {
  request_id?: string;
  created_by?: string;
  service_id?: string;
  mqevent_id?: string;
  rolling_step?: number;
  target_traffic_config?: number;
  source_revision_id?: string;
  target_revision_id?: string;
  release_id?: string;
  region?: string;
  cluster?: string;
  default_release_type?: string;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface PipelineResponseData {
  /** pipeline id */
  id?: string;
  /** pipeline status */
  status?: string;
  /** pipeline template */
  template?: PipelineTemplate;
  /** pipeline steps */
  steps?: Array<PipelineStepResponseData>;
  /** dag edges */
  step_dag_edges?: Array<Edge>;
  /** created time */
  created_at?: string;
  /** updated time */
  updated_at?: string;
}

export interface PipelineStepBizData {
  /** lego compile step biz data */
  compile_biz_data?: PipelineCompileStepBizData;
  /** lego upload step biz data */
  upload_biz_data?: PipelineUploadStepBizData;
  /** mqevent release step biz data */
  release_mqevent_biz_data?: PipelineReleaseMQEventStepBizData;
  release_region_biz_data?: ReleaseRegionStepBizData;
  release_idc_biz_data?: ReleaseSingleIdcStepBizData;
  release_all_idc_biz_data?: ReleaseAllIdcStepBizData;
  confirm_biz_data?: ConfirmBizData;
  build_biz_data?: BuildBizData;
  /** create trigger biz data,  this field used by copy trigger pipeline */
  create_trigger_biz_data?: CreateTriggerBizData;
  /** trigger biz data,  this field used by single trigger curd pipeline */
  trigger_biz_data?: TriggerBizData;
  reset_mq_trigger_biz_data?: ResetMQTriggerBizData;
}

export interface PipelineStepResponseData {
  /** step id */
  id?: string;
  /** step type */
  type?: string;
  /** whether support rollback */
  support_rollback?: boolean;
  /** whether need manual trigger */
  manual_trigger?: boolean;
  /** status code */
  status?: string;
  /** status message */
  status_msg?: string;
  /** error info */
  error_info?: PipelineErrorResponse;
  /** target status */
  target_status?: string;
  /** async status list */
  async_status_list?: Array<string>;
  /** allow actions */
  allowed_actions?: Array<StepAction>;
  /** associated stage info */
  stage_meta?: StageMeta;
  /** create time */
  created_at?: string;
  /** update time */
  updated_at?: string;
  /** step start exec time */
  start_exec_time?: string;
  /** step biz data */
  biz_data?: PipelineStepBizData;
}

export interface PipelineTemplate {
  /** template name */
  name?: string;
  /** template description */
  description?: string;
  /** template type */
  type?: string;
  /** stages in this pipeline template */
  stages?: Array<Stage>;
}

export interface PipelineUploadStepBizData {
  request_id?: string;
  created_by?: string;
  service_id?: string;
  target_revision_id?: string;
  release_ids?: Array<string>;
  rebuild?: boolean;
}

export interface PluginFunction {
  /** the name of the plugin */
  plugin_name?: string;
  /** the plugin regions */
  regions?: Array<string>;
  /** the scm name of the plugin */
  scm_name?: string;
}

export interface PluginFunctionCompileVersion {
  /** the scm compilation version number. scm编译版本号 */
  version?: string;
  /** the go version number. go版本号 */
  go_version?: string;
}

export interface PluginFunctionConfig {
  description?: string;
  /** the environments of the plugin */
  environments?: Record<string, string>;
  /** the timeout time of the plugin init */
  init_timeout?: number;
  /** the name of the plugin used */
  plugin_name?: string;
  /** the version of the plugin used */
  plugin_version?: string;
  /** the timeout time of the plugin request */
  request_timeout?: number;
}

export interface PluginFunctionDetail {
  plugin_name?: string;
  commit_hash?: string;
  /** the lego compilation version number. lego编译版本号 */
  version?: string;
  compile_versions?: Array<PluginFunctionCompileVersion>;
}

export interface PluginFunctionParam {
  plugin_function_revision_id?: string;
  init_timeout?: number;
  system_envs?: Record<string, string>;
  environments?: Record<string, string>;
  plugin_name?: string;
  fake_psm?: string;
  plugin_version?: string;
  plugin_scope?: string;
  package_key?: string;
  revision_map?: Record<string, PluginFunctionRevisionParam>;
  plugin_function_revision_number?: number;
}

export interface PluginFunctionParam2 {
  plugin_function_version?: string;
  plugin_function_scope?: string;
  init_timeout?: number;
  environments?: Record<string, string>;
  revision_map?: Record<string, PluginFunctionRevisionInfo>;
  plugin_function_revision_id?: string;
  plugin_function_revision_number?: number;
}

export interface PluginFunctionRevision {
  cluster?: string;
  created_at?: string;
  created_by?: string;
  function_id?: string;
  /** id of the plugin function */
  id?: string;
  /** the revision number of the plugin function */
  number?: number;
  plugin_function_config?: PluginFunctionConfig;
  region?: string;
  release_status?: string;
  release_ticket_link?: string;
  released_mq_number?: number;
  service_id?: string;
}

export interface PluginFunctionRevisionDetail {
  cluster?: string;
  created_at?: string;
  created_by?: string;
  function_id?: string;
  /** id of the plugin function */
  id?: string;
  /** the revision number of the plugin function */
  number?: number;
  plugin_function_config?: PluginFunctionConfig;
  region?: string;
  release_status?: string;
  release_ticket_link?: string;
  released_mq_number?: number;
  service_id?: string;
  released_mq_triggers?: Array<GlobalMQEventTriggerResponseData>;
}

export interface PluginFunctionRevisionInfo {
  plugin_function_version?: string;
  plugin_function_scope?: string;
}

export interface PluginFunctionRevisionParam {
  plugin_version?: string;
  plugin_scope?: string;
  package_key?: string;
}

export interface PluginVersion {
  branch_name?: string;
  commit_hash?: string;
  message?: string;
  plugin_name?: string;
  status?: string;
  version?: string;
  scm_version?: string;
}

export interface PodInfo {
  /** pod name */
  podName?: string;
  /** pod namespace */
  namespace?: string;
  labels?: Record<string, string>;
  /** pod creation time */
  creatTime?: string;
  /** node ip */
  node?: string;
  /** pod ip */
  podIp?: string;
  /** pod phase */
  podPhase?: string;
  /** unique id */
  uid?: string;
  /** whether pod is ready */
  podNotReady?: boolean;
  /** whether pod is scheduled */
  podNotScheduled?: boolean;
  /** whether pod is deleted */
  deleted?: boolean;
  /** container info */
  containerInfos?: Record<string, ContainerInfo>;
}

export interface PodReplicaLimit {
  max?: number;
  min?: number;
}

export interface PodStartInfo {
  id?: string;
  status?: string;
  function_id?: string;
  region?: string;
  revision_id?: string;
  release_record_id?: string;
  content?: string;
  pod?: string;
  zone?: string;
  created_at?: string;
  updated_at?: string;
  start_logs?: StartLogs;
}

export interface PrescanRequest {
  hours: string;
  /** region name */
  region: string;
  /** zone */
  zone: string;
}

export interface PrescanResponse {
  code?: number;
  data?: DataMessage18;
  error?: string;
}

export interface PreUpdateBaseImagesRequest {
  key?: string;
  data?: Record<string, string>;
}

export interface PreUpdateBaseImagesResponse {
  code?: number;
  error?: string;
  data?: Record<string, string>;
}

export interface PutBurstProtectorSwitchRequest {
  /** PSM to update */
  psm: string;
  /** Cluster to update */
  cluster: string;
  /** Caller PSM */
  caller_psm?: string;
  /** Caller cluster */
  caller_cluster?: string;
  /** Method */
  method?: string;
  /** Burst protector configuration */
  config: BurstProtectorConfig;
}

export interface PutBurstProtectorSwitchResponse {
  /** Response code */
  code: number;
  /** Error message, if any */
  error?: string;
  /** Updated configuration */
  data?: BurstProtectorConfig;
}

export interface QPSLimitTimeRanges {
  start_time?: TimeOfDay;
  end_time?: TimeOfDay;
  qps_limit?: number;
}

export interface QueryPipelineTemplateByTypeRequest {
  /** ticket id */
  template_type: string;
  'X-Jwt-Token'?: string;
}

export interface QueryPipelineTemplateByTypeResponse {
  code?: number;
  data?: PipelineTemplate;
  error?: string;
}

export interface QueryReleasedClusterRequest {
  'X-Jwt-Token'?: string;
  psm?: string;
  env_name?: string;
  region?: string;
  cluster?: string;
}

export interface QueryReleasedClusterResponse {
  code?: number;
  data?: ServiceResponse;
  error?: string;
}

export interface RateLimitStepSettings {
  rate_limit_step?: number;
  rate_limit_step_interval?: number;
  rate_limit_step_increase_weight?: number;
  rate_limit_step_decrease_weight?: number;
}

export interface RecordDiff {
  key?: string;
  old_value?: string;
  new_value?: string;
}

export interface RecoverDeletedClusterRequest {
  /** ID of service */
  service_id: string;
}

export interface RecoverDeletedClusterResponse {
  code?: number;
  data?: BasicCluster;
  error?: string;
}

export interface RegionalMeta {
  region?: string;
  function_id?: string;
  service_id?: string;
  cluster?: string;
  function_name?: string;
  revision_id?: string;
  owner?: string;
  psm?: string;
  cell?: string;
  is_this_zone_disabled?: Record<string, boolean>;
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  gdpr_enable?: boolean;
  cold_start_disabled?: boolean;
  exclusive_mode?: boolean;
  async_mode?: boolean;
  online_mode?: boolean;
  auth_enable?: boolean;
  cors_enable?: boolean;
  trace_enable?: boolean;
  gateway_route_enable?: boolean;
  is_ipv6_only?: boolean;
  zti_enable?: boolean;
  http_trigger_disable?: boolean;
  aliases?: Record<string, Alias>;
  runtime?: string;
  env_name?: string;
  global_kv_namespace_ids?: Array<string>;
  local_cache_namespace_ids?: Array<string>;
  protocol?: string;
  latency_sec?: number;
  net_class_id?: number;
  envs?: Record<string, Record<string, string>>;
  in_releasing?: boolean;
  reserved_dp_enabled?: boolean;
  routing_strategy?: string;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  enable_colocate_scheduling?: boolean;
  network_mode?: string;
  dynamic_load_balancing_data_report_enabled?: boolean;
  dynamic_load_balancing_weight_enabled?: boolean;
  dynamic_load_balancing_enabled_vdcs?: Array<string>;
  dynamic_load_balance_type?: string;
  deployment_inactive?: boolean;
  is_this_zone_deployment_inactive?: Record<string, boolean>;
  package?: string;
  pod_type?: string;
  plugin_name?: string;
  allow_cold_start_instance?: boolean;
  elastic_prefer_cluster?: Record<string, string>;
  reserved_prefer_cluster?: Record<string, string>;
  elastic_user_preferred_cluster?: Record<string, string>;
  reserved_user_preferred_cluster?: Record<string, string>;
  elastic_auto_preferred_cluster?: Record<string, string>;
  reserved_auto_preferred_cluster?: Record<string, string>;
  temp_preferred_cluster?: Record<string, string>;
  formatted_elastic_prefer_cluster?: Array<FormattedPreferCluster>;
  formatted_reserved_prefer_cluster?: Array<FormattedPreferCluster>;
  runtime_log_writers?: string;
  system_log_writers?: string;
  enable_runtime_json_log?: boolean;
  is_bytepaas_elastic_cluster?: boolean;
  disable_service_discovery?: boolean;
  resource_guarantee?: boolean;
  disable_cgroup_v2?: boolean;
  async_result_emit_event_bridge?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  scale_settings?: FuncScaleSettings;
  replica_limit?: Record<string, PodReplicaLimit>;
  zone_reserved_frozen_replicas?: Record<string, number>;
  container_runtime?: string;
  enable_scale_optimise?: boolean;
  schedule_strategy?: string;
  dynamic_overcommit_settings?: Record<string, DynamicOvercommitSettings>;
  overload_protect_enabled?: boolean;
  frozen_cpu_milli?: number;
  enable_fed_on_demand_resource?: Record<string, boolean>;
  frozen_priority_class?: string;
  host_uniq?: HostUniq;
}

export interface RegionalMetaParams {
  /** traffic aliases */
  aliases?: Record<string, Alias>;
  async_mode?: boolean;
  auth_enable?: boolean;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  cell?: string;
  cold_start_disabled?: boolean;
  cors_enable?: boolean;
  dynamic_load_balancing_data_report_enabled?: boolean;
  dynamic_load_balancing_enabled_vdcs?: Array<string>;
  dynamic_load_balancing_weight_enabled?: boolean;
  enable_colocate_scheduling?: boolean;
  env_name?: string;
  exclusive_mode?: boolean;
  format_envs?: Array<FormatEnvs>;
  function_id?: string;
  gateway_route_enable?: boolean;
  gdpr_enable?: boolean;
  global_kv_namespace_ids?: Array<string>;
  http_trigger_disable?: boolean;
  is_ipv6_only?: boolean;
  /** disable zones in a region */
  is_this_zone_disabled?: Record<string, boolean>;
  latency_sec?: number;
  local_cache_namespace_ids?: Array<string>;
  net_class_id?: number;
  network?: string;
  owner?: string;
  protocol?: string;
  psm?: string;
  region?: string;
  reserved_dp_enabled?: boolean;
  revision_id?: string;
  revision_number?: number;
  routing_strategy?: string;
  /** Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  service_id?: string;
  trace_enable?: boolean;
  /** zone throttle log bytes */
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  zti_enable?: boolean;
  /** restricted access, only open to administrators */
  replica_limit?: Record<string, EmptyObject>;
  scale_settings?: FunctionScaleSettings;
  online_mode?: boolean;
  dynamic_overcommit_settings?: Record<string, DynamicOvercommitSettings>;
  formatted_elastic_prefer_cluster?: Array<FormattedPreferCluster>;
  formatted_reserved_prefer_cluster?: Array<FormattedPreferCluster>;
  enable_reserve_frozen_instance?: boolean;
  reserved_frozen_replicas?: number;
  zone_reserved_frozen_replicas?: Record<string, number>;
  allow_cold_start_instance?: boolean;
  disable_cgroup_v2?: boolean;
  overload_protect_enabled?: boolean;
  frozen_cpu_milli?: number;
  enable_fed_on_demand_resource?: Record<string, boolean>;
  frozen_priority_class?: string;
}

export interface RegionalMetaResponseData {
  region?: string;
  function_id?: string;
  service_id?: string;
  cluster?: string;
  function_name?: string;
  revision_id?: string;
  owner?: string;
  psm?: string;
  cell?: string;
  is_this_zone_disabled?: Record<string, boolean>;
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  gdpr_enable?: boolean;
  cold_start_disabled?: boolean;
  exclusive_mode?: boolean;
  async_mode?: boolean;
  online_mode?: boolean;
  auth_enable?: boolean;
  cors_enable?: boolean;
  trace_enable?: boolean;
  gateway_route_enable?: boolean;
  is_ipv6_only?: boolean;
  zti_enable?: boolean;
  http_trigger_disable?: boolean;
  aliases?: Record<string, Alias>;
  runtime?: string;
  env_name?: string;
  global_kv_namespace_ids?: Array<string>;
  local_cache_namespace_ids?: Array<string>;
  protocol?: string;
  latency_sec?: number;
  net_class_id?: number;
  envs?: Record<string, Record<string, string>>;
  in_releasing?: boolean;
  reserved_dp_enabled?: boolean;
  routing_strategy?: string;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  enable_colocate_scheduling?: boolean;
  network_mode?: string;
  dynamic_load_balancing_data_report_enabled?: boolean;
  dynamic_load_balancing_weight_enabled?: boolean;
  dynamic_load_balancing_enabled_vdcs?: Array<string>;
  dynamic_load_balance_type?: string;
  deployment_inactive?: boolean;
  is_this_zone_deployment_inactive?: Record<string, boolean>;
  package?: string;
  pod_type?: string;
  plugin_name?: string;
  allow_cold_start_instance?: boolean;
  elastic_prefer_cluster?: Record<string, string>;
  reserved_prefer_cluster?: Record<string, string>;
  elastic_user_preferred_cluster?: Record<string, string>;
  reserved_user_preferred_cluster?: Record<string, string>;
  elastic_auto_preferred_cluster?: Record<string, string>;
  reserved_auto_preferred_cluster?: Record<string, string>;
  temp_preferred_cluster?: Record<string, string>;
  formatted_elastic_prefer_cluster?: Array<FormattedPreferCluster>;
  formatted_reserved_prefer_cluster?: Array<FormattedPreferCluster>;
  runtime_log_writers?: string;
  system_log_writers?: string;
  enable_runtime_json_log?: boolean;
  is_bytepaas_elastic_cluster?: boolean;
  disable_service_discovery?: boolean;
  resource_guarantee?: boolean;
  disable_cgroup_v2?: boolean;
  async_result_emit_event_bridge?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  scale_settings?: FuncScaleSettings;
  replica_limit?: Record<string, PodReplicaLimit>;
  zone_reserved_frozen_replicas?: Record<string, number>;
  container_runtime?: string;
  enable_scale_optimise?: boolean;
  schedule_strategy?: string;
  dynamic_overcommit_settings?: Record<string, DynamicOvercommitSettings>;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  frozen_cpu_milli?: number;
  enable_fed_on_demand_resource?: Record<string, boolean>;
  frozen_priority_class?: string;
  log_link?: string;
  stream_log_link?: string;
  argos_link?: string;
  grafana_link?: string;
  metrics_links?: Array<string>;
  host_uniq?: HostUniq;
}

export interface ReleaseAllIdcStepBizData {
  region?: string;
  function_id?: string;
  zone_traffic_config?: Record<string, MapMessage>;
  release_ids?: string;
  service_id?: string;
  current_zone_traffic_config?: Record<string, MapMessage>;
  cluster?: string;
  system_log_link?: string;
  runtime_log_link?: string;
  runtime_stream_log_link?: string;
  error_help?: ErrorHelp;
}

export interface ReleaseOverviewItem {
  count?: number;
  error_code?: string;
  rate?: number;
  status_message?: string;
  total?: number;
}

export interface ReleaseRecord {
  alias_name?: string;
  cell?: string;
  cold_start_pods?: Record<string, number>;
  created_at?: string;
  created_by?: string;
  current_traffic_config?: Record<string, number>;
  current_zone_traffic_config?: Record<string, MapMessage>;
  error_code?: string;
  event_center_id?: string;
  failed_instance_logs?: string;
  finished_at?: string;
  format_current_traffic_config?: Array<RevisionTraffic>;
  format_current_zone_traffic_config?: Array<ReleaseRecordFormatCurrentZoneTrafficConfigMessage>;
  format_pre_traffic_config?: Array<RevisionTraffic>;
  format_pre_zone_traffic_config?: Array<ReleaseRecordFormatPreZoneTrafficConfigMessage>;
  format_target_traffic_config?: Array<RevisionTraffic>;
  format_target_zone_traffic_config?: Array<ReleaseRecordFormatTargetZoneTrafficConfigMessage>;
  function_id?: string;
  /** the id of release record, which can be used to get the release status, with /latest_release api */
  id?: string;
  pre_traffic_config?: Record<string, number>;
  pre_zone_traffic_config?: Record<string, MapMessage>;
  region?: string;
  release_platform?: string;
  request_id?: string;
  rolling_step?: number;
  service_id?: string;
  source_revision?: string;
  source_revision_stat?: ReleaseRecordSourceRevisionStatMessage2;
  status?: string;
  status_message?: string;
  target_revision?: string;
  target_revision_stat?: ReleaseRecordTargetRevisionStatMessage2;
  target_traffic_config?: Record<string, number>;
  target_zone_traffic_config?: Record<string, MapMessage>;
  updated_at?: string;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface ReleaseRecordFormatCurrentZoneTrafficConfigMessage {
  zone?: string;
  zone_traffic_config?: Array<RevisionTraffic>;
}

export interface ReleaseRecordFormatPreZoneTrafficConfigMessage {
  zone?: string;
  zone_traffic_config?: Array<RevisionTraffic>;
}

export interface ReleaseRecordFormatTargetZoneTrafficConfigMessage {
  zone?: string;
  zone_traffic_config?: Array<RevisionTraffic>;
}

export interface ReleaseRecordSourceRevisionStatMessage2 {
  id?: string;
  name?: string;
  number?: number;
  source?: string;
  source_type?: string;
}

export interface ReleaseRecordTargetRevisionStatMessage2 {
  id?: string;
  name?: string;
  number?: number;
  source?: string;
  source_type?: string;
}

export interface ReleaseRegionStepBizData {
  region?: string;
  service_id?: string;
  function_id?: string;
  psm?: string;
  alias_name?: string;
  target_traffic_config?: Record<string, number>;
  rolling_step?: number;
  revision_id?: string;
  release_ids?: string;
  current_traffic_config?: Record<string, number>;
  cluster?: string;
  system_log_link?: string;
  runtime_log_link?: string;
  runtime_stream_log_link?: string;
  error_help?: ErrorHelp;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface ReleaseResponseData {
  id?: string;
  function_id?: string;
  service_id?: string;
  region?: string;
  cell?: string;
  alias_name?: string;
  rolling_step?: number;
  rolling_interval?: number;
  rolling_strategy?: number;
  min_ready_percentage?: number;
  min_created_percentage?: number;
  target_traffic_config?: Record<string, number>;
  pre_traffic_config?: Record<string, number>;
  target_zone_traffic_config?: Record<string, Record<string, number>>;
  pre_zone_traffic_config?: Record<string, Record<string, number>>;
  source_revision?: string;
  target_revision?: string;
  status?: string;
  status_message?: string;
  cancel?: CancelOptions;
  error_code?: string;
  request_id?: string;
  event_center_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  finished_at?: string;
  meta_synced?: boolean;
  cold_start_pods?: Record<string, string>;
  failed_instance_logs?: string;
  release_platform?: string;
  status_snapshots?: Array<StatusSnapshot>;
  ticket_id?: string;
  current_traffic_config?: Record<string, number>;
  current_zone_traffic_config?: Record<string, Record<string, number>>;
  source_revision_stat?: ReleaseRevisionStat;
  target_revision_stat?: ReleaseRevisionStat;
  can_rollback?: boolean;
  format_current_traffic_config?: Array<FormatTrafficConfig>;
  format_current_zone_traffic_config?: Array<FormatZoneTrafficConfig>;
  format_pre_traffic_config?: Array<FormatTrafficConfig>;
  format_pre_zone_traffic_config?: Array<FormatZoneTrafficConfig>;
  format_target_traffic_config?: Array<FormatTrafficConfig>;
  format_target_zone_traffic_config?: Array<FormatZoneTrafficConfig>;
  system_log_link?: string;
  runtime_log_link?: string;
  runtime_stream_log_link?: string;
}

export interface ReleaseRevisionStat {
  id?: string;
  number?: number;
  name?: string;
  source_type?: string;
  source?: string;
}

export interface ReleaseSingleIdcStepBizData {
  region?: string;
  service_id?: string;
  function_id?: string;
  psm?: string;
  alias_name?: string;
  zone_traffic_config?: Record<string, MapMessage>;
  rolling_step?: number;
  revision_id?: string;
  release_ids?: string;
  current_zone_traffic_config?: Record<string, MapMessage>;
  cluster?: string;
  system_log_link?: string;
  runtime_log_link?: string;
  runtime_stream_log_link?: string;
  error_help?: ErrorHelp;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface ResetMQOffsetRequest {
  /** cluster of service */
  cluster: string;
  dryRun?: boolean;
  force_stop?: boolean;
  offset?: number;
  /** region of service */
  region: string;
  resetType?: string;
  reset_details_per_partition_array?: Array<ResetMQOffsetRequestResetDetailsPerPartitionArrayMessage>;
  /** ID of service */
  service_id: string;
  timestamp?: number;
  /** type of trigger */
  trigger_id: string;
  /** type of trigger */
  trigger_type: string;
  whence?: string;
}

export interface ResetMQOffsetRequestResetDetailsPerPartitionArrayMessage {
  offset?: number;
  partition?: number;
  timestamp?: number;
  whence?: string;
}

export interface ResetMQOffsetResponse {
  code?: number;
  data?: ResetMQOffsetResponseData;
  error?: string;
}

export interface ResetMQOffsetResponseData {
  ticket_id?: string;
}

export interface ResetMQTriggerBizData {
  region: string;
  cluster: string;
  service_id: string;
  function_id: string;
  created_by: string;
  trigger_id: string;
  mq_type: string;
  trigger_type: string;
  trigger_name: string;
  result?: ResetOffsetResult;
}

export interface ResetOffsetReq {
  initial_mq_status?: boolean;
  clusterName?: string;
  topicName?: string;
  consumerGroup?: string;
  whence?: string;
  relativeOffset?: number;
  timestring?: string;
  event_center_event_id?: string;
  event_center_stage_id?: string;
  psm?: string;
  partition?: number;
}

export interface ResetOffsetResult {
  reset_status?: string;
  reset_error?: string;
  reset_at?: string;
  reset_by?: string;
  partitions?: Array<PartitionDetail>;
  api_status?: number;
  api_called_at?: string;
}

export interface Resource {
  mem_mb?: number;
  cpu_milli?: number;
  disk_mb?: number;
  gpu_config?: GPU;
  socket?: number;
  resource_alias?: ResourceAlias;
}

export interface ResourceAlias {
  cpu_milli?: number;
  mem_mb?: number;
}

export interface ResourceLimit {
  cpu_milli?: number;
  disk_mb?: number;
  gpu_config?: GPU;
  mem_mb?: number;
  sgx_enclave?: number;
  socket?: number;
}

export interface ResourceLimitWithAlias {
  cpu_milli?: number;
  disk_mb?: number;
  gpu_config?: GPU;
  mem_mb?: number;
  sgx_enclave?: number;
  socket?: number;
  resource_alias?: ResourceAlias;
}

export interface ResourceRealtimeZoneData {
  avg_cpu?: number;
  avg_mem?: number;
  instances?: number;
  zone?: string;
}

export interface Revision {
  id?: string;
  name?: string;
  number?: number;
  function_id?: string;
  created_at?: string;
  description?: string;
  cluster?: string;
  region?: string;
  envs?: Record<string, Record<string, string>>;
  format_envs?: Record<string, Array<FormatEnvs>>;
  deploy_method?: string;
  handler?: string;
  initializer?: string;
  built_region_package_keys?: Record<string, string>;
  build_desc_map?: Record<string, BuildDescription>;
  worker_built_region_package_keys?: Record<string, Record<string, string>>;
  built_region_custom_images?: Record<string, string>;
  runtime?: string;
  base_image?: string;
  base_image_for_rollback?: string;
  base_image_desc?: FaaSBaseImageDesc;
  source?: string;
  source_type?: string;
  dependency?: Array<Dependency>;
  dependency_str?: string;
  run_cmd?: string;
  code_revision_number?: string;
  code_revision_id?: string;
  updated_at?: string;
  psm?: string;
  initializer_sec?: number;
  latency_sec?: number;
  cold_start_sec?: number;
  cold_start_disabled?: boolean;
  resource_limit?: ResourceLimit;
  max_concurrency?: number;
  adaptive_concurrency_mode?: string;
  exclusive_mode?: boolean;
  lazyload?: boolean;
  open_image_lazyload?: boolean;
  auth_enable?: boolean;
  disable_build_install?: boolean;
  cors_enable?: boolean;
  is_this_zone_disabled?: Record<string, boolean>;
  gdpr_enable?: boolean;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  last_ticket_status?: string;
  created_by?: string;
  online_mode?: boolean;
  network_mode?: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  runtime_other_container_ports?: Array<number>;
  overload_protect_enabled?: boolean;
  host_uniq?: HostUniq;
}

export interface RevisionTraffic {
  revision_id: string;
  traffic_value: number;
}

export interface RocketMQOptions {
  topic?: string;
  orderly?: boolean;
  sub_expr?: string;
  cluster_name?: string;
  consumer_group?: string;
  enable_filter?: boolean;
  filter_source_type?: string;
  filter_source?: string;
  filter_plugin_id?: string;
  filter_plugin_version?: string;
  retry_interval_seconds?: number;
  enable_retry_queue?: boolean;
  close_multi_env?: boolean;
  enable_multi_tags?: boolean;
  multi_env_version?: string;
  is_eventbus_type?: boolean;
  epoch?: Int64;
  enable_local_consume?: boolean;
  max_in_flight?: number;
  enable_mq_lease?: boolean;
  order_sub_retry?: boolean;
  region_for_mirror?: string;
  enable_batch_consume?: boolean;
  consume_message_batch_max_linger_time?: number;
  consume_message_batch_max_size?: number;
  enable_per_orderly_queue_worker?: boolean;
}

export interface RocketmqTopicPreviewParams {
  cluster_name: string;
  topic_name: string;
  /** 拉取方式 0-从最久的offset 1-从最新的offset 3-指定offset 4-指定时间戳 5-指定messageid */
  type: number;
  /** 对于拉取方式为 3/4 时 指定向前还是向后拉取 */
  forward?: boolean;
  /** 单个queue消息条数 */
  msg_num: Int64;
  /** 对于拉取方式为5时 指定messageid */
  message_id?: string;
  idc?: string;
  broker_name?: string;
  queue_id?: string;
  body_encode?: string;
  time_stamp?: Int64;
  offset?: Int64;
}

export interface RollbackRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  targets?: Array<RollbackRequestTargetsMessage>;
  /** type of trigger */
  trigger_id: string;
  /** type of trigger */
  trigger_type: string;
}

export interface RollbackRequestTargetsMessage {
  /** the ID of the target rollback ticket */
  ticket_id?: string;
}

export interface RollbackResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface RollbackRevisions {
  region?: string;
  cluster?: string;
  revision_id?: string;
}

export interface Runtime {
  category?: string;
  default_template?: string;
  function_type?: string;
  key?: string;
  name?: string;
  show?: boolean;
  supported_protocols?: Array<string>;
  supported_domains?: Array<string>;
}

export interface RuntimeReleaseParams {
  release_info?: RuntimeReleaseParamsReleaseInfoMessage2;
  release_params?: RuntimeReleaseParamsReleaseParamsMessage2;
}

export interface RuntimeReleaseParamsReleaseInfoMessage2 {
  release_ids?: Array<string>;
}

export interface RuntimeReleaseParamsReleaseParamsMessage2 {
  alias_name?: string;
  region?: string;
  rolling_step?: number;
  target_traffic_config?: Record<string, number>;
  zone_traffic_config?: Record<string, MapMessage>;
  grey_mqevent_config?: Array<GreyMQEvent>;
  cluster?: string;
  function_id?: string;
  /** 0 - 先杀后起， 1 - 先起后杀 */
  rolling_strategy?: number;
  /** 滚动间隔，单位（s） */
  rolling_interval?: number;
  /** 滚动完成判断条件 1：最少百分之 N 的容器创建；数值范围（1-100） */
  min_created_percentage?: number;
  /** 滚动完成判断条件 2：最少百分之 N 的容器启动完成；数值范围（1-100） */
  min_ready_percentage?: number;
}

export interface ScaleStrategy {
  /** when the strategy will be effective */
  effective_time?: string;
  /** strategy is enabled or not */
  enabled?: boolean;
  /** when the strategy will be expired */
  expired_time?: string;
  /** function id, no need for post/patch method, it is a path param */
  function_id?: string;
  inner_strategy?: InnerStrategy;
  /** function id or mqevent id */
  item_id?: string;
  /** function or mqevent */
  item_type?: string;
  /** region, no need for post/patch method, it is a path param */
  region?: string;
  /** strategy id, no need for post/patch method, it is a path param */
  strategy_id?: string;
  /** strategy name */
  strategy_name?: string;
  /** only cron for now */
  strategy_type?: string;
  /** updated by */
  updated_by?: string;
  /** ReservedInstance or FrozenReservedInstance default is ReservedInstance */
  instance_type?: string;
}

export interface ScaleThresholdOptionsApiResponse {
  code?: number;
  data?: ScaleThresholdOptionsResult;
  error?: string;
}

export interface ScaleThresholdOptionsRequest {
  service_id: string;
  /** scale target: functions/mqtriggers */
  target: string;
  mqtrigger_id?: string;
}

export interface ScaleThresholdOptionsResult {
  scale_threshold_options?: Array<ScaleThresholdsSet>;
  lag_scale_options?: Array<string>;
}

export interface ScaleThresholdSetting {
  strategy_name?: string;
  scale_up_threshold?: number;
  scale_target?: number;
  scale_down_threshold?: number;
}

export interface ScaleThresholdsSet {
  scale_set_name?: string;
  strategy_settings?: Array<ScaleThresholdSetting>;
}

export interface scmVersion {
  branch?: string;
  commit_hash?: string;
  repo_id?: number;
  scm_type?: string;
  version_version?: string;
}

export interface ScmVersionInfo {
  version: string;
  type: string;
  desc: string;
  status: string;
}

export interface SearchFunctionsBySCMRequest {
  /** pagination query, specify the number for one page */
  limit?: number;
  /** pagination query, specify the offset, default 0 */
  offset?: number;
  /** scm name that this service refers to */
  scm: string;
}

export interface SearchFunctionsBySCMResponse {
  code?: number;
  data?: ServiceResponse;
  error?: string;
}

export interface SendNotificationsToLarkBotGroupsRequest {
  /** Content of the notification message */
  content?: string;
  receiver_ids?: Array<string>;
}

export interface SendNotificationsToLarkBotGroupsResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface ServiceResponse {
  id?: string;
  service_id?: string;
  name?: string;
  description?: string;
  handler?: string;
  initializer?: string;
  admins?: string;
  owner?: string;
  psm?: string;
  psm_parent_id?: number;
  runtime?: string;
  language?: string;
  run_cmd?: string;
  base_image?: string;
  origin?: string;
  category?: string;
  need_approve?: boolean;
  authorizers?: string;
  subscribers?: Array<string>;
  plugin_name?: string;
  plugin_scm_id?: number;
  plugin_scm_path?: string;
  disable_ppe_alarm?: boolean;
  async_mode?: boolean;
  disable_build_install?: boolean;
  max_revision_number?: number;
  max_code_revision_number?: number;
  ms_register_suc?: boolean;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  env_name?: string;
  source_type?: string;
  source?: string;
  code_file_size_mb?: number;
  global_kv_namespace_ids?: Array<string>;
  local_cache_namespace_ids?: Array<string>;
  protocol?: string;
  argos_link?: string;
  created_at?: string;
  updated_at?: string;
  revision_id?: string;
  api_version?: string;
  clusters?: Array<ClusterResponseData>;
  net_queue?: string;
  mount_info?: Array<string>;
  soft_deleted?: string;
}

export interface ServiceTreeNode {
  name: string;
}

export interface Setting {
  name?: string;
  value?: string;
  region?: string;
  tag?: string;
  updated_at?: string;
  updated_by?: string;
  is_deleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  meta_synced?: boolean;
  meta_synced_at?: string;
  cell?: string;
  gray_value?: string;
  need_gray?: boolean;
  gray_conf?: GrayConfig;
}

export interface SkipCheckForBatchTaskRequest {
  parent_id: string;
  id: string;
}

export interface SkipCheckForBatchTaskResponse {
  code?: number;
  error?: string;
}

export interface Stage {
  stage_meta?: StageMeta;
}

export interface StageMeta {
  type?: string;
  group?: string;
  is_rollback?: boolean;
  name?: string;
}

export interface StartLogs {
  prepare?: Array<LogItem>;
  load?: Array<LogItem>;
  initialize?: Array<LogItem>;
}

export interface StatusSnapshot {
  status?: string;
  status_message?: string;
  error_code?: string;
  changed_at?: string;
}

export interface StepAction {
  name?: string;
}

export interface SubscribeServiceRequest {
  'X-Jwt-Token'?: string;
  /** ID of function service */
  service_id: string;
  /** array of name of subscribers. 订阅人数组 */
  subscribers?: Array<string>;
}

export interface SubscribeServiceResponse {
  code?: number;
  data?: ApiResponseDataMessage2;
  error?: string;
}

export interface SwitchBurstProtectorRequest {
  /** Switch stage for all PSMs */
  is_all?: boolean;
  /** List of PSMs to switch */
  psms?: string;
  /** Single PSM to switch */
  psm?: string;
  /** Cluster to switch */
  cluster?: string;
  /** Stage to switch to */
  stage: string;
  /** Debug mode */
  debug?: boolean;
}

export interface SwitchBurstProtectorResponse {
  /** Response code */
  code: number;
  /** Error message, if any */
  error?: string;
  /** Success or failure summary */
  message?: string;
}

export interface SyncMqTriggerDataRequest {
  /** cluster of service */
  cluster: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** trigger id */
  trigger_id: string;
  /** trigger type */
  trigger_type: string;
}

export interface SyncMqTriggerDataResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface TargetSetting {
  key?: string;
  value?: string;
}

/** ticket */
export interface Ticket {
  approved_by?: string;
  approved_by_usertype?: string;
  /** category of ticket */
  category?: string;
  /** change_type of ticket */
  change_type?: string;
  /** The number of the child tickets, ie, the number of the tickets created by a batch operation ticket. It's only available when parent_id is not empty. */
  child_tickets_num?: number;
  created_at?: string;
  created_by?: string;
  detail_info?: TicketDetailInfo;
  error_response?: TicketErrorResponseMessage2;
  finished_at?: string;
  /** ID of function */
  function_id?: string;
  /** ID of ticket */
  id?: string;
  /** Determine if the ticket is generated from an admin/ops operation or user operation */
  is_admin_ticket?: boolean;
  note?: string;
  origin_data?: TicketResourceMeta;
  /** Parent ID of a ticket, ie, the ID of a batch ticket */
  parent_id?: string;
  request_id?: string;
  /** ID of service */
  service_id?: string;
  /** status of ticket */
  status?: string;
  status_before_failed?: string;
  status_message?: string;
  /** type of ticket */
  type?: string;
  update_data?: TicketResourceMeta;
  updated_at?: string;
  is_pipeline_ticket?: boolean;
  pipeline_template_type?: string;
  pipeline?: PipelineResponseData;
  region?: string;
  skipped?: string;
  clusters?: Array<ClusterInfo>;
  description?: string;
  mqevent_release_type?: string;
}

export interface TicketDetailInfo {
  runtime_release?: RuntimeReleaseParams;
  cluster_release?: Array<RuntimeReleaseParams>;
}

export interface TicketErrorResponseMessage2 {
  errno?: number;
  error_code?: string;
  error_message?: string;
  /** 排查失败问题的一些 Help 控制指令 */
  error_help?: ErrorHelp;
}

export interface TicketResourceMeta {
  function_resource?: TicketResourceMetaFunctionResourceMessage2;
  runtime_release?: TicketResourceMetaRuntimeReleaseMessage2;
  runtime_update?: TicketResourceMetaRuntimeUpdateMessage2;
  cluster_release_meta?: Array<TicketResourceMetaRuntimeReleaseMessage2>;
}

export interface TicketResourceMetaFunctionResourceMessage2 {
  code_revision_meta?: CodeRevision;
  function_meta?: TicketResourceMetaFunctionResourceMessage2FunctionMetaMessage2;
  regional_meta?: RegionalMetaParams;
  trigger_meta?: TicketResourceMetaFunctionResourceMessage2TriggerMetaMessage2;
  scale_strategy_meta?: ScaleStrategy;
}

export interface TicketResourceMetaFunctionResourceMessage2FunctionMetaMessage2 {
  /** enable auth check (using jwt token) */
  auth_enable?: boolean;
  /** authorizers of function, split by ',', 函数的授权人，用 ',' 分隔 */
  authorizers?: string;
  /** limit of cold start, 冷启动超时参数 */
  cold_start_sec?: number;
  /** enable cors，允许跨域 */
  cors_enable?: boolean;
  /** description of function, 函数描述 */
  description?: string;
  /** disable build install, only support python/nodejs, 是否调过构建，仅支持 python/nodejs */
  disable_build_install?: boolean;
  /** envs of function by region or router, if key is router, it will be applied in all region */
  envs?: Record<string, MapMessage>;
  /** handler of function, most scenario no need to use this param */
  handler?: string;
  /** initializer function name, default could be none */
  initializer?: string;
  /** limit of function latency, 函数时延超时参数 */
  latency_sec?: number;
  /** max concurrency for one function instance */
  max_concurrency?: number;
  /** memory of function, used for set function resource, unit is MB */
  memory_mb?: number;
  /** name of function, 函数名称 */
  name?: string;
  /** origin of function, from bytefaas ori light(like qingfuwu), 函数的来源，除了 faas 也有可能是来自轻服务等 */
  origin?: string;
  /** the owner of function, 函数的 Owner */
  owner?: string;
  /** protocol of function, such as TTHeader etc. */
  protocol?: string;
  /** psm of function */
  psm?: string;
  /** parent id of psm, only used in create, can not be updated through faas api */
  psm_parent_id?: number;
  /** which runtime language function used. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  /** service level, could be P0 ~ P3 */
  service_level?: string;
  /** service purpose */
  service_purpose?: string;
  /** source code name of latest revision */
  source?: string;
  /** source code type of latest revision */
  source_type?: string;
  /** name of template, 选择的模板名称 */
  template_name?: string;
  /** vpc config, only for ToB logic */
  vpc_config?: BasicFunctionParamsVpcConfigMessage2;
  /** restricted access, only open to administrators */
  async_mode?: boolean;
}

export interface TicketResourceMetaFunctionResourceMessage2TriggerMetaMessage2 {
  consul?: ConsulTriggerResponseData;
  mqevents?: GlobalMQEventTriggerResponseData;
  scale_strategy_meta?: ScaleStrategy;
  timers?: TimerTrigger;
}

export interface TicketResourceMetaRuntimeReleaseMessage2 {
  revision?: Revision;
}

export interface TicketResourceMetaRuntimeUpdateMessage2 {
  function_meta?: TicketResourceMetaRuntimeUpdateMessage2FunctionMetaMessage2;
  regional_metas?: Record<string, BasicRegionalMetaParams>;
}

export interface TicketResourceMetaRuntimeUpdateMessage2FunctionMetaMessage2 {
  /** enable auth check (using jwt token) */
  auth_enable?: boolean;
  /** authorizers of function, split by ',', 函数的授权人，用 ',' 分隔 */
  authorizers?: string;
  /** limit of cold start, 冷启动超时参数 */
  cold_start_sec?: number;
  /** enable cors，允许跨域 */
  cors_enable?: boolean;
  /** description of function, 函数描述 */
  description?: string;
  /** disable build install, only support python/nodejs, 是否调过构建，仅支持 python/nodejs */
  disable_build_install?: boolean;
  /** envs of function by region or router, if key is router, it will be applied in all region */
  envs?: Record<string, MapMessage>;
  /** handler of function, most scenario no need to use this param */
  handler?: string;
  /** initializer function name, default could be none */
  initializer?: string;
  /** limit of function latency, 函数时延超时参数 */
  latency_sec?: number;
  /** max concurrency for one function instance */
  max_concurrency?: number;
  /** memory of function, used for set function resource, unit is MB */
  memory_mb?: number;
  /** name of function, 函数名称 */
  name?: string;
  /** origin of function, from bytefaas ori light(like qingfuwu), 函数的来源，除了 faas 也有可能是来自轻服务等 */
  origin?: string;
  /** the owner of function, 函数的 Owner */
  owner?: string;
  /** protocol of function, such as TTHeader etc. */
  protocol?: string;
  /** psm of function */
  psm?: string;
  /** parent id of psm, only used in create, can not be updated through faas api */
  psm_parent_id?: number;
  /** which runtime language function used. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  /** service level, could be P0 ~ P3 */
  service_level?: string;
  /** service purpose */
  service_purpose?: string;
  /** source code name of latest revision */
  source?: string;
  /** source code type of latest revision */
  source_type?: string;
  /** name of template, 选择的模板名称 */
  template_name?: string;
  /** vpc config, only for ToB logic */
  vpc_config?: BasicFunctionParamsVpcConfigMessage2;
  /** restricted access, only open to administrators */
  async_mode?: boolean;
}

export interface TicketRuntimeUpdateRequest {
  approved_by?: string;
  approved_by_usertype?: string;
  function_id?: string;
  function_meta?: FunctionMetaParams;
  regional_metas?: Record<string, RegionalMetaParams>;
  service_id?: string;
}

export interface TicketRuntimeUpdateResponse {
  code?: number;
  data?: Ticket;
  error?: string;
}

export interface TimeOfDay {
  hours?: number;
  minutes?: number;
}

export interface TimerTrigger {
  cell?: string;
  cluster?: string;
  concurrency_limit?: number;
  created_at?: string;
  cron?: string;
  description?: string;
  enabled?: boolean;
  function_id?: string;
  id?: string;
  is_deleted?: boolean;
  meta_synced?: boolean;
  meta_synced_at?: string;
  name?: string;
  payload?: string;
  region?: string;
  retries?: number;
  service_id?: string;
  updated_at?: string;
  log_link?: string;
  argos_link?: string;
}

export interface TOSOptions {
  bucket_name?: string;
  bucket_id?: number;
  rule_id?: number;
  event_types?: Array<string>;
  topic?: string;
  cluster_name?: string;
  consumer_group?: string;
  enable_filter?: boolean;
  un_orderly?: boolean;
  filter_source_type?: string;
  filter_source?: string;
  filter_plugin_id?: string;
  filter_plugin_version?: string;
  retry_interval_seconds?: number;
}

export interface TriggerBizData {
  region: string;
  cluster: string;
  service_id: string;
  function_id: string;
  created_by: string;
  trigger_id: string;
  other_request_params?: Record<string, string>;
  trigger_params?: CreateMQTriggerRequest;
  trigger_type: string;
  trigger_name: string;
  bpm_orders: Array<TriggerBizDataBPMOrderData>;
}

export interface TriggerBizDataBPMOrderData {
  name: string;
  record_id: string;
  link: string;
  finished: number;
}

export interface TriggerDebugCloudEvent {
  /** json串 */
  extensions: string;
  data: string;
}

export interface TriggerDebugNativeBMQMessage {
  key: string;
  value: string;
  topic: string;
  offset: Int64;
  timestamp: Int64;
}

export interface TriggerDebugNativeEvent {
  mq_event_id: string;
  cluster: string;
  consumer_group: string;
  max_retry_num: number;
  retries_for_bad_status_requests: number;
  retries_for_error_requests: number;
  rmq_native_message: TriggerDebugNativeRMQMessage;
  bmq_native_message: TriggerDebugNativeBMQMessage;
  msg_body: string;
}

export interface TriggerDebugNativeRMQMessage {
  msg: TriggerDebugNativeRMQMessageMsg;
  messageQueue: TriggerDebugNativeRMQMessageQueue;
  storeSize: number;
  queueOffset: Int64;
  commitLogOffset: Int64;
  sysFlag: number;
  bornTimestamp: Int64;
  bornHost: string;
  storeTimestamp: Int64;
  storeHost: string;
  msgId: string;
  bodyCRC: number;
  offsetMsgId: string;
}

export interface TriggerDebugNativeRMQMessageMsg {
  topic: string;
  flag: string;
  properties: Record<string, string>;
  tags: string;
  keys: string;
}

export interface TriggerDebugNativeRMQMessageQueue {
  topic: string;
  brokerName: string;
  queueId: number;
}

export interface TriggerDebugRequest {
  service_id: string;
  region: string;
  cluster: string;
  zone?: string;
  trigger_type: string;
  cloud_event?: Array<TriggerDebugCloudEvent>;
  /** 是否为批量消息，当cloud_event数组长度大于1则为批量消息，否则根据该参数判断 */
  is_batch_msg: boolean;
  is_native_msg?: boolean;
  native_event?: Array<TriggerDebugNativeEvent>;
}

export interface TriggerDebugResponse {
  code: number;
  data: TriggerDebugResponseData;
  error: string;
}

export interface TriggerDebugResponseData {
  log_id: string;
  /** success/failed */
  status: string;
  http_headers?: Record<string, string>;
  http_code?: number;
  http_body?: string;
  cpu_usage?: string;
  mem_usage?: string;
  execution_duration?: string;
  pod_name?: string;
  logs: Array<string>;
  cloud_event: Array<TriggerDebugCloudEvent>;
  failed_message: string;
  argos_log_link: string;
  pod_zone?: string;
  native_event?: Array<TriggerDebugNativeEvent>;
}

export interface TriggerDebugTplItem {
  service_id: string;
  name: string;
  tpl_type: string;
  creator: string;
  /** 如果数组里有多个元素则为批量消息 */
  cloud_event: Array<TriggerDebugCloudEvent>;
  created_at: string;
  updated_at: string;
  trigger_type: string;
  msg_type: string;
  id: string;
  native_event?: Array<TriggerDebugNativeEvent>;
}

export interface TriggerFrozenActiveRequest {
  psm: string;
  env: string;
  region: string;
  cluster: string;
  zone: string;
}

export interface TriggerFrozenActiveResponse {
  code: number;
  data: TriggerFrozenActiveResponseData;
  error: string;
}

export interface TriggerFrozenActiveResponseData {
  log_id: string;
}

export interface TriggerOptions {
  abase_binlog_option?: AbaseBinlogOptions;
  eventbus_option?: EventBusOptions;
  kafka_option?: KafkaMQOptions;
  nsq_option?: NSQOptions;
  rocketmq_option?: RocketMQOptions;
  tos_option?: TOSOptions;
}

export interface UnsubscribeServiceRequest {
  'X-Jwt-Token'?: string;
  /** ID of service to unsub */
  service_id: string;
}

export interface UnsubscribeServiceResponse {
  code?: number;
  data?: ApiResponseDataMessage2;
  error?: string;
}

export interface UpdateBaseImagesRequest {
  key?: string;
  UpdateBaseImages?: string;
}

export interface UpdateBaseImagesResponse {
  code?: number;
  error?: string;
  data?: Record<string, string>;
  status?: string;
  message?: string;
}

export interface UpdateClusterAlarmRequest {
  alarm_id?: string;
  alarm_methods?: string;
  /** cluster */
  cluster: string;
  function_id?: string;
  level?: string;
  /** region */
  region: string;
  rule_alias?: string;
  rule_format?: string;
  /** ID of service */
  service_id: string;
  status?: string;
  threshold?: number;
}

export interface UpdateClusterAlarmResponse {
  code?: number;
  data?: Alarm;
  error?: string;
}

export interface UpdateClusterAutoMeshRequest {
  /** cluster name */
  cluster: string;
  mesh_enable?: boolean;
  mesh_http_egress?: boolean;
  mesh_mongo_egress?: boolean;
  mesh_mysql_egress?: boolean;
  mesh_rpc_egress?: boolean;
  mesh_sidecar_percent?: number;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface UpdateClusterAutoMeshResponse {
  code?: number;
  data?: AutoMeshParams;
  error?: string;
}

export interface UpdateClusterRequest {
  /** auth switch. 鉴权开关 */
  auth_enable?: boolean;
  /** name of cluster */
  cluster: string;
  /** ID of code revision. 部署代码版本 ID */
  code_revision_id?: string;
  /** number of code revision. 部署代码版本号 */
  code_revision_number?: string;
  /** cold start switch. 冷启动开关 */
  cold_start_disabled?: boolean;
  /** CORS switch. CORS 开关 */
  cors_enable?: boolean;
  enable_colocate_scheduling?: boolean;
  enable_scale_strategy?: boolean;
  /** exclusive mode. 独占模式 */
  exclusive_mode?: boolean;
  format_envs?: Array<FormatEnvs>;
  gateway_route_enable?: boolean;
  /** GDPR switch. GDPR 鉴权开关 */
  gdpr_enable?: boolean;
  global_kv_namespace_ids?: Array<string>;
  http_trigger_disable?: boolean;
  initializer_sec?: number;
  is_ipv6_only?: boolean;
  /** disable zones in a region */
  is_this_zone_disabled?: Record<string, boolean>;
  latency_sec?: number;
  max_concurrency?: number;
  /** Optional values: empty string,bridge */
  network_mode?: string;
  /** region name */
  region: string;
  /** function reserved mode switch. 函数预留模式开关 */
  reserved_dp_enabled?: boolean;
  resource_limit?: ResourceLimit;
  revision_id?: string;
  revision_number?: number;
  /** function routing strategy. 函数路由调度策略 */
  routing_strategy?: string;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  /** service ID */
  service_id: string;
  trace_enable?: boolean;
  /** zone throttle log bytes */
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  /** ZTI switch. ZTI 鉴权开关 */
  zti_enable?: boolean;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  cold_start_sec?: number;
  async_mode?: boolean;
  enable_scale_optimise?: boolean;
  enable_runtime_file_log?: boolean;
  enable_runtime_console_log?: boolean;
  enable_runtime_stream_log?: boolean;
  enable_runtime_es_log?: boolean;
  enable_runtime_json_log?: boolean;
  enable_system_stream_log?: boolean;
  enable_system_es_log?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  pod_type?: string;
  online_mode?: boolean;
  enable_reserve_frozen_instance?: boolean;
  cluster_run_cmd?: string;
  disable_service_discovery?: boolean;
  async_result_emit_event_bridge?: boolean;
  resource_guarantee?: boolean;
  mq_trigger_limit?: number;
  cell?: string;
  lazyload?: boolean;
  image_lazyload?: boolean;
  initializer?: string;
  handler?: string;
  run_cmd?: string;
  throttle_log_enabled?: boolean;
  adaptive_concurrency_mode?: string;
  env_name?: string;
  container_runtime?: string;
  protocol?: string;
  overload_protect_enabled?: boolean;
  mq_consumer_meta?: Array<ClusterMQConsumerMeta>;
  enable_consul_ipv6_register?: boolean;
  enable_sys_mount?: boolean;
  disable_mount_jwt_bundles?: boolean;
  termination_grace_period_seconds?: number;
  enable_consul_register?: boolean;
  'X-Jwt-Token'?: string;
  host_uniq?: HostUniq;
}

export interface UpdateClusterResponse {
  code?: number;
  data?: ClusterResponseData;
  error?: string;
}

export interface UpdateCodeByServiceIDRequest {
  /** use struct type to reference only. Value is JSON string. */
  dependency?: Array<Dependency>;
  deploy_method?: string;
  disable_build_install?: boolean;
  handler?: string;
  initializer?: string;
  lazyload?: boolean;
  run_cmd?: string;
  /** runtime. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  runtime_container_port?: number;
  runtime_debug_container_port?: number;
  service_id: string;
  source?: string;
  source_type?: string;
  /** binary data of code resource */
  zip_file?: UpdateCodeByServiceIDRequestZipFileMessage2;
  zip_file_size?: number;
  open_image_lazyload?: boolean;
  runtime_other_container_ports?: Array<number>;
}

export interface UpdateCodeByServiceIDRequestZipFileMessage2 {}

export interface UpdateCodeByServiceIDResponse {
  code?: number;
  data?: CodeRevision;
  error?: string;
}

/** should set this object if the cron strategy is update_pending */
export interface UpdateConfig {
  /** how long the strategy will be effective */
  duration_minutes?: number;
  /** how many replicas should be keep in each zone */
  min_zone_replicas?: Record<string, number>;
  start_time?: UpdateConfigStartTimeMessage2;
}

export interface UpdateConfigStartTimeMessage2 {
  /** the hours to start */
  hours?: number;
  /** the minutes to start */
  minutes?: number;
}

export interface UpdateConsulTriggerRequest {
  /** cluster of service */
  cluster: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** trigger_id of function */
  trigger_id: string;
  'X-Jwt-Token'?: string;
}

export interface UpdateConsulTriggerResponse {
  code?: number;
  data?: ConsulTriggerResponseData;
  error?: string;
}

export interface UpdateFilterPluginsRequest {
  /** cluster name */
  cluster: string;
  filter_plugin_id: string;
  name?: string;
  /** region name */
  region: string;
  /** ID of service */
  service_id: string;
  /** zip file binary */
  zip_file?: UpdateFilterPluginsRequestZipFileMessage2;
  zip_file_size?: number;
}

export interface UpdateFilterPluginsRequestZipFileMessage2 {}

export interface UpdateFilterPluginsResponse {
  code?: number;
  data?: FilterPlugin;
  error?: string;
}

export interface UpdateFunctionInstanceServiceDiscoveryRequest {
  disabled: boolean;
  /** ID of service */
  service_id: string;
  /** region name */
  region: string;
  /** cluster name */
  cluster: string;
  zone: string;
  podname: string;
}

export interface UpdateFunctionInstanceServiceDiscoveryResponse {
  code?: number;
  data?: EmptyObject;
  error?: string;
}

export interface UpdateFunctionLatestRevisionRequest {
  /** cluster name */
  cluster: string;
  /** region */
  region: string;
  /** ID of service */
  service_id: string;
}

export interface UpdateFunctionLatestRevisionResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface UpdateFunctionRevisionRequest {
  /** cluster */
  cluster: string;
  deploy_method?: string;
  envs?: Record<string, MapMessage>;
  handler?: string;
  /** region */
  region: string;
  /** Number of revision */
  revision_number: number;
  /** runtime. 运行时. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  /** ID of service */
  service_id: string;
  source?: string;
  /** Type of code source. Values: url/scm/tos */
  source_type?: string;
}

export interface UpdateFunctionRevisionResponse {
  code?: number;
  data?: Revision;
  error?: string;
}

export interface UpdateHttpTriggerRequest {
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  /** cluster of service */
  cluster: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  /** region of service */
  region: string;
  /** ID of service */
  service_id: string;
  /** ID of trigger */
  trigger_id: string;
  /** url prefix */
  url_prefix?: string;
  /** type of this version. Allow to be `revision` or `alias` */
  version_type?: string;
  /** value of version type. When `version_type` is `revision`, it should be an ID of revision. */
  version_value?: string;
  runtime?: string;
  'X-Jwt-Token'?: string;
}

export interface UpdateHttpTriggerResponse {
  code?: number;
  data?: HttpTriggerResponse;
  error?: string;
}

export interface UpdateImageScmVersionRequest {
  version?: string;
  git_commit?: string;
  key?: string;
}

export interface UpdateImageScmVersionResponse {
  code?: number;
  error?: string;
  data?: Setting;
}

export interface UpdateMqTriggerByTypeRequest {
  batch_size?: number;
  batch_flush_duration_milliseconds?: number;
  description?: string;
  enabled?: boolean;
  envs?: Record<string, string>;
  function_id?: string;
  cell?: string;
  id?: string;
  image_version?: string;
  sdk_version?: string;
  image_alias?: string;
  ms_alarm_id?: Array<string>;
  mq_type?: string;
  max_retries_from_function_status?: number;
  msg_chan_length?: number;
  name?: string;
  need_auto_sharding?: boolean;
  num_of_mq_pod_to_one_func_pod?: number;
  options?: TriggerOptions;
  qps_limit?: number;
  region?: string;
  mq_region?: string;
  runtime_agent_mode?: boolean;
  dynamic_worker_thread?: boolean;
  replica_max_limit?: Record<string, number>;
  replica_min_limit?: Record<string, number>;
  replicas?: number;
  resource?: Resource;
  scale_enabled?: boolean;
  vertical_scale_enabled?: boolean;
  enable_static_membership?: boolean;
  workers_per_pod?: number;
  alarm_params?: AlarmParameters;
  request_timeout?: number;
  disable_infinite_retry_for_timeout?: boolean;
  initial_offset_start_from?: string;
  enable_mq_debug?: boolean;
  mq_logger_limit_size?: number;
  enable_backoff?: boolean;
  disable_backoff?: boolean;
  worker_v2_num_per_half_core?: number;
  enable_concurrency_filter?: boolean;
  enable_ipc_mode?: boolean;
  enable_traffic_priority_scheduling?: boolean;
  enable_pod_colocate_scheduling?: boolean;
  enable_global_rate_limiter?: boolean;
  enable_congestion_control?: boolean;
  allow_bytesuite_debug?: boolean;
  enable_dynamic_load_balance?: boolean;
  disable_smooth_wrr?: boolean;
  dynamic_load_balance_type?: string;
  replica_force_meet_partition?: boolean;
  scale_settings?: MQEventScaleSettings;
  hot_reload?: boolean;
  mq_msg_type?: string;
  status?: string;
  in_releasing?: boolean;
  mirror_region_filter?: string;
  enable_gctuner?: boolean;
  gctuner_percent?: number;
  retry_strategy?: string;
  max_retry_time?: number;
  qps_limit_time_ranges?: Array<QPSLimitTimeRanges>;
  limit_disaster_scenario?: number;
  enable_step_rate_limit?: boolean;
  rate_limit_step_settings?: RateLimitStepSettings;
  max_dwell_time_minute?: number;
  qps_auto_limit?: ConsumeMigrateAutoLimit;
  plugin_function_param?: PluginFunctionParam;
  enable_plugin_function?: boolean;
  enable_canary_update?: boolean;
  traffic_config?: Record<string, number>;
  is_auth_info_updated?: boolean;
  pod_type?: string;
  package?: string;
  enable_filter_congestion_control?: boolean;
  enable_congestion_control_cache?: boolean;
  service_id: string;
  /** cluster of service */
  cluster: string;
  /** trigger id */
  trigger_id: string;
  /** trigger type */
  trigger_type: string;
  /** skips image upgrade， the value can be "true" or "false" */
  skip_image_upgrade?: string;
  caller?: string;
  not_update_alarm?: string;
  migrated_by_cli?: string;
  check?: string;
  'X-Bytefaas-Mqevent-Force-Update'?: string;
  confirm?: string;
  'X-ByteFaaS-Update-MQ-Image'?: string;
  /** jwt token */
  'X-Jwt-Token'?: string;
}

export interface UpdateMqTriggerByTypeResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface UpdateMQTriggerRequest {
  alarm_params?: UpdateMQTriggerRequestAlarmParamsMessage2;
  allow_bytesuite_debug?: boolean;
  batch_size?: number;
  cell?: string;
  /** cluster of service */
  cluster: string;
  deployment_inactive?: boolean;
  description?: string;
  disable_backoff?: boolean;
  disable_smooth_wrr?: boolean;
  dynamic_load_balance_type?: string;
  dynamic_worker_thread?: boolean;
  enable_backoff?: boolean;
  enable_concurrency_filter?: boolean;
  enable_congestion_control?: boolean;
  enable_dynamic_load_balance?: boolean;
  enable_global_rate_limiter?: boolean;
  enable_ipc_mode?: boolean;
  enable_mq_debug?: boolean;
  enable_pod_colocate_scheduling?: boolean;
  enable_static_membership?: boolean;
  enable_traffic_priority_scheduling?: boolean;
  enabled?: boolean;
  envs?: Record<string, string>;
  function_id?: string;
  hot_reload?: boolean;
  id?: string;
  image_alias?: string;
  image_version?: string;
  initial_offset_start_from?: string;
  is_auth_info_updated?: boolean;
  max_retries_from_function_status?: number;
  mq_logger_limit_size?: number;
  mq_msg_type?: string;
  mq_region?: string;
  mq_type?: string;
  ms_alarm_id?: Array<string>;
  msg_chan_length?: number;
  name?: string;
  need_auto_sharding?: boolean;
  num_of_mq_pod_to_one_func_pod?: number;
  options?: TriggerOptions;
  plugin_function_param?: PluginFunctionParam;
  qps_limit?: number;
  /** region of service */
  region: string;
  replica_max_limit?: number;
  replica_min_limit?: number;
  replicas?: number;
  request_timeout?: number;
  resource?: ResourceLimit;
  runtime_agent_mode?: boolean;
  scale_enabled?: boolean;
  scale_settings?: MQEventScaleSettings;
  sdk_version?: string;
  /** ID of service */
  service_id: string;
  /** ID of mq trigger */
  trigger_id: string;
  vertical_scale_enabled?: boolean;
  worker_v2_num_per_half_core?: number;
  workers_per_pod?: number;
  enable_plugin_function?: boolean;
  disable_infinite_retry_for_timeout?: boolean;
  mirror_region_filter?: string;
  enable_gctuner?: boolean;
  gctuner_percent?: number;
  retry_strategy?: string;
  max_retry_time?: number;
  qps_limit_time_ranges?: Array<QPSLimitTimeRanges>;
  rate_limit_step_settings?: RateLimitStepSettings;
  enable_step_rate_limit?: boolean;
  enable_filter_congestion_control?: boolean;
  enable_congestion_control_cache?: boolean;
}

export interface UpdateMQTriggerRequestAlarmParamsMessage2 {
  lag_alarm_threshold?: number;
}

export interface UpdateMQTriggerResponse {
  code?: number;
  data?: GlobalMQEventTriggerResponseData;
  error?: string;
}

export interface UpdateRegionalMetaRequest {
  function_id?: string;
  function_name?: string;
  revision_id?: string;
  owner?: string;
  psm?: string;
  cell?: string;
  is_this_zone_disabled?: Record<string, boolean>;
  zone_throttle_log_bytes_per_sec?: Record<string, number>;
  gdpr_enable?: boolean;
  cold_start_disabled?: boolean;
  exclusive_mode?: boolean;
  async_mode?: boolean;
  online_mode?: boolean;
  auth_enable?: boolean;
  cors_enable?: boolean;
  trace_enable?: boolean;
  gateway_route_enable?: boolean;
  is_ipv6_only?: boolean;
  zti_enable?: boolean;
  http_trigger_disable?: boolean;
  aliases?: Record<string, Alias>;
  runtime?: string;
  env_name?: string;
  global_kv_namespace_ids?: Array<string>;
  local_cache_namespace_ids?: Array<string>;
  protocol?: string;
  latency_sec?: number;
  net_class_id?: number;
  envs?: Record<string, Record<string, string>>;
  in_releasing?: boolean;
  reserved_dp_enabled?: boolean;
  routing_strategy?: string;
  bytefaas_error_response_disabled?: boolean;
  bytefaas_response_header_disabled?: boolean;
  enable_colocate_scheduling?: boolean;
  network_mode?: string;
  dynamic_load_balancing_data_report_enabled?: boolean;
  dynamic_load_balancing_weight_enabled?: boolean;
  dynamic_load_balancing_enabled_vdcs?: Array<string>;
  dynamic_load_balance_type?: string;
  deployment_inactive?: boolean;
  is_this_zone_deployment_inactive?: Record<string, boolean>;
  package?: string;
  pod_type?: string;
  plugin_name?: string;
  allow_cold_start_instance?: boolean;
  elastic_prefer_cluster?: Record<string, string>;
  reserved_prefer_cluster?: Record<string, string>;
  elastic_user_preferred_cluster?: Record<string, string>;
  reserved_user_preferred_cluster?: Record<string, string>;
  elastic_auto_preferred_cluster?: Record<string, string>;
  reserved_auto_preferred_cluster?: Record<string, string>;
  temp_preferred_cluster?: Record<string, string>;
  formatted_elastic_prefer_cluster?: Array<FormattedPreferCluster>;
  formatted_reserved_prefer_cluster?: Array<FormattedPreferCluster>;
  runtime_log_writers?: string;
  system_log_writers?: string;
  is_bytepaas_elastic_cluster?: boolean;
  disable_service_discovery?: boolean;
  resource_guarantee?: boolean;
  disable_cgroup_v2?: boolean;
  async_result_emit_event_bridge?: boolean;
  runtime_stream_log_bytes_per_sec?: number;
  system_stream_log_bytes_per_sec?: number;
  throttle_log_bytes_per_sec?: number;
  throttle_stdout_log_bytes_per_sec?: number;
  throttle_stderr_log_bytes_per_sec?: number;
  scale_enabled?: boolean;
  scale_threshold?: number;
  scale_type?: number;
  scale_settings?: FuncScaleSettings;
  replica_limit?: Record<string, PodReplicaLimit>;
  zone_reserved_frozen_replicas?: Record<string, number>;
  container_runtime?: string;
  enable_scale_optimise?: boolean;
  schedule_strategy?: string;
  dynamic_overcommit_settings?: Record<string, DynamicOvercommitSettings>;
  /** overload_protect_enabled */
  overload_protect_enabled?: boolean;
  frozen_cpu_milli?: number;
  enable_fed_on_demand_resource?: Record<string, boolean>;
  frozen_priority_class?: string;
  host_uniq?: HostUniq;
  region?: string;
  service_id?: string;
  cluster?: string;
  'X-Jwt-Token'?: string;
}

export interface UpdateRegionalMetaResponse {
  code?: number;
  data?: RegionalMeta;
  error?: string;
}

export interface UpdateScaleThresholdSetRequest {
  service_id?: string;
  region?: string;
  cluster?: string;
  scale_set_name?: string;
  overload_fast_scale_enabled?: boolean;
  lag_scale_set_name?: string;
}

export interface UpdateServiceInfoByServiceIDRequest {
  /** admins. 管理员 */
  admins?: string;
  /** authorizers. 授权人 */
  authorizers?: string;
  /** base image. 基础镜像 */
  base_image?: string;
  /** category of service. 服务类型 */
  category?: string;
  /** description of function. 服务描述, 原来的函数描述 */
  description?: string;
  /** name of function. 服务名称, 原来的函数名称 */
  name?: string;
  need_approve?: boolean;
  /** origin of function, from bytefaas ori light(like qingfuwu), 服务的来源，除了 faas 也有可能是来自轻服务等 */
  origin?: string;
  /** the owner of service. 服务的 Owner */
  owner?: string;
  /** plugin name. 绑定的lego插件函数名称 */
  plugin_name?: string;
  /** language in runtime. 运行时语言. Optional values: golang/v1,node10/v1,python3/v1,rust1/v1,java8/v1,wasm/v1,v8/v1,native/v1,native-java8/v1 */
  runtime?: string;
  service_id: string;
  /** service level, could be P0 ~ P3. 服务等级 */
  service_level?: string;
  /** service purpose. 服务用途 */
  service_purpose?: string;
  /** subscribers. 订阅人 */
  subscribers?: Array<string>;
  /** code file size, unit MB. 代码包上限大小 */
  code_file_size_mb?: number;
  psm?: string;
  psm_parent_id?: Int64;
  /** 是否支持集群级别 run_cmd */
  enable_cluster_run_cmd?: boolean;
  disable_ppe_alarm?: boolean;
  net_queue?: string;
  ms_service_meta_params?: MSServiceMetaParams;
  language?: string;
  mount_info?: Array<string>;
  'X-Jwt-Token'?: string;
}

export interface UpdateServiceInfoByServiceIDResponse {
  code?: number;
  data?: FunctionResponseData;
  error?: string;
}

export interface UpdateServiceScaleSettingsRequest {
  /** ID of service */
  service_id: string;
  service_cpu_scale_settings?: FuncCPUScaleSettings;
  cluster_cpu_scale_settings?: Array<ClusterCPUScaleSettings>;
}

export interface UpdateTicketActionRequest {
  action?: string;
  ticket_id: string;
  service_id?: string;
}

export interface UpdateTicketActionResponse {
  code?: number;
  data?: Ticket;
  error?: string;
}

export interface UpdateTicketStepActionRequest {
  /** retry/run/cancel */
  action?: string;
  /** ticket id */
  ticket_id: string;
  /** step id */
  step_id: string;
}

export interface UpdateTicketStepActionResponse {
  /** response code */
  code?: number;
  /** reponse data */
  data?: EmptyObject;
  /** error msg */
  error?: string;
}

export interface UpdateTimerTriggerRequest {
  cell?: string;
  /** cluster of service */
  cluster: string;
  concurrency_limit?: number;
  created_at?: string;
  cron?: string;
  description?: string;
  enabled?: boolean;
  name?: string;
  payload?: string;
  /** region of service */
  region: string;
  retries?: number;
  scheduled_at?: string;
  /** ID of service */
  service_id: string;
  /** the timer trigger you want to get */
  timer_id: string;
  'X-Jwt-Token'?: string;
}

export interface UpdateTimerTriggerResponse {
  code?: number;
  data?: TimerTrigger;
  error?: string;
}

export interface UpdateVefaasTrafficSchedulingRequest {
  /** 是否开启小流量引流火山函数功能 */
  enabled: boolean;
  /** 目标函数psm，留空则配置为当前服务的PSM */
  psm?: string;
  /** 目标函数集群，留空则配置为默认火山集群 */
  cluster?: string;
  /** 是否开启全局模式，开启则跳过触发器配置 */
  global_mode?: boolean;
  /** 全局模式流量配比 */
  global_ratio?: number;
  /** 触发器流量配置 */
  trigger_config?: Record<
    string,
    Record<string, VefaasTrafficSchedulingTriggerData>
  >;
}

export interface UpdateVefaasTrafficSchedulingResponse {
  code?: number;
  data?: ClusterResponseData;
  error?: string;
}

export interface UploadTemplateByNameRequest {
  template_name: string;
}

export interface UploadTemplateByNameResponse {
  code?: number;
  data?: string;
  error?: string;
}

export interface VefaasTrafficSchedulingData {
  /** 小流量引流功能开启状态 */
  enabled?: boolean;
  /** 目标函数psm */
  psm?: string;
  /** 目标函数集群 */
  cluster?: string;
  /** 全局模式 */
  global_mode?: boolean;
  /** 全局模式流量配比 */
  global_ratio?: number;
  /** 触发器流量配置 */
  trigger_config?: Record<
    string,
    Record<string, VefaasTrafficSchedulingTriggerData>
  >;
}

export interface VefaasTrafficSchedulingTriggerData {
  /** 触发器 ID，eventbus触发器的ID为EventName */
  id?: string;
  /** 触发器流量配比 */
  ratio?: number;
}

export interface VolumeMount {
  name?: string;
  version?: string;
  mount_path?: string;
  read_only?: boolean;
}

export default class BytefaasApiService<T> {
  private request: any = () => {
    throw new Error('BytefaasApiService.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || '';
  }

  private genBaseURL(path: string) {
    return typeof this.baseURL === 'string'
      ? this.baseURL + path
      : this.baseURL(path);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/triggers_enabled */
  getTriggersEnabled(
    req: GetTriggersEnabledRequest,
    options?: T,
  ): Promise<GetTriggersEnabledResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers_enabled`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/mqtriggers/:trigger_id */
  updateMQTrigger(
    req: UpdateMQTriggerRequest,
    options?: T,
  ): Promise<UpdateMQTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/mqtriggers/${_req['trigger_id']}`,
    );
    const method = 'PATCH';
    const data = {
      alarm_params: _req['alarm_params'],
      allow_bytesuite_debug: _req['allow_bytesuite_debug'],
      batch_size: _req['batch_size'],
      cell: _req['cell'],
      deployment_inactive: _req['deployment_inactive'],
      description: _req['description'],
      disable_backoff: _req['disable_backoff'],
      disable_smooth_wrr: _req['disable_smooth_wrr'],
      dynamic_load_balance_type: _req['dynamic_load_balance_type'],
      dynamic_worker_thread: _req['dynamic_worker_thread'],
      enable_backoff: _req['enable_backoff'],
      enable_concurrency_filter: _req['enable_concurrency_filter'],
      enable_congestion_control: _req['enable_congestion_control'],
      enable_dynamic_load_balance: _req['enable_dynamic_load_balance'],
      enable_global_rate_limiter: _req['enable_global_rate_limiter'],
      enable_ipc_mode: _req['enable_ipc_mode'],
      enable_mq_debug: _req['enable_mq_debug'],
      enable_pod_colocate_scheduling: _req['enable_pod_colocate_scheduling'],
      enable_static_membership: _req['enable_static_membership'],
      enable_traffic_priority_scheduling:
        _req['enable_traffic_priority_scheduling'],
      enabled: _req['enabled'],
      envs: _req['envs'],
      function_id: _req['function_id'],
      hot_reload: _req['hot_reload'],
      id: _req['id'],
      image_alias: _req['image_alias'],
      image_version: _req['image_version'],
      initial_offset_start_from: _req['initial_offset_start_from'],
      is_auth_info_updated: _req['is_auth_info_updated'],
      max_retries_from_function_status:
        _req['max_retries_from_function_status'],
      mq_logger_limit_size: _req['mq_logger_limit_size'],
      mq_msg_type: _req['mq_msg_type'],
      mq_region: _req['mq_region'],
      mq_type: _req['mq_type'],
      ms_alarm_id: _req['ms_alarm_id'],
      msg_chan_length: _req['msg_chan_length'],
      name: _req['name'],
      need_auto_sharding: _req['need_auto_sharding'],
      num_of_mq_pod_to_one_func_pod: _req['num_of_mq_pod_to_one_func_pod'],
      options: _req['options'],
      plugin_function_param: _req['plugin_function_param'],
      qps_limit: _req['qps_limit'],
      replica_max_limit: _req['replica_max_limit'],
      replica_min_limit: _req['replica_min_limit'],
      replicas: _req['replicas'],
      request_timeout: _req['request_timeout'],
      resource: _req['resource'],
      runtime_agent_mode: _req['runtime_agent_mode'],
      scale_enabled: _req['scale_enabled'],
      scale_settings: _req['scale_settings'],
      sdk_version: _req['sdk_version'],
      vertical_scale_enabled: _req['vertical_scale_enabled'],
      worker_v2_num_per_half_core: _req['worker_v2_num_per_half_core'],
      workers_per_pod: _req['workers_per_pod'],
      enable_plugin_function: _req['enable_plugin_function'],
      disable_infinite_retry_for_timeout:
        _req['disable_infinite_retry_for_timeout'],
      mirror_region_filter: _req['mirror_region_filter'],
      enable_gctuner: _req['enable_gctuner'],
      gctuner_percent: _req['gctuner_percent'],
      retry_strategy: _req['retry_strategy'],
      max_retry_time: _req['max_retry_time'],
      qps_limit_time_ranges: _req['qps_limit_time_ranges'],
      rate_limit_step_settings: _req['rate_limit_step_settings'],
      enable_step_rate_limit: _req['enable_step_rate_limit'],
      enable_filter_congestion_control:
        _req['enable_filter_congestion_control'],
      enable_congestion_control_cache: _req['enable_congestion_control_cache'],
    };
    return this.request({ url, method, data }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/revisions/:revision_number */
  deleteFunctionRevision(
    req: DeleteFunctionRevisionRequest,
    options?: T,
  ): Promise<DeleteFunctionRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions/${_req['revision_number']}`,
    );
    const method = 'DELETE';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/online_revisions */
  getOnlineRevision(
    req: GetOnlineRevisionRequest,
    options?: T,
  ): Promise<GetOnlineRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/online_revisions`,
    );
    const method = 'GET';
    const params = { format: _req['format'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/latest_revisions */
  getLatestRevision(
    req: GetLatestRevisionRequest,
    options?: T,
  ): Promise<GetLatestRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/latest_revisions`,
    );
    const method = 'GET';
    const params = { format: _req['format'] };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/http_triggers/:trigger_id */
  patchHttpTrigger(
    req: PatchHttpTriggerRequest,
    options?: T,
  ): Promise<PatchHttpTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/http_triggers/${_req['trigger_id']}`,
    );
    const method = 'PATCH';
    const data = {
      bytefaas_error_response_disabled:
        _req['bytefaas_error_response_disabled'],
      bytefaas_response_header_disabled:
        _req['bytefaas_response_header_disabled'],
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
      url_prefix: _req['url_prefix'],
      version_type: _req['version_type'],
      version_value: _req['version_value'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id */
  getMqTriggerByType(
    req: GetMqTriggerByTypeRequest,
    options?: T,
  ): Promise<GetMqTriggerByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/diagnosis/:diagnosis_id */
  getDiagnosisByID(
    req: GetDiagnosisByIDRequest,
    options?: T,
  ): Promise<GetDiagnosisByIDResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/diagnosis/${_req['diagnosis_id']}`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/tickets */
  getTicketsByFilter(
    req: GetTicketsByFilterRequest,
    options?: T,
  ): Promise<GetTicketsByFilterResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/tickets');
    const method = 'GET';
    const params = {
      category: _req['category'],
      change_type: _req['change_type'],
      cluster: _req['cluster'],
      function_id: _req['function_id'],
      id: _req['id'],
      max_create_time: _req['max_create_time'],
      min_create_time: _req['min_create_time'],
      only_admin_ticket: _req['only_admin_ticket'],
      parent_id: _req['parent_id'],
      region: _req['region'],
      status: _req['status'],
      trigger_id: _req['trigger_id'],
      trigger_type: _req['trigger_type'],
      type: _req['type'],
      limit: _req['limit'],
      offset: _req['offset'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/timers/:timer_id */
  updateTimerTrigger(
    req: UpdateTimerTriggerRequest,
    options?: T,
  ): Promise<UpdateTimerTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/timers/${_req['timer_id']}`,
    );
    const method = 'PATCH';
    const data = {
      cell: _req['cell'],
      concurrency_limit: _req['concurrency_limit'],
      created_at: _req['created_at'],
      cron: _req['cron'],
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
      payload: _req['payload'],
      retries: _req['retries'],
      scheduled_at: _req['scheduled_at'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/invoke */
  debugFunction(
    req: DebugFunctionRequest,
    options?: T,
  ): Promise<DebugFunctionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/invoke`,
    );
    const method = 'POST';
    const data = {
      batch: _req['batch'],
      data: _req['data'],
      extensions: _req['extensions'],
      type: _req['type'],
      verbose: _req['verbose'],
      event_name: _req['event_name'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/code_revisions */
  getCodeRevisions(
    req: GetCodeRevisionsRequest,
    options?: T,
  ): Promise<GetCodeRevisionsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/code_revisions`,
    );
    const method = 'GET';
    const params = { limit: _req['limit'], offset: _req['offset'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/tickets/:ticket_id */
  getTicketDetailByTicketID(
    req: GetTicketDetailByTicketIDRequest,
    options?: T,
  ): Promise<GetTicketDetailByTicketIDResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/tickets/${_req['ticket_id']}`);
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster */
  updateCluster(
    req: UpdateClusterRequest,
    options?: T,
  ): Promise<UpdateClusterResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}`,
    );
    const method = 'PATCH';
    const data = {
      auth_enable: _req['auth_enable'],
      code_revision_id: _req['code_revision_id'],
      code_revision_number: _req['code_revision_number'],
      cold_start_disabled: _req['cold_start_disabled'],
      cors_enable: _req['cors_enable'],
      enable_colocate_scheduling: _req['enable_colocate_scheduling'],
      enable_scale_strategy: _req['enable_scale_strategy'],
      exclusive_mode: _req['exclusive_mode'],
      format_envs: _req['format_envs'],
      gateway_route_enable: _req['gateway_route_enable'],
      gdpr_enable: _req['gdpr_enable'],
      global_kv_namespace_ids: _req['global_kv_namespace_ids'],
      http_trigger_disable: _req['http_trigger_disable'],
      initializer_sec: _req['initializer_sec'],
      is_ipv6_only: _req['is_ipv6_only'],
      is_this_zone_disabled: _req['is_this_zone_disabled'],
      latency_sec: _req['latency_sec'],
      max_concurrency: _req['max_concurrency'],
      network_mode: _req['network_mode'],
      reserved_dp_enabled: _req['reserved_dp_enabled'],
      resource_limit: _req['resource_limit'],
      revision_id: _req['revision_id'],
      revision_number: _req['revision_number'],
      routing_strategy: _req['routing_strategy'],
      scale_enabled: _req['scale_enabled'],
      scale_threshold: _req['scale_threshold'],
      scale_type: _req['scale_type'],
      trace_enable: _req['trace_enable'],
      zone_throttle_log_bytes_per_sec: _req['zone_throttle_log_bytes_per_sec'],
      zti_enable: _req['zti_enable'],
      throttle_log_bytes_per_sec: _req['throttle_log_bytes_per_sec'],
      throttle_stdout_log_bytes_per_sec:
        _req['throttle_stdout_log_bytes_per_sec'],
      throttle_stderr_log_bytes_per_sec:
        _req['throttle_stderr_log_bytes_per_sec'],
      cold_start_sec: _req['cold_start_sec'],
      async_mode: _req['async_mode'],
      enable_scale_optimise: _req['enable_scale_optimise'],
      enable_runtime_file_log: _req['enable_runtime_file_log'],
      enable_runtime_console_log: _req['enable_runtime_console_log'],
      enable_runtime_stream_log: _req['enable_runtime_stream_log'],
      enable_runtime_es_log: _req['enable_runtime_es_log'],
      enable_runtime_json_log: _req['enable_runtime_json_log'],
      enable_system_stream_log: _req['enable_system_stream_log'],
      enable_system_es_log: _req['enable_system_es_log'],
      runtime_stream_log_bytes_per_sec:
        _req['runtime_stream_log_bytes_per_sec'],
      system_stream_log_bytes_per_sec: _req['system_stream_log_bytes_per_sec'],
      pod_type: _req['pod_type'],
      online_mode: _req['online_mode'],
      enable_reserve_frozen_instance: _req['enable_reserve_frozen_instance'],
      cluster_run_cmd: _req['cluster_run_cmd'],
      disable_service_discovery: _req['disable_service_discovery'],
      async_result_emit_event_bridge: _req['async_result_emit_event_bridge'],
      resource_guarantee: _req['resource_guarantee'],
      mq_trigger_limit: _req['mq_trigger_limit'],
      cell: _req['cell'],
      lazyload: _req['lazyload'],
      image_lazyload: _req['image_lazyload'],
      initializer: _req['initializer'],
      handler: _req['handler'],
      run_cmd: _req['run_cmd'],
      throttle_log_enabled: _req['throttle_log_enabled'],
      adaptive_concurrency_mode: _req['adaptive_concurrency_mode'],
      env_name: _req['env_name'],
      container_runtime: _req['container_runtime'],
      protocol: _req['protocol'],
      overload_protect_enabled: _req['overload_protect_enabled'],
      mq_consumer_meta: _req['mq_consumer_meta'],
      enable_consul_ipv6_register: _req['enable_consul_ipv6_register'],
      enable_sys_mount: _req['enable_sys_mount'],
      disable_mount_jwt_bundles: _req['disable_mount_jwt_bundles'],
      termination_grace_period_seconds:
        _req['termination_grace_period_seconds'],
      enable_consul_register: _req['enable_consul_register'],
      host_uniq: _req['host_uniq'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/consul_triggers */
  createConsulTrigger(
    req: CreateConsulTriggerRequest,
    options?: T,
  ): Promise<CreateConsulTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/consul_triggers`,
    );
    const method = 'POST';
    const data = {
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/filterplugins/:filter_plugin_id */
  getFilterPluginsDetail(
    req: GetFilterPluginsDetailRequest,
    options?: T,
  ): Promise<GetFilterPluginsDetailResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/filterplugins/${_req['filter_plugin_id']}`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions */
  getDeployedRegions(
    req: GetDeployedRegionsRequest,
    options?: T,
  ): Promise<GetDeployedRegionsResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}/regions`);
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster */
  deleteCluster(
    req: DeleteClusterRequest,
    options?: T,
  ): Promise<DeleteClusterResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}`,
    );
    const method = 'DELETE';
    const params = { soft: _req['soft'], reason: _req['reason'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/revisions/:revision_number/code.zip */
  downloadRevisionCode(
    req: DownloadRevisionCodeRequest,
    options?: T,
  ): Promise<DownloadRevisionCodeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions/${_req['revision_number']}/code.zip`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/alarms */
  getClusterAlarm(
    req: GetClusterAlarmRequest,
    options?: T,
  ): Promise<GetClusterAlarmResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/alarms`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/tos/:region/bucketlist */
  getTosBuckets(
    req: GetTosBucketsRequest,
    options?: T,
  ): Promise<GetTosBucketsResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/tos/${_req['region']}/bucketlist`);
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /**
   * POST /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/timers
   *
   * Create a new FaaS timer trigger, and returns the created timer trigger
   */
  createTimerTrigger(
    req: CreateTimerTriggerRequest,
    options?: T,
  ): Promise<CreateTimerTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/timers`,
    );
    const method = 'POST';
    const data = {
      cell: _req['cell'],
      concurrency_limit: _req['concurrency_limit'],
      created_at: _req['created_at'],
      cron: _req['cron'],
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
      payload: _req['payload'],
      retries: _req['retries'],
      scheduled_at: _req['scheduled_at'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id */
  deleteMqTriggerByType(
    req: DeleteMqTriggerByTypeRequest,
    options?: T,
  ): Promise<DeleteMqTriggerByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}`,
    );
    const method = 'DELETE';
    const params = {
      caller: _req['caller'],
      consumer_group: _req['consumer_group'],
      eventbus_name: _req['eventbus_name'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** GET /v2/services/:service_id/code_revisions/:revision_number/code.zip */
  downloadCodeRevisionPackage(
    req: DownloadCodeRevisionPackageRequest,
    options?: T,
  ): Promise<DownloadCodeRevisionPackageResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/code_revisions/${_req['revision_number']}/code.zip`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/consul_triggers/:trigger_id */
  getConsulTrigger(
    req: GetConsulTriggerRequest,
    options?: T,
  ): Promise<GetConsulTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/consul_triggers/${_req['trigger_id']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/async_request */
  getAsyncRequest(
    req: GetAsyncRequestRequest,
    options?: T,
  ): Promise<GetAsyncRequestResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/async_request`,
    );
    const method = 'GET';
    const headers = { 'x-bytefaas-request-id': _req['x-bytefaas-request-id'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/code_revisions/:revision_number */
  getCodeRevisionByNumber(
    req: GetCodeRevisionByNumberRequest,
    options?: T,
  ): Promise<GetCodeRevisionByNumberResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/code_revisions/${_req['revision_number']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/regional_meta */
  getRegionalMeta(
    req: GetRegionalMetaRequest,
    options?: T,
  ): Promise<GetRegionalMetaResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/regional_meta`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id */
  getService(req: GetServiceRequest, options?: T): Promise<GetServiceResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}`);
    const method = 'GET';
    const params = {
      region: _req['region'],
      verbose: _req['verbose'],
      soft_deleted: _req['soft_deleted'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /**
   * POST /v2/services/:service_id/subscription
   *
   * Add a function subscription, and returns successful or failed
   */
  subscribeService(
    req: SubscribeServiceRequest,
    options?: T,
  ): Promise<SubscribeServiceResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/subscription`,
    );
    const method = 'POST';
    const data = { subscribers: _req['subscribers'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/http_triggers/:trigger_id */
  deleteHttpTrigger(
    req: DeleteHttpTriggerRequest,
    options?: T,
  ): Promise<DeleteHttpTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/http_triggers/${_req['trigger_id']}`,
    );
    const method = 'DELETE';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/scale_strategies/:strategy_id */
  deleteScaleStrategy(
    req: DeleteScaleStrategyRequest,
    options?: T,
  ): Promise<DeleteScaleStrategyResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/scale_strategies/${_req['strategy_id']}`,
    );
    const method = 'DELETE';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/online_code_revisions */
  getOnlineCodeRevision(
    req: GetOnlineCodeRevisionRequest,
    options?: T,
  ): Promise<GetOnlineCodeRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/online_code_revisions`,
    );
    const method = 'GET';
    const params = { region: _req['region'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/tickets */
  getTickets(req: GetTicketsRequest, options?: T): Promise<GetTicketsResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}/tickets`);
    const method = 'GET';
    const params = {
      category: _req['category'],
      change_type: _req['change_type'],
      cluster: _req['cluster'],
      id: _req['id'],
      max_create_time: _req['max_create_time'],
      min_create_time: _req['min_create_time'],
      region: _req['region'],
      status: _req['status'],
      trigger_id: _req['trigger_id'],
      trigger_type: _req['trigger_type'],
      type: _req['type'],
      contains_multi_clusters: _req['contains_multi_clusters'],
      offset: _req['offset'],
      limit: _req['limit'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/latest_revisions */
  updateFunctionLatestRevision(
    req: UpdateFunctionLatestRevisionRequest,
    options?: T,
  ): Promise<UpdateFunctionLatestRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/latest_revisions`,
    );
    const method = 'PATCH';
    return this.request({ url, method }, options);
  }

  /** GET /v2/admin */
  getAllAdministrator(
    req?: getAllAdministratorRequest,
    options?: T,
  ): Promise<GetAllAdministratorResponse> {
    const url = this.genBaseURL('/v2/admin');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/triggers */
  getAllTriggers(
    req: GetAllTriggersRequest,
    options?: T,
  ): Promise<GetAllTriggersResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers`,
    );
    const method = 'GET';
    const params = {
      split_eventbus: _req['split_eventbus'],
      with_env_trigger: _req['with_env_trigger'],
      not_show_eb_trigger: _req['not_show_eb_trigger'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id */
  patchMqTriggerByType(
    req: PatchMqTriggerByTypeRequest,
    options?: T,
  ): Promise<PatchMqTriggerByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/:region/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}`,
    );
    const method = 'PATCH';
    const data = {
      alarm_params: _req['alarm_params'],
      allow_bytesuite_debug: _req['allow_bytesuite_debug'],
      batch_size: _req['batch_size'],
      cell: _req['cell'],
      deployment_inactive: _req['deployment_inactive'],
      description: _req['description'],
      disable_backoff: _req['disable_backoff'],
      disable_smooth_wrr: _req['disable_smooth_wrr'],
      dynamic_load_balance_type: _req['dynamic_load_balance_type'],
      dynamic_worker_thread: _req['dynamic_worker_thread'],
      enable_backoff: _req['enable_backoff'],
      enable_concurrency_filter: _req['enable_concurrency_filter'],
      enable_congestion_control: _req['enable_congestion_control'],
      enable_dynamic_load_balance: _req['enable_dynamic_load_balance'],
      enable_global_rate_limiter: _req['enable_global_rate_limiter'],
      enable_ipc_mode: _req['enable_ipc_mode'],
      enable_mq_debug: _req['enable_mq_debug'],
      enable_pod_colocate_scheduling: _req['enable_pod_colocate_scheduling'],
      enable_static_membership: _req['enable_static_membership'],
      enable_traffic_priority_scheduling:
        _req['enable_traffic_priority_scheduling'],
      enabled: _req['enabled'],
      envs: _req['envs'],
      function_id: _req['function_id'],
      hot_reload: _req['hot_reload'],
      id: _req['id'],
      image_alias: _req['image_alias'],
      image_version: _req['image_version'],
      initial_offset_start_from: _req['initial_offset_start_from'],
      is_auth_info_updated: _req['is_auth_info_updated'],
      max_retries_from_function_status:
        _req['max_retries_from_function_status'],
      mq_logger_limit_size: _req['mq_logger_limit_size'],
      mq_msg_type: _req['mq_msg_type'],
      mq_region: _req['mq_region'],
      mq_type: _req['mq_type'],
      ms_alarm_id: _req['ms_alarm_id'],
      msg_chan_length: _req['msg_chan_length'],
      name: _req['name'],
      need_auto_sharding: _req['need_auto_sharding'],
      num_of_mq_pod_to_one_func_pod: _req['num_of_mq_pod_to_one_func_pod'],
      options: _req['options'],
      plugin_function_param: _req['plugin_function_param'],
      qps_limit: _req['qps_limit'],
      region: _req['region'],
      replica_max_limit: _req['replica_max_limit'],
      replica_min_limit: _req['replica_min_limit'],
      replicas: _req['replicas'],
      request_timeout: _req['request_timeout'],
      resource: _req['resource'],
      runtime_agent_mode: _req['runtime_agent_mode'],
      scale_enabled: _req['scale_enabled'],
      scale_settings: _req['scale_settings'],
      sdk_version: _req['sdk_version'],
      vertical_scale_enabled: _req['vertical_scale_enabled'],
      worker_v2_num_per_half_core: _req['worker_v2_num_per_half_core'],
      workers_per_pod: _req['workers_per_pod'],
      enable_plugin_function: _req['enable_plugin_function'],
      disable_infinite_retry_for_timeout:
        _req['disable_infinite_retry_for_timeout'],
      mirror_region_filter: _req['mirror_region_filter'],
      enable_gctuner: _req['enable_gctuner'],
      gctuner_percent: _req['gctuner_percent'],
      retry_strategy: _req['retry_strategy'],
      max_retry_time: _req['max_retry_time'],
      qps_limit_time_ranges: _req['qps_limit_time_ranges'],
      rate_limit_step_settings: _req['rate_limit_step_settings'],
      enable_step_rate_limit: _req['enable_step_rate_limit'],
      enable_filter_congestion_control:
        _req['enable_filter_congestion_control'],
      enable_congestion_control_cache: _req['enable_congestion_control_cache'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/function_templates/:template_name */
  getTemplateByName(
    req: GetTemplateByNameRequest,
    options?: T,
  ): Promise<GetTemplateByNameResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/function_templates/${_req['template_name']}`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/runtimes */
  getRuntime(
    req?: getRuntimeRequest,
    options?: T,
  ): Promise<GetRuntimeResponse> {
    const url = this.genBaseURL('/v2/runtimes');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/async_request */
  killAsyncRequests(
    req: KillAsyncRequestsRequest,
    options?: T,
  ): Promise<KillAsyncRequestsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/async_request`,
    );
    const method = 'DELETE';
    const headers = { 'x-bytefaas-request-id': _req['x-bytefaas-request-id'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/filterplugins */
  getFilterPlugins(
    req: GetFilterPluginsRequest,
    options?: T,
  ): Promise<GetFilterPluginsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/filterplugins`,
    );
    const method = 'GET';
    const params = { offset: _req['offset'], limit: _req['limit'] };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/scale_strategies/:strategy_id */
  patchScaleStrategy(
    req: PatchScaleStrategyRequest,
    options?: T,
  ): Promise<PatchScaleStrategyResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/scale_strategies/${_req['strategy_id']}`,
    );
    const method = 'PATCH';
    const data = {
      effective_time: _req['effective_time'],
      enabled: _req['enabled'],
      expired_time: _req['expired_time'],
      function_id: _req['function_id'],
      inner_strategy: _req['inner_strategy'],
      item_id: _req['item_id'],
      item_type: _req['item_type'],
      strategy_name: _req['strategy_name'],
      strategy_type: _req['strategy_type'],
      instance_type: _req['instance_type'],
    };
    const params = { bpm_update_type: _req['bpm_update_type'] };
    return this.request({ url, method, data, params }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id/reset_mq_offset */
  resetMQOffset(
    req: ResetMQOffsetRequest,
    options?: T,
  ): Promise<ResetMQOffsetResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}/reset_mq_offset`,
    );
    const method = 'POST';
    const data = {
      dryRun: _req['dryRun'],
      force_stop: _req['force_stop'],
      offset: _req['offset'],
      resetType: _req['resetType'],
      reset_details_per_partition_array:
        _req['reset_details_per_partition_array'],
      timestamp: _req['timestamp'],
      whence: _req['whence'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/mqtriggers */
  createMQTrigger(
    req: CreateMQTriggerRequest,
    options?: T,
  ): Promise<CreateMQTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/:region/clusters/${_req['cluster']}/mqtriggers`,
    );
    const method = 'POST';
    const data = {
      alarm_params: _req['alarm_params'],
      allow_bytesuite_debug: _req['allow_bytesuite_debug'],
      batch_size: _req['batch_size'],
      cell: _req['cell'],
      deployment_inactive: _req['deployment_inactive'],
      description: _req['description'],
      disable_backoff: _req['disable_backoff'],
      disable_smooth_wrr: _req['disable_smooth_wrr'],
      dynamic_load_balance_type: _req['dynamic_load_balance_type'],
      dynamic_worker_thread: _req['dynamic_worker_thread'],
      enable_backoff: _req['enable_backoff'],
      enable_concurrency_filter: _req['enable_concurrency_filter'],
      enable_congestion_control: _req['enable_congestion_control'],
      enable_dynamic_load_balance: _req['enable_dynamic_load_balance'],
      enable_global_rate_limiter: _req['enable_global_rate_limiter'],
      enable_ipc_mode: _req['enable_ipc_mode'],
      enable_mq_debug: _req['enable_mq_debug'],
      enable_pod_colocate_scheduling: _req['enable_pod_colocate_scheduling'],
      enable_static_membership: _req['enable_static_membership'],
      enable_traffic_priority_scheduling:
        _req['enable_traffic_priority_scheduling'],
      enabled: _req['enabled'],
      envs: _req['envs'],
      function_id: _req['function_id'],
      hot_reload: _req['hot_reload'],
      id: _req['id'],
      image_alias: _req['image_alias'],
      image_version: _req['image_version'],
      initial_offset_start_from: _req['initial_offset_start_from'],
      is_auth_info_updated: _req['is_auth_info_updated'],
      max_retries_from_function_status:
        _req['max_retries_from_function_status'],
      mq_logger_limit_size: _req['mq_logger_limit_size'],
      mq_msg_type: _req['mq_msg_type'],
      mq_region: _req['mq_region'],
      mq_type: _req['mq_type'],
      ms_alarm_id: _req['ms_alarm_id'],
      msg_chan_length: _req['msg_chan_length'],
      name: _req['name'],
      need_auto_sharding: _req['need_auto_sharding'],
      num_of_mq_pod_to_one_func_pod: _req['num_of_mq_pod_to_one_func_pod'],
      options: _req['options'],
      plugin_function_param: _req['plugin_function_param'],
      qps_limit: _req['qps_limit'],
      region: _req['region'],
      replica_max_limit: _req['replica_max_limit'],
      replica_min_limit: _req['replica_min_limit'],
      replicas: _req['replicas'],
      request_timeout: _req['request_timeout'],
      resource: _req['resource'],
      runtime_agent_mode: _req['runtime_agent_mode'],
      scale_enabled: _req['scale_enabled'],
      scale_settings: _req['scale_settings'],
      sdk_version: _req['sdk_version'],
      vertical_scale_enabled: _req['vertical_scale_enabled'],
      worker_v2_num_per_half_core: _req['worker_v2_num_per_half_core'],
      workers_per_pod: _req['workers_per_pod'],
      enable_plugin_function: _req['enable_plugin_function'],
      disable_infinite_retry_for_timeout:
        _req['disable_infinite_retry_for_timeout'],
      mirror_region_filter: _req['mirror_region_filter'],
      enable_gctuner: _req['enable_gctuner'],
      gctuner_percent: _req['gctuner_percent'],
      retry_strategy: _req['retry_strategy'],
      max_retry_time: _req['max_retry_time'],
      qps_limit_time_ranges: _req['qps_limit_time_ranges'],
      rate_limit_step_settings: _req['rate_limit_step_settings'],
      enable_step_rate_limit: _req['enable_step_rate_limit'],
      batch_flush_duration_milliseconds:
        _req['batch_flush_duration_milliseconds'],
      replica_force_meet_partition: _req['replica_force_meet_partition'],
      limit_disaster_scenario: _req['limit_disaster_scenario'],
      max_dwell_time_minute: _req['max_dwell_time_minute'],
      enable_canary_update: _req['enable_canary_update'],
      traffic_config: _req['traffic_config'],
      pod_type: _req['pod_type'],
      package: _req['package'],
      qps_auto_limit: _req['qps_auto_limit'],
      enable_filter_congestion_control:
        _req['enable_filter_congestion_control'],
      enable_congestion_control_cache: _req['enable_congestion_control_cache'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/deploy_status */
  getClusterDeployedStatus(
    req: GetClusterDeployedStatusRequest,
    options?: T,
  ): Promise<GetClusterDeployedStatusResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/deploy_status`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/resource/services */
  getResource(
    req?: GetResourceRequest,
    options?: T,
  ): Promise<GetResourceResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/resource/services');
    const method = 'GET';
    const params = {
      all_region: _req['all_region'],
      env: _req['env'],
      function_id: _req['function_id'],
      psm: _req['psm'],
      region: _req['region'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/revisions/:revision_number */
  updateFunctionRevision(
    req: UpdateFunctionRevisionRequest,
    options?: T,
  ): Promise<UpdateFunctionRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions/${_req['revision_number']}`,
    );
    const method = 'PATCH';
    const data = {
      deploy_method: _req['deploy_method'],
      envs: _req['envs'],
      handler: _req['handler'],
      runtime: _req['runtime'],
      source: _req['source'],
      source_type: _req['source_type'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/zones/:zone/instances/:podname/webshell */
  getInstancesWebshell(
    req: GetInstancesWebshellRequest,
    options?: T,
  ): Promise<GetInstancesWebshellResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/zones/${_req['zone']}/instances/${_req['podname']}/webshell`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/mqevents/:mq_type/mqclusters */
  getMqClusters(
    req: GetMqClustersRequest,
    options?: T,
  ): Promise<GetMqClustersResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/mqevents/${_req['mq_type']}/mqclusters`);
    const method = 'GET';
    const params = { region: _req['region'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type */
  createMqTriggerByType(
    req: CreateMqTriggerByTypeRequest,
    options?: T,
  ): Promise<CreateMqTriggerByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}`,
    );
    const method = 'POST';
    const data = {
      batch_size: _req['batch_size'],
      batch_flush_duration_milliseconds:
        _req['batch_flush_duration_milliseconds'],
      description: _req['description'],
      enabled: _req['enabled'],
      envs: _req['envs'],
      function_id: _req['function_id'],
      cell: _req['cell'],
      id: _req['id'],
      image_version: _req['image_version'],
      sdk_version: _req['sdk_version'],
      image_alias: _req['image_alias'],
      ms_alarm_id: _req['ms_alarm_id'],
      mq_type: _req['mq_type'],
      max_retries_from_function_status:
        _req['max_retries_from_function_status'],
      msg_chan_length: _req['msg_chan_length'],
      name: _req['name'],
      need_auto_sharding: _req['need_auto_sharding'],
      num_of_mq_pod_to_one_func_pod: _req['num_of_mq_pod_to_one_func_pod'],
      options: _req['options'],
      qps_limit: _req['qps_limit'],
      region: _req['region'],
      mq_region: _req['mq_region'],
      runtime_agent_mode: _req['runtime_agent_mode'],
      dynamic_worker_thread: _req['dynamic_worker_thread'],
      replica_max_limit: _req['replica_max_limit'],
      replica_min_limit: _req['replica_min_limit'],
      replicas: _req['replicas'],
      resource: _req['resource'],
      scale_enabled: _req['scale_enabled'],
      vertical_scale_enabled: _req['vertical_scale_enabled'],
      enable_static_membership: _req['enable_static_membership'],
      workers_per_pod: _req['workers_per_pod'],
      alarm_params: _req['alarm_params'],
      request_timeout: _req['request_timeout'],
      disable_infinite_retry_for_timeout:
        _req['disable_infinite_retry_for_timeout'],
      initial_offset_start_from: _req['initial_offset_start_from'],
      enable_mq_debug: _req['enable_mq_debug'],
      mq_logger_limit_size: _req['mq_logger_limit_size'],
      enable_backoff: _req['enable_backoff'],
      disable_backoff: _req['disable_backoff'],
      worker_v2_num_per_half_core: _req['worker_v2_num_per_half_core'],
      enable_concurrency_filter: _req['enable_concurrency_filter'],
      enable_ipc_mode: _req['enable_ipc_mode'],
      enable_traffic_priority_scheduling:
        _req['enable_traffic_priority_scheduling'],
      enable_pod_colocate_scheduling: _req['enable_pod_colocate_scheduling'],
      enable_global_rate_limiter: _req['enable_global_rate_limiter'],
      enable_congestion_control: _req['enable_congestion_control'],
      allow_bytesuite_debug: _req['allow_bytesuite_debug'],
      enable_dynamic_load_balance: _req['enable_dynamic_load_balance'],
      disable_smooth_wrr: _req['disable_smooth_wrr'],
      dynamic_load_balance_type: _req['dynamic_load_balance_type'],
      replica_force_meet_partition: _req['replica_force_meet_partition'],
      scale_settings: _req['scale_settings'],
      hot_reload: _req['hot_reload'],
      mq_msg_type: _req['mq_msg_type'],
      status: _req['status'],
      in_releasing: _req['in_releasing'],
      mirror_region_filter: _req['mirror_region_filter'],
      enable_gctuner: _req['enable_gctuner'],
      gctuner_percent: _req['gctuner_percent'],
      retry_strategy: _req['retry_strategy'],
      max_retry_time: _req['max_retry_time'],
      qps_limit_time_ranges: _req['qps_limit_time_ranges'],
      limit_disaster_scenario: _req['limit_disaster_scenario'],
      enable_step_rate_limit: _req['enable_step_rate_limit'],
      rate_limit_step_settings: _req['rate_limit_step_settings'],
      max_dwell_time_minute: _req['max_dwell_time_minute'],
      qps_auto_limit: _req['qps_auto_limit'],
      plugin_function_param: _req['plugin_function_param'],
      enable_plugin_function: _req['enable_plugin_function'],
      enable_canary_update: _req['enable_canary_update'],
      traffic_config: _req['traffic_config'],
      is_auth_info_updated: _req['is_auth_info_updated'],
      pod_type: _req['pod_type'],
      package: _req['package'],
      enable_filter_congestion_control:
        _req['enable_filter_congestion_control'],
      enable_congestion_control_cache: _req['enable_congestion_control_cache'],
    };
    const params = { caller: _req['caller'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, params, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster */
  getCluster(req: GetClusterRequest, options?: T): Promise<GetClusterResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}`,
    );
    const method = 'GET';
    const params = {
      'use-argos-iframe': _req['use-argos-iframe'],
      verbose: _req['verbose'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** GET /v2/function_templates */
  getFunctionTemplates(
    req?: getFunctionTemplatesRequest,
    options?: T,
  ): Promise<GetFunctionTemplatesResponse> {
    const url = this.genBaseURL('/v2/function_templates');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id */
  updateServiceInfoByServiceID(
    req: UpdateServiceInfoByServiceIDRequest,
    options?: T,
  ): Promise<UpdateServiceInfoByServiceIDResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}`);
    const method = 'PATCH';
    const data = {
      admins: _req['admins'],
      authorizers: _req['authorizers'],
      base_image: _req['base_image'],
      category: _req['category'],
      description: _req['description'],
      name: _req['name'],
      need_approve: _req['need_approve'],
      origin: _req['origin'],
      owner: _req['owner'],
      plugin_name: _req['plugin_name'],
      runtime: _req['runtime'],
      service_level: _req['service_level'],
      service_purpose: _req['service_purpose'],
      subscribers: _req['subscribers'],
      code_file_size_mb: _req['code_file_size_mb'],
      psm: _req['psm'],
      psm_parent_id: _req['psm_parent_id'],
      enable_cluster_run_cmd: _req['enable_cluster_run_cmd'],
      disable_ppe_alarm: _req['disable_ppe_alarm'],
      net_queue: _req['net_queue'],
      ms_service_meta_params: _req['ms_service_meta_params'],
      language: _req['language'],
      mount_info: _req['mount_info'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/revisions/:revision_number/build */
  buildServiceRevision(
    req: BuildServiceRevisionRequest,
    options?: T,
  ): Promise<BuildServiceRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions/${_req['revision_number']}/build`,
    );
    const method = 'POST';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/code_revisions */
  createCodeRevision(
    req: CreateCodeRevisionRequest,
    options?: T,
  ): Promise<CreateCodeRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/code_revisions`,
    );
    const method = 'POST';
    const data = {
      dependency: _req['dependency'],
      deploy_method: _req['deploy_method'],
      description: _req['description'],
      disable_build_install: _req['disable_build_install'],
      handler: _req['handler'],
      initializer: _req['initializer'],
      lazyload: _req['lazyload'],
      number: _req['number'],
      protocol: _req['protocol'],
      run_cmd: _req['run_cmd'],
      runtime: _req['runtime'],
      runtime_container_port: _req['runtime_container_port'],
      runtime_debug_container_port: _req['runtime_debug_container_port'],
      source: _req['source'],
      source_type: _req['source_type'],
      open_image_lazyload: _req['open_image_lazyload'],
      runtime_other_container_ports: _req['runtime_other_container_ports'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services */
  createService(
    req: CreateServiceRequest,
    options?: T,
  ): Promise<CreateServiceResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/services');
    const method = 'POST';
    const data = {
      admins: _req['admins'],
      async_mode: _req['async_mode'],
      authorizers: _req['authorizers'],
      base_image: _req['base_image'],
      category: _req['category'],
      dependency: _req['dependency'],
      deploy_method: _req['deploy_method'],
      description: _req['description'],
      env_name: _req['env_name'],
      name: _req['name'],
      need_approve: _req['need_approve'],
      origin: _req['origin'],
      owner: _req['owner'],
      protocol: _req['protocol'],
      psm: _req['psm'],
      psm_parent_id: _req['psm_parent_id'],
      runtime: _req['runtime'],
      service_level: _req['service_level'],
      service_purpose: _req['service_purpose'],
      source: _req['source'],
      source_type: _req['source_type'],
      subscribers: _req['subscribers'],
      template_name: _req['template_name'],
      online_mode: _req['online_mode'],
      plugin_scm_path: _req['plugin_scm_path'],
      code_file_size_mb: _req['code_file_size_mb'],
      disable_ppe_alarm: _req['disable_ppe_alarm'],
      language: _req['language'],
      run_cmd: _req['run_cmd'],
      image_lazy_load: _req['image_lazy_load'],
      plugin_name: _req['plugin_name'],
      runtime_container_port: _req['runtime_container_port'],
      runtime_debug_container_port: _req['runtime_debug_container_port'],
      health_check_path: _req['health_check_path'],
      health_check_failure_threshold: _req['health_check_failure_threshold'],
      health_check_period: _req['health_check_period'],
      runtime_other_container_ports: _req['runtime_other_container_ports'],
      overload_protect_enabled: _req['overload_protect_enabled'],
      net_queue: _req['net_queue'],
      ms_service_meta_params: _req['ms_service_meta_params'],
      mount_info: _req['mount_info'],
      disable_build_install: _req['disable_build_install'],
      lazyload: _req['lazyload'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /**
   * POST /v2/tickets/:ticket_id/actions
   *
   * v1 upgrade to v2
   */
  updateTicketAction(
    req: UpdateTicketActionRequest,
    options?: T,
  ): Promise<UpdateTicketActionResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/tickets/${_req['ticket_id']}/actions`);
    const method = 'POST';
    const data = { action: _req['action'] };
    const params = { service_id: _req['service_id'] };
    return this.request({ url, method, data, params }, options);
  }

  /** GET /v2/check_admin */
  checkUserIsAdministrator(
    req: CheckUserIsAdministratorRequest,
    options?: T,
  ): Promise<CheckUserIsAdministratorResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/check_admin');
    const method = 'GET';
    const params = { user: _req['user'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/filterplugins */
  createFilterPlugins(
    req: CreateFilterPluginsRequest,
    options?: T,
  ): Promise<CreateFilterPluginsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/filterplugins`,
    );
    const method = 'POST';
    const data = {
      name: _req['name'],
      zip_file: _req['zip_file'],
      zip_file_size: _req['zip_file_size'],
    };
    return this.request({ url, method, data }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/regional_meta */
  updateRegionalMeta(
    req?: UpdateRegionalMetaRequest,
    options?: T,
  ): Promise<UpdateRegionalMetaResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/regional_meta`,
    );
    const method = 'PATCH';
    const data = {
      function_id: _req['function_id'],
      function_name: _req['function_name'],
      revision_id: _req['revision_id'],
      owner: _req['owner'],
      psm: _req['psm'],
      cell: _req['cell'],
      is_this_zone_disabled: _req['is_this_zone_disabled'],
      zone_throttle_log_bytes_per_sec: _req['zone_throttle_log_bytes_per_sec'],
      gdpr_enable: _req['gdpr_enable'],
      cold_start_disabled: _req['cold_start_disabled'],
      exclusive_mode: _req['exclusive_mode'],
      async_mode: _req['async_mode'],
      online_mode: _req['online_mode'],
      auth_enable: _req['auth_enable'],
      cors_enable: _req['cors_enable'],
      trace_enable: _req['trace_enable'],
      gateway_route_enable: _req['gateway_route_enable'],
      is_ipv6_only: _req['is_ipv6_only'],
      zti_enable: _req['zti_enable'],
      http_trigger_disable: _req['http_trigger_disable'],
      aliases: _req['aliases'],
      runtime: _req['runtime'],
      env_name: _req['env_name'],
      global_kv_namespace_ids: _req['global_kv_namespace_ids'],
      local_cache_namespace_ids: _req['local_cache_namespace_ids'],
      protocol: _req['protocol'],
      latency_sec: _req['latency_sec'],
      net_class_id: _req['net_class_id'],
      envs: _req['envs'],
      in_releasing: _req['in_releasing'],
      reserved_dp_enabled: _req['reserved_dp_enabled'],
      routing_strategy: _req['routing_strategy'],
      bytefaas_error_response_disabled:
        _req['bytefaas_error_response_disabled'],
      bytefaas_response_header_disabled:
        _req['bytefaas_response_header_disabled'],
      enable_colocate_scheduling: _req['enable_colocate_scheduling'],
      network_mode: _req['network_mode'],
      dynamic_load_balancing_data_report_enabled:
        _req['dynamic_load_balancing_data_report_enabled'],
      dynamic_load_balancing_weight_enabled:
        _req['dynamic_load_balancing_weight_enabled'],
      dynamic_load_balancing_enabled_vdcs:
        _req['dynamic_load_balancing_enabled_vdcs'],
      dynamic_load_balance_type: _req['dynamic_load_balance_type'],
      deployment_inactive: _req['deployment_inactive'],
      is_this_zone_deployment_inactive:
        _req['is_this_zone_deployment_inactive'],
      package: _req['package'],
      pod_type: _req['pod_type'],
      plugin_name: _req['plugin_name'],
      allow_cold_start_instance: _req['allow_cold_start_instance'],
      elastic_prefer_cluster: _req['elastic_prefer_cluster'],
      reserved_prefer_cluster: _req['reserved_prefer_cluster'],
      elastic_user_preferred_cluster: _req['elastic_user_preferred_cluster'],
      reserved_user_preferred_cluster: _req['reserved_user_preferred_cluster'],
      elastic_auto_preferred_cluster: _req['elastic_auto_preferred_cluster'],
      reserved_auto_preferred_cluster: _req['reserved_auto_preferred_cluster'],
      temp_preferred_cluster: _req['temp_preferred_cluster'],
      formatted_elastic_prefer_cluster:
        _req['formatted_elastic_prefer_cluster'],
      formatted_reserved_prefer_cluster:
        _req['formatted_reserved_prefer_cluster'],
      runtime_log_writers: _req['runtime_log_writers'],
      system_log_writers: _req['system_log_writers'],
      is_bytepaas_elastic_cluster: _req['is_bytepaas_elastic_cluster'],
      disable_service_discovery: _req['disable_service_discovery'],
      resource_guarantee: _req['resource_guarantee'],
      disable_cgroup_v2: _req['disable_cgroup_v2'],
      async_result_emit_event_bridge: _req['async_result_emit_event_bridge'],
      runtime_stream_log_bytes_per_sec:
        _req['runtime_stream_log_bytes_per_sec'],
      system_stream_log_bytes_per_sec: _req['system_stream_log_bytes_per_sec'],
      throttle_log_bytes_per_sec: _req['throttle_log_bytes_per_sec'],
      throttle_stdout_log_bytes_per_sec:
        _req['throttle_stdout_log_bytes_per_sec'],
      throttle_stderr_log_bytes_per_sec:
        _req['throttle_stderr_log_bytes_per_sec'],
      scale_enabled: _req['scale_enabled'],
      scale_threshold: _req['scale_threshold'],
      scale_type: _req['scale_type'],
      scale_settings: _req['scale_settings'],
      replica_limit: _req['replica_limit'],
      zone_reserved_frozen_replicas: _req['zone_reserved_frozen_replicas'],
      container_runtime: _req['container_runtime'],
      enable_scale_optimise: _req['enable_scale_optimise'],
      schedule_strategy: _req['schedule_strategy'],
      dynamic_overcommit_settings: _req['dynamic_overcommit_settings'],
      overload_protect_enabled: _req['overload_protect_enabled'],
      frozen_cpu_milli: _req['frozen_cpu_milli'],
      enable_fed_on_demand_resource: _req['enable_fed_on_demand_resource'],
      frozen_priority_class: _req['frozen_priority_class'],
      host_uniq: _req['host_uniq'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/filterplugins/:filter_plugin_id/download */
  downloadFilterPlugins(
    req: DownloadFilterPluginsRequest,
    options?: T,
  ): Promise<DownloadFilterPluginsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/filterplugins/${_req['filter_plugin_id']}/download`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/http_triggers/:trigger_id */
  getHttpTrigger(
    req: GetHttpTriggerRequest,
    options?: T,
  ): Promise<GetHttpTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/http_triggers/${_req['trigger_id']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/psm/:psm/regions/:region/clusters */
  getClusterListByPsm(
    req: GetClusterListByPsmRequest,
    options?: T,
  ): Promise<GetClusterListByPsmResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/psm/${_req['psm']}/regions/${_req['region']}/clusters`,
    );
    const method = 'GET';
    const params = { env: _req['env'] };
    return this.request({ url, method, params }, options);
  }

  /** DELETE /v2/services/:service_id */
  deleteService(
    req: DeleteServiceRequest,
    options?: T,
  ): Promise<DeleteServiceResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}`);
    const method = 'DELETE';
    const params = { soft: _req['soft'], reason: _req['reason'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** GET /v2/function_templates/:template_name/code.zip */
  downloadTemplateByName(
    req: DownloadTemplateByNameRequest,
    options?: T,
  ): Promise<DownloadTemplateByNameResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/function_templates/${_req['template_name']}/code.zip`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /**
   * POST /v2/tickets/runtime/update
   *
   * v1 upgrade to v2
   */
  ticketRuntimeUpdate(
    req?: TicketRuntimeUpdateRequest,
    options?: T,
  ): Promise<TicketRuntimeUpdateResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/tickets/runtime/update');
    const method = 'POST';
    const data = {
      approved_by: _req['approved_by'],
      approved_by_usertype: _req['approved_by_usertype'],
      function_id: _req['function_id'],
      function_meta: _req['function_meta'],
      regional_metas: _req['regional_metas'],
      service_id: _req['service_id'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters */
  createCluster(
    req: CreateClusterRequest,
    options?: T,
  ): Promise<CreateClusterResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters`,
    );
    const method = 'POST';
    const data = {
      async_mode: _req['async_mode'],
      auth_enable: _req['auth_enable'],
      cluster: _req['cluster'],
      code_revision_id: _req['code_revision_id'],
      code_revision_number: _req['code_revision_number'],
      cold_start_disabled: _req['cold_start_disabled'],
      cors_enable: _req['cors_enable'],
      enable_colocate_scheduling: _req['enable_colocate_scheduling'],
      enable_scale_strategy: _req['enable_scale_strategy'],
      exclusive_mode: _req['exclusive_mode'],
      format_envs: _req['format_envs'],
      gateway_route_enable: _req['gateway_route_enable'],
      gdpr_enable: _req['gdpr_enable'],
      global_kv_namespace_ids: _req['global_kv_namespace_ids'],
      http_trigger_disable: _req['http_trigger_disable'],
      initializer_sec: _req['initializer_sec'],
      is_ipv6_only: _req['is_ipv6_only'],
      is_this_zone_disabled: _req['is_this_zone_disabled'],
      latency_sec: _req['latency_sec'],
      max_concurrency: _req['max_concurrency'],
      network_mode: _req['network_mode'],
      reserved_dp_enabled: _req['reserved_dp_enabled'],
      revision_id: _req['revision_id'],
      revision_number: _req['revision_number'],
      routing_strategy: _req['routing_strategy'],
      scale_enabled: _req['scale_enabled'],
      scale_threshold: _req['scale_threshold'],
      scale_type: _req['scale_type'],
      trace_enable: _req['trace_enable'],
      zone_throttle_log_bytes_per_sec: _req['zone_throttle_log_bytes_per_sec'],
      zti_enable: _req['zti_enable'],
      online_mode: _req['online_mode'],
      enable_runtime_file_log: _req['enable_runtime_file_log'],
      enable_runtime_console_log: _req['enable_runtime_console_log'],
      enable_runtime_stream_log: _req['enable_runtime_stream_log'],
      enable_runtime_es_log: _req['enable_runtime_es_log'],
      enable_runtime_json_log: _req['enable_runtime_json_log'],
      enable_system_stream_log: _req['enable_system_stream_log'],
      enable_system_es_log: _req['enable_system_es_log'],
      runtime_stream_log_bytes_per_sec:
        _req['runtime_stream_log_bytes_per_sec'],
      system_stream_log_bytes_per_sec: _req['system_stream_log_bytes_per_sec'],
      resource_limit: _req['resource_limit'],
      pod_type: _req['pod_type'],
      enable_reserve_frozen_instance: _req['enable_reserve_frozen_instance'],
      cluster_run_cmd: _req['cluster_run_cmd'],
      disable_service_discovery: _req['disable_service_discovery'],
      async_result_emit_event_bridge: _req['async_result_emit_event_bridge'],
      resource_guarantee: _req['resource_guarantee'],
      mq_trigger_limit: _req['mq_trigger_limit'],
      cell: _req['cell'],
      lazyload: _req['lazyload'],
      image_lazyload: _req['image_lazyload'],
      initializer: _req['initializer'],
      handler: _req['handler'],
      run_cmd: _req['run_cmd'],
      throttle_log_enabled: _req['throttle_log_enabled'],
      adaptive_concurrency_mode: _req['adaptive_concurrency_mode'],
      env_name: _req['env_name'],
      container_runtime: _req['container_runtime'],
      protocol: _req['protocol'],
      overload_protect_enabled: _req['overload_protect_enabled'],
      mq_consumer_meta: _req['mq_consumer_meta'],
      enable_consul_ipv6_register: _req['enable_consul_ipv6_register'],
      enable_sys_mount: _req['enable_sys_mount'],
      disable_mount_jwt_bundles: _req['disable_mount_jwt_bundles'],
      termination_grace_period_seconds:
        _req['termination_grace_period_seconds'],
      enable_consul_register: _req['enable_consul_register'],
      host_uniq: _req['host_uniq'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /v2/services/:service_id/tickets */
  createTicket(
    req: CreateTicketRequest,
    options?: T,
  ): Promise<CreateTicketResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}/tickets`);
    const method = 'POST';
    const data = {
      approved_by: _req['approved_by'],
      approved_by_usertype: _req['approved_by_usertype'],
      cluster: _req['cluster'],
      code_revision_id: _req['code_revision_id'],
      description: _req['description'],
      format_target_traffic_config: _req['format_target_traffic_config'],
      format_zone_traffic_config: _req['format_zone_traffic_config'],
      region: _req['region'],
      release_type: _req['release_type'],
      replica_limit: _req['replica_limit'],
      revision_id: _req['revision_id'],
      rollback: _req['rollback'],
      rolling_step: _req['rolling_step'],
      use_latest_code_revision: _req['use_latest_code_revision'],
      grey_mqevent_config: _req['grey_mqevent_config'],
      code_source: _req['code_source'],
      mqevent_release_type: _req['mqevent_release_type'],
      is_pipeline_ticket: _req['is_pipeline_ticket'],
      pipeline_template_type: _req['pipeline_template_type'],
      rolling_strategy: _req['rolling_strategy'],
      rolling_interval: _req['rolling_interval'],
      min_created_percentage: _req['min_created_percentage'],
      min_ready_percentage: _req['min_ready_percentage'],
    };
    return this.request({ url, method, data }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/diagnosis/:diagnosis_id */
  deleteDiagnosisByID(
    req: DeleteDiagnosisByIDRequest,
    options?: T,
  ): Promise<DeleteDiagnosisByIDResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/diagnosis/${_req['diagnosis_id']}`,
    );
    const method = 'DELETE';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/revisions/:revision_number */
  getFunctionRevision(
    req: GetFunctionRevisionRequest,
    options?: T,
  ): Promise<GetFunctionRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions/${_req['revision_number']}`,
    );
    const method = 'GET';
    const params = { format: _req['format'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/zones/:zone/instances/:podname/logs */
  getInstancesLogs(
    req: GetInstancesLogsRequest,
    options?: T,
  ): Promise<GetInstancesLogsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/zones/${_req['zone']}/instances/${_req['podname']}/logs`,
    );
    const method = 'GET';
    const params = { revision_id: _req['revision_id'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/function_templates/:template_name/upload */
  uploadTemplateByName(
    req: UploadTemplateByNameRequest,
    options?: T,
  ): Promise<UploadTemplateByNameResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/function_templates/${_req['template_name']}/upload`,
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/diagnosis */
  createDiagnosis(
    req: CreateDiagnosisRequest,
    options?: T,
  ): Promise<CreateDiagnosisResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/diagnosis`,
    );
    const method = 'POST';
    const data = {
      diagnosis_id: _req['diagnosis_id'],
      end_at: _req['end_at'],
      item_id: _req['item_id'],
      item_type: _req['item_type'],
      set_time_range: _req['set_time_range'],
      start_at: _req['start_at'],
    };
    return this.request({ url, method, data }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/consul_triggers/:trigger_id */
  deleteConsulTrigger(
    req: DeleteConsulTriggerRequest,
    options?: T,
  ): Promise<DeleteConsulTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/consul_triggers/${_req['trigger_id']}`,
    );
    const method = 'DELETE';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services */
  getServicesList(
    req?: GetServicesListRequest,
    options?: T,
  ): Promise<GetServicesListResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/services');
    const method = 'GET';
    const params = {
      all: _req['all'],
      env: _req['env'],
      id: _req['id'],
      limit: _req['limit'],
      name: _req['name'],
      no_worker: _req['no_worker'],
      offset: _req['offset'],
      owner: _req['owner'],
      psm: _req['psm'],
      search: _req['search'],
      search_type: _req['search_type'],
      sort_by: _req['sort_by'],
      search_fields: _req['search_fields'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/latest_release */
  getLatestRelease(
    req: GetLatestReleaseRequest,
    options?: T,
  ): Promise<GetLatestReleaseResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/latest_release`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/regions_enabled */
  getRegionsEnabled(
    req?: getRegionsEnabledRequest,
    options?: T,
  ): Promise<GetRegionsEnabledResponse> {
    const url = this.genBaseURL('/v2/regions_enabled');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/timers/:timer_id */
  getTimerTrigger(
    req: GetTimerTriggerRequest,
    options?: T,
  ): Promise<GetTimerTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/timers/${_req['timer_id']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/http_triggers */
  getHttpTriggers(
    req: GetHttpTriggersRequest,
    options?: T,
  ): Promise<GetHttpTriggersResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/http_triggers`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/instances */
  getInstances(
    req: GetInstancesRequest,
    options?: T,
  ): Promise<GetInstancesResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/instances`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/diagnosis */
  getDiagnosis(
    req: GetDiagnosisRequest,
    options?: T,
  ): Promise<GetDiagnosisResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/diagnosis`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/consul_triggers/:trigger_id */
  updateConsulTrigger(
    req: UpdateConsulTriggerRequest,
    options?: T,
  ): Promise<UpdateConsulTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/consul_triggers/${_req['trigger_id']}`,
    );
    const method = 'PATCH';
    const data = {
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** PUT /v2/services/:service_id/regions/:region/clusters/:cluster/http_triggers/:trigger_id */
  updateHttpTrigger(
    req: UpdateHttpTriggerRequest,
    options?: T,
  ): Promise<UpdateHttpTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/http_triggers/${_req['trigger_id']}`,
    );
    const method = 'PUT';
    const data = {
      bytefaas_error_response_disabled:
        _req['bytefaas_error_response_disabled'],
      bytefaas_response_header_disabled:
        _req['bytefaas_response_header_disabled'],
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
      url_prefix: _req['url_prefix'],
      version_type: _req['version_type'],
      version_value: _req['version_value'],
      runtime: _req['runtime'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/revisions */
  createRevision(
    req: CreateRevisionRequest,
    options?: T,
  ): Promise<CreateRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions`,
    );
    const method = 'POST';
    const data = {
      code_revision_number: _req['code_revision_number'],
      dependency: _req['dependency'],
      deploy_method: _req['deploy_method'],
      description: _req['description'],
      disable_build_install: _req['disable_build_install'],
      envs: _req['envs'],
      format_envs: _req['format_envs'],
      handler: _req['handler'],
      initializer: _req['initializer'],
      lazyload: _req['lazyload'],
      name: _req['name'],
      network_mode: _req['network_mode'],
      run_cmd: _req['run_cmd'],
      runtime: _req['runtime'],
      runtime_container_port: _req['runtime_container_port'],
      runtime_debug_container_port: _req['runtime_debug_container_port'],
      source: _req['source'],
      source_type: _req['source_type'],
      open_image_lazyload: _req['open_image_lazyload'],
      runtime_other_container_ports: _req['runtime_other_container_ports'],
      host_uniq: _req['host_uniq'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/timers/:timer_id */
  deleteTimerTrigger(
    req: DeleteTimerTriggerRequest,
    options?: T,
  ): Promise<DeleteTimerTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/timers/${_req['timer_id']}`,
    );
    const method = 'DELETE';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/zones/:zone/instances/:podname/migrate */
  migrateInstances(
    req: MigrateInstancesRequest,
    options?: T,
  ): Promise<MigrateInstancesResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/zones/${_req['zone']}/instances/${_req['podname']}/migrate`,
    );
    const method = 'POST';
    const params = { env: _req['env'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** PUT /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id */
  updateMqTriggerByType(
    req: UpdateMqTriggerByTypeRequest,
    options?: T,
  ): Promise<UpdateMqTriggerByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}`,
    );
    const method = 'PUT';
    const data = {
      batch_size: _req['batch_size'],
      batch_flush_duration_milliseconds:
        _req['batch_flush_duration_milliseconds'],
      description: _req['description'],
      enabled: _req['enabled'],
      envs: _req['envs'],
      function_id: _req['function_id'],
      cell: _req['cell'],
      id: _req['id'],
      image_version: _req['image_version'],
      sdk_version: _req['sdk_version'],
      image_alias: _req['image_alias'],
      ms_alarm_id: _req['ms_alarm_id'],
      mq_type: _req['mq_type'],
      max_retries_from_function_status:
        _req['max_retries_from_function_status'],
      msg_chan_length: _req['msg_chan_length'],
      name: _req['name'],
      need_auto_sharding: _req['need_auto_sharding'],
      num_of_mq_pod_to_one_func_pod: _req['num_of_mq_pod_to_one_func_pod'],
      options: _req['options'],
      qps_limit: _req['qps_limit'],
      region: _req['region'],
      mq_region: _req['mq_region'],
      runtime_agent_mode: _req['runtime_agent_mode'],
      dynamic_worker_thread: _req['dynamic_worker_thread'],
      replica_max_limit: _req['replica_max_limit'],
      replica_min_limit: _req['replica_min_limit'],
      replicas: _req['replicas'],
      resource: _req['resource'],
      scale_enabled: _req['scale_enabled'],
      vertical_scale_enabled: _req['vertical_scale_enabled'],
      enable_static_membership: _req['enable_static_membership'],
      workers_per_pod: _req['workers_per_pod'],
      alarm_params: _req['alarm_params'],
      request_timeout: _req['request_timeout'],
      disable_infinite_retry_for_timeout:
        _req['disable_infinite_retry_for_timeout'],
      initial_offset_start_from: _req['initial_offset_start_from'],
      enable_mq_debug: _req['enable_mq_debug'],
      mq_logger_limit_size: _req['mq_logger_limit_size'],
      enable_backoff: _req['enable_backoff'],
      disable_backoff: _req['disable_backoff'],
      worker_v2_num_per_half_core: _req['worker_v2_num_per_half_core'],
      enable_concurrency_filter: _req['enable_concurrency_filter'],
      enable_ipc_mode: _req['enable_ipc_mode'],
      enable_traffic_priority_scheduling:
        _req['enable_traffic_priority_scheduling'],
      enable_pod_colocate_scheduling: _req['enable_pod_colocate_scheduling'],
      enable_global_rate_limiter: _req['enable_global_rate_limiter'],
      enable_congestion_control: _req['enable_congestion_control'],
      allow_bytesuite_debug: _req['allow_bytesuite_debug'],
      enable_dynamic_load_balance: _req['enable_dynamic_load_balance'],
      disable_smooth_wrr: _req['disable_smooth_wrr'],
      dynamic_load_balance_type: _req['dynamic_load_balance_type'],
      replica_force_meet_partition: _req['replica_force_meet_partition'],
      scale_settings: _req['scale_settings'],
      hot_reload: _req['hot_reload'],
      mq_msg_type: _req['mq_msg_type'],
      status: _req['status'],
      in_releasing: _req['in_releasing'],
      mirror_region_filter: _req['mirror_region_filter'],
      enable_gctuner: _req['enable_gctuner'],
      gctuner_percent: _req['gctuner_percent'],
      retry_strategy: _req['retry_strategy'],
      max_retry_time: _req['max_retry_time'],
      qps_limit_time_ranges: _req['qps_limit_time_ranges'],
      limit_disaster_scenario: _req['limit_disaster_scenario'],
      enable_step_rate_limit: _req['enable_step_rate_limit'],
      rate_limit_step_settings: _req['rate_limit_step_settings'],
      max_dwell_time_minute: _req['max_dwell_time_minute'],
      qps_auto_limit: _req['qps_auto_limit'],
      plugin_function_param: _req['plugin_function_param'],
      enable_plugin_function: _req['enable_plugin_function'],
      enable_canary_update: _req['enable_canary_update'],
      traffic_config: _req['traffic_config'],
      is_auth_info_updated: _req['is_auth_info_updated'],
      pod_type: _req['pod_type'],
      package: _req['package'],
      enable_filter_congestion_control:
        _req['enable_filter_congestion_control'],
      enable_congestion_control_cache: _req['enable_congestion_control_cache'],
    };
    const params = {
      hot_reload: _req['hot_reload'],
      skip_image_upgrade: _req['skip_image_upgrade'],
      caller: _req['caller'],
      not_update_alarm: _req['not_update_alarm'],
      migrated_by_cli: _req['migrated_by_cli'],
      check: _req['check'],
      'X-Bytefaas-Mqevent-Force-Update':
        _req['X-Bytefaas-Mqevent-Force-Update'],
      confirm: _req['confirm'],
      'X-ByteFaaS-Update-MQ-Image': _req['X-ByteFaaS-Update-MQ-Image'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, params, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/http_triggers */
  createHttpTrigger(
    req: CreateHttpTriggerRequest,
    options?: T,
  ): Promise<CreateHttpTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/http_triggers`,
    );
    const method = 'POST';
    const data = {
      bytefaas_error_response_disabled:
        _req['bytefaas_error_response_disabled'],
      bytefaas_response_header_disabled:
        _req['bytefaas_response_header_disabled'],
      description: _req['description'],
      enabled: _req['enabled'],
      name: _req['name'],
      url_prefix: _req['url_prefix'],
      version_type: _req['version_type'],
      version_value: _req['version_value'],
      runtime: _req['runtime'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/filterplugins/:filter_plugin_id */
  deleteFilterPlugins(
    req: DeleteFilterPluginsRequest,
    options?: T,
  ): Promise<DeleteFilterPluginsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/filterplugins/${_req['filter_plugin_id']}`,
    );
    const method = 'DELETE';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/logs/:log_type */
  getLogs(req: GetLogsRequest, options?: T): Promise<GetLogsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/logs/${_req['log_type']}`,
    );
    const method = 'GET';
    const params = {
      advanced: _req['advanced'],
      ascend: _req['ascend'],
      from: _req['from'],
      include_system: _req['include_system'],
      pod_ip: _req['pod_ip'],
      pod_name: _req['pod_name'],
      revision_id: _req['revision_id'],
      search: _req['search'],
      size: _req['size'],
      to: _req['to'],
    };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/services/:service_id/recover */
  recoverDeletedCluster(
    req: RecoverDeletedClusterRequest,
    options?: T,
  ): Promise<RecoverDeletedClusterResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}/recover`);
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** PUT /v2/services/:service_id/code */
  updateCodeByServiceID(
    req: UpdateCodeByServiceIDRequest,
    options?: T,
  ): Promise<UpdateCodeByServiceIDResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}/code`);
    const method = 'PUT';
    const data = {
      dependency: _req['dependency'],
      deploy_method: _req['deploy_method'],
      disable_build_install: _req['disable_build_install'],
      handler: _req['handler'],
      initializer: _req['initializer'],
      lazyload: _req['lazyload'],
      run_cmd: _req['run_cmd'],
      runtime: _req['runtime'],
      runtime_container_port: _req['runtime_container_port'],
      runtime_debug_container_port: _req['runtime_debug_container_port'],
      source: _req['source'],
      source_type: _req['source_type'],
      zip_file: _req['zip_file'],
      zip_file_size: _req['zip_file_size'],
      open_image_lazyload: _req['open_image_lazyload'],
      runtime_other_container_ports: _req['runtime_other_container_ports'],
    };
    return this.request({ url, method, data }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/filterplugins/:filter_plugin_id */
  updateFilterPlugins(
    req: UpdateFilterPluginsRequest,
    options?: T,
  ): Promise<UpdateFilterPluginsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/filterplugins/${_req['filter_plugin_id']}`,
    );
    const method = 'PATCH';
    const data = {
      name: _req['name'],
      zip_file: _req['zip_file'],
      zip_file_size: _req['zip_file_size'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters */
  getClustersList(
    req: GetClustersListRequest,
    options?: T,
  ): Promise<GetClustersListResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters`,
    );
    const method = 'GET';
    const params = { verbose: _req['verbose'] };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** POST /v2/regions/:region/zone/:zone/prescan/:hours */
  prescan(req: PrescanRequest, options?: T): Promise<PrescanResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/regions/${_req['region']}/zone/${_req['zone']}/prescan/:hours`,
    );
    const method = 'POST';
    const data = { hours: _req['hours'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/async_requests */
  listAsyncRequests(
    req: ListAsyncRequestsRequest,
    options?: T,
  ): Promise<ListAsyncRequestsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/async_requests`,
    );
    const method = 'GET';
    const params = {
      begin_time: _req['begin_time'],
      end_time: _req['end_time'],
      limit: _req['limit'],
      offset: _req['offset'],
      request_id: _req['request_id'],
      task_status: _req['task_status'],
    };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster_name/mq_permission */
  mqPermission(
    req: MqPermissionRequest,
    options?: T,
  ): Promise<MqPermissionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster_name']}/mq_permission`,
    );
    const method = 'POST';
    const data = {
      cluster: _req['cluster'],
      mq_region: _req['mq_region'],
      topic: _req['topic'],
      type: _req['type'],
      auth_type: _req['auth_type'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * DELETE /v2/services/:service_id/subscription
   *
   * unsubscribe a single function service
   */
  unsubscribeService(
    req: UnsubscribeServiceRequest,
    options?: T,
  ): Promise<UnsubscribeServiceResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/subscription`,
    );
    const method = 'DELETE';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/build_latest */
  buildLatestRevision(
    req: BuildLatestRevisionRequest,
    options?: T,
  ): Promise<BuildLatestRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/build_latest`,
    );
    const method = 'POST';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/revisions */
  getClusterRevisions(
    req: GetClusterRevisionsRequest,
    options?: T,
  ): Promise<GetClusterRevisionsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions`,
    );
    const method = 'GET';
    const params = {
      description: _req['description'],
      format: _req['format'],
      limit: _req['limit'],
      offset: _req['offset'],
      with_status: _req['with_status'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/scale_strategies */
  getScaleStrategies(
    req: GetScaleStrategiesRequest,
    options?: T,
  ): Promise<GetScaleStrategiesResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/scale_strategies`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/alarms */
  updateClusterAlarm(
    req: UpdateClusterAlarmRequest,
    options?: T,
  ): Promise<UpdateClusterAlarmResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/alarms`,
    );
    const method = 'PATCH';
    const data = {
      alarm_id: _req['alarm_id'],
      alarm_methods: _req['alarm_methods'],
      function_id: _req['function_id'],
      level: _req['level'],
      rule_alias: _req['rule_alias'],
      rule_format: _req['rule_format'],
      status: _req['status'],
      threshold: _req['threshold'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id/sync */
  syncMqTriggerData(
    req: SyncMqTriggerDataRequest,
    options?: T,
  ): Promise<SyncMqTriggerDataResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}/sync`,
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/scale_strategies */
  createScaleStrategy(
    req: CreateScaleStrategyRequest,
    options?: T,
  ): Promise<CreateScaleStrategyResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/:region/clusters/${_req['cluster']}/scale_strategies`,
    );
    const method = 'POST';
    const data = {
      effective_time: _req['effective_time'],
      enabled: _req['enabled'],
      expired_time: _req['expired_time'],
      function_id: _req['function_id'],
      inner_strategy: _req['inner_strategy'],
      item_id: _req['item_id'],
      item_type: _req['item_type'],
      region: _req['region'],
      strategy_id: _req['strategy_id'],
      strategy_name: _req['strategy_name'],
      strategy_type: _req['strategy_type'],
      instance_type: _req['instance_type'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/scale_strategies/:strategy_id */
  getScaleStrategy(
    req: GetScaleStrategyRequest,
    options?: T,
  ): Promise<GetScaleStrategyResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/scale_strategies/${_req['strategy_id']}`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/psm/:psm/env/:env_name */
  getServiceByPsmAndEnv(
    req: GetServiceByPsmAndEnvRequest,
    options?: T,
  ): Promise<GetServiceByPsmAndEnvResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/psm/${_req['psm']}/env/${_req['env_name']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/plugin_function_revisions/:id/release */
  createPluginFunctionRelease(
    req: CreatePluginFunctionReleaseRequest,
    options?: T,
  ): Promise<CreatePluginFunctionReleaseResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/plugin_function_revisions/${_req['id']}/release`,
    );
    const method = 'POST';
    const data = { mqevent_ids: _req['mqevent_ids'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/plugin_function_revisions/:id */
  getPluginFunctionRevisionDetail(
    req: GetPluginFunctionRevisionDetailRequest,
    options?: T,
  ): Promise<GetPluginFunctionRevisionDetailResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/plugin_function_revisions/${_req['id']}`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** DELETE /v2/services/:service_id/regions/:region/clusters/:cluster/plugin_function_revisions/:id */
  deletePluginFunctionRevision(
    req: DeletePluginFunctionRevisionRequest,
    options?: T,
  ): Promise<DeletePluginFunctionRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/plugin_function_revisions/${_req['id']}`,
    );
    const method = 'DELETE';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/plugin_function_revisions */
  createPluginFunctionRevision(
    req: CreatePluginFunctionRevisionRequest,
    options?: T,
  ): Promise<CreatePluginFunctionRevisionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/plugin_function_revisions`,
    );
    const method = 'POST';
    const data = {
      description: _req['description'],
      environments: _req['environments'],
      init_timeout: _req['init_timeout'],
      plugin_name: _req['plugin_name'],
      plugin_version: _req['plugin_version'],
      request_timeout: _req['request_timeout'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/plugin_functions */
  getPluginFunctions(
    req: GetPluginFunctionsRequest,
    options?: T,
  ): Promise<GetPluginFunctionsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/plugin_functions`,
    );
    const method = 'GET';
    const params = { limit: _req['limit'], offset: _req['offset'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/plugin_function_revisions */
  getPluginFunctionRevisions(
    req: GetPluginFunctionRevisionsRequest,
    options?: T,
  ): Promise<GetPluginFunctionRevisionsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/plugin_function_revisions`,
    );
    const method = 'GET';
    const params = { limit: _req['limit'], offset: _req['offset'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/mqtriggers */
  getMQTrigger(
    req: GetMQTriggerRequest,
    options?: T,
  ): Promise<GetMQTriggerResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/mqtriggers`,
    );
    const method = 'GET';
    const params = {
      enable_plugin_function: _req['enable_plugin_function'],
      plugin_function_version: _req['plugin_function_version'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/release/:release_id */
  patchRelease(
    req: PatchReleaseRequest,
    options?: T,
  ): Promise<PatchReleaseResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/release/${_req['release_id']}`,
    );
    const method = 'PATCH';
    const data = {
      action: _req['action'],
      alias_name: _req['alias_name'],
      format_target_traffic_config: _req['format_target_traffic_config'],
      format_zone_traffic_config: _req['format_zone_traffic_config'],
      rolling_step: _req['rolling_step'],
      target_traffic_config: _req['target_traffic_config'],
      zone_traffic_config: _req['zone_traffic_config'],
      rolling_strategy: _req['rolling_strategy'],
      rolling_interval: _req['rolling_interval'],
      min_created_percentage: _req['min_created_percentage'],
      min_ready_percentage: _req['min_ready_percentage'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/release/:release_id */
  getReleaseByID(
    req: GetReleaseByIDRequest,
    options?: T,
  ): Promise<GetReleaseByIDResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/release/${_req['release_id']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/release */
  getRelease(req: GetReleaseRequest, options?: T): Promise<GetReleaseResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/release`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/release */
  createRelease(
    req: CreateReleaseRequest,
    options?: T,
  ): Promise<CreateReleaseResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/release`,
    );
    const method = 'POST';
    const data = {
      alias_name: _req['alias_name'],
      rolling_step: _req['rolling_step'],
      target_traffic_config: _req['target_traffic_config'],
      zone_traffic_config: _req['zone_traffic_config'],
      rolling_strategy: _req['rolling_strategy'],
      rolling_interval: _req['rolling_interval'],
      min_created_percentage: _req['min_created_percentage'],
      min_ready_percentage: _req['min_ready_percentage'],
    };
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, data, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/auto_mesh */
  getClusterAutoMesh(
    req: GetClusterAutoMeshRequest,
    options?: T,
  ): Promise<GetClusterAutoMeshResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/auto_mesh`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/plugin_functions/:plugin_name/plugin_versions */
  getPluginVersions(
    req: GetPluginVersionsRequest,
    options?: T,
  ): Promise<GetPluginVersionsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/plugin_functions/${_req['plugin_name']}/plugin_versions`,
    );
    const method = 'GET';
    const params = { limit: _req['limit'], offset: _req['offset'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/auto_mesh
   *
   * update cluster in auto mesh
   */
  updateClusterAutoMesh(
    req: UpdateClusterAutoMeshRequest,
    options?: T,
  ): Promise<UpdateClusterAutoMeshResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/auto_mesh`,
    );
    const method = 'PATCH';
    const data = {
      mesh_enable: _req['mesh_enable'],
      mesh_http_egress: _req['mesh_http_egress'],
      mesh_mongo_egress: _req['mesh_mongo_egress'],
      mesh_mysql_egress: _req['mesh_mysql_egress'],
      mesh_rpc_egress: _req['mesh_rpc_egress'],
      mesh_sidecar_percent: _req['mesh_sidecar_percent'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/clusters */
  getClustersListWithPagination(
    req: GetClustersListWithPaginationRequest,
    options?: T,
  ): Promise<GetClustersListWithPaginationResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/${_req['service_id']}/clusters`);
    const method = 'GET';
    const params = {
      cluster: _req['cluster'],
      limit: _req['limit'],
      offset: _req['offset'],
      region: _req['region'],
      resource_list: _req['resource_list'],
      search: _req['search'],
      verbose: _req['verbose'],
      soft_deleted: _req['soft_deleted'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/psm/:psm */
  getAllServiceByPsm(
    req: GetAllServiceByPsmRequest,
    options?: T,
  ): Promise<GetAllServiceByPsmResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/services/psm/${_req['psm']}`);
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/scm/search */
  searchFunctionsBySCM(
    req: SearchFunctionsBySCMRequest,
    options?: T,
  ): Promise<SearchFunctionsBySCMResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/services/scm/search');
    const method = 'GET';
    const params = {
      limit: _req['limit'],
      offset: _req['offset'],
      scm: _req['scm'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/tickets/:ticket_id */
  getServiceTicketByID(
    req: GetServiceTicketByIDRequest,
    options?: T,
  ): Promise<GetServiceTicketByIDResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/tickets/${_req['ticket_id']}`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/mqtriggers */
  getMQTriggersListWithPagination(
    req: GetMQTriggersListWithPaginationRequest,
    options?: T,
  ): Promise<GetMQTriggersListWithPaginationResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/mqtriggers`,
    );
    const method = 'GET';
    const params = {
      cluster: _req['cluster'],
      limit: _req['limit'],
      offset: _req['offset'],
      region: _req['region'],
      search: _req['search'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/batch_tickets/:id */
  getBatchTicketDetailByID(
    req: GetBatchTicketDetailByIDRequest,
    options?: T,
  ): Promise<GetBatchTicketDetailByIDResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/batch_tickets/${_req['id']}`);
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/mqtriggers/:trigger_id/zones/:zone/instances/:podname/webshell */
  getMqTriggerInstancesWebshell(
    req: GetMqTriggerInstancesWebshellRequest,
    options?: T,
  ): Promise<GetMqTriggerInstancesWebshellResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/mqtriggers/${_req['trigger_id']}/zones/${_req['zone']}/instances/${_req['podname']}/webshell`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/mqtriggers/:trigger_id/instances */
  getMqTriggerInstances(
    req: GetMqTriggerInstancesRequest,
    options?: T,
  ): Promise<GetMqTriggerInstancesResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/mqtriggers/${_req['trigger_id']}/instances`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/mqtriggers/:trigger_id/zones/:zone/instances/:podname/migrate */
  migrateMqTriggerInstance(
    req: MigrateMqTriggerInstanceRequest,
    options?: T,
  ): Promise<MigrateMqTriggerInstanceResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/mqtriggers/${_req['trigger_id']}/zones/${_req['zone']}/instances/${_req['podname']}/migrate`,
    );
    const method = 'POST';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/resource/services/:service_id/regions/:region/clusters/:cluster/threshold */
  getReservedReplicaThreshold(
    req: GetReservedReplicaThresholdRequest,
    options?: T,
  ): Promise<GetReservedReplicaThresholdResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/resource/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/threshold`,
    );
    const method = 'GET';
    const params = {
      duration_minutes: _req['duration_minutes'],
      hours: _req['hours'],
      minutes: _req['minutes'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/admin/triggers/rollback */
  adminRollback(
    req?: AdminRollbackRequest,
    options?: T,
  ): Promise<AdminRollbackResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/admin/triggers/rollback');
    const method = 'PATCH';
    const data = { targets: _req['targets'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/admin/notifications/templates */
  getMQTriggerTemplate(
    req?: getMQTriggerTemplateRequest,
    options?: T,
  ): Promise<GetMQTriggerTemplateResponse> {
    const url = this.genBaseURL('/v2/admin/notifications/templates');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /**
   * POST /v2/admin/notifications/groups
   *
   * If no message content is provided, it will use a default MQ trigger announcement template
   */
  sendNotificationsToLarkBotGroups(
    req?: SendNotificationsToLarkBotGroupsRequest,
    options?: T,
  ): Promise<SendNotificationsToLarkBotGroupsResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/admin/notifications/groups');
    const method = 'POST';
    const data = {
      content: _req['content'],
      receiver_ids: _req['receiver_ids'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/admin/notifications/groups */
  getLarkBotChatGroups(
    req?: getLarkBotChatGroupsRequest,
    options?: T,
  ): Promise<GetLarkBotChatGroupsResponse> {
    const url = this.genBaseURL('/v2/admin/notifications/groups');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id/rollback */
  rollback(req: RollbackRequest, options?: T): Promise<RollbackResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}/rollback`,
    );
    const method = 'PATCH';
    const data = { targets: _req['targets'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/admin/tickets */
  adminListTickets(
    req: GetTicketsByFilterRequest,
    options?: T,
  ): Promise<GetTicketsByFilterResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/admin/tickets');
    const method = 'GET';
    const params = {
      category: _req['category'],
      change_type: _req['change_type'],
      cluster: _req['cluster'],
      function_id: _req['function_id'],
      id: _req['id'],
      max_create_time: _req['max_create_time'],
      min_create_time: _req['min_create_time'],
      only_admin_ticket: _req['only_admin_ticket'],
      parent_id: _req['parent_id'],
      region: _req['region'],
      status: _req['status'],
      trigger_id: _req['trigger_id'],
      trigger_type: _req['trigger_type'],
      type: _req['type'],
      limit: _req['limit'],
      offset: _req['offset'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/mqtrigger_instances */
  getClusterAllMqTriggerInstances(
    req: GetClusterAllMqTriggerInstancesRequest,
    options?: T,
  ): Promise<GetClusterAllMqTriggerInstancesResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/mqtrigger_instances`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /**
   * POST /v2/tickets/:ticket_id/steps/:step_id/actions
   *
   * new api for pipeline type ticket
   */
  updateTicketStepAction(
    req: UpdateTicketStepActionRequest,
    options?: T,
  ): Promise<UpdateTicketStepActionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/tickets/${_req['ticket_id']}/steps/${_req['step_id']}/actions`,
    );
    const method = 'POST';
    const data = { action: _req['action'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/resource/services/realtime */
  getRealtimeResourceUsage(
    req?: GetRealtimeResourceUsageRequest,
    options?: T,
  ): Promise<GetRealtimeResourceUsageResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/resource/services/realtime');
    const method = 'GET';
    const params = {
      all_region: _req['all_region'],
      env: _req['env'],
      psm: _req['psm'],
      region: _req['region'],
    };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/packages */
  getPackageList(
    req?: GetPackageListRequest,
    options?: T,
  ): Promise<GetPackageListResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/packages');
    const method = 'POST';
    const params = { region: _req['region'] };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/admin/batch_tickets/:parent_id/tickets/:id */
  skipCheckForBatchTask(
    req: SkipCheckForBatchTaskRequest,
    options?: T,
  ): Promise<SkipCheckForBatchTaskResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/admin/batch_tickets/${_req['parent_id']}/tickets/${_req['id']}`,
    );
    const method = 'PATCH';
    return this.request({ url, method }, options);
  }

  /** GET /v2/pipeline/templates */
  listPipelineTemplates(
    req?: ListPipelineTemplatesRequest,
    options?: T,
  ): Promise<ListPipelineTemplatesResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/pipeline/templates');
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/pipeline/templates/:template_type */
  queryPipelineTemplateByType(
    req: QueryPipelineTemplateByTypeRequest,
    options?: T,
  ): Promise<QueryPipelineTemplateByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/pipeline/templates/${_req['template_type']}`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** GET /v2/function_resource_packages */
  getFunctionResourcePackages(
    req?: GetFunctionResourcePackagesRequest,
    options?: T,
  ): Promise<GetFunctionResourcePackagesResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/function_resource_packages');
    const method = 'GET';
    const params = {
      is_plugin_function: _req['is_plugin_function'],
      is_worker: _req['is_worker'],
      runtime: _req['runtime'],
      region: _req['region'],
      cluster: _req['cluster'],
      category: _req['category'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/release/:release_id/start_info */
  getReleaseStartLogByID(
    req: GetReleaseStartInfoByIDRequest,
    options?: T,
  ): Promise<GetReleaseStartInfoByIDResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/release/${_req['release_id']}/start_info`,
    );
    const method = 'GET';
    const params = { revision_id: _req['revision_id'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/psm/:psm/env/:env_name/regions/:region/clusters/:cluster/released */
  queryReleaseClusterByPsm(
    req?: QueryReleasedClusterRequest,
    options?: T,
  ): Promise<QueryReleasedClusterResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/psm/${_req['psm']}/env/${_req['env_name']}/regions/${_req['region']}/clusters/${_req['cluster']}/released`,
    );
    const method = 'GET';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/revisions/:revision_number/abort_build */
  abortBuild(req: AbortBuildRequest, options?: T): Promise<AbortBuildResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/revisions/${_req['revision_number']}/abort_build`,
    );
    const method = 'POST';
    const headers = { 'X-Jwt-Token': _req['X-Jwt-Token'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/services/:service_id/tickets/release_clusters */
  releaseMultiClusters(
    req?: MultiCusterReleaseTicketRequest,
    options?: T,
  ): Promise<CreateTicketResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/tickets/release_clusters`,
    );
    const method = 'POST';
    const data = {
      approved_by: _req['approved_by'],
      approved_by_usertype: _req['approved_by_usertype'],
      code_revision_id: _req['code_revision_id'],
      description: _req['description'],
      rollback: _req['rollback'],
      use_latest_code_revision: _req['use_latest_code_revision'],
      code_source: _req['code_source'],
      mqevent_release_type: _req['mqevent_release_type'],
      pipeline_template_type: _req['pipeline_template_type'],
      clusters: _req['clusters'],
      rollback_revisions: _req['rollback_revisions'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/tickets/:ticket_id/steps/actions */
  batchUpdateTicketStepAction(
    req: BatchUpdateTicketStepActionRequest,
    options?: T,
  ): Promise<UpdateTicketStepActionResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/tickets/${_req['ticket_id']}/steps/actions`,
    );
    const method = 'POST';
    const data = { action: _req['action'], step_ids: _req['step_ids'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/migration_records */
  getMigrationRecords(
    req: MigrationRecordsRequest,
    options?: T,
  ): Promise<MigrationRecordsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/migration_records`,
    );
    const method = 'GET';
    const params = {
      region: _req['region'],
      cluster: _req['cluster'],
      delete_by: _req['delete_by'],
      pod_name: _req['pod_name'],
      page_size: _req['page_size'],
      page_num: _req['page_num'],
      start: _req['start'],
      end: _req['end'],
      detector: _req['detector'],
      zone: _req['zone'],
      ip: _req['ip'],
      pod_type: _req['pod_type'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/resource/services/:service_id/regions/:region/clusters/:cluster/:trigger_type/:trigger_id/threshold */
  getTriggerReservedReplicaThreshold(
    req: GetTriggerReservedReplicaThresholdRequest,
    options?: T,
  ): Promise<GetTriggerReservedReplicaThresholdResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/resource/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/${_req['trigger_type']}/${_req['trigger_id']}/threshold`,
    );
    const method = 'GET';
    const params = {
      duration_minutes: _req['duration_minutes'],
      hours: _req['hours'],
      minutes: _req['minutes'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/autoscale/functions/scale_threshold/setting */
  getFunctionScaleThresholdsSetting(
    req?: GetFunctionScaleThresholdsSettingRequest,
    options?: T,
  ): Promise<FuncScaleSettingApiResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/autoscale/functions/scale_threshold/setting`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/autoscale/functions/scale_threshold/setting */
  updateFunctionScaleThresholds(
    req?: UpdateScaleThresholdSetRequest,
    options?: T,
  ): Promise<FuncScaleSettingApiResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/autoscale/functions/scale_threshold/setting`,
    );
    const method = 'PATCH';
    const data = {
      scale_set_name: _req['scale_set_name'],
      overload_fast_scale_enabled: _req['overload_fast_scale_enabled'],
      lag_scale_set_name: _req['lag_scale_set_name'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/autoscale/functions/scale_threshold/settings */
  listFunctionScaleThresholdsSettings(
    req?: ListFuncScaleSettingApiRequest,
    options?: T,
  ): Promise<ListFuncScaleSettingApiResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/autoscale/functions/scale_threshold/settings`,
    );
    const method = 'GET';
    const params = {
      region: _req['region'],
      cluster: _req['cluster'],
      offset: _req['offset'],
      limit: _req['limit'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id/restricted_meta */
  patchMqTriggerRestrictedMetaByType(
    req: PatchMqTriggerRestrictedMetaByTypeRequest,
    options?: T,
  ): Promise<PatchMqTriggerByTypeResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}/restricted_meta`,
    );
    const method = 'PATCH';
    const data = { cluster: _req['cluster'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/autoscale/functions/emergency_scale */
  createEmergencyScaleStrategy(
    req?: EmergencyScaleRequest,
    options?: T,
  ): Promise<EmergencyScaleResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/autoscale/functions/emergency_scale`,
    );
    const method = 'POST';
    const data = {
      min_replicas: _req['min_replicas'],
      scale_duration_minutes: _req['scale_duration_minutes'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/admin/release_overview */
  getReleaseOverview(
    req?: GetReleaseOverviewRequest,
    options?: T,
  ): Promise<GetReleaseOverviewResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/admin/release_overview');
    const method = 'GET';
    const params = {
      start_time: _req['start_time'],
      end_time: _req['end_time'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/autoscale/mqtriggers/:trigger_id/scale_threshold/setting */
  getMQTriggerScaleThresholdsSetting(
    req: GetMQTriggerScaleThresholdSetRequest,
    options?: T,
  ): Promise<GetMQTriggerScaleThresholdSetResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/autoscale/mqtriggers/${_req['trigger_id']}/scale_threshold/setting`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/autoscale/mqtriggers/:trigger_id/emergency_scale */
  createMQTriggerEmergencyScaleStrategy(
    req: MQTriggerEmergencyScaleRequest,
    options?: T,
  ): Promise<MQTriggerEmergencyScaleResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/autoscale/mqtriggers/${_req['trigger_id']}/emergency_scale`,
    );
    const method = 'POST';
    const data = {
      min_replicas: _req['min_replicas'],
      scale_duration_minutes: _req['scale_duration_minutes'],
    };
    return this.request({ url, method, data }, options);
  }

  /** PATCH /v2/services/:service_id/regions/:region/clusters/:cluster/autoscale/mqtriggers/:trigger_id/scale_threshold/setting */
  patchMQTriggerScaleThresholdsSetting(
    req: PatchMQTriggerScaleThresholdSetRequest,
    options?: T,
  ): Promise<PatchMQTriggerScaleThresholdSetResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/autoscale/mqtriggers/${_req['trigger_id']}/scale_threshold/setting`,
    );
    const method = 'PATCH';
    const data = {
      scale_set_name: _req['scale_set_name'],
      lag_scale_set_name: _req['lag_scale_set_name'],
      vertical_scale_enabled: _req['vertical_scale_enabled'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/autoscale/mqtriggers/scale_threshold/settings */
  listMQTriggerScaleThresholdsSetting(
    req: ListMQTriggerScaleThresholdsSettingRequest,
    options?: T,
  ): Promise<ListMQTriggerScaleThresholdsSettingResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/autoscale/mqtriggers/scale_threshold/settings`,
    );
    const method = 'GET';
    const params = {
      offset: _req['offset'],
      limit: _req['limit'],
      search: _req['search'],
      region: _req['region'],
      cluster: _req['cluster'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/service/:service_id/autoscale/:target/scale_threshold/options */
  scaleThresholdOptions(
    req: ScaleThresholdOptionsRequest,
    options?: T,
  ): Promise<ScaleThresholdOptionsApiResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/service/${_req['service_id']}/autoscale/${_req['target']}/scale_threshold/options`,
    );
    const method = 'GET';
    const params = { mqtrigger_id: _req['mqtrigger_id'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/services/:target_service_id/regions/:target_region/clusters/:target_cluster/copy_triggers */
  copyTriggers(
    req: CopyTriggersRequest,
    options?: T,
  ): Promise<CreateTicketResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['target_service_id']}/regions/${_req['target_region']}/clusters/${_req['target_cluster']}/copy_triggers`,
    );
    const method = 'POST';
    const data = {
      source_service_id: _req['source_service_id'],
      source_region: _req['source_region'],
      source_cluster: _req['source_cluster'],
      source_triggers: _req['source_triggers'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/autoscale/functions/scale_list */
  GetFunctionScaleRecordList(
    req: GetFunctionScaleRecordListReq,
    options?: T,
  ): Promise<GetFunctionScaleRecordListRes> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/autoscale/functions/scale_list`,
    );
    const method = 'GET';
    const params = {
      offset: _req['offset'],
      limit: _req['limit'],
      start_time: _req['start_time'],
      end_time: _req['end_time'],
      cluster: _req['cluster'],
      strategy: _req['strategy'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/autoscale/mqtriggers/scale_list */
  GetMQTriggerScaleRecordList(
    req: GetMQTriggerScaleRecordListReq,
    options?: T,
  ): Promise<GetMQTriggerScaleRecordListRes> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/autoscale/mqtriggers/scale_list`,
    );
    const method = 'GET';
    const params = {
      offset: _req['offset'],
      limit: _req['limit'],
      start_time: _req['start_time'],
      end_time: _req['end_time'],
      cluster: _req['cluster'],
      strategy: _req['strategy'],
      search: _req['search'],
    };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/services/:service_id/debug/trigger/tpl */
  CreateTriggerDebugTpl(
    req: CreateTriggerDebugTplRequest,
    options?: T,
  ): Promise<CreateTriggerDebugTplResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/debug/trigger/tpl`,
    );
    const method = 'POST';
    const data = {
      tpl_type: _req['tpl_type'],
      cloud_event: _req['cloud_event'],
      name: _req['name'],
      trigger_type: _req['trigger_type'],
      msg_type: _req['msg_type'],
      native_event: _req['native_event'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/mq/:mq_type/topic/preview */
  MQTopicPreview(
    req: MQTopicPreviewRequest,
    options?: T,
  ): Promise<MQTopicPreviewResponse> {
    const _req = req;
    const url = this.genBaseURL(`/v2/mq/${_req['mq_type']}/topic/preview`);
    const method = 'POST';
    const data = {
      mq_region: _req['mq_region'],
      service_id: _req['service_id'],
      region: _req['region'],
      cluster: _req['cluster'],
      is_batch_msg: _req['is_batch_msg'],
      kafka_topic_preview_params: _req['kafka_topic_preview_params'],
      rocket_mq_topic_preview_params: _req['rocket_mq_topic_preview_params'],
      eventbus_topic_preview_params: _req['eventbus_topic_preview_params'],
      is_native_msg: _req['is_native_msg'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/debug/trigger/tpl */
  GetTriggerDebugTpl(
    req: GetTriggerDebugTplRequest,
    options?: T,
  ): Promise<GetTriggerDebugTplResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/debug/trigger/tpl`,
    );
    const method = 'GET';
    const params = {
      tpl_type: _req['tpl_type'],
      trigger_type: _req['trigger_type'],
    };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/services/:service_id/debug/trigger/tpl/:tpl_id */
  PatchTriggerDebugTpl(
    req: PatchTriggerDebugTplRequest,
    options?: T,
  ): Promise<PatchTriggerDebugTplResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/debug/trigger/tpl/${_req['tpl_id']}`,
    );
    const method = 'PATCH';
    const data = {
      name: _req['name'],
      cloud_event: _req['cloud_event'],
      msg_type: _req['msg_type'],
      native_event: _req['native_event'],
    };
    return this.request({ url, method, data }, options);
  }

  /** DELETE /v2/services/:service_id/debug/trigger/tpl/:tpl_id */
  DeleteTriggerDebugTpl(
    req: DeleteTriggerDebugTplRequest,
    options?: T,
  ): Promise<DeleteTriggerDebugTplResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/debug/trigger/tpl/${_req['tpl_id']}`,
    );
    const method = 'DELETE';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/trigger_debug */
  TriggerDebug(
    req: TriggerDebugRequest,
    options?: T,
  ): Promise<TriggerDebugResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/trigger_debug`,
    );
    const method = 'POST';
    const data = {
      zone: _req['zone'],
      trigger_type: _req['trigger_type'],
      cloud_event: _req['cloud_event'],
      is_batch_msg: _req['is_batch_msg'],
      is_native_msg: _req['is_native_msg'],
      native_event: _req['native_event'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/triggers/:trigger_type/:trigger_id/restart */
  RestartMQTrigger(
    req: MQTriggerRestartRequest,
    options?: T,
  ): Promise<MQTriggerRestartResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/triggers/${_req['trigger_type']}/${_req['trigger_id']}/restart`,
    );
    const method = 'POST';
    const data = { max_surge_percent: _req['max_surge_percent'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/mq/rocketmq/topic/queue-info */
  MQQueueInfo(
    req: MQQueueInfoRequest,
    options?: T,
  ): Promise<MQQueueInfoResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/mq/rocketmq/topic/queue-info');
    const method = 'GET';
    const params = {
      mq_region: _req['mq_region'],
      region: _req['region'],
      cluster_name: _req['cluster_name'],
      topic_name: _req['topic_name'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/regions/:region/zones/:zone/pods/:podname */
  getInstancesPodInfo(
    req: GetInstancesPodInfoRequest,
    options?: T,
  ): Promise<GetInstancesPodInfoResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/regions/${_req['region']}/zones/${_req['zone']}/pods/${_req['podname']}`,
    );
    const method = 'GET';
    const params = { cell: _req['cell'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/base_image/:key/version_validation */
  checkImageVersion(
    req?: CheckImagesVersionRequest,
    options?: T,
  ): Promise<CheckImagesVersionResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/base_image/${_req['key']}/version_validation`,
    );
    const method = 'POST';
    const data = { scm_version: _req['scm_version'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/base_image/:key */
  UpdateBaseImages(
    req?: UpdateBaseImagesRequest,
    options?: T,
  ): Promise<UpdateBaseImagesResponse> {
    const _req = req || {};
    const url = this.genBaseURL(`/v2/base_image/${_req['key']}`);
    const method = 'POST';
    const headers = { UpdateBaseImages: _req['UpdateBaseImages'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v2/image_manager/build/records */
  AddImageCICDRecords(
    req?: AddImageCICDRecordsRequest,
    options?: T,
  ): Promise<AddImageCICDRecordsResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/image_manager/build/records');
    const method = 'POST';
    const data = {
      create_by: _req['create_by'],
      image_type: _req['image_type'],
      app_env: _req['app_env'],
      value: _req['value'],
      old_record_value: _req['old_record_value'],
      description: _req['description'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /v1/base_image/:key */
  UpdateBaseImagesV1(
    req?: UpdateBaseImagesRequest,
    options?: T,
  ): Promise<UpdateBaseImagesResponse> {
    const _req = req || {};
    const url = this.genBaseURL(`/v1/base_image/${_req['key']}`);
    const method = 'POST';
    const headers = { UpdateBaseImages: _req['UpdateBaseImages'] };
    return this.request({ url, method, headers }, options);
  }

  /** POST /v1/image_manager/build/records */
  AddImageCICDRecordsV1(
    req?: AddImageCICDRecordsRequest,
    options?: T,
  ): Promise<AddImageCICDRecordsResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v1/image_manager/build/records');
    const method = 'POST';
    const data = {
      create_by: _req['create_by'],
      image_type: _req['image_type'],
      app_env: _req['app_env'],
      value: _req['value'],
      old_record_value: _req['old_record_value'],
      description: _req['description'],
    };
    return this.request({ url, method, data }, options);
  }

  /** PUT /v2/base_image/:key/scm_version */
  updateImageScmVersionV2(
    req?: UpdateImageScmVersionRequest,
    options?: T,
  ): Promise<UpdateImageScmVersionResponse> {
    const _req = req || {};
    const url = this.genBaseURL(`/v2/base_image/${_req['key']}/scm_version`);
    const method = 'PUT';
    const data = { version: _req['version'], git_commit: _req['git_commit'] };
    return this.request({ url, method, data }, options);
  }

  /** PATCH /v1/base_image/:key */
  preUpdateBaseImageV1(
    req?: PreUpdateBaseImagesRequest,
    options?: T,
  ): Promise<PreUpdateBaseImagesResponse> {
    const _req = req || {};
    const url = this.genBaseURL(`/v1/base_image/${_req['key']}`);
    const method = 'PATCH';
    const data = { data: _req['data'] };
    return this.request({ url, method, data }, options);
  }

  /** PATCH /v2/base_image/:key */
  preUpdateBaseImage(
    req?: PreUpdateBaseImagesRequest,
    options?: T,
  ): Promise<PreUpdateBaseImagesResponse> {
    const _req = req || {};
    const url = this.genBaseURL(`/v2/base_image/${_req['key']}`);
    const method = 'PATCH';
    const data = { data: _req['data'] };
    return this.request({ url, method, data }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/zones/:zone/instances/:podname/frozen_active */
  activeFunctionFrozenInstance(
    req: ActiveFunctionFrozenInstanceRequest,
    options?: T,
  ): Promise<ActiveFunctionFrozenInstanceResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/zones/${_req['zone']}/instances/${_req['podname']}/frozen_active`,
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** GET /v2/resource/services/:service_id/mqevent */
  getMQEventResource(
    req: GetMQEventResourceRequest,
    options?: T,
  ): Promise<GetResourceResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/resource/services/${_req['service_id']}/mqevent`,
    );
    const method = 'GET';
    const params = { env: _req['env'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/zones/:zone/instances/:podname/service_discovery */
  updateFunctionInstanceServiceDiscovery(
    req: UpdateFunctionInstanceServiceDiscoveryRequest,
    options?: T,
  ): Promise<UpdateFunctionInstanceServiceDiscoveryResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/zones/${_req['zone']}/instances/${_req['podname']}/service_discovery`,
    );
    const method = 'POST';
    const data = { disabled: _req['disabled'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/plugin_functions/:plugin_name/plugin_versions */
  getGlobalPluginVersions(
    req: GetGlobalPluginVersionsRequest,
    options?: T,
  ): Promise<GetPluginVersionsResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/plugin_functions/${_req['plugin_name']}/plugin_versions`,
    );
    const method = 'GET';
    const params = { limit: _req['limit'], offset: _req['offset'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/plugin_functions */
  getGlobalPluginFunctions(
    req?: GetGlobalPluginFunctionsRequest,
    options?: T,
  ): Promise<GetPluginFunctionsResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/plugin_functions');
    const method = 'GET';
    const params = { limit: _req['limit'], offset: _req['offset'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/volc_signin_token */
  getVolcSigninToken(
    req?: GetVolcSigninTokenRequest,
    options?: T,
  ): Promise<GetVolcSigninTokenResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/volc_signin_token`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/volc_tls_config */
  getVolcTlsConfig(
    req?: GetVolcTlsConfigRequest,
    options?: T,
  ): Promise<GetVolcTlsConfigResponse> {
    const _req = req || {};
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/regions/${_req['region']}/clusters/${_req['cluster']}/volc_tls_config`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** POST /admin/batch_tasks/function */
  AdminCreateUpdateFunctionBatchTask(
    req: AdminCreateUpdateFunctionBatchTaskRequest,
    options?: T,
  ): Promise<AdminCreateUpdateFunctionBatchTaskResponse> {
    const _req = req;
    const url = this.genBaseURL('/admin/batch_tasks/function');
    const method = 'POST';
    const data = {
      clusters: _req['clusters'],
      runtime: _req['runtime'],
      target_image: _req['target_image'],
      strategy: _req['strategy'],
      rolling_step: _req['rolling_step'],
      format_envs: _req['format_envs'],
      critical: _req['critical'],
      auto_start: _req['auto_start'],
      description: _req['description'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /admin/clusters */
  AdminGetClusters(
    req?: AdminGetClustersRequest,
    options?: T,
  ): Promise<AdminGetClustersResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/admin/clusters');
    const method = 'GET';
    const params = {
      service_id: _req['service_id'],
      function_id: _req['function_id'],
      psm: _req['psm'],
      region: _req['region'],
      runtime: _req['runtime'],
      limit: _req['limit'],
      offset: _req['offset'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /admin/batch_tasks */
  AdminGetBatchTask(
    req?: AdminGetBatchTaskRequest,
    options?: T,
  ): Promise<AdminGetBatchTaskResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/admin/batch_tasks');
    const method = 'GET';
    const params = {
      batch_task_id: _req['batch_task_id'],
      task_type: _req['task_type'],
      offset: _req['offset'],
      limit: _req['limit'],
      status: _req['status'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /admin/base_image_desc */
  AdminGetBaseImageByRuntimeAndId(
    req: AdminGetBaseImageByRuntimeAndIdRequest,
    options?: T,
  ): Promise<AdminGetBaseImageByRuntimeAndIdResponse> {
    const _req = req;
    const url = this.genBaseURL('/admin/base_image_desc');
    const method = 'GET';
    const params = { runtime: _req['runtime'], image_id: _req['image_id'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/tce/cluster_list */
  GetTCEClusterList(
    req: GetTCEClusterListRequest,
    options?: T,
  ): Promise<GetTCEClusterListResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/tce/cluster_list');
    const method = 'GET';
    const params = { tce_psm: _req['tce_psm'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/tce/migrate/mq_app_params */
  GetTCEMigrateMQAppParams(
    req: GetTCEMigrateMQAppParamsRequest,
    options?: T,
  ): Promise<GetTCEMigrateMQAppParamsResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/tce/migrate/mq_app_params');
    const method = 'GET';
    const params = {
      tce_psm: _req['tce_psm'],
      tce_cluster_id: _req['tce_cluster_id'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /v2/images/get_icm_base_image_list
   *
   * @title getICMBaseImageList
   */
  GetICMBaseImageList(
    req?: GetICMBaseImagesListRequest,
    options?: T,
  ): Promise<GetICMBaseImagesListResponse> {
    const url = this.genBaseURL('/v2/images/get_icm_base_image_list');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PUT /admin/settings_etcd */
  AdminUpserEtcdSetting(
    req: AdminUpsertEtcdSettingRequest,
    options?: T,
  ): Promise<AdminUpsertEtcdSettingResponse> {
    const _req = req;
    const url = this.genBaseURL('/admin/settings_etcd');
    const method = 'PUT';
    const data = {
      name: _req['name'],
      value: _req['value'],
      cell: _req['cell'],
      region: _req['region'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /admin/settings_etcd/:setting_name */
  AdminGetEtcdSettings(
    req: AdminGetEtcdSettingsRequest,
    options?: T,
  ): Promise<AdminGetEtcdSettingsResponse> {
    const _req = req;
    const url = this.genBaseURL(`/admin/settings_etcd/${_req['setting_name']}`);
    const method = 'GET';
    const params = { cell: _req['cell'], region: _req['region'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /admin/cells */
  AdminGetAvaliableCells(
    req: AdminGetAvailableCellsRequest,
    options?: T,
  ): Promise<AdminGetAvailableCellsResponse> {
    const _req = req;
    const url = this.genBaseURL('/admin/cells');
    const method = 'GET';
    const params = { region: _req['region'] };
    return this.request({ url, method, params }, options);
  }

  /** GET /admin/settings_etcd */
  AdminGetAllEtcdSettings(
    req: AdminGetAllEtcdSettingsRequest,
    options?: T,
  ): Promise<AdminGetAllEtcdSettingsResponse> {
    const _req = req;
    const url = this.genBaseURL('/admin/settings_etcd');
    const method = 'GET';
    const data = { cell: _req['cell'], region: _req['region'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * PATCH /admin/parent_task/:batch_task_id
   *
   * @title AdminUpdateParentTask
   */
  AdminUpdateParentTask(
    req: AdminUpdateParentTaskRequest,
    options?: T,
  ): Promise<AdminUpdateParentTaskResponse> {
    const _req = req;
    const url = this.genBaseURL(`/admin/parent_task/${_req['batch_task_id']}`);
    const method = 'PATCH';
    const data = { status: _req['status'], concurrency: _req['concurrency'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /admin/parent_task
   *
   * @title AdminGetParentTask
   */
  AdminGetParentTask(
    req?: AdminGetParentTaskRequest,
    options?: T,
  ): Promise<AdminGetParentTaskResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/admin/parent_task');
    const method = 'GET';
    const params = {
      status: _req['status'],
      task_type: _req['task_type'],
      limit: _req['limit'],
      offset: _req['offset'],
    };
    return this.request({ url, method, params }, options);
  }

  /** GET /v2/regions/zones */
  getRegionZones(
    req?: getRegionZonesRequest,
    options?: T,
  ): Promise<GetRegionZonesResponse> {
    const url = this.genBaseURL('/v2/regions/zones');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/mqevents/advanced_config_setting */
  GetMQeventAdvancedConfig(
    req?: GetMQeventAdvancedConfigRequest,
    options?: T,
  ): Promise<GetMQeventAdvancedConfigResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/mqevents/advanced_config_setting');
    const method = 'GET';
    const params = { region: _req['region'] };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /admin/parent_task/:parent_task_id/batch_tasks/:batch_task_id */
  AdminUpdateBatchTask(
    req: AdminUpdateBatchTaskRequset,
    options?: T,
  ): Promise<AdminUpdateBatchTaskResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/admin/parent_task/${_req['parent_task_id']}/batch_tasks/${_req['batch_task_id']}`,
    );
    const method = 'PATCH';
    const data = { status: _req['status'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /admin/parent_task/:parent_task_id */
  AdminGetParentTaskDetail(
    req: AdminGetParentTaskDetailRequest,
    options?: T,
  ): Promise<AdminGetParentTaskDetailResponse> {
    const _req = req;
    const url = this.genBaseURL(`/admin/parent_task/${_req['parent_task_id']}`);
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** POST /spi/services/psm/:psm/env/:env/regions/:region/clusters/:cluster/zones/:zone/trigger_frozen_active */
  TriggerFrozenActive(
    req: TriggerFrozenActiveRequest,
    options?: T,
  ): Promise<TriggerFrozenActiveResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/spi/services/psm/${_req['psm']}/env/${_req['env']}/regions/${_req['region']}/clusters/${_req['cluster']}/zones/${_req['zone']}/trigger_frozen_active`,
    );
    const method = 'POST';
    return this.request({ url, method }, options);
  }

  /** POST /v2/services/:service_id/regions/:region/clusters/:cluster/vefaas_traffic_scheduling */
  updateVefaasTrafficScheduling(
    req: UpdateVefaasTrafficSchedulingRequest,
    options?: T,
  ): Promise<UpdateVefaasTrafficSchedulingResponse> {
    const _req = req;
    const url = this.genBaseURL(
      '/v2/services/:service_id/regions/:region/clusters/:cluster/vefaas_traffic_scheduling',
    );
    const method = 'POST';
    const data = {
      enabled: _req['enabled'],
      psm: _req['psm'],
      cluster: _req['cluster'],
      global_mode: _req['global_mode'],
      global_ratio: _req['global_ratio'],
      trigger_config: _req['trigger_config'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /v2/services/:service_id/regions/:region/clusters/:cluster/vefaas_traffic_scheduling */
  getVefaasTrafficScheduling(
    req?: GetVefaasTrafficSchedulingRequest,
    options?: T,
  ): Promise<GetVefaasTrafficSchedulingResponse> {
    const url = this.genBaseURL(
      '/v2/services/:service_id/regions/:region/clusters/:cluster/vefaas_traffic_scheduling',
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** GET /v2/psm/:psm/cross_region_migration */
  getCrossRegionMigration(
    req: GetCrossRegionMigrationRequest,
    options?: T,
  ): Promise<GetCrossRegionMigrationResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/psm/${_req['psm']}/cross_region_migration`,
    );
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PATCH /v2/services/:service_id/scale_setting */
  updateServiceScaleSettings(
    req: UpdateServiceScaleSettingsRequest,
    options?: T,
  ): Promise<ApiResponse> {
    const _req = req;
    const url = this.genBaseURL(
      `/v2/services/${_req['service_id']}/scale_setting`,
    );
    const method = 'PATCH';
    const data = {
      service_cpu_scale_settings: _req['service_cpu_scale_settings'],
      cluster_cpu_scale_settings: _req['cluster_cpu_scale_settings'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /admin/service_trees */
  GetServiceTrees(
    req?: GetServiceTreesRequest,
    options?: T,
  ): Promise<GetServiceTreesResponse> {
    const url = this.genBaseURL('/admin/service_trees');
    const method = 'GET';
    return this.request({ url, method }, options);
  }

  /** PUT /v2/burst_protector/config */
  PutBurstProtectorSwitch(
    req: PutBurstProtectorSwitchRequest,
    options?: T,
  ): Promise<PutBurstProtectorSwitchResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/burst_protector/config');
    const method = 'PUT';
    const data = { config: _req['config'] };
    const params = {
      psm: _req['psm'],
      cluster: _req['cluster'],
      caller_psm: _req['caller_psm'],
      caller_cluster: _req['caller_cluster'],
      method: _req['method'],
    };
    return this.request({ url, method, data, params }, options);
  }

  /** GET /v2/burst_protector/configs */
  GetBurstProtectorSwitch(
    req?: GetBurstProtectorSwitchRequest,
    options?: T,
  ): Promise<GetBurstProtectorSwitchResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/burst_protector/configs');
    const method = 'GET';
    const params = { psm: _req['psm'], cluster: _req['cluster'] };
    return this.request({ url, method, params }, options);
  }

  /** PATCH /v2/burst_protector/switch */
  SwitchBurstProtector(
    req: SwitchBurstProtectorRequest,
    options?: T,
  ): Promise<SwitchBurstProtectorResponse> {
    const _req = req;
    const url = this.genBaseURL('/v2/burst_protector/switch');
    const method = 'PATCH';
    const params = {
      is_all: _req['is_all'],
      psms: _req['psms'],
      psm: _req['psm'],
      cluster: _req['cluster'],
      stage: _req['stage'],
      debug: _req['debug'],
    };
    return this.request({ url, method, params }, options);
  }

  /** DELETE /v2/burst_protector/config */
  DeleteBurstProtector(
    req?: DeleteBurstProtectorRequest,
    options?: T,
  ): Promise<DeleteBurstProtectorResponse> {
    const _req = req || {};
    const url = this.genBaseURL('/v2/burst_protector/config');
    const method = 'DELETE';
    const params = {
      is_all: _req['is_all'],
      psms: _req['psms'],
      psm: _req['psm'],
      cluster: _req['cluster'],
    };
    return this.request({ url, method, params }, options);
  }
}
/* eslint-enable */
