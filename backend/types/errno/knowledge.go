package errno

import "code.byted.org/flow/opencoze/backend/pkg/errorx/code"

// Knowledge: 105 000 000 ~ 105 999 999
const (
	ErrKnowledgeInvalidParamCode             = 105000000
	ErrKnowledgePermissionCode               = 105000001
	ErrKnowledgeNonRetryableCode             = 105000002
	ErrKnowledgeDBCode                       = 105000003
	ErrKnowledgeSearchStoreCode              = 105000004
	ErrKnowledgeSystemCode                   = 105000005
	ErrKnowledgeCrossDomainCode              = 105000006
	ErrKnowledgeEmbeddingCode                = 105000007
	ErrKnowledgeIDGenCode                    = 105000008
	ErrKnowledgeMQCode                       = 105000009
	ErrKnowledgeDuplicateCode                = 105000010
	ErrKnowledgeNotExistCode                 = 105000011
	ErrKnowledgeDocumentNotExistCode         = 105000012
	ErrKnowledgeSemanticColumnValueEmptyCode = 105000013
	ErrKnowledgeParseJSONCode                = 105000014
	ErrKnowledgeResegmentNotSupportedCode    = 105000015
	ErrKnowledgeFieldNameDuplicatedCode      = 105000016
	ErrKnowledgeDocOversizeCode              = 105000017
	
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
}
