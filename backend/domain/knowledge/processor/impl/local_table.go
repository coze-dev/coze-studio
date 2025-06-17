package impl

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type localTableProcessor struct {
	baseDocProcessor
}

func (l *localTableProcessor) BeforeCreate() error {
	if isTableAppend(l.Documents) {
		tableDoc, _, err := l.documentRepo.FindDocumentByCondition(l.ctx, &entity.WhereDocumentOpt{
			KnowledgeIDs: []int64{l.Documents[0].KnowledgeID},
			SelectAll:    true,
		})
		if err != nil {
			logs.CtxErrorf(l.ctx, "find document failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}

		if len(tableDoc) == 0 {
			logs.CtxErrorf(l.ctx, "table doc not found")
			return errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "doc not found"))
		}

		l.Documents[0].ID = tableDoc[0].ID

		if tableDoc[0].TableInfo == nil {
			logs.CtxErrorf(l.ctx, "table info not found")
			return errorx.New(errno.ErrKnowledgeTableInfoNotExistCode, errorx.KVf("msg", "table info not found, doc_id: %d", tableDoc[0].ID))
		}
		l.Documents[0].TableInfo = ptr.From(tableDoc[0].TableInfo)
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
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		return nil
	}
	return l.baseDocProcessor.InsertDBModel()
}
