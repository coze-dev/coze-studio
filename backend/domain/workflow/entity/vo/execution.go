package vo

type ExecuteConfig struct {
	Operator     int64
	Mode         ExecuteMode
	AppID        *int64
	AgentID      *int64
	ConnectorID  int64
	ConnectorUID string
	TaskType     TaskType
	SyncPattern  SyncPattern
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

type SyncPattern string

const (
	SyncPatternSync   SyncPattern = "sync"
	SyncPatternAsync  SyncPattern = "async"
	SyncPatternStream SyncPattern = "stream"
)
