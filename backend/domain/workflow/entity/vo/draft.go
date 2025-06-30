package vo

import (
	"time"

	"code.byted.org/flow/opencoze/backend/pkg/sonic"
)

type DraftInfo struct {
	*DraftMeta

	Canvas          string
	InputParamsStr  string
	OutputParamsStr string

	CommitID string
}

type CanvasInfo struct {
	Canvas          string
	InputParams     []*NamedTypeInfo
	OutputParams    []*NamedTypeInfo
	InputParamsStr  string
	OutputParamsStr string
}

func (c *CanvasInfo) Unmarshal() error {
	if c.InputParamsStr != "" && len(c.InputParams) == 0 {
		var input []*NamedTypeInfo
		err := sonic.UnmarshalString(c.InputParamsStr, &input)
		if err != nil {
			return err
		}
		c.InputParams = input
	}

	if c.OutputParamsStr != "" && len(c.OutputParams) == 0 {
		var output []*NamedTypeInfo
		err := sonic.UnmarshalString(c.OutputParamsStr, &output)
		if err != nil {
			return err
		}
		c.OutputParams = output
	}

	return nil
}

type DraftMeta struct {
	TestRunSuccess bool
	Modified       bool
	Timestamp      time.Time
	IsSnapshot     bool // if true, this is a snapshot of a previous draft content, not the latest draft
}
