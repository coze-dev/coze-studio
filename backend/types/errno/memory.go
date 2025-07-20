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

// Memory: 106 000 000 ~ 106 999 999
const (
	ErrMemoryInvalidParamCode            = 106000000
	ErrMemoryPermissionCode              = 106000001
	ErrMemoryIDGenFailCode               = 106000002
	ErrMemorySchemeInvalidCode           = 106000003
	ErrMemoryGetAppVariableCode          = 106000004
	ErrMemoryCreateAppVariableCode       = 106000005
	ErrMemoryUpdateAppVariableCode       = 106000006
	ErrMemoryGetVariableMetaCode         = 106000007
	ErrMemoryVariableMetaNotFoundCode    = 106000008
	ErrMemoryNoVariableCanBeChangedCode  = 106000009
	ErrMemoryDeleteVariableInstanceCode  = 106000010
	ErrMemoryGetSysUUIDInstanceCode      = 106000011
	ErrMemoryGetVariableInstanceCode     = 106000012
	ErrMemorySetKvMemoryItemInstanceCode = 106000013
	ErrMemoryUpdateVariableInstanceCode  = 106000014
	ErrMemoryInsertVariableInstanceCode  = 106000015
	ErrMemoryDatabaseFieldNotFoundCode   = 106000016
	ErrMemoryDatabaseNotFoundCode        = 106000017
	ErrMemoryDatabaseCannotAddData       = 106000018
	ErrMemoryDatabaseColumnNotMatch      = 106000019
	ErrMemoryDatabaseXlsSheetEmpty       = 106000020
	ErrMemoryDatabaseSheetSizeExceed     = 106000021
	ErrMemoryDatabaseUnsupportedFileType = 106000022
	ErrMemoryDatabaseSheetRowCountExceed = 106000023
	ErrMemoryDatabaseSheetIndexExceed    = 106000024
	ErrMemoryDatabaseNoSheetFound        = 106000025
	ErrMemoryDatabaseNameInvalid         = 106000026
)

func init() {
	code.Register(
		ErrMemorySchemeInvalidCode,
		"schema is invalid : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryGetAppVariableCode,
		"get project variable failed ",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryCreateAppVariableCode,
		"get project variable failed ",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryUpdateAppVariableCode,
		"update project variable failed ",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrMemoryGetVariableMetaCode,
		"get variable meta failed ",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryVariableMetaNotFoundCode,
		"variable meta not found ",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryNoVariableCanBeChangedCode,
		"no variable can be changed ",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDeleteVariableInstanceCode,
		"delete variable instance failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryGetSysUUIDInstanceCode,
		"get sys uuid instance failed {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryGetVariableInstanceCode,
		"get sys uuid instance failed {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemorySetKvMemoryItemInstanceCode,
		"no key can be changed",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryUpdateVariableInstanceCode,
		"update variable instance failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryInsertVariableInstanceCode,
		"insert variable instance failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryIDGenFailCode,
		"gen id failed : {msg}",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrMemoryPermissionCode,
		"unauthorized access : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseFieldNotFoundCode,
		"database field not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseNotFoundCode,
		"database not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseCannotAddData,
		"database cannot add data",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseColumnNotMatch,
		"database column not match : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseXlsSheetEmpty,
		"database xls sheet empty",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseSheetSizeExceed,
		"database sheet size exceed",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseUnsupportedFileType,
		"database unsupported file type",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseSheetRowCountExceed,
		"database sheet row count exceed : {msg}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseSheetIndexExceed,
		"database sheet index exceed",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseNoSheetFound,
		"database no sheet found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMemoryDatabaseNameInvalid,
		"database name invalid",
		code.WithAffectStability(false),
	)
}
