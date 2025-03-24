package common

import (
	"time"
)

type Info struct {
	ID          int64
	Name        string
	Description string

	CreatorID int64 // TODO: replace with user info struct
	SpaceID   int64

	CreateTime time.Time
	UpdateTime time.Time
	DeleteTime *time.Time
}
