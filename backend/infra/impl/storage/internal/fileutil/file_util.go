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
package fileutil

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
)

func AssembleFileUrl(ctx context.Context, urlExpire *int64, files []*storage.FileInfo, s storage.Storage) ([]*storage.FileInfo, error) {
	if files == nil || s == nil {
		return files, nil
	}

	taskGroup := taskgroup.NewTaskGroup(ctx, 5)
	for idx := range files {
		f := files[idx]
		expire := int64(7 * 60 * 60 * 24)
		if urlExpire != nil && *urlExpire > 0 {
			expire = *urlExpire
		}

		taskGroup.Go(func() error {
			url, err := s.GetObjectUrl(ctx, f.Key, storage.WithExpire(expire))
			if err != nil {
				return err
			}

			f.URL = url

			return nil
		})
	}

	if err := taskGroup.Wait(); err != nil {
		return nil, err
	}

	return files, nil
}
