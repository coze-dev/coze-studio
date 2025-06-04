package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/singleagent"
)

// Use composition instead of aliasing for domain entities to enhance extensibility
type SingleAgent struct {
	*singleagent.SingleAgent
}

type AgentIdentity = singleagent.AgentIdentity

type ExecuteRequest = singleagent.ExecuteRequest

type DuplicateInfo struct {
	UserID     int64
	SpaceID    int64
	NewAgentID int64
	DraftAgent *SingleAgent
}
