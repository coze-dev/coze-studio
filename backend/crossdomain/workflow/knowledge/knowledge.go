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

package knowledge

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	domainknowledge "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	crossknowledge "github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type Knowledge struct {
	client domainknowledge.Knowledge
	idGen  idgen.IDGenerator
}

func NewKnowledgeRepository(client domainknowledge.Knowledge, idGen idgen.IDGenerator) *Knowledge {
	return &Knowledge{
		client: client,
		idGen:  idGen,
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
		Info: knowledge.Info{
			Name: document.FileName,
		},
		KnowledgeID:      document.KnowledgeID,
		Type:             knowledge.DocumentTypeText,
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

	ss := make([]*crossknowledge.Slice, 0, len(response.RetrieveSlices))
	for _, s := range response.RetrieveSlices {
		if s.Slice == nil {
			continue
		}
		ss = append(ss, &crossknowledge.Slice{
			DocumentID: strconv.FormatInt(s.Slice.DocumentID, 10),
			Output:     s.Slice.GetSliceContent(),
		})

	}

	return &crossknowledge.RetrieveResponse{
		Slices: ss,
	}, nil
}

func (k *Knowledge) Delete(ctx context.Context, r *crossknowledge.DeleteDocumentRequest) (*crossknowledge.DeleteDocumentResponse, error) {
	docID, err := strconv.ParseInt(r.DocumentID, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid document id: %s", r.DocumentID)
	}

	err = k.client.DeleteDocument(ctx, &domainknowledge.DeleteDocumentRequest{
		DocumentID: docID,
	})
	if err != nil {
		return &crossknowledge.DeleteDocumentResponse{IsSuccess: false}, err
	}

	return &crossknowledge.DeleteDocumentResponse{IsSuccess: true}, nil
}

func (k *Knowledge) ListKnowledgeDetail(ctx context.Context, req *crossknowledge.ListKnowledgeDetailRequest) (*crossknowledge.ListKnowledgeDetailResponse, error) {
	response, err := k.client.MGetKnowledgeByID(ctx, &domainknowledge.MGetKnowledgeByIDRequest{
		KnowledgeIDs: req.KnowledgeIDs,
	})
	if err != nil {
		return nil, err
	}

	resp := &crossknowledge.ListKnowledgeDetailResponse{
		KnowledgeDetails: slices.Transform(response.Knowledge, func(a *knowledge.Knowledge) *crossknowledge.KnowledgeDetail {
			return &crossknowledge.KnowledgeDetail{
				ID:          a.ID,
				Name:        a.Name,
				Description: a.Description,
				IconURL:     a.IconURL,
				FormatType:  int64(a.Type),
			}
		}),
	}

	return resp, nil
}

func toSearchType(typ crossknowledge.SearchType) (knowledge.SearchType, error) {
	switch typ {
	case crossknowledge.SearchTypeSemantic:
		return knowledge.SearchTypeSemantic, nil
	case crossknowledge.SearchTypeFullText:
		return knowledge.SearchTypeFullText, nil
	case crossknowledge.SearchTypeHybrid:
		return knowledge.SearchTypeHybrid, nil
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
