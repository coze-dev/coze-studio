package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/repository"
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
