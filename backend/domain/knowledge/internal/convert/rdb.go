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

package convert

import (
	"github.com/coze-dev/coze-studio/backend/infra/document"
	rdbEntity "github.com/coze-dev/coze-studio/backend/infra/rdb/entity"
)

func ConvertColumnType(columnType document.TableColumnType) rdbEntity.DataType {
	switch columnType {
	case document.TableColumnTypeBoolean:
		return rdbEntity.TypeBoolean
	case document.TableColumnTypeInteger:
		return rdbEntity.TypeBigInt
	case document.TableColumnTypeNumber:
		return rdbEntity.TypeDouble
	case document.TableColumnTypeString, document.TableColumnTypeImage:
		return rdbEntity.TypeText
	case document.TableColumnTypeTime:
		return rdbEntity.TypeTimestamp
	default:
		return rdbEntity.TypeText
	}
}
