package service

import (
	"context"
	"fmt"
	"time"

	"github.com/cloudwego/eino-ext/components/model/ark"
	"github.com/cloudwego/eino-ext/components/model/claude"
	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/components/model/openai"
	cm "github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/chatmodel"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/entity"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/entity/common"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/dao"
	dmodel "code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/model/protocol"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	pmodel "code.byted.org/flow/opencoze/backend/infra/contract/model"
	"code.byted.org/flow/opencoze/backend/infra/pkg/slices"
	"code.byted.org/flow/opencoze/backend/infra/pkg/toptr"
)

type ChatModelFactory func(ctx context.Context, config *ChatModelConfig) (cm.ChatModel, error)

type ChatModelConfig struct {
	Model            *entity.Model `json:"model"`
	Timeout          time.Duration `json:"timeout"`
	Temperature      *float64      `json:"temperature"`
	FrequencyPenalty *float64      `json:"frequency_penalty"`
	PresencePenalty  *float64      `json:"presence_penalty"`
	MaxTokens        *int          `json:"max_tokens"`
	TopP             *float64      `json:"top_p"`
	TopK             *int          `json:"top_k"`
}

func NewModelManager(db *gorm.DB, idgen idgen.IDGenerator, customProtocols map[pmodel.Protocol]ChatModelFactory) chatmodel.Manager {
	return &ModelManager{
		idgen:                 idgen,
		modelMetaRepo:         dao.NewModelMetaDAO(db),
		modelEntityRepo:       dao.NewModelEntityDAO(db),
		customProtocolMapping: customProtocols,
	}
}

type ModelManager struct {
	idgen idgen.IDGenerator

	modelMetaRepo   dao.ModelMetaRepo
	modelEntityRepo dao.ModelEntityRepo

	// customProtocolMapping supports customized protocols
	customProtocolMapping map[pmodel.Protocol]ChatModelFactory
}

func (m *ModelManager) CreateModelMeta(ctx context.Context, meta *entity.ModelMeta) (*entity.ModelMeta, error) {
	if err := m.alignProtocol(meta); err != nil {
		return nil, err
	}

	id, err := m.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}

	now := time.Now().UnixMilli()

	if err = m.modelMetaRepo.Create(ctx, &dmodel.ModelMeta{
		ID:          id,
		ModelName:   meta.Name,
		Protocol:    string(meta.Protocol),
		ShowName:    meta.ShowName,
		Capability:  meta.Capability,
		ConnConfig:  meta.ConnConfig,
		ParamSchema: meta.Schema,
		Status:      int32(meta.Status),
		Description: meta.Description,
		CreatedAt:   now,
		UpdatedAt:   now,
	}); err != nil {
		return nil, err
	}

	return &entity.ModelMeta{
		Info: common.Info{
			ID:          id,
			Name:        meta.Name,
			Description: meta.Description,
			CreatedAtMs: now,
			UpdatedAtMs: now,
		},
		ShowName:   meta.ShowName,
		Protocol:   meta.Protocol,
		Capability: meta.Capability,
		ConnConfig: meta.ConnConfig,
		Schema:     meta.Schema,
		Status:     meta.Status,
	}, nil
}

func (m *ModelManager) UpdateModelMetaStatus(ctx context.Context, id int64, status entity.Status) error {
	return m.modelMetaRepo.UpdateStatus(ctx, id, int32(status))
}

func (m *ModelManager) DeleteModelMeta(ctx context.Context, id int64) error {
	return m.modelMetaRepo.Delete(ctx, id)
}

func (m *ModelManager) ListModelMeta(ctx context.Context, req *chatmodel.ListModelMetaRequest) (*chatmodel.ListModelMetaResponse, error) {
	status := slices.ConvertSliceNoError(req.Status, func(a entity.Status) int32 {
		return int32(a)
	})

	pos, next, hasMore, err := m.modelMetaRepo.List(ctx, req.FuzzyModelName, status, req.Limit, req.Cursor)
	if err != nil {
		return nil, err
	}

	dos := slices.ConvertSliceNoError(pos, m.fromModelMetaPO)
	return &chatmodel.ListModelMetaResponse{
		ModelMetaList: dos,
		HasMore:       hasMore,
		NextCursor:    next,
	}, nil
}

