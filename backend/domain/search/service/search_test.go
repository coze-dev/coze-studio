package service

import (
	"testing"
)

func TestIndex(t *testing.T) {
	// ctx := context.Background()
	//
	// esClient, err := elasticsearch.NewTypedClient(elasticsearch.Config{
	// 	Addresses: []string{"http://127.0.0.1:9200"},
	// })
	// assert.NoError(t, err)
	//
	// _, searchConsumer, err := NewSearchService(ctx, &SearchConfig{
	// 	ESClient: esClient,
	// })
	// assert.NoError(t, err)
	//
	// ev := &entity.DomainEvent{
	// 	DomainName: entity.SingleAgent,
	// 	OpType:     entity.Created,
	// 	Agent: &entity.Agent{
	// 		ID:          2,
	// 		Name:        "Big Agent",
	// 		Desc:        "i can do anything for you",
	// 		SpaceID:     3,
	// 		OwnerID:     3,
	// 		HasPublished: false,
	// 		CreatedAt:   time.Now().UnixMilli(),
	// 		UpdatedAt:   time.Now().UnixMilli(),
	// 		PublishedAt: 0,
	// 	},
	// 	Meta: &entity.EventMeta{
	// 		SendTimeMs: time.Now().UnixMilli(),
	// 	},
	// }
	//
	// data, err := sonic.Marshal(ev)
	// assert.NoError(t, err)
	// err = searchConsumer.HandleMessage(ctx, &eventbus.Message{
	// 	Topic: "test",
	// 	Group: "test",
	// 	Body:  data,
	// })
	// assert.NoError(t, err)
}

func TestSearch(t *testing.T) {
	// ctx := context.Background()
	//
	// esClient, err := elasticsearch.NewTypedClient(elasticsearch.Config{
	// 	Addresses: []string{"http://127.0.0.1:9200"},
	// })
	// assert.NoError(t, err)
	//
	// searchSvr, _, err := NewSearchService(ctx, &SearchConfig{
	// 	ESClient: esClient,
	// })
	// assert.NoError(t, err)
	//
	// resp, err := searchSvr.SearchApps(ctx, &entity.SearchRequest{
	// 	SpaceID: 3,
	// 	Name:    "Big Agent",
	// 	Limit:   1,
	// 	Cursor:  "1745395610728",
	// })
	// assert.NoError(t, err)
	//
	// t.Logf("cursor: %s, hasMore: %v", resp.NextCursor, resp.HasMore)
	// for idx, doc := range resp.Data {
	// 	t.Logf("idx: %d, doc: %+v", idx, doc)
	// }
}
