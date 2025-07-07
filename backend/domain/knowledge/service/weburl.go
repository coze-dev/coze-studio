package service

import (
	"context"
	"fmt"
	"time"

	"github.com/bytedance/sonic"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/events"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) SubmitWebUrlTask(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error) {
	if len(request.URLs) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "urls is empty"))
	}
	tasks := []*model.WebCrawlTask{}
	ids, err := k.genMultiIDs(ctx, len(request.URLs))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("gen multi ids failed, err: %v", err)))
	}
	for i := range request.URLs {
		task := model.WebCrawlTask{}
		task.ID = ids[i]
		task.WebURL = request.URLs[i]
		task.Title = request.URLs[i]
		task.Status = 0
		task.CreatedAt = time.Now().UnixMilli()
		task.UpdatedAt = time.Now().UnixMilli()
		tasks = append(tasks, &task)
	}
	err = k.webCrawlTaskRepo.BatchCreate(ctx, tasks)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("batch create web crawl task failed, err: %v", err)))
	}
	msgs := [][]byte{}
	for i := range ids {
		event := events.NewWebCrawlTaskEvent(&entity.WebCrawlTask{TaskID: ids[i], Source: request.Source})
		byteData, err := sonic.Marshal(event)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal event failed, err: %v", err)))
		}
		msgs = append(msgs, byteData)
	}
	err = k.producer.BatchSend(ctx, msgs)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", fmt.Sprintf("batch send event failed, err: %v", err)))
	}
	return &SubmitWebUrlTaskResponse{TaskIDs: ids}, nil
}

func (k *knowledgeSVC) GetWebUrlInfo(ctx context.Context, request *GetWebUrlInfoRequest) (*GetWebUrlInfoResponse, error) {
	if len(request.TaskIDs) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "task ids is empty"))
	}
	tasks, err := k.webCrawlTaskRepo.BatchGetByID(ctx, request.TaskIDs)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("batch get web crawl task failed, err: %v", err)))
	}
	taskResp := map[int64]*entity.WebCrawlTaskResp{}
	for i := range tasks {
		task := tasks[i]
		r := entity.WebCrawlTaskResp{
			Status: entity.WebCrawlTaskStatus(task.Status),
		}
		switch task.Status {
		case int32(entity.WebCrawlTaskStatusSuccess):
			r.ContentUri = task.ContentTosURL
			r.SubPageCount = int(task.SubPageCount)
			byteData, err := k.storage.GetObject(ctx, task.SublinkTosURI)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeGetObjectFailCode, errorx.KV("msg", fmt.Sprintf("get object failed, err: %v", err)))
			}
			subLinks := []string{}
			err = sonic.Unmarshal(byteData, &subLinks)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("unmarshal sublinks failed, err: %v", err)))
			}
			r.SubLinkUrls = subLinks
			r.Progress = 100
		case int32(entity.WebCrawlTaskStatusInit):
			r.Progress = 10
		case int32(entity.WebCrawlTaskStatusAborted):
			r.Progress = 100
		case int32(entity.WebCrawlTaskStatusFailed):
			r.Progress = 100
			r.FailReason = task.FailReason
		}
		if len(task.Title) == 0 {
			r.Title = task.WebURL
		} else {
			r.Title = task.Title
		}
		taskResp[task.ID] = &r
	}
	return &GetWebUrlInfoResponse{Tasks: taskResp}, nil
}

func (k *knowledgeSVC) AbortWebUrlTask(ctx context.Context, request *AbortWebUrlTaskRequest) error {
	if request.TaskID == 0 {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "task id is empty"))
	}

	err := k.webCrawlTaskRepo.Update(ctx, request.TaskID, map[string]any{
		"status": int32(entity.WebCrawlTaskStatusAborted),
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("update web crawl task failed, err: %v", err)))
	}
	return nil
}