func (m *ModelManager) MGetModelMetaByID(ctx context.Context, req *chatmodel.MGetModelMetaRequest) ([]*entity.ModelMeta, error) {
	if len(req.IDs) == 0 {
		return nil, nil
	}

	pos, err := m.modelMetaRepo.MGetByID(ctx, req.IDs)
	if err != nil {
		return nil, err
	}

	dos := slices.ConvertSliceNoError(pos, m.fromModelMetaPO)

	return dos, nil
}

func (m *ModelManager) CreateModel(ctx context.Context, model *entity.Model) (*entity.Model, error) {
	// check if meta id exists
	metaPO, err := m.modelMetaRepo.GetByID(ctx, model.Meta.ID)
	if err != nil {
		return nil, err
	}
	if metaPO == nil {
		return nil, fmt.Errorf("[CreateModel] mode meta not found, model_meta id=%d", model.Meta.ID)
	}

	id, err := m.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	now := time.Now().UnixMilli()
	if err = m.modelEntityRepo.Create(ctx, &dmodel.ModelEntity{
		ID:        id,
		MetaID:    model.Meta.ID,
		Name:      model.Name,
		Scenario:  int64(model.Scenario),
		CreatedAt: now,
		UpdatedAt: now,
	}); err != nil {
		return nil, err
	}

	resp := &entity.Model{
		Info: common.Info{
			ID:          id,
			Name:        model.Name,
			CreatedAtMs: now,
			UpdatedAtMs: now,
		},
		Meta:     model.Meta,
		Scenario: model.Scenario,
	}

	return resp, nil
}

func (m *ModelManager) DeleteModel(ctx context.Context, id int64) error {
	return m.modelEntityRepo.Delete(ctx, id)
}

func (m *ModelManager) ListModel(ctx context.Context, req *chatmodel.ListModelRequest) (*chatmodel.ListModelResponse, error) {
	var sc *int64
	if req.Scenario != nil {
		sc = toptr.Of(int64(*req.Scenario))
	}

	pos, next, hasMore, err := m.modelEntityRepo.List(ctx, req.FuzzyModelName, sc, req.Limit, req.Cursor)
	if err != nil {
		return nil, err
	}

	resp, err := m.fromModelPOs(ctx, pos)
	if err != nil {
		return nil, err
	}

	return &chatmodel.ListModelResponse{
		ModelList:  resp,
		HasMore:    hasMore,
		NextCursor: next,
	}, nil
}

func (m *ModelManager) MGetModelByID(ctx context.Context, req *chatmodel.MGetModelRequest) ([]*entity.Model, error) {
	if len(req.IDs) == 0 {
		return nil, nil
	}

	pos, err := m.modelEntityRepo.MGet(ctx, req.IDs)
	if err != nil {
		return nil, err
	}

	resp, err := m.fromModelPOs(ctx, pos)
	if err != nil {
		return nil, err
	}

	return resp, nil
}

func (m *ModelManager) Generate(ctx context.Context, req *chatmodel.ChatRequest) (*schema.Message, error) {
	dos, err := m.MGetModelByID(ctx, &chatmodel.MGetModelRequest{IDs: []int64{req.ModelID}})
	if err != nil {
		return nil, err
	}

	if len(dos) == 0 {
		return nil, fmt.Errorf("[Generate] model not found for id=%v", req.ModelID)
	}

	do := dos[0]
	chatModel, err := m.buildChatModel(ctx, do, req)
	if err != nil {
		return nil, err
	}

	if err = chatModel.BindTools(req.Tools); err != nil {
		return nil, err
	}

	return chatModel.Generate(ctx, req.Messages)
}

func (m *ModelManager) Stream(ctx context.Context, req *chatmodel.ChatRequest) (*schema.StreamReader[*schema.Message], error) {
	dos, err := m.MGetModelByID(ctx, &chatmodel.MGetModelRequest{IDs: []int64{req.ModelID}})
	if err != nil {
		return nil, err
	}

	if len(dos) == 0 {
		return nil, fmt.Errorf("[Generate] model not found for id=%v", req.ModelID)
	}

	do := dos[0]
	chatModel, err := m.buildChatModel(ctx, do, req)
	if err != nil {
		return nil, err
	}

	if err = chatModel.BindTools(req.Tools); err != nil {
		return nil, err
	}

	return chatModel.Stream(ctx, req.Messages)
}

