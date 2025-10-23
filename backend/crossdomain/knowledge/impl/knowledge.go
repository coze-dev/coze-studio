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
	"errors"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	"github.com/coze-dev/coze-studio/backend/infra/document/parser"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

var defaultSVC crossknowledge.Knowledge

type impl struct {
	DomainSVC service.Knowledge
}

func InitDomainService(c service.Knowledge) crossknowledge.Knowledge {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (i *impl) ListKnowledge(ctx context.Context, request *model.ListKnowledgeRequest) (response *model.ListKnowledgeResponse, err error) {
	return i.DomainSVC.ListKnowledge(ctx, request)
}

func (i *impl) Retrieve(ctx context.Context, req *model.RetrieveRequest) (*model.RetrieveResponse, error) {
	return i.DomainSVC.Retrieve(ctx, req)
}

func (i *impl) DeleteKnowledge(ctx context.Context, req *model.DeleteKnowledgeRequest) error {
	return i.DomainSVC.DeleteKnowledge(ctx, req)
}

func (i *impl) GetKnowledgeByID(ctx context.Context, request *model.GetKnowledgeByIDRequest) (response *model.GetKnowledgeByIDResponse, err error) {
	return i.DomainSVC.GetKnowledgeByID(ctx, request)
}

func (i *impl) MGetKnowledgeByID(ctx context.Context, request *model.MGetKnowledgeByIDRequest) (response *model.MGetKnowledgeByIDResponse, err error) {
	return i.DomainSVC.MGetKnowledgeByID(ctx, request)
}

func (i *impl) Store(ctx context.Context, document *model.CreateDocumentRequest) (*model.CreateDocumentResponse, error) {
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

	if document.ParsingStrategy.ParseMode == model.AccurateParseMode {
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
		Info: model.Info{
			Name: document.FileName,
		},
		KnowledgeID:      document.KnowledgeID,
		Type:             model.DocumentTypeText,
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

	response, err := i.DomainSVC.CreateDocument(ctx, &service.CreateDocumentRequest{
		Documents: []*entity.Document{req},
	})
	if err != nil {
		return nil, err
	}

	kCResponse := &model.CreateDocumentResponse{
		FileURL:    document.FileURL,
		DocumentID: response.Documents[0].Info.ID,
		FileName:   response.Documents[0].Info.Name,
	}

	return kCResponse, nil
}

func (i *impl) Delete(ctx context.Context, r *model.DeleteDocumentRequest) (*model.DeleteDocumentResponse, error) {
	if r.KnowledgeID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge id cannot be 0"))
	}

	docs, err := i.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{
		KnowledgeID: r.KnowledgeID,
		DocumentIDs: []int64{r.DocumentID},
		SelectAll:   true,
	})
	if err != nil {
		return nil, err
	}
	if len(docs.Documents) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "the specified document is not part of this knowledge base"))
	}

	err = i.DomainSVC.DeleteDocument(ctx, &service.DeleteDocumentRequest{
		DocumentID: r.DocumentID,
	})
	if err != nil {
		return &model.DeleteDocumentResponse{IsSuccess: false}, err
	}

	return &model.DeleteDocumentResponse{IsSuccess: true}, nil
}

func (i *impl) ListKnowledgeDetail(ctx context.Context, req *model.ListKnowledgeDetailRequest) (*model.ListKnowledgeDetailResponse, error) {
	response, err := i.DomainSVC.MGetKnowledgeByID(ctx, &service.MGetKnowledgeByIDRequest{
		KnowledgeIDs: req.KnowledgeIDs,
	})
	if err != nil {
		return nil, err
	}

	resp := &model.ListKnowledgeDetailResponse{
		KnowledgeDetails: slices.Transform(response.Knowledge, func(a *model.Knowledge) *model.KnowledgeDetail {
			return &model.KnowledgeDetail{
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

func toChunkType(typ model.ChunkType) (parser.ChunkType, error) {
	switch typ {
	case model.ChunkTypeDefault:
		return parser.ChunkTypeDefault, nil
	case model.ChunkTypeCustom:
		return parser.ChunkTypeCustom, nil
	case model.ChunkTypeLeveled:
		return parser.ChunkTypeLeveled, nil
	default:
		return 0, fmt.Errorf("unknown chunk type: %v", typ)
	}
}
