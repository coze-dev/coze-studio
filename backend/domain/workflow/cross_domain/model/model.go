package model

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

type LLMParams struct {
	GenerationDiversity string
	MaxToken            int64
	ModelName           string
	ModelType           int64
	Temperature         float64
	TopP                float64
}

type GenerationDiversity string

const (
	Balanced GenerationDiversity = "balance"
	Precise  GenerationDiversity = "precise"
	Creative GenerationDiversity = "creative"
	Custom   GenerationDiversity = "custom"
)

var ManagerImpl Manager

//go:generate  mockgen -destination modelmock/model_mock.go --package mockmodel -source model.go
type Manager interface {
	GetModel(ctx context.Context, params *LLMParams) (model.ChatModel, error)
}