func (m *ModelManager) buildChatModel(ctx context.Context, model *entity.Model, req *chatmodel.ChatRequest) (chatModel cm.ChatModel, err error) {
	meta := model.Meta
	if meta.Status != entity.StatusInUse &&
		meta.Status != entity.StatusPending {
		return nil, fmt.Errorf("model meta status invalid, status=%v", meta.Status)
	}

	if m.customProtocolMapping != nil {
		if fn, found := m.customProtocolMapping[meta.Protocol]; found {
			return fn(ctx, &ChatModelConfig{
				Model:            model,
				Timeout:          req.Timeout,
				Temperature:      req.Temperature,
				FrequencyPenalty: req.FrequencyPenalty,
				PresencePenalty:  req.PresencePenalty,
				MaxTokens:        req.MaxTokens,
				TopP:             req.TopP,
				TopK:             req.TopK,
			})
		}
	}

	timeout := req.Timeout

	switch meta.Protocol {
	case pmodel.ProtocolOpenAI:
		c := meta.ConnConfig.OpenAI
		if timeout == 0 {
			timeout = meta.ConnConfig.Timeout
		}
		cfg := &openai.ChatModelConfig{
			APIKey:     c.APIKey,
			Timeout:    timeout,
			ByAzure:    c.ByAzure,
			BaseURL:    c.BaseURL,
			APIVersion: c.APIVersion,
			Model:      meta.Name,
		}
		if req.Temperature != nil {
			cfg.Temperature = toptr.Of(float32(*req.Temperature))
		}
		if req.FrequencyPenalty != nil {
			cfg.FrequencyPenalty = toptr.Of(float32(*req.FrequencyPenalty))
		}
		if req.PresencePenalty != nil {
			cfg.PresencePenalty = toptr.Of(float32(*req.PresencePenalty))
		}
		if req.MaxTokens != nil {
			cfg.MaxTokens = req.MaxTokens
		}
		if req.TopP != nil {
			cfg.TopP = toptr.Of(float32(*req.TopP))
		}
		chatModel, err = openai.NewChatModel(ctx, cfg)

	case pmodel.ProtocolClaude:
		c := meta.ConnConfig.Claude
		var baseURL *string
		if c.BaseURL != "" {
			baseURL = &c.BaseURL
		}
		cfg := &claude.Config{
			ByBedrock:       c.ByBedrock,
			AccessKey:       c.AccessKey,
			SecretAccessKey: c.SecretAccessKey,
			SessionToken:    c.SessionToken,
			Region:          c.Region,
			BaseURL:         baseURL,
			APIKey:          c.APIKey,
			Model:           meta.Name,
		}
		if req.Temperature != nil {
			cfg.Temperature = toptr.Of(float32(*req.Temperature))
		}
		if req.MaxTokens != nil {
			cfg.MaxTokens = *req.MaxTokens
		}
		if req.TopP != nil {
			cfg.TopP = toptr.Of(float32(*req.TopP))
		}
		if req.TopK != nil {
			cfg.TopK = toptr.Of(int32(*req.TopK))
		}
		chatModel, err = claude.NewChatModel(ctx, cfg)

	case pmodel.ProtocolDeepseek:
		c := meta.ConnConfig.Deepseek
		if timeout == 0 {
			timeout = meta.ConnConfig.Timeout
		}
		cfg := &deepseek.ChatModelConfig{
			APIKey:  c.APIKey,
			Timeout: meta.ConnConfig.Timeout,
			BaseURL: c.BaseURL,
			Model:   meta.Name,
		}
		if req.Temperature != nil {
			cfg.Temperature = float32(*req.Temperature)
		}
		if req.FrequencyPenalty != nil {
			cfg.FrequencyPenalty = float32(*req.FrequencyPenalty)
		}
		if req.PresencePenalty != nil {
			cfg.PresencePenalty = float32(*req.PresencePenalty)
		}
		if req.MaxTokens != nil {
			cfg.MaxTokens = *req.MaxTokens
		}
		if req.TopP != nil {
			cfg.TopP = float32(*req.TopP)
		}
		chatModel, err = deepseek.NewChatModel(ctx, cfg)

	case pmodel.ProtocolArk:
		c := meta.ConnConfig.Ark
		var to *time.Duration
		if timeout != 0 {
			to = &timeout
		} else if meta.ConnConfig.Timeout != 0 {
			to = &meta.ConnConfig.Timeout
		}
		cfg := &ark.ChatModelConfig{
			Timeout:   to,
			BaseURL:   c.BaseURL,
			Region:    c.Region,
			APIKey:    c.APIKey,
			AccessKey: c.AccessKey,
			SecretKey: c.SecretKey,
			Model:     meta.Name,
		}
		if req.Temperature != nil {
			cfg.Temperature = toptr.Of(float32(*req.Temperature))
		}
		if req.FrequencyPenalty != nil {
			cfg.FrequencyPenalty = toptr.Of(float32(*req.FrequencyPenalty))
		}
		if req.PresencePenalty != nil {
			cfg.PresencePenalty = toptr.Of(float32(*req.PresencePenalty))
		}
		if req.MaxTokens != nil {
			cfg.MaxTokens = req.MaxTokens
		}
		if req.TopP != nil {
			cfg.TopP = toptr.Of(float32(*req.TopP))
		}
		chatModel, err = ark.NewChatModel(ctx, cfg)

	default:
		return nil, fmt.Errorf("protocol not support, model id=%d, model_meta id=%d, protocol=%v",
			model.ID, meta.ID, meta.Protocol)
	}

	if err != nil {
		return nil, err
	}

	return chatModel, nil
}

