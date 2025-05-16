package impl

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/processor"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type baseDocProcessor struct {
	ctx            context.Context
	UserID         int64
	SpaceID        int64
	Documents      []*entity.Document
	documentSource *entity.DocumentSource

	// 落DB 的 model
	TableName string
	docModels []*model.KnowledgeDocument

	storage       storage.Storage
	knowledgeRepo dao.KnowledgeRepo
	documentRepo  dao.KnowledgeDocumentRepo
	sliceRepo     dao.KnowledgeDocumentSliceRepo
	idgen         idgen.IDGenerator
	rdb           rdb.RDB
	producer      eventbus.Producer
	parseManager  parser.Manager
}

// 用户自定义表格创建文档
type CustomTableProcessor struct {
	baseDocProcessor
}

// 用户输入自定义内容后创建文档
type CustomDocProcessor struct {
	baseDocProcessor
}

type DocProcessorConfig struct {
	UserID         int64
	SpaceID        int64
	DocumentSource entity.DocumentSource
	Documents      []*entity.Document

	KnowledgeRepo dao.KnowledgeRepo
	DocumentRepo  dao.KnowledgeDocumentRepo
	SliceRepo     dao.KnowledgeDocumentSliceRepo
	Idgen         idgen.IDGenerator
	Storage       storage.Storage
	Rdb           rdb.RDB
	Producer      eventbus.Producer // TODO: document id 维度有序?
	ParseManager  parser.Manager
}

func NewDocProcessor(ctx context.Context, config *DocProcessorConfig) (p processor.DocProcessor) {
	base := &baseDocProcessor{
		ctx:            ctx,
		UserID:         config.UserID,
		SpaceID:        config.SpaceID,
		Documents:      config.Documents,
		documentSource: &config.DocumentSource,
		knowledgeRepo:  config.KnowledgeRepo,
		documentRepo:   config.DocumentRepo,
		sliceRepo:      config.SliceRepo,
		storage:        config.Storage,
		idgen:          config.Idgen,
		rdb:            config.Rdb,
		producer:       config.Producer,
		parseManager:   config.ParseManager,
	}

	switch config.DocumentSource {
	case entity.DocumentSourceCustom:
		p = &CustomDocProcessor{
			baseDocProcessor: *base,
		}
		if config.Documents[0].Type == entity.DocumentTypeTable {
			p = &CustomTableProcessor{
				baseDocProcessor: *base,
			}
		}
		return p
	case entity.DocumentSourceLocal:
		return base
	default:
		return base
	}
}

func (p *baseDocProcessor) BeforeCreate() error {
	// 这个方法主要是从各个数据源拉取数据，我们只有本地上传

	return nil
}

func (p *baseDocProcessor) BuildDBModel() error {
	p.docModels = make([]*model.KnowledgeDocument, 0, len(p.Documents))
	ids, err := p.idgen.GenMultiIDs(p.ctx, len(p.Documents))
	if err != nil {
		return err
	}
	for i := range p.Documents {
		docModel := &model.KnowledgeDocument{
			ID:            ids[i],
			KnowledgeID:   p.Documents[i].KnowledgeID,
			Name:          p.Documents[i].Name,
			FileExtension: string(p.Documents[i].FileExtension),
			URI:           p.Documents[i].URI,
			DocumentType:  int32(p.Documents[i].Type),
			CreatorID:     p.UserID,
			SpaceID:       p.SpaceID,
			SourceType:    int32(p.Documents[i].Source),
			Status:        int32(entity.KnowledgeStatusInit),
			ParseRule: &model.DocumentParseRule{
				ParsingStrategy:  p.Documents[i].ParsingStrategy,
				ChunkingStrategy: p.Documents[i].ChunkingStrategy,
			},
		}
		p.Documents[i].ID = docModel.ID
		p.docModels = append(p.docModels, docModel)
	}

	return nil
}

