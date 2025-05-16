package elasticsearch

import (
	"context"
	"fmt"

	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/create"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/delete"
	"github.com/elastic/go-elasticsearch/v8/typedapi/indices/exists"
	"github.com/elastic/go-elasticsearch/v8/typedapi/types"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/embedding"
	"code.byted.org/flow/opencoze/backend/infra/contract/es8"
)

type ManagerConfig struct {
	Client *es8.Client
}

func NewManager(config *ManagerConfig) searchstore.Manager {
	return &esManager{config: config}
}

type esManager struct {
	config *ManagerConfig
}

func (e *esManager) Create(ctx context.Context, req *searchstore.CreateRequest) error {
	properties := make(map[string]types.Property)
	var foundID, foundCreatorID, foundTextContent bool
	for _, field := range req.Fields {
		switch field.Name {
		case searchstore.FieldID:
			foundID = true
		case searchstore.FieldCreatorID:
			foundCreatorID = true
		case searchstore.FieldTextContent:
			foundTextContent = true
		default:

		}

		var property types.Property
		switch field.Type {
		case searchstore.FieldTypeInt64:
			property = types.NewLongNumberProperty()
		case searchstore.FieldTypeText:
			property = types.NewTextProperty()
		default:
			return fmt.Errorf("[Create] es unsupported field type: %d", field.Type)
		}

		properties[field.Name] = property
	}

	if !foundID {
		properties[searchstore.FieldID] = types.NewLongNumberProperty()
	}
	if !foundCreatorID {
		properties[searchstore.FieldCreatorID] = types.NewUnsignedLongNumberProperty()
	}
	if !foundTextContent {
		properties[searchstore.FieldTextContent] = types.NewTextProperty()
	}

	cli := e.config.Client
	index := req.CollectionName
	indexExists, err := exists.NewExistsFunc(cli)(index).Do(ctx)
	if err != nil {
		return err
	}
	if indexExists { // exists
		return nil
	}

	if _, err = create.NewCreateFunc(cli)(index).Request(&create.Request{
		Mappings: &types.TypeMapping{
			Properties: properties,
		},
	}).Do(ctx); err != nil {
		return err
	}

	return err
}

func (e *esManager) Drop(ctx context.Context, req *searchstore.DropRequest) error {
	cli := e.config.Client
	index := req.CollectionName
	_, err := delete.NewDeleteFunc(cli)(index).Do(ctx)
	return err
}

func (e *esManager) GetType() searchstore.SearchStoreType {
	return searchstore.TypeTextStore
}

func (e *esManager) GetSearchStore(ctx context.Context, collectionName string) (searchstore.SearchStore, error) {
	return &esSearchStore{
		config:    e.config,
		indexName: collectionName,
	}, nil
}

func (e *esManager) GetEmbedding() embedding.Embedder {
	return nil
}
