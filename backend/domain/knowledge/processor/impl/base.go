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

package impl

import (
	"context"
	"time"

	"github.com/bytedance/sonic"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/events"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	rdbEntity "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type baseDocProcessor struct {
	ctx            context.Context
	UserID         int64
	SpaceID        int64
	Documents      []*entity.Document
	documentSource *entity.DocumentSource

	// Drop DB model
	TableName string
	docModels []*model.KnowledgeDocument

	storage       storage.Storage
	knowledgeRepo repository.KnowledgeRepo
	documentRepo  repository.KnowledgeDocumentRepo
	sliceRepo     repository.KnowledgeDocumentSliceRepo
	idgen         idgen.IDGenerator
	rdb           rdb.RDB
	producer      eventbus.Producer
	parseManager  parser.Manager
}

func (p *baseDocProcessor) BeforeCreate() error {
	// Pull data from a data source
	return nil
}

func (p *baseDocProcessor) BuildDBModel() error {
	p.docModels = make([]*model.KnowledgeDocument, 0, len(p.Documents))
	ids, err := p.idgen.GenMultiIDs(p.ctx, len(p.Documents))
	if err != nil {
		logs.CtxErrorf(p.ctx, "gen ids failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeIDGenCode)
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
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
		}
	}

	tx, err := p.knowledgeRepo.InitTx()
	if err != nil {
		logs.CtxErrorf(ctx, "init tx failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	defer func() {
		if e := recover(); e != nil {
			logs.CtxErrorf(ctx, "panic: %v", e)
			err = errorx.New(errno.ErrKnowledgeSystemCode, errorx.KVf("msg", "panic: %v", e))
			tx.Rollback()
			return
		}
		if err != nil {
			logs.CtxErrorf(ctx, "InsertDBModel err: %v", err)
			tx.Rollback()
			if p.TableName != "" {
				deleteErr := p.deleteTable()
				if deleteErr != nil {
					logs.CtxErrorf(ctx, "delete table failed, err: %v", deleteErr)
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
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	err = p.knowledgeRepo.UpdateWithTx(ctx, tx, p.Documents[0].KnowledgeID, map[string]interface{}{
		"updated_at": time.Now().UnixMilli(),
	})
	if err != nil {
		logs.CtxErrorf(ctx, "update knowledge failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (p *baseDocProcessor) createTable() error {
	if len(p.Documents) == 1 && p.Documents[0].Type == knowledge.DocumentTypeTable {
		// Tabular knowledge base, creating tables
		rdbColumns := []*rdbEntity.Column{}
		tableColumns := p.Documents[0].TableInfo.Columns
		columnIDs, err := p.idgen.GenMultiIDs(p.ctx, len(tableColumns)+1)
		if err != nil {
			logs.CtxErrorf(p.ctx, "gen ids failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeIDGenCode)
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
		// Add a primary key ID to each table
		rdbColumns = append(rdbColumns, &rdbEntity.Column{
			Name:     consts.RDBFieldID,
			DataType: rdbEntity.TypeBigInt,
			NotNull:  true,
		})
		// Create a data table
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
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
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
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
		}
	}
	return nil
}

func (p *baseDocProcessor) Indexing() error {
	event := events.NewIndexDocumentsEvent(p.Documents[0].KnowledgeID, p.Documents)
	body, err := sonic.Marshal(event)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", err.Error()))
	}

	if err = p.producer.Send(p.ctx, body); err != nil {
		logs.CtxErrorf(p.ctx, "send message failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (p *baseDocProcessor) GetResp() []*entity.Document {
	return p.Documents
}
