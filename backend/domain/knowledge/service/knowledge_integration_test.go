package service

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	rewrite "code.byted.org/flow/opencoze/backend/domain/knowledge/rewrite/llm_based"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	knowledgees "code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore/text/elasticsearch"
	knolwedgemilvus "code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore/vector/milvus"
	rdbservice "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	hembed "code.byted.org/flow/opencoze/backend/infra/impl/embedding/http"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	"code.byted.org/flow/opencoze/backend/infra/impl/storage/minio"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

func TestKnowledgeSuite(t *testing.T) {
	if os.Getenv("TEST_KNOWLEDGE_INTEGRATION") != "true" {
		return
	}

	suite.Run(t, new(KnowledgeTestSuite))
}

type KnowledgeTestSuite struct {
	suite.Suite
	handler eventbus.ConsumerHandler

	ctx     context.Context
	uid     int64
	spaceID int64

	db      *gorm.DB
	st      storage.Storage
	svc     *knowledgeSVC
	eventCh chan *eventbus.Message
}

func (suite *KnowledgeTestSuite) SetupSuite() {
	ctx := context.Background()
	var (
		rmqEndpoint = "127.0.0.1:9876"
		embEndpoint = "http://127.0.0.1:6543"
		//esCertPath    = os.Getenv("ES_CA_CERT_PATH")
		esAddr = os.Getenv("ES_ADDR")
		//esUsername    = os.Getenv("ES_USERNAME")
		//esPassword    = os.Getenv("ES_PASSWORD")
		milvusAddr    = os.Getenv("MILVUS_ADDR")
		_             = os.Getenv("MYSQL_DSN")
		_             = os.Getenv("REDIS_ADDR")
		minioEndpoint = os.Getenv(consts.MinIO_Endpoint)
		minioAK       = os.Getenv(consts.MinIO_AK)
		minioSK       = os.Getenv(consts.MinIO_SK)
	)

	db, err := mysql.New()
	if err != nil {
		panic(err)
	}

	cacheCli := redis.New()
	idGenSVC, err := idgen.New(cacheCli)
	if err != nil {
		panic(err)
	}

	tosClient, err := minio.New(ctx,
		minioEndpoint,
		minioAK,
		minioSK,
		"bucket2",
		false,
	)
	if err != nil {
		panic(err)
	}

	rdbService := rdbservice.NewService(db, idGenSVC)

	knowledgeProducer, err := rmq.NewProducer(rmqEndpoint, "opencoze_knowledge", 2)
	if err != nil {
		panic(err)
	}

	var ss []searchstore.SearchStore
	//cert, err := os.ReadFile(esCertPath)
	//if err != nil {
	//	panic(err)
	//}

	knowledgeES, err := elasticsearch.NewTypedClient(elasticsearch.Config{
		Addresses: strings.Split(esAddr, ";"),
		//Username:  esUsername,
		//Password:  esPassword,
		//CACert:    cert,
	})
	if err != nil {
		panic(err)
	}

	ss = append(ss, knowledgees.NewSearchStore(&knowledgees.Config{
		Client:       knowledgeES,
		CompactTable: nil,
	}))

	mc, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
		Address: milvusAddr,
	})
	if err != nil {
		panic(err)
	}

	emb, err := hembed.NewEmbedding(embEndpoint)
	if err != nil {
		panic(err)
	}

	mvs, err := knolwedgemilvus.NewSearchStore(&knolwedgemilvus.Config{
		Client:       mc,
		Embedding:    emb,
		EnableHybrid: ptr.Of(true),
	})
	if err != nil {
		panic(err)
	}
	ss = append(ss, mvs)

	var knowledgeEventHandler eventbus.ConsumerHandler
	knowledgeDomainSVC, knowledgeEventHandler := NewKnowledgeSVC(&KnowledgeSVCConfig{
		DB:            db,
		IDGen:         idGenSVC,
		RDB:           rdbService,
		Producer:      knowledgeProducer,
		SearchStores:  ss,
		FileParser:    nil, // default builtin
		Storage:       tosClient,
		ImageX:        nil, // TODO: image not support
		QueryRewriter: rewrite.NewRewriter(nil, ""),
		Reranker:      nil, // default rrf
	})

	suite.handler = knowledgeEventHandler

	err = rmq.RegisterConsumer(rmqEndpoint, "opencoze_knowledge", "knowledge", suite)
	if err != nil {
		panic(err)
	}

	suite.ctx = context.Background()
	suite.uid = 111
	suite.spaceID = 222
	suite.db = db
	suite.st = tosClient
	suite.svc = knowledgeDomainSVC.(*knowledgeSVC)
	suite.eventCh = make(chan *eventbus.Message, 50)
}