func (m *ModelManager) alignProtocol(meta *entity.ModelMeta) error {
	if meta.Protocol == "" {
		return fmt.Errorf("protocol not provided")
	}

	config := meta.ConnConfig
	if config == nil {
		return fmt.Errorf("ConnConfig not provided, protocol=%s", meta.Protocol)
	}

	var set bool
	switch meta.Protocol {
	case pmodel.ProtocolOpenAI:
		set = config.OpenAI != nil
	case pmodel.ProtocolClaude:
		set = config.Claude != nil
	case pmodel.ProtocolDeepseek:
		set = config.Deepseek != nil
	case pmodel.ProtocolArk:
		set = config.Ark != nil
	default:
		set = config.Custom != nil
	}

	if !set {
		return fmt.Errorf("ConnConfig content not provided, protocol=%s", meta.Protocol)
	}

	return nil
}

func (m *ModelManager) fromModelMetaPO(po *dmodel.ModelMeta) *entity.ModelMeta {
	if po == nil {
		return nil
	}

	return &entity.ModelMeta{
		Info: common.Info{
			ID:          po.ID,
			Name:        po.ModelName,
			Description: po.Description,
			CreatedAtMs: po.CreatedAt,
			UpdatedAtMs: po.UpdatedAt,
			DeletedAtMs: po.DeletedAt.Time.UnixMilli(),
		},
		ShowName:   po.ShowName,
		Protocol:   protocol.Protocol(po.Protocol),
		Capability: po.Capability,
		//ConnConfig: po.ConnConfig,
		Schema: po.ParamSchema,
		Status: entity.Status(po.Status),
	}
}

func (m *ModelManager) fromModelPOs(ctx context.Context, pos []*dmodel.ModelEntity) ([]*entity.Model, error) {
	if len(pos) == 0 {
		return nil, nil
	}

	resp := make([]*entity.Model, 0, len(pos))
	metaIDSet := make(map[int64]struct{})
	for _, po := range pos {
		resp = append(resp, &entity.Model{
			Info: common.Info{
				ID:          po.ID,
				Name:        po.Name,
				CreatedAtMs: po.CreatedAt,
				UpdatedAtMs: po.UpdatedAt,
			},
			Meta: entity.ModelMeta{
				Info: common.Info{ID: po.MetaID},
			},
			Scenario: entity.Scenario(po.Scenario),
		})
		metaIDSet[po.MetaID] = struct{}{}
	}

	metaIDSlice := make([]int64, 0, len(metaIDSet))
	for id := range metaIDSet {
		metaIDSlice = append(metaIDSlice, id)
	}

	modelMetaSlice, err := m.MGetModelMetaByID(ctx, &chatmodel.MGetModelMetaRequest{IDs: metaIDSlice})
	if err != nil {
		return nil, err
	}

	metaID2Meta := make(map[int64]*entity.ModelMeta)
	for i := range modelMetaSlice {
		item := modelMetaSlice[i]
		metaID2Meta[item.ID] = item
	}

	for _, r := range resp {
		meta, found := metaID2Meta[r.Meta.ID]
		if !found {
			return nil, fmt.Errorf("[ListModel] model meta not found, model_entity id=%v, model_meta id=%v", r.ID, r.Meta.ID)
		}
		r.Meta = *meta
	}

	return resp, nil
}
