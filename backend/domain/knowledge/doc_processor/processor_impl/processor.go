package processor_impl

import (
	"context"
	"fmt"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/doc_processor"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/parser"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"github.com/bytedance/sonic"
	"github.com/volcengine/volc-sdk-golang/service/imagex/v2"
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

	imageX        *imagex.Imagex
	knowledgeRepo dao.KnowledgeRepo
	documentRepo  dao.KnowledgeDocumentRepo
	sliceRepo     dao.KnowledgeDocumentSliceRepo
	idgen         idgen.IDGenerator
	rdb           rdb.RDB
	producer      eventbus.Producer
	parser        parser.Parser
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
	ImageX        *imagex.Imagex
	Rdb           rdb.RDB
	Producer      eventbus.Producer
	Parser        parser.Parser
}

func NewDocProcessor(ctx context.Context, config *DocProcessorConfig) doc_processor.DocProcessor {
	baseDocProcessor := &baseDocProcessor{
		ctx:            ctx,
		UserID:         config.UserID,
		SpaceID:        config.SpaceID,
		Documents:      config.Documents,
		documentSource: &config.DocumentSource,
		knowledgeRepo:  config.KnowledgeRepo,
		documentRepo:   config.DocumentRepo,
		sliceRepo:      config.SliceRepo,
		imageX:         config.ImageX,
		idgen:          config.Idgen,
		rdb:            config.Rdb,
		producer:       config.Producer,
		parser:         config.Parser,
	}
	switch config.DocumentSource {
	case entity.DocumentSourceCustom:
		processor := &CustomDocProcessor{
			baseDocProcessor: *baseDocProcessor,
		}
		if config.Documents[0].Type == entity.DocumentTypeTable {
			processor := &CustomTableProcessor{
				baseDocProcessor: *baseDocProcessor,
			}
			return processor
		}
		return processor
	case entity.DocumentSourceLocal:
		return baseDocProcessor
	default:
		return baseDocProcessor
	}
}

const columnName = "c_%d"

func convertColumnType(columnType entity.TableColumnType) rdbEntity.DataType {
	switch columnType {
	case entity.TableColumnTypeBoolean:
		return rdbEntity.TypeBoolean
	case entity.TableColumnTypeInteger:
		return rdbEntity.TypeInt
	case entity.TableColumnTypeNumber:
		return rdbEntity.TypeFloat
	case entity.TableColumnTypeString, entity.TableColumnTypeImage:
		return rdbEntity.TypeText
	case entity.TableColumnTypeTime:
		return rdbEntity.TypeTimestamp
	default:
		return rdbEntity.TypeText
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
			ID:          ids[i],
			KnowledgeID: p.Documents[i].KnowledgeID,
			Name:        p.Documents[i].Name,
			Type:        p.Documents[i].FilenameExtension,
			URI:         p.Documents[i].URI,
			CreatorID:   p.UserID,
			SpaceID:     p.SpaceID,
			SourceType:  0,
			Status:      int32(entity.KnowledgeStatusInit),
			ParseRule: &model.DocumentParseRule{
				ParsingStrategy:  p.Documents[i].ParsingStrategy,
				ChunkingStrategy: p.Documents[i].ChunkingStrategy,
			},
		}
		if p.Documents[i].Type == entity.DocumentTypeTable {
			docModel.TableInfo = &entity.TableInfo{
				VirtualTableName:  p.Documents[i].Name,
				PhysicalTableName: p.TableName,
				TableDesc:         p.Documents[i].Description,
				Columns:           p.Documents[i].TableInfo.Columns,
			}
		}
		p.docModels = append(p.docModels, docModel)
	}

	return nil
}

func (p *baseDocProcessor) InsertDBModel() error {

	var err error
	ctx := p.ctx
	tx, err := p.knowledgeRepo.InitTx()
	if err != nil {
		logs.CtxErrorf(ctx, "init tx failed, err: %v", err)
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			if p.TableName != "" {
				p.deleteTable()
			}
		} else {
			tx.Commit()
		}
	}()
	if len(p.Documents) == 1 && p.Documents[0].Type == entity.DocumentTypeTable {
		err = p.createTable()
		if err != nil {
			logs.CtxErrorf(ctx, "create table failed, err: %v", err)
			return err
		}
	}
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
				Name:     fmt.Sprintf(columnName, columnIDs[i]),
				DataType: convertColumnType(p.Documents[0].TableInfo.Columns[i].Type),
				NotNull:  false,
			})
		}
		p.Documents[0].TableInfo.Columns = append(p.Documents[0].TableInfo.Columns, &entity.TableColumn{
			ID:          columnIDs[len(columnIDs)-1],
			Name:        "id",
			Type:        entity.TableColumnTypeInteger,
			Description: "主键ID",
			Indexing:    false,
			Sequence:    -1, // todo 这里没什么用
		})
		// 为每个表格增加个主键ID
		columns = append(columns, &rdbEntity.Column{
			Name:     "id",
			DataType: rdbEntity.TypeInt,
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
						Columns: []string{"id"},
					},
				},
			},
		})
		if err != nil {
			logs.CtxErrorf(p.ctx, "create table failed, err: %v", err)
			return err
		}
		p.TableName = resp.Table.Name
		p.docModels[0].TableInfo.PhysicalTableName = resp.Table.Name
	}
	return nil
}
func (p *baseDocProcessor) deleteTable() error {
	if len(p.Documents) == 1 && p.Documents[0].Type == entity.DocumentTypeTable {
		_, err := p.rdb.DropTable(p.ctx, &rdb.DropTableRequest{
			TableName: p.TableName,
			IfExists:  true,
		})
		if err != nil {
			logs.CtxErrorf(p.ctx, "drop table failed, err: %v", err)
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

func (c *CustomDocProcessor) BeforeCreate() error {
	// 这种自定义文档一般不存在批量的情况
	// todo 上传文档存储并返回uri，回写到Documents里，等待提供接口中
	return nil
}

func (c *CustomTableProcessor) BuildDBModel() error {
	if len(c.Documents) == 1 && c.Documents[0].Type == entity.DocumentTypeTable {
		if c.Documents[0].IsAppend {
			// 追加场景，不需要创建表了
			// 一是用户自定义一些数据、二是再上传一个表格，把表格里的数据追加到表格中
		} else {
			c.baseDocProcessor.BuildDBModel()
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
		err := c.documentRepo.SetStatus(c.ctx, c.Documents[0].ID, int32(entity.DocumentStatusChunking), "")
		if err != nil {
			logs.CtxErrorf(c.ctx, "document set status err:%v", err)
			return err
		}
	} else {
		err := c.baseDocProcessor.InsertDBModel()
		if err != nil {
			logs.CtxErrorf(c.ctx, "document insert err:%v", err)
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