func (suite *KnowledgeTestSuite) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	defer func() {
		suite.eventCh <- msg
	}()

	return suite.handler.HandleMessage(ctx, msg)
}

func (suite *KnowledgeTestSuite) TestSkip() {
	time.Sleep(time.Second * 5)
}

func (suite *KnowledgeTestSuite) SetupTest() {
	//suite.clearDB()
}

func (suite *KnowledgeTestSuite) TearDownSuite() {
	//suite.clearDB()
}

func (suite *KnowledgeTestSuite) clearDB() {
	db := suite.db
	db.WithContext(suite.ctx).Table((&model.Knowledge{}).TableName()).Where("1=1").Delete([]struct{}{})
	db.WithContext(suite.ctx).Table((&model.KnowledgeDocument{}).TableName()).Where("1=1").Delete([]struct{}{})
	db.WithContext(suite.ctx).Table((&model.KnowledgeDocumentSlice{}).TableName()).Where("1=1").Delete([]struct{}{})
	fmt.Println("[KnowledgeTestSuite] clear done")
}

func (suite *KnowledgeTestSuite) TestTextKnowledge() {
	k := &entity.Knowledge{
		Info: common.Info{
			ID:          0,
			Name:        "test_knowledge",
			Description: "test_description",
			IconURI:     "test_icon_uri",
			IconURL:     "test_icon_url",
			CreatorID:   suite.uid,
			SpaceID:     suite.spaceID,
			ProjectID:   0,
			CreatedAtMs: 0,
			UpdatedAtMs: 0,
			DeletedAtMs: 0,
		},
		Type:   entity.DocumentTypeText,
		Status: 0,
	}

	created, err := suite.svc.CreateKnowledge(suite.ctx, k)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", created)

	created.Name = "test_new_name"
	created.Description = "test_new_description"
	updated, err := suite.svc.UpdateKnowledge(suite.ctx, created)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", updated)

	mget, total, err := suite.svc.MGetKnowledge(suite.ctx, &knowledge.MGetKnowledgeRequest{
		IDs: []int64{updated.ID},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), total)
	fmt.Printf("%+v\n", mget)

	mget, total, err = suite.svc.MGetKnowledge(suite.ctx, &knowledge.MGetKnowledgeRequest{
		SpaceID: ptr.Of(suite.spaceID),
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), total)
	fmt.Printf("%+v\n", mget)

	_, total, err = suite.svc.MGetKnowledge(suite.ctx, &knowledge.MGetKnowledgeRequest{
		IDs: []int64{887766},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(0), total)

	deleted, err := suite.svc.DeleteKnowledge(suite.ctx, updated)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", deleted)
}

func (suite *KnowledgeTestSuite) TestTextDocument() {
	k := &entity.Knowledge{
		Info: common.Info{
			ID:          0,
			Name:        "test_knowledge",
			Description: "test_description",
			IconURI:     "test_icon_uri",
			IconURL:     "test_icon_url",
			CreatorID:   suite.uid,
			SpaceID:     suite.spaceID,
			ProjectID:   0,
			CreatedAtMs: 0,
			UpdatedAtMs: 0,
			DeletedAtMs: 0,
		},
		Type:   entity.DocumentTypeText,
		Status: 0,
	}

	key := fmt.Sprintf("test_text_document_key:%d:%s", time.Now().Unix(), "test.md")
	b := []byte(`1. Eiffel Tower: Located in Paris, France, it is one of the most famous landmarks in the world, designed by Gustave Eiffel and built in 1889.
2. The Great Wall: Located in China, it is one of the Seven Wonders of the World, built from the Qin Dynasty to the Ming Dynasty, with a total length of over 20000 kilometers.
3. Grand Canyon National Park: Located in Arizona, USA, it is famous for its deep canyons and magnificent scenery, which are cut by the Colorado River.
4. The Colosseum: Located in Rome, Italy, built between 70-80 AD, it was the largest circular arena in the ancient Roman Empire.
5. Taj Mahal: Located in Agra, India, it was completed by Mughal Emperor Shah Jahan in 1653 to commemorate his wife and is one of the New Seven Wonders of the World.
6. Sydney Opera House: Located in Sydney Harbour, Australia, it is one of the most iconic buildings of the 20th century, renowned for its unique sailboat design.
7. Louvre Museum: Located in Paris, France, it is one of the largest museums in the world with a rich collection, including Leonardo da Vinci's Mona Lisa and Greece's Venus de Milo.
8. Niagara Falls: located at the border of the United States and Canada, consisting of three main waterfalls, its spectacular scenery attracts millions of tourists every year.
9. St. Sophia Cathedral: located in Istanbul, Türkiye, originally built in 537 A.D., it used to be an Orthodox cathedral and mosque, and now it is a museum.
10. Machu Picchu: an ancient Inca site located on the plateau of the Andes Mountains in Peru, one of the New Seven Wonders of the World, with an altitude of over 2400 meters.`)
	assert.NoError(suite.T(), suite.st.PutObject(suite.ctx, key, b))
	url, err := suite.st.GetObjectUrl(suite.ctx, key)
	assert.NoError(suite.T(), err)
	fmt.Println(url)

	createdKnowledge, err := suite.svc.CreateKnowledge(suite.ctx, k)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdKnowledge)

	createdDocs, err := suite.svc.CreateDocument(suite.ctx, []*entity.Document{
		{
			Info: common.Info{
				ID:          0,
				Name:        "test.md",
				Description: "test description",
				CreatorID:   suite.uid,
				SpaceID:     suite.spaceID,
			},
			KnowledgeID:   createdKnowledge.ID,
			Type:          entity.DocumentTypeText,
			URI:           key,
			URL:           url,
			Size:          0,
			SliceCount:    0,
			CharCount:     0,
			FileExtension: entity.FileExtensionMarkdown,
			Status:        entity.DocumentStatusUploading,
			StatusMsg:     "",
			Hits:          0,
			Source:        entity.DocumentSourceLocal,
			ParsingStrategy: &entity.ParsingStrategy{
				ExtractImage: false,
				ExtractTable: false,
				ImageOCR:     false,
			},
			ChunkingStrategy: &entity.ChunkingStrategy{
				ChunkType:       entity.ChunkTypeCustom,
				ChunkSize:       1000,
				Separator:       "\n",
				Overlap:         0,
				TrimSpace:       true,
				TrimURLAndEmail: true,
				MaxDepth:        0,
				SaveTitle:       false,
			},
			TableInfo: entity.TableInfo{},
			IsAppend:  false,
		},
	})
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdDocs)

	<-suite.eventCh // index documents
	<-suite.eventCh // index document
	time.Sleep(time.Second * 10)
}

