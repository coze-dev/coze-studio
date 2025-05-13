package knowledge

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/crossdomain"
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

type ServiceComponents struct {
	Db             *gorm.DB
	IdGenSVC       idgen.IDGenerator
	Storage        storage.Storage
	Rdb            rdb.RDB
	ImageX         imagex.ImageX
	Es             *es8.Client
	DomainNotifier crossdomain.DomainNotifier
}

func InitService(
	c *ServiceComponents,
) (
	knowledge.Knowledge,

	error) {

	var (
		milvusAddr        = os.Getenv("MILVUS_ADDR")         // default: localhost:9010
		httpEmbeddingAddr = os.Getenv("HTTP_EMBEDDING_ADDR") // default: http://127.0.0.1:6543
	)

	ctx := context.Background()

	// TODO: 加上 search svc
	// TODO: nameserver 替换成 config
	knowledgeProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_knowledge", "opencoze_knowledge", 2)
	if err != nil {
		return nil, fmt.Errorf("init knowledge producer failed, err=%w", err)
	}

	var ss []searchstore.SearchStore
	// es full text search
	ss = append(ss, knowledgees.NewSearchStore(&knowledgees.Config{
		Client:       c.Es,
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
		DB:             c.Db,
		IDGen:          c.IdGenSVC,
		RDB:            c.Rdb,
		Producer:       knowledgeProducer,
		SearchStores:   ss,
		FileParser:     nil, // default builtin
		Storage:        c.Storage,
		ImageX:         c.ImageX,
		DomainNotifier: c.DomainNotifier,
		QueryRewriter:  rewrite.NewRewriter(nil, ""),
		Reranker:       nil, // default rrf
	})

	if err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_knowledge", "knowledge", knowledgeEventHandler); err != nil {
		return nil, fmt.Errorf("register knowledge consumer failed, err=%w", err)
	}

	return knowledgeDomainSVC, nil
}
