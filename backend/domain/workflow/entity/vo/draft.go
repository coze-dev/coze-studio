package vo

import "time"

type DraftInfo struct {
	*DraftMeta

	Canvas          string
	InputParamsStr  string
	OutputParamsStr string

	CommitID string
}

type CanvasInfo struct {
	Canvas          string
	InputParamsStr  string
	OutputParamsStr string
}

type CanvasInfoV2 struct {
	Canvas          string
	InputParams     []*NamedTypeInfo
	OutputParams    []*NamedTypeInfo
	InputParamsStr  string
	OutputParamsStr string
}

type DraftMeta struct {
	TestRunSuccess bool
	Modified       bool
	Timestamp      time.Time
	IsSnapshot     bool // if true, this is a snapshot of a previous draft content, not the latest draft
}