func (suite *KnowledgeTestSuite) TestTableKnowledge() {
	k := &entity.Knowledge{
		Info: common.Info{
			ID:          0,
			Name:        "test_knowledge",
			Description: "test_description",
			IconURI:     "test_icon_uri",
			IconURL:     "test_icon_url",
			CreatorID:   suite.uid,
			SpaceID:     suite.spaceID,
			ProjectID:   0,
			CreatedAtMs: 0,
			UpdatedAtMs: 0,
			DeletedAtMs: 0,
		},
		Type:   entity.DocumentTypeTable,
		Status: 0,
	}

	created, err := suite.svc.CreateKnowledge(suite.ctx, k)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", created)

	created.Name = "test_new_name"
	created.Description = "test_new_description"
	updated, err := suite.svc.UpdateKnowledge(suite.ctx, created)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", updated)

	mget, total, err := suite.svc.MGetKnowledge(suite.ctx, &knowledge.MGetKnowledgeRequest{
		IDs: []int64{updated.ID},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), total)
	fmt.Printf("%+v\n", mget)

	mget, total, err = suite.svc.MGetKnowledge(suite.ctx, &knowledge.MGetKnowledgeRequest{
		SpaceID: ptr.Of(suite.spaceID),
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), total)
	fmt.Printf("%+v\n", mget)

	_, total, err = suite.svc.MGetKnowledge(suite.ctx, &knowledge.MGetKnowledgeRequest{
		IDs: []int64{887766},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(0), total)

	deleted, err := suite.svc.DeleteKnowledge(suite.ctx, updated)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", deleted)
}

func (suite *KnowledgeTestSuite) TestTableDocument() {
	suite.clearDB()
	k := &entity.Knowledge{
		Info: common.Info{
			ID:          0,
			Name:        "test_knowledge",
			Description: "test_description",
			IconURI:     "test_icon_uri",
			IconURL:     "test_icon_url",
			CreatorID:   suite.uid,
			SpaceID:     suite.spaceID,
			ProjectID:   0,
			CreatedAtMs: 0,
			UpdatedAtMs: 0,
			DeletedAtMs: 0,
		},
		Type:   entity.DocumentTypeText,
		Status: 0,
	}

	key := fmt.Sprintf("test_table_document_key:%d:%s", time.Now().Unix(), "test.json")
	b := []byte(`[
    {
        "department": "心血管科",
        "title": "高血压患者能吃党参吗？",
        "question": "我有高血压这两天女婿来的时候给我拿了些党参泡水喝，您好高血压可以吃党参吗？",
        "answer": "高血压病人可以口服党参的。党参有降血脂，降血压的作用，可以彻底消除血液中的垃圾，从而对冠心病以及心血管疾病的患者都有一定的稳定预防工作作用，因此平时口服党参能远离三高的危害。另外党参除了益气养血，降低中枢神经作用，调整消化系统功能，健脾补肺的功能。感谢您的进行咨询，期望我的解释对你有所帮助。"
    },
    {
        "department": "消化科",
        "title": "哪家医院能治胃反流",
        "question": "烧心，打隔，咳嗽低烧，以有4年多",
        "answer": "建议你用奥美拉唑同时，加用吗丁啉或莫沙必利或援生力维，另外还可以加用达喜片"
    }
]`)
	assert.NoError(suite.T(), suite.st.PutObject(suite.ctx, key, b))
	url, err := suite.st.GetObjectUrl(suite.ctx, key)
	assert.NoError(suite.T(), err)
	fmt.Println(url)

	createdKnowledge, err := suite.svc.CreateKnowledge(suite.ctx, k)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdKnowledge)

	rawDoc := &entity.Document{
		Info: common.Info{
			ID:          0,
			Name:        "test.md",
			Description: "test description",
			CreatorID:   suite.uid,
			SpaceID:     suite.spaceID,
		},
		KnowledgeID:   createdKnowledge.ID,
		Type:          entity.DocumentTypeText,
		URI:           key,
		URL:           url,
		Size:          0,
		SliceCount:    0,
		CharCount:     0,
		FileExtension: entity.FileExtensionMarkdown,
		Status:        entity.DocumentStatusUploading,
		StatusMsg:     "",
		Hits:          0,
		Source:        entity.DocumentSourceLocal,
		ParsingStrategy: &entity.ParsingStrategy{
			SheetID:       0,
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     2,
		},
		ChunkingStrategy: &entity.ChunkingStrategy{
			ChunkType:       entity.ChunkTypeCustom,
			ChunkSize:       1000,
			Separator:       "\n",
			Overlap:         0,
			TrimSpace:       true,
			TrimURLAndEmail: true,
			MaxDepth:        0,
			SaveTitle:       false,
		},
		TableInfo: entity.TableInfo{},
		IsAppend:  false,
	}

	parseResult, err := suite.svc.parser.Parse(suite.ctx, bytes.NewReader(b), rawDoc)
	assert.NoError(suite.T(), err)
	rawDoc.TableInfo = entity.TableInfo{
		Columns: parseResult.TableSchema,
	}

	createdDocs, err := suite.svc.CreateDocument(suite.ctx, []*entity.Document{rawDoc})
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdDocs)

	<-suite.eventCh // index documents
	<-suite.eventCh // index document
	time.Sleep(time.Second * 10)
}

