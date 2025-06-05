package impl

import (
	"context"
	"fmt"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/events"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/infra/contract/rdb/entity"
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
			Status:        int32(knowledge.KnowledgeStatusInit),
			ParseRule: &model.DocumentParseRule{
				ParsingStrategy:  p.Documents[i].ParsingStrategy,
				ChunkingStrategy: p.Documents[i].ChunkingStrategy,
			},
			CreatedAt: time.Now().UnixMilli(),
			UpdatedAt: time.Now().UnixMilli(),
		}
		p.Documents[i].ID = docModel.ID
		p.docModels = append(p.docModels, docModel)
	}

	return nil
}

func (p *baseDocProcessor) InsertDBModel() (err error) {
	ctx := p.ctx

	if !isTableAppend(p.Documents) {
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
		"updated_at": time.Now().UnixMilli(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return err
	}
	return nil
}

func (p *baseDocProcessor) createTable() error {
	if len(p.Documents) == 1 && p.Documents[0].Type == knowledge.DocumentTypeTable {
		// 表格型知识库，创建表
		rdbColumns := []*rdbEntity.Column{}
		tableColumns := p.Documents[0].TableInfo.Columns
		columnIDs, err := p.idgen.GenMultiIDs(p.ctx, len(tableColumns)+1)
		if err != nil {
			return err
		}
		for i := range tableColumns {
			tableColumns[i].ID = columnIDs[i]
			rdbColumns = append(rdbColumns, &rdbEntity.Column{
				Name:     convert.ColumnIDToRDBField(columnIDs[i]),
				DataType: convert.ConvertColumnType(tableColumns[i].Type),
				NotNull:  tableColumns[i].Indexing,
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
		rdbColumns = append(rdbColumns, &rdbEntity.Column{
			Name:     consts.RDBFieldID,
			DataType: rdbEntity.TypeBigInt,
			NotNull:  true,
		})
		// 创建一个数据表
		resp, err := p.rdb.CreateTable(p.ctx, &rdb.CreateTableRequest{
			Table: &rdbEntity.Table{
				Columns: rdbColumns,
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
	if len(p.Documents) == 1 && p.Documents[0].Type == knowledge.DocumentTypeTable {
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
	event := events.NewIndexDocumentsEvent(p.Documents[0].KnowledgeID, p.Documents)
	body, err := sonic.Marshal(event)
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
