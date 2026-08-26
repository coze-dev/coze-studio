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
	"errors"
	"testing"

	"github.com/stretchr/testify/require"
	"go.uber.org/mock/gomock"

	"github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	storagemock "github.com/coze-dev/coze-studio/backend/internal/mock/infra/storage"
)

type fakeFilesRepo struct {
	file *entity.File
	err  error
}

func (f *fakeFilesRepo) Create(_ context.Context, _ *entity.File) error { return nil }
func (f *fakeFilesRepo) BatchCreate(_ context.Context, _ []*entity.File) error {
	return nil
}
func (f *fakeFilesRepo) Delete(_ context.Context, _ int64) error { return nil }
func (f *fakeFilesRepo) GetByID(_ context.Context, _ int64) (*entity.File, error) {
	return f.file, f.err
}
func (f *fakeFilesRepo) MGetByIDs(_ context.Context, _ []int64) ([]*entity.File, error) {
	return nil, nil
}

func TestGetFilePropagatesOSSError(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	store := storagemock.NewMockStorage(ctrl)
	store.EXPECT().
		GetObjectUrl(gomock.Any(), "tos://obj").
		Return("", errors.New("oss down"))

	svc := &uploadSVC{
		fileRepo: &fakeFilesRepo{file: &entity.File{ID: 1, TosURI: "tos://obj"}},
		oss:      store,
	}

	resp, err := svc.GetFile(context.Background(), &GetFileRequest{ID: 1})
	require.Error(t, err, "GetObjectUrl failure must be surfaced, not silently swallowed")
	require.Nil(t, resp)
}

func TestGetFileSetsURLOnSuccess(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	store := storagemock.NewMockStorage(ctrl)
	store.EXPECT().
		GetObjectUrl(gomock.Any(), "tos://obj").
		Return("https://cdn.example.com/obj", nil)

	svc := &uploadSVC{
		fileRepo: &fakeFilesRepo{file: &entity.File{ID: 1, TosURI: "tos://obj"}},
		oss:      store,
	}

	resp, err := svc.GetFile(context.Background(), &GetFileRequest{ID: 1})
	require.NoError(t, err)
	require.Equal(t, "https://cdn.example.com/obj", resp.File.Url)
}