func (p *baseDocProcessor) InsertDBModel() (err error) {

	ctx := p.ctx

	if len(p.Documents) == 1 && p.Documents[0].Type == entity.DocumentTypeTable {
		err = p.createTable()
		if err != nil {
			logs.CtxErrorf(ctx, "create table failed, err: %v", err)
			return err
		}
	}

	tx, err := p.knowledgeRepo.InitTx()
	if err != nil {
		logs.CtxErrorf(ctx, "init tx failed, err: %v", err)
		return err
	}
	defer func() {
		if e := recover(); e != nil {
			logs.CtxErrorf(ctx, "panic: %v", e)
			err = fmt.Errorf("panic: %v", e)
			tx.Rollback()
			return
		}
		if err != nil {
			logs.CtxErrorf(ctx, "InsertDBModel err: %v", err)
			tx.Rollback()
			if p.TableName != "" {
				err = p.deleteTable()
				if err != nil {
					logs.CtxErrorf(ctx, "delete table failed, err: %v", err)
					return
				}
			}
		} else {
			tx.Commit()
		}
	}()
	err = p.documentRepo.CreateWithTx(ctx, tx, p.docModels)
	if err != nil {
		logs.CtxErrorf(ctx, "create document failed, err: %v", err)
		return err
	}
	err = p.knowledgeRepo.UpdateWithTx(ctx, tx, p.Documents[0].KnowledgeID, map[string]interface{}{
		"updated_at": time.Now().Unix(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return err
	}
	return nil
}

func (p *baseDocProcessor) createTable() error {
	if len(p.Documents) == 1 && p.Documents[0].Type == entity.DocumentTypeTable {
		// 表格型知识库，创建表
		columns := []*rdbEntity.Column{}
		columnIDs, err := p.idgen.GenMultiIDs(p.ctx, len(p.Documents[0].TableInfo.Columns)+1)
		if err != nil {
			return err
		}
		for i := range p.Documents[0].TableInfo.Columns {
			p.Documents[0].TableInfo.Columns[i].ID = columnIDs[i]
			columns = append(columns, &rdbEntity.Column{
				Name:     convert.ColumnIDToRDBField(columnIDs[i]),
				DataType: convert.ConvertColumnType(p.Documents[0].TableInfo.Columns[i].Type),
				NotNull:  false,
			})
		}
		p.Documents[0].TableInfo.Columns = append(p.Documents[0].TableInfo.Columns, &entity.TableColumn{
			ID:          columnIDs[len(columnIDs)-1],
			Name:        consts.RDBFieldID,
			Type:        document.TableColumnTypeInteger,
			Description: "主键ID",
			Indexing:    false,
			Sequence:    -1,
		})
		// 为每个表格增加个主键ID
		columns = append(columns, &rdbEntity.Column{
			Name:     consts.RDBFieldID,
			DataType: rdbEntity.TypeBigInt,
			NotNull:  true,
		})
		// 创建一个数据表
		resp, err := p.rdb.CreateTable(p.ctx, &rdb.CreateTableRequest{
			Table: &rdbEntity.Table{
				Columns: columns,
				Indexes: []*rdbEntity.Index{
					{
						Name:    "pk",
						Type:    rdbEntity.PrimaryKey,
						Columns: []string{consts.RDBFieldID},
					},
				},
			},
		})
		if err != nil {
			logs.CtxErrorf(p.ctx, "create table failed, err: %v", err)
			return err
		}
		p.TableName = resp.Table.Name
		p.Documents[0].TableInfo.PhysicalTableName = p.TableName
		p.docModels[0].TableInfo = &entity.TableInfo{
			VirtualTableName:  p.Documents[0].Name,
			PhysicalTableName: p.TableName,
			TableDesc:         p.Documents[0].Description,
			Columns:           p.Documents[0].TableInfo.Columns,
		}
	}
	return nil
}
func (p *baseDocProcessor) deleteTable() error {
	if len(p.Documents) == 1 && p.Documents[0].Type == entity.DocumentTypeTable {
		_, err := p.rdb.DropTable(p.ctx, &rdb.DropTableRequest{
			TableName: p.TableName,
			IfExists:  false,
		})
		if err != nil {
			logs.CtxErrorf(p.ctx, "[deleteTable] drop table failed, err: %v", err)
			return err
		}
	}
	return nil
}
func (p *baseDocProcessor) Indexing() error {
	body, err := sonic.Marshal(&entity.Event{
		Type:      entity.EventTypeIndexDocuments,
		Documents: p.Documents,
	})
	if err != nil {
		return err
	}

	if err = p.producer.Send(p.ctx, body); err != nil {
		return err
	}
	return nil
}

func (p *baseDocProcessor) GetResp() []*entity.Document {
	return p.Documents
}

func getFormatType(tp entity.DocumentType) parser.FileExtension {
	docType := parser.FileExtensionTXT
	if tp == entity.DocumentTypeTable {
		docType = parser.FileExtensionJSON
	}
	return docType
}

func getTosUri(userID int64, fileType string) string {
	fileName := fmt.Sprintf("FileBizType.Knowledge/%d_%d.%s", userID, time.Now().UnixNano(), fileType)
	return fileName
}

func (c *CustomDocProcessor) BeforeCreate() error {
	for i := range c.Documents {
		if c.Documents[i].RawContent != "" {
			c.Documents[i].FileExtension = getFormatType(c.Documents[i].Type)
			uri := getTosUri(c.UserID, string(c.Documents[i].FileExtension))
			err := c.storage.PutObject(c.ctx, uri, []byte(c.Documents[i].RawContent))
			if err != nil {
				logs.CtxErrorf(c.ctx, "put object failed, err: %v", err)
				return err
			}
			c.Documents[i].URI = uri
		}
	}

	return nil
}

func (c *CustomTableProcessor) BeforeCreate() error {

	if len(c.Documents) == 1 && c.Documents[0].Type == entity.DocumentTypeTable && c.Documents[0].IsAppend {
		doc, err := c.documentRepo.GetByID(c.ctx, c.Documents[0].ID)
		if err != nil {
			logs.CtxErrorf(c.ctx, "get document failed, err: %v", err)
			return err
		}
		if doc.TableInfo == nil {
			logs.CtxErrorf(c.ctx, "document table info is nil")
			return errors.New("document table info is nil")
		}
		c.Documents[0].TableInfo = *doc.TableInfo
		// 追加场景
		if c.Documents[0].RawContent != "" {
			c.Documents[0].FileExtension = getFormatType(c.Documents[0].Type)
			uri := getTosUri(c.UserID, string(c.Documents[0].FileExtension))
			err := c.storage.PutObject(c.ctx, uri, []byte(c.Documents[0].RawContent))
			if err != nil {
				logs.CtxErrorf(c.ctx, "put object failed, err: %v", err)
				return err
			}
			c.Documents[0].URI = uri
		}
	}
	return nil
}

func (c *CustomTableProcessor) BuildDBModel() error {
	if len(c.Documents) == 1 && c.Documents[0].Type == entity.DocumentTypeTable {
		if c.Documents[0].IsAppend {
			// 追加场景，不需要创建表了
			// 一是用户自定义一些数据、二是再上传一个表格，把表格里的数据追加到表格中
		} else {
			err := c.baseDocProcessor.BuildDBModel()
			if err != nil {
				return err
			}
			// 因为这种创建方式不带数据，所以直接设置状态为可用
			for i := range c.docModels {
				c.docModels[i].Status = int32(entity.DocumentStatusEnable)
			}
		}
	}
	return nil
}

func (c *CustomTableProcessor) InsertDBModel() error {
	if len(c.Documents) == 1 &&
		c.Documents[0].Type == entity.DocumentTypeTable &&
		c.Documents[0].IsAppend {
		// 追加场景，设置文档为处理中状态
		err := c.documentRepo.SetStatus(c.ctx, c.Documents[0].ID, int32(entity.DocumentStatusUploading), "")
		if err != nil {
			logs.CtxErrorf(c.ctx, "document set status err:%v", err)
			return err
		}
	}
	return nil
}

func (c *CustomTableProcessor) Indexing() error {
	c.baseDocProcessor.Indexing()
	if len(c.Documents) == 1 &&
		c.Documents[0].Type == entity.DocumentTypeTable &&
		c.Documents[0].IsAppend {
		err := c.baseDocProcessor.Indexing()
		if err != nil {
			logs.CtxErrorf(c.ctx, "document indexing err:%v", err)
			return err
		}
	}
	return nil
}
