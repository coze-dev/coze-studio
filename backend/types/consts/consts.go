package consts

const (
	MySQLDsn         = "MYSQL_DSN"
	RedisAddr        = "REDIS_ADDR"
	VeImageXAK       = "VE_IMAGEX_AK"
	VeImageXSK       = "VE_IMAGEX_SK"
	VeImageXServerID = "VE_IMAGEX_SERVER_ID"
	VeImageXDomain   = "VE_IMAGEX_DOMAIN"
	VeImageXTemplate = "VE_IMAGEX_TEMPLATE"

	MinIO_AK      = "MINIO_AK"
	MinIO_SK      = "MINIO_SK"
	MinIOEndpoint = "MINIO_ENDPOINT"
	MinIOBucket   = "MINIO_BUCKET"

	CozeConnectorID       = int64(10000010)
	WebSDKConnectorID     = int64(999)
	AgentAsAPIConnectorID = int64(1024)

	SessionDataKeyInCtx = "session_data_key_in_ctx"
)

var PublishConnectorIDWhiteList = map[int64]bool{
	WebSDKConnectorID:     true,
	AgentAsAPIConnectorID: true,
}
