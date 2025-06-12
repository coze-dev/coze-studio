package vo

import "time"

type ExecuteConfig struct {
	Operator    int64
	Mode        ExecuteMode
	AppID       *int64
	AgentID     *int64
	ConnectorID int64
	TaskType    TaskType
}

type ExecuteMode string

const (
	ExecuteModeDebug     ExecuteMode = "debug"
	ExecuteModeRelease   ExecuteMode = "release"
	ExecuteModeNodeDebug ExecuteMode = "node_debug"
)

type TaskType string

const (
	TaskTypeForeground TaskType = "foreground"
	TaskTypeBackground TaskType = "background"
)

type StaticConfig struct {
	ForegroundRunTimeout     time.Duration
	BackgroundRunTimeout     time.Duration
	MaxNodeCountPerWorkflow  int
	MaxNodeCountPerExecution int
}
