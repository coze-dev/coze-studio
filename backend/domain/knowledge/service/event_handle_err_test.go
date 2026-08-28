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

	knowledgeModel "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/repository"
	"github.com/stretchr/testify/require"
)

type noopDocRepo struct {
	repository.KnowledgeDocumentRepo
}

func (noopDocRepo) SetStatus(ctx context.Context, documentID int64, status int32, reason string) error {
	return nil
}

// A panic during indexing must be written back into the caller's named
// return error; the old code reassigned the local *error parameter, so
// the caller's error stayed nil and the MQ message was never retried.
func TestHandleIndexingErrorsPanicPropagates(t *testing.T) {
	k := &knowledgeSVC{documentRepo: noopDocRepo{}}
	event := &entity.Event{Document: &entity.Document{Info: knowledgeModel.Info{ID: 1}}}

	var err error
	func() {
		defer k.handleIndexingErrors(context.Background(), event, &err)
		panic("boom")
	}()

	require.Error(t, err)
	require.Contains(t, err.Error(), "panic")
}
