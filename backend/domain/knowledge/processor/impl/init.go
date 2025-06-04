package impl

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/processor"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

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
		p = &customDocProcessor{
			baseDocProcessor: *base,
		}
		if config.Documents[0].Type == knowledge.DocumentTypeTable {
			p = &customTableProcessor{
				baseDocProcessor: *base,
			}
		}
		return p
	case entity.DocumentSourceLocal:
		if config.Documents[0].Type == knowledge.DocumentTypeTable {
			return &localTableProcessor{
				baseDocProcessor: *base,
			}
		}
		return base
	default:
		return base
	}
}
