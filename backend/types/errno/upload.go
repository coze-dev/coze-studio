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

// Upload: 104 000 000 ~ 104 999 999
const (
	ErrUploadInvalidParamCode                = 104000000
	ErrUploadPermissionCode                  = 104000001
	ErrUploadInvalidType                     = 104000002
	ErrUploadInvalidContentTypeCode          = 104000003
	ErrUploadInvalidFileSizeCode             = 104000004
	ErrUploadMultipartFormDataReadFailedCode = 104000005
	ErrUploadEmptyFileCode                   = 104000006
	ErrUploadFileUploadGreaterOneCode        = 104000007
	ErrUploadSystemErrorCode                 = 104000008

	ErrUploadHostNotExistCode       = 104000009
	ErrUploadHostSchemaNotExistCode = 104000010
)

func init() {
	code.Register(
		ErrUploadInvalidType,
		"invalid Upload type : {type}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadInvalidContentTypeCode,
		"invalid content-type : {content-type}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadInvalidFileSizeCode,
		"文件size过大",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadMultipartFormDataReadFailedCode,
		"multipart form data read failed",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadEmptyFileCode,
		"upload file（open）can't find file",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadFileUploadGreaterOneCode,
		"upload file（open）exceed one file",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrUploadSystemErrorCode,
		"system error : {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrUploadHostNotExistCode,
		"upload host not exist",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrUploadHostSchemaNotExistCode,
		"upload host schema not exist",
		code.WithAffectStability(false),
	)

}
