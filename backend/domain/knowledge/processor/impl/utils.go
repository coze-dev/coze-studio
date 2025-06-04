package impl

import (
	"fmt"
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
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
