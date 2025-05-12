package vo

type VersionInfo struct {
	Version            string
	VersionDescription string
	Canvas             string
	InputParams        string
	OutputParams       string
	CreatorID          int64
	CreatedAt          int64
	UpdaterID          int64
	UpdatedAt          int64
}

type DraftInfo struct {
	Canvas         string
	TestRunSuccess bool
	Published      bool
	InputParams    string
	OutputParams   string
	CreatedAt      int64
	UpdatedAt      int64
}
