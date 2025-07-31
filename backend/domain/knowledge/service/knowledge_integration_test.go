/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package service

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/apache/rocketmq-client-go/v2/primitive"
	"github.com/cloudwego/eino/schema"
	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/nl2sql"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/cache/redis"
	sses "github.com/coze-dev/coze-studio/backend/infra/impl/document/searchstore/elasticsearch"
	ssmilvus "github.com/coze-dev/coze-studio/backend/infra/impl/document/searchstore/milvus"
	hembed "github.com/coze-dev/coze-studio/backend/infra/impl/embedding/http"
	"github.com/coze-dev/coze-studio/backend/infra/impl/es"
	"github.com/coze-dev/coze-studio/backend/infra/impl/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/impl/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/impl/mysql"
	rdbservice "github.com/coze-dev/coze-studio/backend/infra/impl/rdb"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage/minio"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/consts"
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
	es      es.Client
	st      storage.Storage
	svc     *knowledgeSVC
	eventCh chan *eventbus.Message

	startTime int64
}

func (suite *KnowledgeTestSuite) SetupSuite() {
	ctx := context.Background()
	var (
		rmqEndpoint = "127.0.0.1:9876"
		embEndpoint = "http://127.0.0.1:6543"
		// esCertPath    = os.Getenv("ES_CA_CERT_PATH")
		// esAddr = os.Getenv("ES_ADDR")
		// esUsername    = os.Getenv("ES_USERNAME")
		// esPassword    = os.Getenv("ES_PASSWORD")
		milvusAddr    = os.Getenv("MILVUS_ADDR")
		_             = os.Getenv("MYSQL_DSN")
		_             = os.Getenv("REDIS_ADDR")
		minioEndpoint = os.Getenv(consts.MinIOEndpoint)
		minioAK       = os.Getenv(consts.MinIOAK)
		minioSK       = os.Getenv(consts.MinIOSK)
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

	knowledgeProducer, err := eventbus.NewProducer(rmqEndpoint, consts.RMQTopicKnowledge, consts.RMQConsumeGroupKnowledge, 2)
	if err != nil {
		panic(err)
	}

	var mgrs []searchstore.Manager
	// cert, err := os.ReadFile(esCertPath)
	// if err != nil {
	//	panic(err)
	// }

	knowledgeES, err := es.New()
	if err != nil {
		panic(err)
	}

	mgrs = append(mgrs, sses.NewManager(&sses.ManagerConfig{Client: knowledgeES}))

	mc, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
		Address: milvusAddr,
	})
	if err != nil {
		panic(err)
	}

	emb, err := hembed.NewEmbedding(embEndpoint, 1024, 1)
	if err != nil {
		panic(err)
	}

	mvs, err := ssmilvus.NewManager(&ssmilvus.ManagerConfig{
		Client:       mc,
		Embedding:    emb,
		EnableHybrid: ptr.Of(true),
	})
	if err != nil {
		panic(err)
	}
	mgrs = append(mgrs, mvs)

	// ctrl := gomock.NewController(suite.T())

	var knowledgeEventHandler eventbus.ConsumerHandler
	knowledgeDomainSVC, knowledgeEventHandler := NewKnowledgeSVC(&KnowledgeSVCConfig{
		DB:                  db,
		IDGen:               idGenSVC,
		RDB:                 rdbService,
		Producer:            knowledgeProducer,
		SearchStoreManagers: mgrs,
		ParseManager:        nil, // default builtin
		Storage:             tosClient,
		Rewriter:            nil,
		Reranker:            nil, // default rrf
		EnableCompactTable:  ptr.Of(true),
	})

	suite.handler = knowledgeEventHandler

	err = eventbus.RegisterConsumer(rmqEndpoint, consts.RMQTopicKnowledge, consts.RMQConsumeGroupKnowledge, suite)
	if err != nil {
		panic(err)
	}

	suite.ctx = context.Background()
	suite.uid = 111
	suite.spaceID = 222
	suite.db = db
	suite.es = knowledgeES
	suite.st = tosClient
	suite.svc = knowledgeDomainSVC.(*knowledgeSVC)
	suite.eventCh = make(chan *eventbus.Message, 50)

	suite.startTime = time.Now().UnixMilli() - 1000
}

