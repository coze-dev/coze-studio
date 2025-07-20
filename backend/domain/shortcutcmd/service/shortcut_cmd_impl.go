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

	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/entity"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/repository"
)

type Components struct {
	ShortCutCmdRepo repository.ShortCutCmdRepo
}

type shortcutCommandImpl struct {
	Components
}

func NewShortcutCommandService(c *Components) ShortcutCmd {
	return &shortcutCommandImpl{
		Components: *c,
	}
}

func (s *shortcutCommandImpl) ListCMD(ctx context.Context, lm *entity.ListMeta) ([]*entity.ShortcutCmd, error) {
	return s.ShortCutCmdRepo.List(ctx, lm)
}

func (s *shortcutCommandImpl) CreateCMD(ctx context.Context, shortcut *entity.ShortcutCmd) (*entity.ShortcutCmd, error) {
	return s.ShortCutCmdRepo.Create(ctx, shortcut)

}

func (s *shortcutCommandImpl) UpdateCMD(ctx context.Context, shortcut *entity.ShortcutCmd) (*entity.ShortcutCmd, error) {
	return s.ShortCutCmdRepo.Update(ctx, shortcut)
}

func (s *shortcutCommandImpl) GetByCmdID(ctx context.Context, cmdID int64, isOnline int32) (*entity.ShortcutCmd, error) {
	return s.ShortCutCmdRepo.GetByCmdID(ctx, cmdID, isOnline)
}

func (s *shortcutCommandImpl) PublishCMDs(ctx context.Context, objID int64, cmdIDs []int64) error {
	return s.ShortCutCmdRepo.PublishCMDs(ctx, objID, cmdIDs)

}
