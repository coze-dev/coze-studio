package modelmgr

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/modelmgr/entity"
)

type Manager interface {
	CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) (*entity.ModelMeta, error)
	UpdateModelMetaStatus(ctx context.Context, id int64, status entity.Status) error
	DeleteModelMeta(ctx context.Context, id int64) error
	ListModelMeta(ctx context.Context, req *ListModelMetaRequest) (*ListModelMetaResponse, error)
	MGetModelMetaByID(ctx context.Context, req *MGetModelMetaRequest) ([]*entity.ModelMeta, error)

	CreateModel(ctx context.Context, model *entity.Model) (*entity.Model, error)
	DeleteModel(ctx context.Context, id int64) error
	ListModel(ctx context.Context, req *ListModelRequest) (*ListModelResponse, error)
	MGetModelByID(ctx context.Context, req *MGetModelRequest) ([]*entity.Model, error)
}

type ListModelMetaRequest struct {
	FuzzyModelName *string
	Status         []entity.Status
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
	Scenario       *entity.Scenario
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
