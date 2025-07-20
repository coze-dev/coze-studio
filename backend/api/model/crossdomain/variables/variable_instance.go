package variables

import (
	"github.com/coze-dev/coze-studio/backend/api/model/project_memory"
)

type UserVariableMeta struct {
	BizType      project_memory.VariableConnector
	BizID        string
	Version      string
	ConnectorUID string
	ConnectorID  int64
}
