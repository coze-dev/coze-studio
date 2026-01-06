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

package impl

import (
	"fmt"
	"time"

	knowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser"
)

func getFormatType(tp knowledge.DocumentType) parser.FileExtension {
	docType := parser.FileExtensionTXT
	if tp == knowledge.DocumentTypeTable {
		docType = parser.FileExtensionJSON
	}
	return docType
}

func getTosUri(userID int64, fileType string) string {
	fileName := fmt.Sprintf("FileBizType.Knowledge/%d_%d.%s", userID, time.Now().UnixNano(), fileType)
	return fileName
}

func isTableAppend(docs []*entity.Document) bool {
	return len(docs) > 0 &&
		docs[0].Type == knowledge.DocumentTypeTable &&
		docs[0].IsAppend
}
