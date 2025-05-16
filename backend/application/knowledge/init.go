package knowledge

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/cloudwego/eino-ext/components/embedding/ark"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/crossdomain"
	knowledgeImpl "code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	sses "code.byted.org/flow/opencoze/backend/infra/impl/document/searchstore/elasticsearch"
	ssmilvus "code.byted.org/flow/opencoze/backend/infra/impl/document/searchstore/milvus"
	"code.byted.org/flow/opencoze/backend/infra/impl/embedding/wrap"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

var knowledgeDomainSVC knowledge.Knowledge

type ServiceComponents struct {
	DB             *gorm.DB
	IDGenSVC       idgen.IDGenerator
	Storage        storage.Storage
	RDB            rdb.RDB
	ImageX         imagex.ImageX
	ES             *es8.Client
	DomainNotifier crossdomain.DomainNotifier
}

func InitService(c *ServiceComponents) (knowledge.Knowledge, error) {
	var (
		milvusAddr        = os.Getenv("MILVUS_ADDR") // default: localhost:9010
		arkEmbeddingModel = os.Getenv("ARK_EMBEDDING_MODEL")
		arkEmbeddingAK    = os.Getenv("ARK_EMBEDDING_AK")
		arkEmbeddingDims  = os.Getenv("ARK_EMBEDDING_DIMS")
	)

	ctx := context.Background()

	// TODO: 加上 search svc
	// TODO: nameserver 替换成 config
	knowledgeProducer, err := rmq.NewProducer("127.0.0.1:9876", "opencoze_knowledge", "opencoze_knowledge", 2)
	if err != nil {
		return nil, fmt.Errorf("init knowledge producer failed, err=%w", err)
	}

	var sManagers []searchstore.Manager

	// es full text search
	sManagers = append(sManagers, sses.NewManager(&sses.ManagerConfig{Client: c.ES}))

	// milvus vector search
	if false {
		cctx, cancel := context.WithTimeout(ctx, time.Second*5)
		defer cancel()
		mc, err := milvusclient.New(cctx, &milvusclient.ClientConfig{Address: milvusAddr})
		if err != nil {
			return nil, fmt.Errorf("init milvus client failed, err=%w", err)
		}

		dims, err := strconv.ParseInt(arkEmbeddingDims, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("init parse embedding dims failed, err=%w", err)
		}
		emb, err := wrap.NewArkEmbedder(ctx, &ark.EmbeddingConfig{
			APIKey: arkEmbeddingAK,
			Model:  arkEmbeddingModel,
		}, dims)
		if err != nil {
			return nil, fmt.Errorf("init http embedding client failed, err=%w", err)
		}

		mgr, err := ssmilvus.NewManager(&ssmilvus.ManagerConfig{
			Client:       mc,
			Embedding:    emb,
			EnableHybrid: ptr.Of(true),
		})
		if err != nil {
			return nil, fmt.Errorf("init milvus vector store failed, err=%w", err)
		}
		sManagers = append(sManagers, mgr)
	}

	var knowledgeEventHandler eventbus.ConsumerHandler

	knowledgeDomainSVC, knowledgeEventHandler = knowledgeImpl.NewKnowledgeSVC(&knowledgeImpl.KnowledgeSVCConfig{
		DB:                  c.DB,
		IDGen:               c.IDGenSVC,
		RDB:                 c.RDB,
		Producer:            knowledgeProducer,
		DomainNotifier:      c.DomainNotifier,
		SearchStoreManagers: sManagers,
		ParseManager:        nil, // default builtin
		Storage:             c.Storage,
		ImageX:              c.ImageX,
		Rewriter:            nil,
		Reranker:            nil, // default rrf
		NL2Sql:              nil,
	})

	if err = rmq.RegisterConsumer("127.0.0.1:9876", "opencoze_knowledge", "knowledge", knowledgeEventHandler); err != nil {
		return nil, fmt.Errorf("register knowledge consumer failed, err=%w", err)
	}

	return knowledgeDomainSVC, nil
}