func (suite *KnowledgeTestSuite) HandleMessage(ctx context.Context, msg *eventbus.Message) error {
	if ext, ok := primitive.GetConsumerCtx(ctx); ok {
		if ext.Msgs[0].StoreTimestamp < suite.startTime {
			fmt.Printf("[KnowledgeTestSuite][HandleMessage] skip msg, store_ms=%v, body=%v\n",
				ext.Msgs[0].StoreTimestamp, string(msg.Body))
			return nil
		}
	}

	defer func() {
		suite.eventCh <- msg
	}()

	return suite.handler.HandleMessage(ctx, msg)
}

func (suite *KnowledgeTestSuite) TestSkip() {
	time.Sleep(time.Second * 5)
	suite.clearDB()
}

func (suite *KnowledgeTestSuite) SetupTest() {
	// suite.clearDB()
}

func (suite *KnowledgeTestSuite) TearDownSuite() {
	// suite.clearDB()
}

func (suite *KnowledgeTestSuite) clearDB() {
	db := suite.db
	db.WithContext(suite.ctx).Table((&model.Knowledge{}).TableName()).Where("1=1").Delete([]struct{}{})
	db.WithContext(suite.ctx).Table((&model.KnowledgeDocument{}).TableName()).Where("1=1").Delete([]struct{}{})
	db.WithContext(suite.ctx).Table((&model.KnowledgeDocumentSlice{}).TableName()).Where("1=1").Delete([]struct{}{})
	fmt.Println("[KnowledgeTestSuite] clear done")
}

func (suite *KnowledgeTestSuite) TestTextKnowledge() {
	createReq := CreateKnowledgeRequest{
		Name:        "test_knowledge",
		Description: "test_description",
		IconUri:     "test_icon_uri",
		CreatorID:   suite.uid,
		SpaceID:     suite.spaceID,
		AppID:       0,
		FormatType:  knowledgeModel.DocumentTypeText,
	}
	createResp, err := suite.svc.CreateKnowledge(suite.ctx, &createReq)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createResp)
	updateReq := UpdateKnowledgeRequest{
		KnowledgeID: createResp.KnowledgeID,
		Name:        ptr.Of("test_new_name"),
		Description: ptr.Of("test_new_description"),
	}
	err = suite.svc.UpdateKnowledge(suite.ctx, &updateReq)
	assert.NoError(suite.T(), err)

	mGetResp, err := suite.svc.ListKnowledge(suite.ctx, &ListKnowledgeRequest{
		IDs: []int64{createResp.KnowledgeID},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), mGetResp.Total)
	fmt.Printf("%+v\n", mGetResp)

	mGetResp, err = suite.svc.ListKnowledge(suite.ctx, &ListKnowledgeRequest{
		SpaceID: ptr.Of(suite.spaceID),
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), mGetResp.Total)
	fmt.Printf("%+v\n", mGetResp)

	mGetResp, err = suite.svc.ListKnowledge(suite.ctx, &ListKnowledgeRequest{
		IDs: []int64{887766},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(0), mGetResp.Total)
	err = suite.svc.DeleteKnowledge(suite.ctx, &DeleteKnowledgeRequest{
		KnowledgeID: createResp.KnowledgeID,
	})
	assert.NoError(suite.T(), err)
}

