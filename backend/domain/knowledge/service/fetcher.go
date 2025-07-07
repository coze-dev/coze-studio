package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/crawl"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
	"code.byted.org/flow/opencoze/backend/types/errno"
	"github.com/google/uuid"
)

func (k *knowledgeSVC) newFetchFunc(source *entity.DocumentSource) func(ctx context.Context, req *fecthRequest) (resp *fetchResponse, err error) {
	switch *source {
	case entity.DocumentSourceWeb:
		return k.fetchFromWebUrl
	}
	return func(ctx context.Context, req *fecthRequest) (resp *fetchResponse, err error) {
		return nil, errors.New("unsupported document source")
	}
}

func (k *knowledgeSVC) newFetchRequest(ctx context.Context, source *entity.DocumentSource, sourceFileID int64) (*fecthRequest, error) {
	if source == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "document source is nil"))
	}
	if sourceFileID <= 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "source file id is invalid"))
	}
	switch ptr.From(source) {
	case entity.DocumentSourceWeb:
		crawlTask, err := k.webCrawlTaskRepo.GetByID(ctx, sourceFileID)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("get crawl task failed, err: %v", err)))
		}
		return &fecthRequest{
			URL: crawlTask.WebURL,
		}, nil
	default:
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "unsupported document source"))
	}
}

type fecthRequest struct {
	URL string `json:"url"`
}

type fetchResponse struct {
	ContentUri  string   `json:"content_uri"`
	SubLinkUrls []string `json:"sub_link_urls"`
}

func (k *knowledgeSVC) fetchFromWebUrl(ctx context.Context, req *fecthRequest) (resp *fetchResponse, err error) {
	crawlResult, err := k.crawler.Crawl(ctx, req.URL, crawl.CrawlOptions{NeedSubURLs: true})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCrawlWebUrlFailCode, errorx.KV("msg", fmt.Sprintf("crawl failed, err: %v", err)))
	}
	uri := uuid.NewString() + ".md"
	err = k.storage.PutObject(ctx, uri, []byte(crawlResult.Content))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", fmt.Sprintf("put object failed, err: %v", err)))
	}

	return &fetchResponse{
		ContentUri:  uri,
		SubLinkUrls: crawlResult.SubURLs,
	}, nil
}

func (k *knowledgeSVC) saveWebCrawlTaskResult(ctx context.Context, fetchResp *fetchResponse, originSourceFileID int64) (newSourceFileID int64, err error) {
	if fetchResp == nil {
		return 0, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "fetch response is nil"))
	}
	taskID, err := k.idgen.GenID(ctx)
	if err != nil {
		return 0, errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("gen id failed, err: %v", err)))
	}
	originTask, err := k.webCrawlTaskRepo.GetByID(ctx, originSourceFileID)
	if err != nil {
		return 0, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("get crawl task failed, err: %v", err)))
	}
	tosUri := uuid.NewString() + ".json"
	byteData, err := sonic.Marshal(fetchResp.SubLinkUrls)
	if err != nil {
		return 0, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal failed, err: %v", err)))
	}
	err = k.storage.PutObject(ctx, tosUri, byteData)
	if err != nil {
		return 0, errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", fmt.Sprintf("put object failed, err: %v", err)))
	}
	newTask := model.WebCrawlTask{
		ID:            taskID,
		Title:         originTask.Title,
		SubPageCount:  int32(len(fetchResp.SubLinkUrls)),
		ContentTosURL: fetchResp.ContentUri,
		SublinkTosURI: tosUri,
		Status:        int32(entity.WebCrawlTaskStatusSuccess),
		CreatedAt:     time.Now().UnixMilli(),
		UpdatedAt:     time.Now().UnixMilli(),
	}
	err = k.webCrawlTaskRepo.Create(ctx, &newTask)
	if err != nil {
		return 0, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("save crawl task failed, err: %v", err)))
	}
	return taskID, nil
}
