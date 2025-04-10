package knowledge

import (
	"context"
	"errors"
	"fmt"

	domainknowledge "code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes/knowledge"
)

type Knowledge struct {
	client domainknowledge.Knowledge
}

func (k *Knowledge) CreateDocument(ctx context.Context, document *knowledge.CreateDocumentRequest) (*knowledge.CreateDocumentResponse, error) {

	var ps *entity.ParsingStrategy
	var cs *entity.ChunkingStrategy
	if document.ParsingStrategy == nil {
		return nil, errors.New("document parsing strategy is required")
	}

	if document.ChunkingStrategy == nil {
		return nil, errors.New("document chunking strategy is required")
	}

	if document.ParsingStrategy.ParseMode == knowledge.AccurateParseMode {
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
		KnowledgeID:      document.KnowledgeID,
		Type:             entity.DocumentTypeText,
		URI:              document.FileURI,
		Source:           entity.DocumentSourceLocal,
		ParsingStrategy:  ps,
		ChunkingStrategy: cs,
	}

	response, err := k.client.CreateDocument(ctx, req)
	if err != nil {
		return nil, err
	}

	kCResponse := &knowledge.CreateDocumentResponse{
		FileURL:    document.FileURI,
		DocumentID: response.Info.ID,
		FileName:   response.Info.Name,
	}

	return kCResponse, nil
}

func (k *Knowledge) Retrieve(ctx context.Context, r *knowledge.RetrieveRequest) (*knowledge.RetrieveResponse, error) {

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
	for _, s := range response {
		if s.Slice == nil {
			continue
		}
		data = append(data, map[string]any{
			"output": s.Slice.PlainText,
		})

	}

	return &knowledge.RetrieveResponse{
		RetrieveData: data,
	}, nil
}

func toSearchType(typ knowledge.SearchType) (entity.SearchType, error) {
	switch typ {
	case knowledge.SearchTypeSemantic:
		return entity.SearchTypeSemantic, nil
	case knowledge.SearchTypeFullText:
		return entity.SearchTypeFullText, nil
	case knowledge.SearchTypeHybrid:
		return entity.SearchTypeHybrid, nil
	default:
		return 0, fmt.Errorf("unknown search type: %v", typ)
	}
}

func toChunkType(typ knowledge.ChunkType) (entity.ChunkType, error) {
	switch typ {
	case knowledge.ChunkTypeDefault:
		return entity.ChunkTypeDefault, nil
	case knowledge.ChunkTypeCustom:
		return entity.ChunkTypeCustom, nil
	case knowledge.ChunkTypeLeveled:
		return entity.ChunkTypeLeveled, nil
	default:
		return 0, fmt.Errorf("unknown chunk type: %v", typ)
	}
}
