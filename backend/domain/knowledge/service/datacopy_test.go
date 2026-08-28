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

	"gorm.io/gorm"

	crossdatacopy "github.com/coze-dev/coze-studio/backend/crossdomain/datacopy"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy"
	copyEntity "github.com/coze-dev/coze-studio/backend/domain/datacopy/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/repository"
	"github.com/stretchr/testify/require"
)

type fakeDataCopySvc struct{}

func (fakeDataCopySvc) CheckAndGenCopyTask(ctx context.Context, req *datacopy.CheckAndGenCopyTaskReq) (*datacopy.CheckAndGenCopyTaskResp, error) {
	return nil, nil
}

func (fakeDataCopySvc) UpdateCopyTask(ctx context.Context, req *datacopy.UpdateCopyTaskReq) error {
	return nil
}

func (fakeDataCopySvc) UpdateCopyTaskWithTX(ctx context.Context, req *datacopy.UpdateCopyTaskReq, tx *gorm.DB) error {
	return nil
}

// panicRepo panics on Upsert; GetByID reports "not found" so the deferred
// cleanup in copyDo exits early without touching other dependencies.
type panicRepo struct {
	repository.KnowledgeRepo
}

func (panicRepo) Upsert(ctx context.Context, knowledge *model.Knowledge) error {
	panic("boom")
}

func (panicRepo) GetByID(ctx context.Context, id int64) (*model.Knowledge, error) {
	return nil, nil
}

// copyDo recovers panics; the recovered error must be returned to the
// caller instead of being swallowed into a (nil, nil) response.
func TestCopyDoPanicReturnsError(t *testing.T) {
	ctx := context.Background()
	crossdatacopy.SetDefaultSVC(fakeDataCopySvc{})
	defer crossdatacopy.SetDefaultSVC(nil)

	k := &knowledgeSVC{knowledgeRepo: panicRepo{}}
	copyCtx := &knowledgeCopyCtx{
		OriginData: &model.Knowledge{ID: 1},
		CopyTask:   &copyEntity.CopyDataTask{TargetDataID: 2},
	}

	resp, err := k.copyDo(ctx, copyCtx)
	require.Error(t, err)
	require.Nil(t, resp)
	require.Contains(t, err.Error(), "panic")
}
