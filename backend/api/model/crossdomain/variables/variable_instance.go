package variables

import (
	"code.byted.org/data_edc/workflow_engine_next/api/model/project_memory"
)

type UserVariableMeta struct {
	BizType      project_memory.VariableConnector
	BizID        string
	Version      string
	ConnectorUID string
	ConnectorID  int64
}