func (suite *KnowledgeTestSuite) TestTextDocument() {
	suite.clearDB()
	createReq := CreateKnowledgeRequest{
		Name:        "test_knowledge",
		Description: "test_description",
		IconUri:     "test_icon_uri",
		CreatorID:   suite.uid,
		SpaceID:     suite.spaceID,
		AppID:       0,
		FormatType:  knowledgeModel.DocumentTypeText,
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

	createdKnowledge, err := suite.svc.CreateKnowledge(suite.ctx, &createReq)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdKnowledge)

	createdDocs, err := suite.svc.CreateDocument(suite.ctx, &CreateDocumentRequest{
		Documents: []*entity.Document{
			{
				Info: knowledgeModel.Info{
					ID:          0,
					Name:        "test.md",
					Description: "test description",
					CreatorID:   suite.uid,
					SpaceID:     suite.spaceID,
				},
				KnowledgeID:   createdKnowledge.KnowledgeID,
				Type:          knowledgeModel.DocumentTypeText,
				URI:           key,
				URL:           url,
				Size:          0,
				SliceCount:    0,
				CharCount:     0,
				FileExtension: parser.FileExtensionMarkdown,
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
					ChunkType:       parser.ChunkTypeCustom,
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
		},
	})
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdDocs)

	<-suite.eventCh // index documents
	<-suite.eventCh // index document
	time.Sleep(time.Second * 10)
}

func (suite *KnowledgeTestSuite) TestTableKnowledge() {
	createReq := CreateKnowledgeRequest{
		Name:        "test_knowledge",
		Description: "test_description",
		IconUri:     "test_icon_uri",
		CreatorID:   suite.uid,
		SpaceID:     suite.spaceID,
		AppID:       0,
		FormatType:  knowledgeModel.DocumentTypeTable,
	}
	createResp, err := suite.svc.CreateKnowledge(suite.ctx, &createReq)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createResp)
	updateReq := UpdateKnowledgeRequest{
		KnowledgeID: createResp.KnowledgeID,
		Name:        ptr.Of("test_new_name"),
		Description: ptr.Of("test_new_description"),
	}
	err = suite.svc.UpdateKnowledge(suite.ctx, &updateReq)
	assert.NoError(suite.T(), err)

	mgetResp, err := suite.svc.ListKnowledge(suite.ctx, &ListKnowledgeRequest{
		IDs: []int64{createResp.KnowledgeID},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), mgetResp.Total)
	fmt.Printf("%+v\n", mgetResp)

	mgetResp, err = suite.svc.ListKnowledge(suite.ctx, &ListKnowledgeRequest{
		SpaceID: ptr.Of(suite.spaceID),
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), mgetResp.Total)
	fmt.Printf("%+v\n", mgetResp)

	mgetResp, err = suite.svc.ListKnowledge(suite.ctx, &ListKnowledgeRequest{
		IDs: []int64{887766},
	})
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(0), mgetResp.Total)

	err = suite.svc.DeleteKnowledge(suite.ctx, &DeleteKnowledgeRequest{
		KnowledgeID: createResp.KnowledgeID,
	})
	assert.NoError(suite.T(), err)
}

