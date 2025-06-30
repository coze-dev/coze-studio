package entity

import (
	"time"
)

const SessionKey = "session_key"

type Session struct {
	UserID int64
	Locale string

	CreatedAt time.Time
	ExpiresAt time.Time
}
