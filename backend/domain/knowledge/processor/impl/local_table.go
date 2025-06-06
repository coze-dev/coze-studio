package impl

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type localTableProcessor struct {
	baseDocProcessor
}

func (l *localTableProcessor) BeforeCreate() error {
	if isTableAppend(l.Documents) {
		tableDoc, _, err := l.documentRepo.FindDocumentByCondition(l.ctx, &entity.WhereDocumentOpt{
			KnowledgeIDs: []int64{l.Documents[0].KnowledgeID},
			Limit:        1,
		})
		if err != nil {
			logs.CtxErrorf(l.ctx, "find document failed, err: %v", err)
			return err
		}
		l.Documents[0].ID = tableDoc[0].ID

		if len(tableDoc) == 0 {
			logs.CtxErrorf(l.ctx, "table doc not found")
			return fmt.Errorf("table doc not found")
		}

		if tableDoc[0].TableInfo == nil {
			logs.CtxErrorf(l.ctx, "table info not found")
			return fmt.Errorf("table info not found")
		}
		l.Documents[0].TableInfo = *tableDoc[0].TableInfo
		return nil
	}
	return l.baseDocProcessor.BeforeCreate()
}

func (l *localTableProcessor) BuildDBModel() error {
	if isTableAppend(l.Documents) {
		return nil
	}
	return l.baseDocProcessor.BuildDBModel()
}

func (l *localTableProcessor) InsertDBModel() error {
	if isTableAppend(l.Documents) {
		// 追加场景，设置文档为处理中状态
		err := l.documentRepo.SetStatus(l.ctx, l.Documents[0].ID, int32(entity.DocumentStatusUploading), "")
		if err != nil {
			logs.CtxErrorf(l.ctx, "document set status err:%v", err)
			return err
		}
		return nil
	}
	return l.baseDocProcessor.InsertDBModel()
}
