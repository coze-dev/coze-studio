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

	MinIOAK        = "MINIO_AK"
	MinIOSK        = "MINIO_SK"
	MinIOEndpoint  = "MINIO_ENDPOINT"
	MinIOBucket    = "MINIO_BUCKET"
	RocketMQServer = "RMQ_NAME_SERVER"

	CozeConnectorID       = int64(10000010)
	WebSDKConnectorID     = int64(999)
	AgentAsAPIConnectorID = int64(1024)

	SessionDataKeyInCtx = "session_data_key_in_ctx"
)

const (
	SessionMaxAgeSecond    = 30 * 24 * 60 * 60
	DefaultSessionDuration = SessionMaxAgeSecond * time.Second
)
