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

package errno

import "github.com/coze-dev/coze-studio/backend/pkg/errorx/code"

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
	ErrKnowledgeCopyFailCode                   = 105000034
	ErrKnowledgeParseResultEmptyCode           = 105000035
	ErrKnowledgeCacheClientSetFailCode         = 105000036
	ErrKnowledgeCheckTableSliceValidCode       = 105000037
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
		"MySQL operation failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSearchStoreCode,
		"SearchStore operation failed: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeSystemCode,
		"system internal error: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeCrossDomainCode,
		"cross-domain error: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeEmbeddingCode,
		"embedding error: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeIDGenCode,
		"ID generation failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeMQSendFailCode,
		"MQ send message failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDuplicateCode,
		"knowledge name duplicate: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeNotExistCode,
		"knowledge not exist: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDocumentNotExistCode,
		"document not exist: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSemanticColumnValueEmptyCode,
		"semantic column value empty: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeParseJSONCode,
		"parse json failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeResegmentNotSupportedCode,
		"Processing, resegment is not supported: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeFieldNameDuplicatedCode,
		"field name duplicated: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeDocOversizeCode,
		"document oversize: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeDocNotReadyCode,
		"document not ready: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeDownloadFailedCode,
		"download failed: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeGetObjectURLFailCode,
		"get object url failed: {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrKnowledgeTableInfoNotExistCode,
		"table info not exist: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeGetDocProgressFailCode,
		"get document progress failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSliceInsertPositionIllegalCode,
		"slice insert position illegal: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeSliceNotExistCode,
		"slice not exist: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeColumnParseFailCode,
		"column parse failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeAutoAnnotationNotSupportedCode,
		"auto annotation not supported: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeGetParserFailCode,
		"get parser failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeGetObjectFailCode,
		"get object failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeParserParseFailCode,
		"parser parse failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeBuildRetrieveChainFailCode,
		"build retrieve chain failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeRetrieveExecFailCode,
		"retrieve exec failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeNL2SqlExecFailCode,
		"nl2sql exec failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeCopyFailCode,
		"copy failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeParseResultEmptyCode,
		"parse result empty: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeCacheClientSetFailCode,
		"cache client set failed: {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrKnowledgeCheckTableSliceValidCode,
		"slice content validation failed, please check if the input is correct:{msg}",
		code.WithAffectStability(false),
	)
}
