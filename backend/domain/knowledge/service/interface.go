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

package service

import (
	"context"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/sets"
)

type Knowledge interface {
	CreateKnowledge(ctx context.Context, request *CreateKnowledgeRequest) (response *CreateKnowledgeResponse, err error)
	UpdateKnowledge(ctx context.Context, request *UpdateKnowledgeRequest) error
	DeleteKnowledge(ctx context.Context, request *DeleteKnowledgeRequest) error
	CopyKnowledge(ctx context.Context, request *CopyKnowledgeRequest) (*CopyKnowledgeResponse, error)
	MoveKnowledgeToLibrary(ctx context.Context, request *MoveKnowledgeToLibraryRequest) error
	ListKnowledge(ctx context.Context, request *ListKnowledgeRequest) (response *ListKnowledgeResponse, err error)
	GetKnowledgeByID(ctx context.Context, request *GetKnowledgeByIDRequest) (response *GetKnowledgeByIDResponse, err error)
	MGetKnowledgeByID(ctx context.Context, request *MGetKnowledgeByIDRequest) (response *MGetKnowledgeByIDResponse, err error)

	CreateDocument(ctx context.Context, request *CreateDocumentRequest) (response *CreateDocumentResponse, err error)
	UpdateDocument(ctx context.Context, request *UpdateDocumentRequest) error
	DeleteDocument(ctx context.Context, request *DeleteDocumentRequest) error
	ExtractPhotoCaption(ctx context.Context, request *ExtractPhotoCaptionRequest) (response *ExtractPhotoCaptionResponse, err error)
	ListDocument(ctx context.Context, request *ListDocumentRequest) (response *ListDocumentResponse, err error)
	MGetDocumentProgress(ctx context.Context, request *MGetDocumentProgressRequest) (response *MGetDocumentProgressResponse, err error)
	ResegmentDocument(ctx context.Context, request *ResegmentDocumentRequest) (response *ResegmentDocumentResponse, err error)
	GetAlterTableSchema(ctx context.Context, request *AlterTableSchemaRequest) (response *TableSchemaResponse, err error)
	ValidateTableSchema(ctx context.Context, request *ValidateTableSchemaRequest) (response *ValidateTableSchemaResponse, err error)
	GetDocumentTableInfo(ctx context.Context, request *GetDocumentTableInfoRequest) (response *GetDocumentTableInfoResponse, err error)
	GetImportDataTableSchema(ctx context.Context, request *ImportDataTableSchemaRequest) (response *TableSchemaResponse, err error)

	CreateSlice(ctx context.Context, request *CreateSliceRequest) (response *CreateSliceResponse, err error)
	UpdateSlice(ctx context.Context, request *UpdateSliceRequest) error
	DeleteSlice(ctx context.Context, request *DeleteSliceRequest) error
	ListSlice(ctx context.Context, request *ListSliceRequest) (response *ListSliceResponse, err error)
	ListPhotoSlice(ctx context.Context, request *ListPhotoSliceRequest) (response *ListPhotoSliceResponse, err error)
	GetSlice(ctx context.Context, request *GetSliceRequest) (response *GetSliceResponse, err error)
	Retrieve(ctx context.Context, request *RetrieveRequest) (response *RetrieveResponse, err error)
	CreateDocumentReview(ctx context.Context, request *CreateDocumentReviewRequest) (response *CreateDocumentReviewResponse, err error)
	MGetDocumentReview(ctx context.Context, request *MGetDocumentReviewRequest) (response *MGetDocumentReviewResponse, err error)
	SaveDocumentReview(ctx context.Context, request *SaveDocumentReviewRequest) error
}

type CreateKnowledgeRequest struct {
	Name        string
	Description string
	CreatorID   int64
	SpaceID     int64
	IconUri     string
	FormatType  knowledge.DocumentType
	AppID       int64
}

type CreateKnowledgeResponse struct {
	KnowledgeID int64
	CreatedAtMs int64
}

