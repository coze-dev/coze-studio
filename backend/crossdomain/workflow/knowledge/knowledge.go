package knowledge

import (
	"context"
	"errors"
	"fmt"

	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	domainknowledge "code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
)

type Knowledge struct {
	client domainknowledge.Knowledge
}

func NewKnowledgeRepository(client domainknowledge.Knowledge) *Knowledge {
	return &Knowledge{
		client: client,
	}
}

func (k *Knowledge) Store(ctx context.Context, document *crossknowledge.CreateDocumentRequest) (*crossknowledge.CreateDocumentResponse, error) {

	var (
		ps *entity.ParsingStrategy
		cs = &entity.ChunkingStrategy{}
	)

	if document.ParsingStrategy == nil {
		return nil, errors.New("document parsing strategy is required")
	}

	if document.ChunkingStrategy == nil {
		return nil, errors.New("document chunking strategy is required")
	}

	if document.ParsingStrategy.ParseMode == crossknowledge.AccurateParseMode {
		ps = &entity.ParsingStrategy{}
		ps.ExtractImage = document.ParsingStrategy.ExtractImage
		ps.ExtractTable = document.ParsingStrategy.ExtractTable
		ps.ImageOCR = document.ParsingStrategy.ImageOCR
	}

	chunkType, err := toChunkType(document.ChunkingStrategy.ChunkType)
	if err != nil {
		return nil, err
	}
	cs.ChunkType = chunkType
	cs.Separator = document.ChunkingStrategy.Separator
	cs.ChunkSize = document.ChunkingStrategy.ChunkSize
	cs.Overlap = document.ChunkingStrategy.Overlap

	req := &entity.Document{
		Info: common.Info{
			Name: document.FileName,
		},
		KnowledgeID:      document.KnowledgeID,
		Type:             entity.DocumentTypeText,
		URL:              document.FileURL,
		Source:           entity.DocumentSourceLocal,
		ParsingStrategy:  ps,
		ChunkingStrategy: cs,
		FileExtension:    document.FileExtension,
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid != nil {
		req.Info.CreatorID = *uid
	}

	response, err := k.client.CreateDocument(ctx, &domainknowledge.CreateDocumentRequest{
		Documents: []*entity.Document{req},
	})
	if err != nil {
		return nil, err
	}

	kCResponse := &crossknowledge.CreateDocumentResponse{
		FileURL:    document.FileURL,
		DocumentID: response.Documents[0].Info.ID,
		FileName:   response.Documents[0].Info.Name,
	}

	return kCResponse, nil
}

func (k *Knowledge) Retrieve(ctx context.Context, r *crossknowledge.RetrieveRequest) (*crossknowledge.RetrieveResponse, error) {

	rs := &entity.RetrievalStrategy{}
	if r.RetrievalStrategy != nil {
		rs.TopK = r.RetrievalStrategy.TopK
		rs.MinScore = r.RetrievalStrategy.MinScore
		searchType, err := toSearchType(r.RetrievalStrategy.SearchType)
		if err != nil {
			return nil, err
		}
		rs.SearchType = searchType
		rs.EnableQueryRewrite = r.RetrievalStrategy.EnableQueryRewrite
		rs.EnableRerank = r.RetrievalStrategy.EnableRerank
		rs.EnableNL2SQL = r.RetrievalStrategy.EnableNL2SQL
	}

	req := &domainknowledge.RetrieveRequest{
		Query:        r.Query,
		KnowledgeIDs: r.KnowledgeIDs,
		Strategy:     rs,
	}

	response, err := k.client.Retrieve(ctx, req)
	if err != nil {
		return nil, err
	}

	data := make([]map[string]any, 0)
	for _, s := range response.RetrieveSlices {
		if s.Slice == nil {
			continue
		}
		data = append(data, map[string]any{
			"output": s.Slice.GetSliceContent(),
		})

	}

	return &crossknowledge.RetrieveResponse{
		RetrieveData: data,
	}, nil
}

func toSearchType(typ crossknowledge.SearchType) (entity.SearchType, error) {
	switch typ {
	case crossknowledge.SearchTypeSemantic:
		return entity.SearchTypeSemantic, nil
	case crossknowledge.SearchTypeFullText:
		return entity.SearchTypeFullText, nil
	case crossknowledge.SearchTypeHybrid:
		return entity.SearchTypeHybrid, nil
	default:
		return 0, fmt.Errorf("unknown search type: %v", typ)
	}
}

func toChunkType(typ crossknowledge.ChunkType) (parser.ChunkType, error) {
	switch typ {
	case crossknowledge.ChunkTypeDefault:
		return parser.ChunkTypeDefault, nil
	case crossknowledge.ChunkTypeCustom:
		return parser.ChunkTypeCustom, nil
	case crossknowledge.ChunkTypeLeveled:
		return parser.ChunkTypeLeveled, nil
	default:
		return 0, fmt.Errorf("unknown chunk type: %v", typ)
	}
}
