package impl

import (
	"path"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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
			w.Documents[i].FileExtension = parser.FileExtension(getExtension(task.ContentTosURL))
		}
	}
	return nil
}

func (w *webDocProcessor) BuildDBModel() error {
	err := w.baseDocProcessor.BuildDBModel()
	if err != nil {
		return err
	}
	for i := range w.Documents {
		if w.Documents[i].UpdateRule == nil {
			continue
		}
		updateConfigModel := &model.KnowledgeDocumentUpdateConfig{
			DocumentID:     w.Documents[i].ID,
			UpdateInterval: w.Documents[i].UpdateRule.UpdateInterval * 24,
			NextUpdateTime: time.Now().Add(time.Hour * 24 * time.Duration(w.Documents[i].UpdateRule.UpdateInterval)).UnixMilli(),
			CreateAt:       time.Now().UnixMilli(),
			UpdateAt:       time.Now().UnixMilli(),
		}
		w.updateConfigModels = append(w.updateConfigModels, updateConfigModel)
	}
	return nil
}

func getExtension(uri string) string {
	if uri == "" {
		return ""
	}
	fileExtension := path.Base(uri)
	ext := path.Ext(fileExtension)
	if ext != "" {
		return strings.TrimPrefix(ext, ".")
	}
	return ""
}