type UpdateKnowledgeRequest struct {
	KnowledgeID int64
	Name        *string
	IconUri     *string
	Description *string
	Status      *knowledge.KnowledgeStatus
}

type CreateDocumentRequest struct {
	Documents []*entity.Document
}

type UpdateDocumentRequest struct {
	DocumentID   int64
	DocumentName *string
	TableInfo    *entity.TableInfo
}

type DeleteDocumentRequest struct {
	DocumentID int64
}

type MGetDocumentProgressRequest struct {
	DocumentIDs []int64
}

type MGetDocumentProgressResponse struct {
	ProgressList []*DocumentProgress
}

type CreateSliceRequest struct {
	DocumentID int64
	CreatorID  int64
	Position   int64
	RawContent []*knowledge.SliceContent
}
type CreateSliceResponse struct {
	SliceID int64
}

type UpdateSliceRequest struct {
	SliceID    int64
	DocumentID int64
	CreatorID  int64
	RawContent []*knowledge.SliceContent
}

type GetSliceRequest struct {
	SliceID int64
}
type GetSliceResponse struct {
	Slice *entity.Slice
}
type DeleteSliceRequest struct {
	SliceID int64
}

type ListKnowledgeRequest = knowledge.ListKnowledgeRequest

type RetrieveResponse = knowledge.RetrieveResponse

type ListKnowledgeResponse = knowledge.ListKnowledgeResponse

type DeleteKnowledgeRequest = knowledge.DeleteKnowledgeRequest

type CreateDocumentResponse struct {
	Documents []*entity.Document
}

type ListDocumentRequest struct {
	KnowledgeID int64
	DocumentIDs []int64
	Limit       *int
	Offset      *int
	Cursor      *string
	SelectAll   bool
}

type ListDocumentResponse struct {
	Documents  []*entity.Document
	Total      int64
	HasMore    bool
	NextCursor *string
}

type DocumentProgress struct {
	ID            int64
	Name          string
	Size          int64
	FileExtension string
	Progress      int
	Status        entity.DocumentStatus
	StatusMsg     string
	RemainingSec  int64
	URL           string
}

type ResegmentDocumentRequest struct {
	DocumentID       int64
	ParsingStrategy  *entity.ParsingStrategy
	ChunkingStrategy *entity.ChunkingStrategy
}
type ResegmentDocumentResponse struct {
	Document *entity.Document
}
type ListSliceRequest struct {
	KnowledgeID *int64
	DocumentID  *int64
	Keyword     *string
	Sequence    int64
	Offset      int64
	Limit       int64
}

type ListSliceResponse struct {
	Slices     []*entity.Slice
	Total      int
	HasMore    bool
	NextCursor *string
}

type RetrieveRequest = knowledge.RetrieveRequest

type RetrieveContext struct {
	Ctx              context.Context
	OriginQuery      string                   // Original query
	RewrittenQuery   *string                  // The rewritten query, if not rewritten, is nil, which will be added during execution
	ChatHistory      []*schema.Message        // Nil if there is no dialogue history or no history is required
	KnowledgeIDs     sets.Set[int64]          // The knowledge base ID involved in this search
	KnowledgeInfoMap map[int64]*KnowledgeInfo // Mapping of Knowledge Base IDs to Document IDs
	// recall strategy
	Strategy *entity.RetrievalStrategy
	// Retrieve the document information involved
	Documents []*model.KnowledgeDocument
	// A chat model for nl2sql and message to query
	ChatModel chatmodel.BaseChatModel
}

type KnowledgeInfo struct {
	DocumentIDs  []int64
	DocumentType knowledge.DocumentType
	TableColumns []*entity.TableColumn
}
type AlterTableSchemaRequest struct {
	DocumentID       int64
	TableDataType    TableDataType
	OriginTableMeta  []*entity.TableColumn
	PreviewTableMeta []*entity.TableColumn
}

