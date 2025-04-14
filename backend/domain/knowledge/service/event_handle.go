package service

import (
	"context"
	"fmt"
	"net/http"

	"github.com/bytedance/sonic"
	"github.com/volcengine/volc-sdk-golang/service/imagex/v2"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) HandleMessage(ctx context.Context, msg *eventbus.Message) (err error) {
	defer func() {
		if err != nil {
			logs.Errorf("[HandleMessage] failed, %v", err)
		}
	}()

	event := &entity.Event{}
	if err = sonic.Unmarshal(msg.Body, event); err != nil {
		return err
	}

	switch event.Type {
	case entity.EventTypeIndexDocument:

	}

	return nil
}

func (k *knowledgeSVC) indexDocument(ctx context.Context, event *entity.Event) error {
	doc := event.Document

	resource, err := k.imageX.GetResourceURL(ctx, &imagex.GetResourceURLQuery{
		Domain:    k.imageX.Domain,
		ServiceID: k.imageX.ServiceID,
		URI:       doc.URI,
	})
	if err != nil {
		return err
	}

	resp, err := http.Get(resource.Result.URL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("get url failed, status code=%d", resp.StatusCode)
	}

	parseResult, err := k.parser.Parse(ctx, resp.Body, event.Document.ParsingStrategy, event.Document.ChunkingStrategy)
	if err != nil {
		return err
	}

	_ = parseResult
	panic("impl me")
}
