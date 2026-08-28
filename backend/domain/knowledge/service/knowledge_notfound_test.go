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
	"testing"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/repository"
	"github.com/stretchr/testify/require"
)

// missingDocRepo mimics the DAO: a not-found record returns (nil, nil).
type missingDocRepo struct {
	repository.KnowledgeDocumentRepo
}

func (missingDocRepo) GetByID(ctx context.Context, id int64) (*model.KnowledgeDocument, error) {
	return nil, nil
}

// UpdateDocument on a non-existent document must return a not-found error
// instead of dereferencing the nil document.
func TestUpdateDocumentNotFound(t *testing.T) {
	k := &knowledgeSVC{documentRepo: missingDocRepo{}}

	err := k.UpdateDocument(context.Background(), &UpdateDocumentRequest{DocumentID: 1})
	require.Error(t, err)
	require.Contains(t, err.Error(), "document not found")
}

// ListSlice on a non-existent document must return a not-found error
// instead of dereferencing the nil document.
func TestListSliceDocumentNotFound(t *testing.T) {
	k := &knowledgeSVC{documentRepo: missingDocRepo{}}

	docID := int64(1)
	_, err := k.ListSlice(context.Background(), &ListSliceRequest{DocumentID: &docID})
	require.Error(t, err)
	require.Contains(t, err.Error(), "document not found")
}