type ImportDataTableSchemaRequest struct {
	// parse source data
	SourceInfo    TableSourceInfo
	TableSheet    *entity.TableSheet
	TableDataType TableDataType

	// DocumentID would be nil if is first time import
	DocumentID *int64

	// OriginTableMeta and PreviewTableMeta is not nil only in first time import
	OriginTableMeta  []*entity.TableColumn
	PreviewTableMeta []*entity.TableColumn
}

type TableSchemaResponse struct {
	Code           int32
	Msg            string
	TableSheet     *entity.TableSheet       // sheet detail
	AllTableSheets []*entity.TableSheet     // all sheets, len >= 1 when file type is xlsx
	TableMeta      []*entity.TableColumn    // columns
	PreviewData    [][]*document.ColumnData // rows: index -> value
}

type TableDataType int32

const (
	AllData     TableDataType = 0 // Schema sheets and preview data
	OnlySchema  TableDataType = 1 // Only need schema structure & Sheets
	OnlyPreview TableDataType = 2 // Just preview the data
)

type GetDocumentTableInfoRequest struct {
	DocumentID *int64
	SourceInfo *TableSourceInfo
}

type GetDocumentTableInfoResponse struct {
	Code        int32
	Msg         string
	TableSheet  []*entity.TableSheet
	TableMeta   map[string][]*entity.TableColumn // table sheet index -> columns
	PreviewData map[string][]map[string]string   // table sheet index -> rows : sequence -> value
}

type TableSourceInfo struct {
	// FileType table file type, required when using Uri or FileBase64
	FileType *string
	// Uri table from uri
	Uri *string
	// FileBase64 table from base64
	FileBase64 *string
	// CustomContent table from raw content
	// rows: column name -> value
	CustomContent []map[string]string
}

type ValidateTableSchemaRequest struct {
	DocumentID int64
	SourceInfo TableSourceInfo
	TableSheet *entity.TableSheet
}

type ValidateTableSchemaResponse struct {
	ColumnValidResult map[string]string // column name -> validate result
}
type CreateDocumentReviewRequest struct {
	KnowledgeID     int64
	Reviews         []*ReviewInput
	ChunkStrategy   *entity.ChunkingStrategy
	ParsingStrategy *entity.ParsingStrategy
}

type ReviewInput struct {
	DocumentName string `thrift:"document_name,1" frugal:"1,default,string" json:"document_name"`
	DocumentType string `thrift:"document_type,2" frugal:"2,default,string" json:"document_type"`
	TosUri       string `thrift:"tos_uri,3" frugal:"3,default,string" json:"tos_uri"`
	DocumentID   *int64 `thrift:"document_id,4,optional" frugal:"4,optional,i64" json:"document_id,omitempty"`
}

type SaveDocumentReviewRequest struct {
	KnowledgeID int64
	ReviewID    int64
	DocTreeJson string
}

type CreateDocumentReviewResponse struct {
	Reviews []*entity.Review
}

type MGetDocumentReviewRequest struct {
	KnowledgeID int64
	ReviewIDs   []int64
}

type MGetDocumentReviewResponse struct {
	Reviews []*entity.Review
}

type CopyKnowledgeRequest = knowledge.CopyKnowledgeRequest
type CopyKnowledgeResponse = knowledge.CopyKnowledgeResponse

type MoveKnowledgeToLibraryRequest = knowledge.MoveKnowledgeToLibraryRequest

type GetKnowledgeByIDRequest = knowledge.GetKnowledgeByIDRequest
type GetKnowledgeByIDResponse = knowledge.GetKnowledgeByIDResponse

type ListPhotoSliceRequest struct {
	KnowledgeID int64
	DocumentIDs []int64
	Limit       *int
	Offset      *int
	HasCaption  *bool
}
type ListPhotoSliceResponse struct {
	Slices []*entity.Slice
	Total  int
}

type ExtractPhotoCaptionRequest struct {
	DocumentID int64
}

type ExtractPhotoCaptionResponse struct {
	Caption string
}
type MGetKnowledgeByIDRequest = knowledge.MGetKnowledgeByIDRequest
type MGetKnowledgeByIDResponse = knowledge.MGetKnowledgeByIDResponse
