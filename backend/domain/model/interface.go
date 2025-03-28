package model

import (
	"context"
	"time"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/model/entity"
)

type Manager interface {
	CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) (*entity.ModelMeta, error)
	UpdateModelMetaStatus(ctx context.Context, id int64, status entity.Status) error
	DeleteModelMeta(ctx context.Context, id int64) error
	ListModelMeta(ctx context.Context, req *ListModelMetaRequest) (*ListModelMetaResponse, error)
	MGetModelMetaByID(ctx context.Context, ids *MGetModelMetaRequest) ([]*entity.ModelMeta, error)

	CreateModel(ctx context.Context, model *entity.Model) (*entity.Model, error)
	DeleteModel(ctx context.Context, id int64) error
	ListModel(ctx context.Context, req *ListModelRequest) (*ListModelResponse, error)
	MGetModelByID(ctx context.Context, req *MGetModelRequest) ([]*entity.Model, error)

	Generate(ctx context.Context, req *ChatRequest) (*schema.Message, error)
	Stream(ctx context.Context, req *ChatRequest) (*schema.StreamReader[*schema.Message], error)
}

type ListModelMetaRequest struct {
	FuzzyModelName *string
	Status         []*entity.Status
	Limit          int
	Cursor         *string
}

type ListModelMetaResponse struct {
	ModelMetaList []*entity.ModelMeta
	HasMore       bool
	NextCursor    *string
}

type MGetModelMetaRequest struct {
	IDs []int64
}

type ListModelRequest struct {
	FuzzyModelName *string
	Status         []*entity.Status
	Limit          int
	Cursor         *string
}

type ListModelResponse struct {
	ModelList  []*entity.Model
	HasMore    bool
	NextCursor *string
}

type MGetModelRequest struct {
	IDs []int64
}

type ChatRequest struct {
	ModelID int64

	Messages []*schema.Message
	Tools    []*schema.ToolInfo

	Timeout time.Duration

	Temperature      *float64 `json:"temperature"`
	FrequencyPenalty *float64 `json:"frequency_penalty"`
	PresencePenalty  *float64 `json:"presence_penalty"`
	MaxTokens        *int     `json:"max_tokens"`
	TopP             *float64 `json:"top_p"`
	TopK             *int     `json:"top_k"`
}
