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
	"github.com/bytedance/sonic"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type ListKnowledgeRequest struct {
	IDs        []int64
	SpaceID    *int64
	AppID      *int64
	Name       *string // Exact match
	Status     []int32
	UserID     *int64
	Query      *string // fuzzy match
	Page       *int
	PageSize   *int
	Order      *Order
	OrderType  *OrderType
	FormatType *DocumentType
}

type Order int32

const (
	OrderCreatedAt Order = 1
	OrderUpdatedAt Order = 2
)

type OrderType int32

const (
	OrderTypeAsc  OrderType = 1
	OrderTypeDesc OrderType = 2
)

type DocumentType int64

const (
	DocumentTypeText    DocumentType = 0 // Text
	DocumentTypeTable   DocumentType = 1 // table
	DocumentTypeImage   DocumentType = 2 // image
	DocumentTypeUnknown DocumentType = 9 // unknown
)

type ListKnowledgeResponse struct {
	KnowledgeList []*Knowledge
	Total         int64
}

type Knowledge struct {
	Info
	SliceHit int64
	Type     DocumentType
	Status   KnowledgeStatus
}

type Info struct {
	ID          int64
	Name        string
	Description string
	IconURI     string
	IconURL     string
	CreatorID   int64
	SpaceID     int64
	AppID       int64
	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64
}

type KnowledgeStatus int64

const (
	KnowledgeStatusInit    KnowledgeStatus = 0
	KnowledgeStatusEnable  KnowledgeStatus = 1
	KnowledgeStatusDisable KnowledgeStatus = 3
)

type RetrieveRequest struct {
	Query       string
	ChatHistory []*schema.Message

	// Recall from the specified knowledge base and documentation
	KnowledgeIDs []int64
	DocumentIDs  []int64 // TODO: Confirm the scene

	// recall strategy
	Strategy *RetrievalStrategy

	// Chat model config for nl2sql and message to query
	ChatModelProtocol *chatmodel.Protocol
	ChatModelConfig   *chatmodel.Config
}

type RetrievalStrategy struct {
	TopK      *int64   // 1-10 default 3
	MinScore  *float64 // 0.01-0.99 default 0.5
	MaxTokens *int64

	SelectType         SelectType // call method
	SearchType         SearchType // search strategy
	EnableQueryRewrite bool
	EnableRerank       bool
	EnableNL2SQL       bool
}

type SelectType int64

const (
	SelectTypeAuto     = 0 // automatic call
	SelectTypeOnDemand = 1 // call on demand
)

type SearchType int64

const (
	SearchTypeSemantic SearchType = 0 // semantics
	SearchTypeFullText SearchType = 1 // full text
	SearchTypeHybrid   SearchType = 2 // mix
)

type RetrieveResponse struct {
	RetrieveSlices []*RetrieveSlice
}

type RetrieveSlice struct {
	Slice *Slice
	Score float64
}

type Slice struct {
	Info

	KnowledgeID  int64
	DocumentID   int64
	DocumentName string
	RawContent   []*SliceContent
	SliceStatus  SliceStatus
	ByteCount    int64 // Sliced bytes
	CharCount    int64 // number of sliced characters
	Sequence     int64 // Slicing position serial number
	Hit          int64 // hit count
	Extra        map[string]string
}

func (s *Slice) GetSliceContent() string {
	if len(s.RawContent) == 0 {
		return ""
	}
	if s.RawContent[0].Type == SliceContentTypeTable {
		contentMap := map[string]string{}
		for _, column := range s.RawContent[0].Table.Columns {
			contentMap[column.ColumnName] = column.GetStringValue()
		}
		byteData, err := sonic.Marshal(contentMap)
		if err != nil {
			return ""
		}
		return string(byteData)
	}
	data := ""
	for i := range s.RawContent {
		item := s.RawContent[i]
		if item == nil {
			continue
		}
		if item.Type == SliceContentTypeTable {
			contentMap := make(map[string]string)
			for _, column := range s.RawContent[0].Table.Columns {
				contentMap[column.ColumnName] = column.GetStringValue()
			}
			byteData, err := sonic.Marshal(contentMap)
			if err != nil {
				return ""
			}
			data += string(byteData)
		}
		if item.Type == SliceContentTypeText {
			data += ptr.From(item.Text)
		}
	}
	return data
}

type SliceContent struct {
	Type SliceContentType

	Text  *string
	Image *SliceImage
	Table *SliceTable
}

type SliceStatus int64

const (
	SliceStatusInit        SliceStatus = 0 // initialization
	SliceStatusFinishStore SliceStatus = 1 // searchStore storage complete
	SliceStatusFailed      SliceStatus = 9 // fail
)

type SliceContentType int64

const (
	SliceContentTypeText SliceContentType = 0
	//SliceContentTypeImage SliceContentType = 1
	SliceContentTypeTable SliceContentType = 2
)

type SliceImage struct {
	Base64  []byte
	URI     string
	OCR     bool // Is the text extracted using OCR?
	OCRText *string
}

type SliceTable struct { // Table sliced into one row
	Columns []*document.ColumnData
}

type DeleteKnowledgeRequest struct {
	KnowledgeID int64
}
type GetKnowledgeByIDRequest struct {
	KnowledgeID int64
}

type GetKnowledgeByIDResponse struct {
	Knowledge *Knowledge
}

type MGetKnowledgeByIDRequest struct {
	KnowledgeIDs []int64
}

type MGetKnowledgeByIDResponse struct {
	Knowledge []*Knowledge
}

type CopyKnowledgeRequest struct {
	KnowledgeID   int64
	TargetAppID   int64
	TargetSpaceID int64
	TargetUserID  int64
	TaskUniqKey   string
}
type CopyStatus int64

const (
	CopyStatus_Successful CopyStatus = 1
	CopyStatus_Processing CopyStatus = 2
	CopyStatus_Failed     CopyStatus = 3
	CopyStatus_KeepOrigin CopyStatus = 4
)

type CopyKnowledgeResponse struct {
	OriginKnowledgeID int64
	TargetKnowledgeID int64
	CopyStatus        CopyStatus
	ErrMsg            string
}
type MoveKnowledgeToLibraryRequest struct {
	KnowledgeID int64
}
