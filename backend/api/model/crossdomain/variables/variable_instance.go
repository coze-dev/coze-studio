package variables

import (
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
)

type UserVariableMeta struct {
	BizType      project_memory.VariableConnector
	BizID        string
	Version      string
	ConnectorUID string
	ConnectorID  int64
}
