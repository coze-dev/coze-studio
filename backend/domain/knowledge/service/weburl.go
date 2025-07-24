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

type TaskFunc func(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error)

var webTaskProcessFunMap = map[entity.DocumentSource]func(*knowledgeSVC) TaskFunc{
	entity.DocumentSourceWeb: func(k *knowledgeSVC) TaskFunc {
		return func(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error) {
			return k.submitUrlTasks(ctx, request)
		}
	},
	entity.DocumentSourceFeishuWeb: func(k *knowledgeSVC) TaskFunc {
		return func(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error) {
			return k.submitFeishuTasks(ctx, request)
		}
	},
}

func (k *knowledgeSVC) submitUrlTasks(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error) {
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

const (
	cacheKeyAggregateFileTasks = "aggregate_file_tasks:%d"
)

func (k *knowledgeSVC) submitFeishuTasks(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error) {
	if request.LarkFileRequest == nil || len(request.LarkFileRequest.Nodes) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "lark file request is empty"))
	}
	tasks := []*model.WebCrawlTask{}
	ids, err := k.genMultiIDs(ctx, len(request.URLs))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("gen multi ids failed, err: %v", err)))
	}
	for i := range request.LarkFileRequest.Nodes {
		task := model.WebCrawlTask{}
		node := request.LarkFileRequest.Nodes[i]
		if node == nil {
			continue
		}
		task.ID = ids[i]
		task.AuthID = request.LarkFileRequest.AuthID
		task.Title = node.FileName
		task.WebURL = node.FileURL
		task.FileID = node.FileID
		task.Status = 0
		task.LarkExtra = &entity.LarkExtra{
			FileType:     node.FileType,
			FileNodeType: node.FileNodeType,
		}
		task.CreatedAt = time.Now().UnixMilli()
		task.UpdatedAt = time.Now().UnixMilli()
		tasks = append(tasks, &task)
	}
	resp := &SubmitWebUrlTaskResponse{}
	resp.AggregateID, err = k.idgen.GenID(ctx)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("gen aggregate id failed, err: %v", err)))
	}
	idsStr, err := sonic.MarshalString(ids)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal ids failed, err: %v", err)))
	}
	err = k.cacheCli.Set(ctx, fmt.Sprintf(cacheKeyAggregateFileTasks, resp.AggregateID), idsStr, time.Hour).Err()
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCacheFileCode, errorx.KV("msg", fmt.Sprintf("set cache failed, err: %v", err)))
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
	return resp, nil
}

func (k *knowledgeSVC) SubmitWebUrlTask(ctx context.Context, request *SubmitWebUrlTaskRequest) (*SubmitWebUrlTaskResponse, error) {
	taskFunc, ok := webTaskProcessFunMap[request.Source]
	if !ok {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", fmt.Sprintf("invalid source %v", request.Source)))
	}
	return taskFunc(k)(ctx, request)
}

func (k *knowledgeSVC) GetWebUrlInfo(ctx context.Context, request *GetWebUrlInfoRequest) (*GetWebUrlInfoResponse, error) {
	if len(request.TaskIDs) == 0 && request.AggregateID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "task ids or aggregate ids is empty"))
	}
	if request.AggregateID != 0 {
		taskIDs, err := k.getTaskIDsByAggregateID(ctx, request.AggregateID)
		if err != nil {
			return nil, err
		}
		request.TaskIDs = taskIDs
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
			if len(task.SublinkTosURI) != 0 {
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
				r.FileID = task.FileID
				r.FileSize = task.FileSize
				r.AuthID = task.AuthID
				r.LarkExtra = task.LarkExtra
			}
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

func (k *knowledgeSVC) getTaskIDsByAggregateID(ctx context.Context, aggregateID int64) (taskIDs []int64, err error) {
	taskIDs = []int64{}
	idsStr, err := k.cacheCli.Get(ctx, fmt.Sprintf(cacheKeyAggregateFileTasks, aggregateID)).Result()
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCacheFileCode, errorx.KV("msg", fmt.Sprintf("get cache failed, err: %v", err)))
	}
	var ids []int64
	err = sonic.UnmarshalString(idsStr, &ids)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("unmarshal ids failed, err: %v", err)))
	}
	taskIDs = append(taskIDs, ids...)
	return taskIDs, nil
}

func (k *knowledgeSVC) AbortWebUrlTask(ctx context.Context, request *AbortWebUrlTaskRequest) error {
	if len(request.TaskIDs) == 0 {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "task id is empty"))
	}

	err := k.webCrawlTaskRepo.BatchUpdate(ctx, request.TaskIDs, map[string]any{
		"status": int32(entity.WebCrawlTaskStatusAborted),
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("update web crawl task failed, err: %v", err)))
	}
	return nil
}
