package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Knowledge: 105 000 000 ~ 105 999 999
const (
	ErrKnowledgeInvalidParamCode               = 105000000
	ErrKnowledgePermissionCode                 = 105000001
	ErrKnowledgeNonRetryableCode               = 105000002
	ErrKnowledgeDBCode                         = 105000003
	ErrKnowledgeSearchStoreCode                = 105000004
	ErrKnowledgeSystemCode                     = 105000005
	ErrKnowledgeCrossDomainCode                = 105000006
	ErrKnowledgeEmbeddingCode                  = 105000007
	ErrKnowledgeIDGenCode                      = 105000008
	ErrKnowledgeMQSendFailCode                 = 105000009
	ErrKnowledgeDuplicateCode                  = 105000010
	ErrKnowledgeNotExistCode                   = 105000011
	ErrKnowledgeDocumentNotExistCode           = 105000012
	ErrKnowledgeSemanticColumnValueEmptyCode   = 105000013
	ErrKnowledgeParseJSONCode                  = 105000014
	ErrKnowledgeResegmentNotSupportedCode      = 105000015
	ErrKnowledgeFieldNameDuplicatedCode        = 105000016
	ErrKnowledgeDocOversizeCode                = 105000017
	ErrKnowledgeDocNotReadyCode                = 105000018
	ErrKnowledgeDownloadFailedCode             = 105000019
	ErrKnowledgeTableInfoNotExistCode          = 105000020
	ErrKnowledgePutObjectFailCode              = 105000021
	ErrKnowledgeGetObjectURLFailCode           = 105000022
	ErrKnowledgeGetDocProgressFailCode         = 105000023
	ErrKnowledgeSliceInsertPositionIllegalCode = 105000024
	ErrKnowledgeSliceNotExistCode              = 105000025
	ErrKnowledgeColumnParseFailCode            = 105000026
	ErrKnowledgeAutoAnnotationNotSupportedCode = 105000027
	ErrKnowledgeGetParserFailCode              = 105000028
	ErrKnowledgeGetObjectFailCode              = 105000029
	ErrKnowledgeParserParseFailCode            = 105000030
	ErrKnowledgeBuildRetrieveChainFailCode     = 105000031
	ErrKnowledgeRetrieveExecFailCode           = 105000032
	ErrKnowledgeNL2SqlExecFailCode             = 105000033
)

func init() {
	code.Register(
		ErrKnowledgeNonRetryableCode,
		"non-retryable error",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgePermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDBCode,
		"操作MySQL失败: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSearchStoreCode,
		"操作SearchStore失败: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeSystemCode,
		"系统内部错误: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeCrossDomainCode,
		"跨域错误: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeEmbeddingCode,
		"向量化错误: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeIDGenCode,
		"ID生成失败",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeMQSendFailCode,
		"MQ发送消息失败: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDuplicateCode,
		"知识库命名重复: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeNotExistCode,
		"知识库不存在: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDocumentNotExistCode,
		"文档不存在: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSemanticColumnValueEmptyCode,
		"语义列值为空: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeParseJSONCode,
		"解析JSON失败: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeResegmentNotSupportedCode,
		"正在处理中，不支持重新分片: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeFieldNameDuplicatedCode,
		"字段名重复: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDocOversizeCode,
		"文档过大: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeDocNotReadyCode,
		"文档未就绪: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeDownloadFailedCode,
		"下载失败: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeGetObjectURLFailCode,
		"获取storage链接失败: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeTableInfoNotExistCode,
		"表信息不存在: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeGetDocProgressFailCode,
		"获取文档进度失败: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSliceInsertPositionIllegalCode,
		"分片插入位置不合法",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSliceNotExistCode,
		"分片不存在",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeColumnParseFailCode,
		"列值解析失败: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeAutoAnnotationNotSupportedCode,
		"您没有实现自动标注功能:{msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeGetParserFailCode,
		"获取文档解析器失败:{msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeGetObjectFailCode,
		"获取storage内容失败:{msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeParserParseFailCode,
		"文档解析失败:{msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeBuildRetrieveChainFailCode,
		"知识库召回Chain构建失败:{msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeRetrieveExecFailCode,
		"知识库召回执行失败:{msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeNL2SqlExecFailCode,
		"NL2SQL执行失败:{msg}",
		code.WithAffectStability(false),
	)
}
