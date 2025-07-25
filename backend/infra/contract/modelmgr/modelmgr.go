package modelmgr

import (
	"context"
)

type Manager interface {
	ListModel(ctx context.Context, req *ListModelRequest) (*ListModelResponse, error)
	ListInUseModel(ctx context.Context, limit int, Cursor *string) (*ListModelResponse, error)
	MGetModelByID(ctx context.Context, req *MGetModelRequest) ([]*Model, error)
}

type ListModelRequest struct {
	FuzzyModelName *string
	Status         []ModelStatus // default is default and in_use status
	Limit          int
	Cursor         *string
}

type ListModelResponse struct {
	ModelList  []*Model
	HasMore    bool
	NextCursor *string
}

type MGetModelRequest struct {
	IDs []int64
}
