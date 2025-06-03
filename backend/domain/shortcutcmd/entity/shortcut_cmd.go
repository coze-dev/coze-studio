package entity

import "code.byted.org/flow/opencoze/backend/domain/shortcutcmd/internal/dal/model"

type ShortcutCmd = model.ShortcutCommand

type ListMeta struct {
	ObjectID   int64   `json:"object_id"`
	SpaceID    int64   `json:"space_id"`
	IsOnline   int32   `json:"is_online"`
	CommandIDs []int64 `json:"command_ids"`
}
