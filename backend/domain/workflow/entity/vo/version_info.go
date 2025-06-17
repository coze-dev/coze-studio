package vo

import "time"

type VersionInfo struct {
	*VersionMeta

	CanvasInfo

	CommitID string
}

type PublishPolicy struct {
	ID                 int64
	Version            string
	VersionDescription string
	CreatorID          int64
	CommitID           string
	Force              bool
}

type VersionMeta struct {
	Version            string
	VersionDescription string
	VersionCreatedAt   time.Time
	VersionCreatorID   int64
}
