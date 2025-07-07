package impl

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type webDocProcessor struct {
	baseDocProcessor
}

func (w *webDocProcessor) BeforeCreate() error {
	for i := range w.Documents {
		if w.Documents[i] == nil {
			continue
		}
		sourceFileID := w.Documents[i].SourceFileID
		if sourceFileID != 0 {
			task, err := w.webCrawlTaskRepo.GetByID(w.ctx, sourceFileID)
			if err != nil {
				logs.CtxErrorf(w.ctx, "get web content task failed, err: %v", err)
				return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
			}
			if task.Status != int32(entity.WebCrawlTaskStatusSuccess) {
				logs.CtxErrorf(w.ctx, "web content task status not success, status: %v", task.Status)
				return errorx.New(errno.ErrKnowledgeCrawlWebUrlFailCode, errorx.KV("msg", "web content task status not success"))
			}
			w.Documents[i].URI = task.ContentTosURL
		}
	}
	return nil
}