// call TestTextKnowledge and comment out SetupTest before using this
func (suite *KnowledgeTestSuite) TestRetrieve() {
	knowledgeIDs := []int64{7501599196214984704}
	docIDs := []int64{7501599196269510656}
	slices, err := suite.svc.Retrieve(suite.ctx, &knowledge.RetrieveRequest{
		Query:        "best tourist attractions",
		ChatHistory:  nil,
		KnowledgeIDs: knowledgeIDs,
		DocumentIDs:  docIDs,
		Strategy: &entity.RetrievalStrategy{
			TopK:               ptr.Of(int64(3)),
			MinScore:           nil,
			MaxTokens:          nil,
			SelectType:         entity.SelectTypeAuto,
			SearchType:         entity.SearchTypeHybrid,
			EnableQueryRewrite: true,
			EnableRerank:       true,
			EnableNL2SQL:       false,
		},
	})
	assert.NoError(suite.T(), err)
	fmt.Println(slices)
}

// call TestTextKnowledge and comment out SetupTest before using this
func (suite *KnowledgeTestSuite) TestTextKnowledgeDelete() {
	deleted, err := suite.svc.DeleteKnowledge(suite.ctx, &entity.Knowledge{
		Info: common.Info{
			ID: 7501599196214984704,
		},
	})
	assert.NoError(suite.T(), err)
	fmt.Println(deleted)
	<-suite.eventCh // delete document
}
