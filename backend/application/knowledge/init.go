package knowledge

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	rewrite "code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite/llm_based"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	knowledgees "code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore/text/elasticsearch"
	knolwedgemilvus "code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore/vector/milvus"
	knowledgeImpl "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	hembed "code.byted.org/flow/opencoze/backend/infra/impl/embedding/http"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

var (
	knowledgeDomainSVC knowledge.Knowledge
)

func InitService(
	db *gorm.DB,
	idGenSVC idgen.IDGenerator,
	storage storage.Storage,
	rdb rdb.RDB,
	imageX imagex.ImageX,
	es *es8.Client) (
	knowledge.Knowledge, error) {

	var (
		milvusAddr        = os.Getenv("MILVUS_ADDR")         // default: localhost:9010
		httpEmbeddingAddr = os.Getenv("HTTP_EMBEDDING_ADDR") // default: http://127.0.0.1:6543
	)

	ctx := context.Background()

	// TODO: 加上 search svc
	// TODO: nameserver 替换成 config
	knowledgeProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_knowledge", 2)
	if err != nil {
		return nil, fmt.Errorf("init knowledge producer failed, err=%w", err)
	}

	var ss []searchstore.SearchStore
	// es full text search
	ss = append(ss, knowledgees.NewSearchStore(&knowledgees.Config{
		Client:       es,
		CompactTable: nil,
	}))

	// milvus vector search
	if false {
		cctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()
		mc, err := milvusclient.New(cctx, &milvusclient.ClientConfig{Address: milvusAddr})
		if err != nil {
			return nil, fmt.Errorf("init milvus client failed, err=%w", err)
		}

		emb, err := hembed.NewEmbedding(httpEmbeddingAddr)
		if err != nil {
			return nil, fmt.Errorf("init http embedding client failed, err=%w", err)
		}

		mvs, err := knolwedgemilvus.NewSearchStore(&knolwedgemilvus.Config{
			Client:       mc,
			Embedding:    emb,
			EnableHybrid: ptr.Of(true),
		})
		if err != nil {
			return nil, fmt.Errorf("init milvus vector store failed, err=%w", err)
		}

		ss = append(ss, mvs)
	}

	var knowledgeEventHandler eventbus.ConsumerHandler

	knowledgeDomainSVC, knowledgeEventHandler = knowledgeImpl.NewKnowledgeSVC(&knowledgeImpl.KnowledgeSVCConfig{
		DB:            db,
		IDGen:         idGenSVC,
		RDB:           rdb,
		Producer:      knowledgeProducer,
		SearchStores:  ss,
		FileParser:    nil, // default builtin
		Storage:       storage,
		ImageX:        imageX,
		QueryRewriter: rewrite.NewRewriter(nil, ""),
		Reranker:      nil, // default rrf
	})

	if err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_knowledge", "knowledge", knowledgeEventHandler); err != nil {
		return nil, fmt.Errorf("register knowledge consumer failed, err=%w", err)
	}

	return knowledgeDomainSVC, nil
}
