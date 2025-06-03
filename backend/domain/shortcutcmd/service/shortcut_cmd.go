package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/shortcutcmd/entity"
)

type ShortcutCmd interface {
	ListCMD(ctx context.Context, lm *entity.ListMeta) ([]*entity.ShortcutCmd, error)
	CreateCMD(ctx context.Context, shortcut *entity.ShortcutCmd) (*entity.ShortcutCmd, error)
	UpdateCMD(ctx context.Context, shortcut *entity.ShortcutCmd) (*entity.ShortcutCmd, error)
	GetByCmdID(ctx context.Context, cmdID int64, isOnline int32) (*entity.ShortcutCmd, error)
	PublishCMDs(ctx context.Context, objID int64, cmdIDs []int64) error
}