func (suite *KnowledgeTestSuite) TestTableDocument() {
	suite.clearDB()
	createReq := CreateKnowledgeRequest{
		Name:        "test_knowledge",
		Description: "test_description",
		IconUri:     "test_icon_uri",
		CreatorID:   suite.uid,
		SpaceID:     suite.spaceID,
		AppID:       0,
		FormatType:  knowledgeModel.DocumentTypeTable,
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

	createdKnowledge, err := suite.svc.CreateKnowledge(suite.ctx, &createReq)
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdKnowledge)

	rawDoc := &entity.Document{
		Info: knowledgeModel.Info{
			ID:          0,
			Name:        "test.json",
			Description: "test json",
			CreatorID:   suite.uid,
			SpaceID:     suite.spaceID,
		},
		KnowledgeID:   createdKnowledge.KnowledgeID,
		Type:          knowledgeModel.DocumentTypeTable,
		URI:           key,
		URL:           url,
		Size:          0,
		SliceCount:    0,
		CharCount:     0,
		FileExtension: parser.FileExtensionJSON,
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
			ChunkType:       parser.ChunkTypeCustom,
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

	p, err := suite.svc.parseManager.GetParser(convert.DocumentToParseConfig(rawDoc))
	assert.NoError(suite.T(), err)

	parseResult, err := p.Parse(suite.ctx, bytes.NewReader(b))
	assert.NoError(suite.T(), err)
	cols := parseResult[0].MetaData[document.MetaDataKeyColumns].([]*document.Column)
	createCols := make([]*entity.TableColumn, 0, len(cols))
	for i, col := range cols {
		createCols = append(createCols, &entity.TableColumn{
			ID:          col.ID,
			Name:        col.Name,
			Type:        col.Type,
			Description: col.Description,
			Indexing:    !col.Nullable,
			Sequence:    int64(i),
		})
	}
	rawDoc.TableInfo = entity.TableInfo{
		Columns: createCols,
	}

	createdDocs, err := suite.svc.CreateDocument(suite.ctx, &CreateDocumentRequest{Documents: []*entity.Document{rawDoc}})
	assert.NoError(suite.T(), err)
	fmt.Printf("%+v\n", createdDocs)

	<-suite.eventCh // index documents
	<-suite.eventCh // index document
	time.Sleep(time.Second * 10)
}

// call TestTextKnowledge and comment out SetupTest before using this
func (suite *KnowledgeTestSuite) TestDocRetrieve() {
	knowledgeIDs := []int64{7504983031996743680}
	docIDs := []int64{7504983394833399808}

	slices, err := suite.svc.Retrieve(suite.ctx, &RetrieveRequest{
		Query:        "tower",
		ChatHistory:  nil,
		KnowledgeIDs: knowledgeIDs,
		DocumentIDs:  docIDs,
		Strategy: &entity.RetrievalStrategy{
			TopK:               ptr.Of(int64(3)),
			MinScore:           nil,
			MaxTokens:          nil,
			SelectType:         knowledgeModel.SelectTypeAuto,
			SearchType:         knowledgeModel.SearchTypeHybrid,
			EnableQueryRewrite: false,
			EnableRerank:       true,
			EnableNL2SQL:       true,
		},
	})
	assert.NoError(suite.T(), err)
	fmt.Println(slices)
}

// call TestTextKnowledge and comment out SetupTest before using this
func (suite *KnowledgeTestSuite) TestTableRetrieve() {
	knowledgeIDs := []int64{7506054446447591424}
	docIDs := []int64{7506054481226760192}
	suite.svc.nl2Sql = &mockNL2SQL{tableName: "table_7506054481281286144"}

	slices, err := suite.svc.Retrieve(suite.ctx, &RetrieveRequest{
		Query:        "hello",
		ChatHistory:  nil,
		KnowledgeIDs: knowledgeIDs,
		DocumentIDs:  docIDs,
		Strategy: &entity.RetrievalStrategy{
			TopK:               ptr.Of(int64(3)),
			MinScore:           nil,
			MaxTokens:          nil,
			SelectType:         knowledgeModel.SelectTypeAuto,
			SearchType:         knowledgeModel.SearchTypeHybrid,
			EnableQueryRewrite: true,
			EnableRerank:       true,
			EnableNL2SQL:       true,
		},
	})
	assert.NoError(suite.T(), err)
	fmt.Println(slices)
}

// call TestTextKnowledge and comment out SetupTest before using this
func (suite *KnowledgeTestSuite) TestTextKnowledgeDelete() {
	err := suite.svc.DeleteKnowledge(suite.ctx, &DeleteKnowledgeRequest{
		KnowledgeID: 7501599196214984704,
	})
	assert.NoError(suite.T(), err)
	<-suite.eventCh // delete document
}

type mockNL2SQL struct {
	tableName string
}

func (m *mockNL2SQL) NL2SQL(ctx context.Context, messages []*schema.Message, tables []*document.TableSchema, opts ...nl2sql.Option) (sql string, err error) {
	return fmt.Sprintf("select * from %s", m.tableName), nil
}
