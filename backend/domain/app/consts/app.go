package consts

type PublishStatus int

const (
	PublishStatusOfPacking             PublishStatus = 0
	PublishStatusOfPackFailed          PublishStatus = 1
	PublishStatusOfAuditing            PublishStatus = 2
	PublishStatusOfAuditNotPass        PublishStatus = 3
	PublishStatusOfConnectorPublishing PublishStatus = 4
	PublishStatusOfPublishDone         PublishStatus = 5
)

type ConnectorPublishStatus int

const (
	ConnectorPublishStatusOfDefault  ConnectorPublishStatus = 0
	ConnectorPublishStatusOfAuditing ConnectorPublishStatus = 1
	ConnectorPublishStatusOfSuccess  ConnectorPublishStatus = 2
	ConnectorPublishStatusOfFailed   ConnectorPublishStatus = 3
	ConnectorPublishStatusOfDisable  ConnectorPublishStatus = 4
)
