package vo

type ExecuteConfig struct {
	ID           int64
	From         Locator
	Version      string
	CommitID     string
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

var DebugURLTpl = "https://127.0.0.1:3000/work_flow?execute_id=%d&space_id=%d&workflow_id=%d&execute_mode=2"
