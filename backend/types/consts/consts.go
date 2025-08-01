/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package consts

import "time"

const (
	MySQLDsn           = "MYSQL_DSN"
	RedisAddr          = "REDIS_ADDR"
	VeImageXAK         = "VE_IMAGEX_AK"
	VeImageXSK         = "VE_IMAGEX_SK"
	VeImageXServerID   = "VE_IMAGEX_SERVER_ID"
	VeImageXDomain     = "VE_IMAGEX_DOMAIN"
	VeImageXTemplate   = "VE_IMAGEX_TEMPLATE"
	VeImageXUploadHost = "VE_IMAGEX_UPLOAD_HOST"

	FileUploadComponentType        = "FILE_UPLOAD_COMPONENT_TYPE"
	FileUploadComponentTypeImagex  = "imagex"
	FileUploadComponentTypeStorage = "storage"
	StorageUploadHTTPScheme        = "STORAGE_UPLOAD_HTTP_SCHEME"

	StorageType        = "STORAGE_TYPE"
	MinIOAK            = "MINIO_AK"
	MinIOSK            = "MINIO_SK"
	MinIOEndpoint      = "MINIO_ENDPOINT"
	MinIOProxyEndpoint = "MINIO_PROXY_ENDPOINT"
	MinIOAPIHost       = "MINIO_API_HOST"
	StorageBucket      = "STORAGE_BUCKET"
	TOSAccessKey       = "TOS_ACCESS_KEY"
	TOSSecretKey       = "TOS_SECRET_KEY"
	TOSRegion          = "TOS_REGION"
	TOSEndpoint        = "TOS_ENDPOINT"
	TOSBucketEndpoint  = "TOS_BUCKET_ENDPOINT"
	S3AccessKey        = "S3_ACCESS_KEY"
	S3SecretKey        = "S3_SECRET_KEY"
	S3Region           = "S3_REGION"
	S3Endpoint         = "S3_ENDPOINT"
	S3BucketEndpoint   = "S3_BUCKET_ENDPOINT"

	HostKeyInCtx          = "HOST_KEY_IN_CTX"
	RequestSchemeKeyInCtx = "REQUEST_SCHEME_IN_CTX"

	MQTypeKey                = "COZE_MQ_TYPE"
	MQServer                 = "MQ_NAME_SERVER"
	RMQSecretKey             = "RMQ_SECRET_KEY"
	RMQAccessKey             = "RMQ_ACCESS_KEY"
	RMQTopicApp              = "opencoze_search_app"
	RMQTopicResource         = "opencoze_search_resource"
	RMQTopicKnowledge        = "opencoze_knowledge"
	RMQConsumeGroupResource  = "cg_search_resource"
	RMQConsumeGroupApp       = "cg_search_app"
	RMQConsumeGroupKnowledge = "cg_knowledge"

	CozeConnectorID   = int64(10000010)
	WebSDKConnectorID = int64(999)
	APIConnectorID    = int64(1024)

	SessionDataKeyInCtx = "session_data_key_in_ctx"
	OpenapiAuthKeyInCtx = "openapi_auth_key_in_ctx"

	CodeRunnerType           = "CODE_RUNNER_TYPE"
	CodeRunnerAllowEnv       = "CODE_RUNNER_ALLOW_ENV"
	CodeRunnerAllowRead      = "CODE_RUNNER_ALLOW_READ"
	CodeRunnerAllowWrite     = "CODE_RUNNER_ALLOW_WRITE"
	CodeRunnerAllowNet       = "CODE_RUNNER_ALLOW_NET"
	CodeRunnerAllowRun       = "CODE_RUNNER_ALLOW_RUN"
	CodeRunnerAllowFFI       = "CODE_RUNNER_ALLOW_FFI"
	CodeRunnerNodeModulesDir = "CODE_RUNNER_NODE_MODULES_DIR"
	CodeRunnerTimeoutSeconds = "CODE_RUNNER_TIMEOUT_SECONDS"
	CodeRunnerMemoryLimitMB  = "CODE_RUNNER_MEMORY_LIMIT_MB"

	UseSSL      = "USE_SSL"
	SSLCertFile = "SSL_CERT_FILE"
	SSLKeyFile  = "SSL_KEY_FILE"
)

const (
	ShortcutCommandResourceType = "uri"
)

const (
	SessionMaxAgeSecond    = 30 * 24 * 60 * 60
	DefaultSessionDuration = SessionMaxAgeSecond * time.Second
)

const (
	DefaultUserIcon     = "default_icon/user_default_icon.png"
	DefaultAgentIcon    = "default_icon/default_agent_icon.png"
	DefaultAppIcon      = "default_icon/default_app_icon.png"
	DefaultPluginIcon   = "default_icon/plugin_default_icon.png"
	DefaultDatabaseIcon = "default_icon/default_database_icon.png"
	DefaultDatasetIcon  = "default_icon/default_dataset_icon.png"
	DefaultPromptIcon   = "default_icon/default_prompt_icon.png"
	DefaultWorkflowIcon = "default_icon/default_workflow_icon.png"
	DefaultTeamIcon     = "default_icon/team_default_icon.png"
)

const (
	TemplateSpaceID = int64(999999) // special space id for template
)

const (
	ApplyUploadActionURI = "/api/common/upload/apply_upload_action"
	UploadURI            = "/api/common/upload"
)

const (
	DisableUserRegistration = "DISABLE_USER_REGISTRATION"
	AllowRegistrationEmail  = "ALLOW_REGISTRATION_EMAIL"
)
