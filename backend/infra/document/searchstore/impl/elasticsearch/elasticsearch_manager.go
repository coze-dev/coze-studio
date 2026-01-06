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

package elasticsearch

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/embedding"
	"github.com/coze-dev/coze-studio/backend/infra/es"
)

type ManagerConfig struct {
	Client es.Client
}

func NewManager(config *ManagerConfig) searchstore.Manager {
	return &esManager{config: config}
}

type esManager struct {
	config *ManagerConfig
}

func (e *esManager) Create(ctx context.Context, req *searchstore.CreateRequest) error {
	cli := e.config.Client
	index := req.CollectionName
	indexExists, err := cli.Exists(ctx, index)
	if err != nil {
		return err
	}
	if indexExists { // exists
		return nil
	}

	properties := make(map[string]any)
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

		var property any
		switch field.Type {
		case searchstore.FieldTypeInt64:
			property = cli.Types().NewLongNumberProperty()
		case searchstore.FieldTypeText:
			property = cli.Types().NewTextProperty()
		default:
			return fmt.Errorf("[Create] es unsupported field type: %d", field.Type)
		}

		properties[field.Name] = property
	}

	if !foundID {
		properties[searchstore.FieldID] = cli.Types().NewLongNumberProperty()
	}
	if !foundCreatorID {
		properties[searchstore.FieldCreatorID] = cli.Types().NewUnsignedLongNumberProperty()
	}
	if !foundTextContent {
		properties[searchstore.FieldTextContent] = cli.Types().NewTextProperty()
	}

	err = cli.CreateIndex(ctx, index, properties)
	if err != nil {
		return err
	}

	return err
}

func (e *esManager) Drop(ctx context.Context, req *searchstore.DropRequest) error {
	cli := e.config.Client
	index := req.CollectionName

	return cli.DeleteIndex(ctx, index)
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
