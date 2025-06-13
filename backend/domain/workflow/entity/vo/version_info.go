package vo

type VersionInfo struct {
	Version            string
	VersionDescription string

	CanvasInfo

	CreatorID int64
	CreatedAt int64

	FromCommitID string
}

type CreateVersionInfo struct {
	ID                 int64
	Version            string
	VersionDescription string
	CreatorID          int64
	FromCommitID       string
	Force              bool
}

type DraftInfo struct {
	Canvas         string
	TestRunSuccess bool
	Modified       bool
	InputParams    string
	OutputParams   string
	CreatedAt      int64
	UpdatedAt      int64
	CommitID       string
}

type CanvasInfo struct {
	Canvas       string
	InputParams  string
	OutputParams string
}
