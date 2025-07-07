package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/bytedance/sonic"
	"github.com/google/uuid"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/crawl"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) newFetchFunc(source *entity.DocumentSource) func(ctx context.Context, req *fecthRequest) (resp *fetchResponse, err error) {
	switch ptr.From(source) {
	case entity.DocumentSourceWeb:
		return k.fetchFromWebUrl
	case entity.DocumentSourceTableDataUrl:
		return k.fetchTableDataFromWebUrl
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
	case entity.DocumentSourceWeb, entity.DocumentSourceTableDataUrl:
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
	Title       string   `json:"title"`
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
		SubLinkUrls: append(crawlResult.InternalLinks, crawlResult.ExternalLinks...),
	}, nil
}

func (k *knowledgeSVC) fetchTableDataFromWebUrl(ctx context.Context, req *fecthRequest) (resp *fetchResponse, err error) {
	logs.CtxInfof(ctx, "fetch table data from web url, req: %s", req.URL)
	u, err := url.Parse(req.URL)
	isUrl := (err == nil && u.Scheme != "" && u.Host != "")
	if !isUrl {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid url"))
	}
	request, err := http.NewRequest(http.MethodGet, req.URL, nil)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCrawlWebUrlFailCode, errorx.KV("msg", fmt.Sprintf("new request failed, err: %v", err)))
	}
	request.Header.Set("User-Agent", "")
	httpResp, err := http.DefaultClient.Do(request.WithContext(ctx))
	if err != nil {
		logs.CtxErrorf(ctx, "Http request failed, err:%v", err)
		return nil, errorx.New(errno.ErrKnowledgeCrawlWebUrlFailCode, errorx.KV("msg", fmt.Sprintf("do request failed, err: %v", err)))
	}
	defer httpResp.Body.Close()
	body, err := io.ReadAll(httpResp.Body)
	if err != nil {
		logs.CtxErrorf(ctx, "Read resp body failed, err:%v", err)
		return nil, errorx.New(errno.ErrKnowledgeCrawlWebUrlFailCode, errorx.KV("msg", fmt.Sprintf("read body failed, err: %v", err)))
	}
	if httpResp.StatusCode != http.StatusOK {
		logs.CtxErrorf(ctx, "[GetContent] StatusCode is not 200: %v", string(body))
		return nil, errorx.New(errno.ErrKnowledgeCrawlWebUrlFailCode, errorx.KV("msg", fmt.Sprintf("status code is not 200, body: %v", string(body))))
	}
	uri := uuid.NewString() + ".txt"
	err = k.storage.PutObject(ctx, uri, body)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", fmt.Sprintf("put object failed, err: %v", err)))
	}
	return &fetchResponse{ContentUri: uri}, nil
}

func (k *knowledgeSVC) saveSubLinks2Storage(ctx context.Context, subLinkUrls []string) (uri string, err error) {
	tosUri := uuid.NewString() + ".json"
	byteData, err := sonic.Marshal(subLinkUrls)
	if err != nil {
		return "", errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal failed, err: %v", err)))
	}
	err = k.storage.PutObject(ctx, tosUri, byteData)
	if err != nil {
		return "", errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", fmt.Sprintf("put object failed, err: %v", err)))
	}
	return tosUri, nil
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
	tosUri, err := k.saveSubLinks2Storage(ctx, fetchResp.SubLinkUrls)
	if err != nil {
		return 0, err
	}
	newTask := model.WebCrawlTask{
		ID:            taskID,
		WebURL:        originTask.WebURL,
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
