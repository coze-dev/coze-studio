package knowledge

import (
	"context"
	"errors"
	"fmt"

	domainknowledge "code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	crossknowledge "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
)

type Knowledge struct {
	client domainknowledge.Knowledge
}

func NewKnowledgeRepository() (*Knowledge, error) {
	// todo new default knowledge repository
	return &Knowledge{}, nil
}

func (k *Knowledge) Store(ctx context.Context, document *crossknowledge.CreateDocumentRequest) (*crossknowledge.CreateDocumentResponse, error) {

	var ps *entity.ParsingStrategy
	var cs *entity.ChunkingStrategy
	if document.ParsingStrategy == nil {
		return nil, errors.New("document parsing strategy is required")
	}

	if document.ChunkingStrategy == nil {
		return nil, errors.New("document chunking strategy is required")
	}

	if document.ParsingStrategy.ParseMode == crossknowledge.AccurateParseMode {
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

	response, err := k.client.CreateDocument(ctx, []*entity.Document{req})
	if err != nil {
		return nil, err
	}

	kCResponse := &crossknowledge.CreateDocumentResponse{
		FileURL:    document.FileURI,
		DocumentID: response[0].Info.ID,
		FileName:   response[0].Info.Name,
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
	for _, s := range response {
		if s.Slice == nil {
			continue
		}
		data = append(data, map[string]any{
			"output": s.Slice.PlainText,
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

func toChunkType(typ crossknowledge.ChunkType) (entity.ChunkType, error) {
	switch typ {
	case crossknowledge.ChunkTypeDefault:
		return entity.ChunkTypeDefault, nil
	case crossknowledge.ChunkTypeCustom:
		return entity.ChunkTypeCustom, nil
	case crossknowledge.ChunkTypeLeveled:
		return entity.ChunkTypeLeveled, nil
	default:
		return 0, fmt.Errorf("unknown chunk type: %v", typ)
	}
}
