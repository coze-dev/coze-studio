package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

const (
	ErrWorkflowNotPublished             = 720702011
	ErrMissingRequiredParam             = 720702002
	ErrInterruptNotSupported            = 720702078
	ErrInvalidParameter                 = 720702001
	ErrArrIndexOutOfRange               = 720712014
	ErrWorkflowExecuteFail              = 720701013
	ErrCodeExecuteFail                  = 305000002
	ErrQuestionOptionsEmpty             = 720712049
	ErrNodeOutputParseFail              = 720712023
	ErrWorkflowTimeout                  = 720702085
	ErrWorkflowNotFound                 = 720702004
	ErrSerializationDeserializationFail = 720701011
	ErrInternalBadRequest               = 720701007
	ErrSchemaConversionFail             = 720702089
	ErrWorkflowCompileFail              = 720701003
)

const (
	ErrWorkflowCanceledByUser          = 777777777
	ErrNodeTimeout                     = 777777776
	ErrWorkflowOperationFail           = 777777775
	ErrIndexingNilArray                = 777777774
	ErrLLMStructuredOutputParseFail    = 777777773
	ErrCreateNodeFail                  = 777777772
	ErrWorkflowSnapshotNotFound        = 777777771
	ErrNotifyWorkflowResourceChangeErr = 777777770
	ErrInvalidVersionName              = 777777769
)

// stability problems
const (
	ErrDatabaseError = 720700801
	ErrRedisError    = 720700803
	ErrIDGenError    = 720700808
)

const (
	ErrOpenAPIWorkflowNotPublished  = 6031
	ErrOpenAPIBadRequest            = 4000
	ErrOpenAPIInterruptNotSupported = 6039
	ErrOpenAPIWorkflowTimeout       = 6023
)

func init() {
	code.Register(
		ErrWorkflowNotPublished,
		"Workflow not published. The requested operation cannot be performed on an unpublished workflow. Please publish the workflow and try again.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMissingRequiredParam,
		"Missing required parameters {param}. Please review the API documentation and ensure all mandatory fields are included in your request.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrInterruptNotSupported,
		"Synchronous requests do not support interruption. Please switch to asynchronous requests for interruptible operations.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrInvalidParameter,
		"Invalid request parameters. Please check your input and ensure all required fields are correctly formatted and within allowed ranges.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrArrIndexOutOfRange,
		"Array {arr_name} index out of bounds: The requested index {req_index} exceeds the array's length {arr_len}. Please ensure the index is within the valid range of the array. You can refer to debug_url for more details.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrIndexingNilArray,
		"Array {arr_name} is nil: The requested index {req_index} cannot be extracted.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowExecuteFail,
		"Workflow execution failure: {cause}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowOperationFail,
		"Workflow operation failure: {cause}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCodeExecuteFail,
		"Function execution failed, please check the code of the function. Detail: {detail}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrQuestionOptionsEmpty,
		"question option is empty",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrNodeOutputParseFail,
		"node output parse fail: {warnings}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowCanceledByUser,
		"workflow cancel by user",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrNodeTimeout,
		"node timeout",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowTimeout,
		"Workflow execution timed out. Please check for long-running operations, optimize if possible, or retry later.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrLLMStructuredOutputParseFail,
		"parse LLM structured output failed, please refer to LLM's raw output for detail.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCreateNodeFail,
		"create node {node_name} failed: {cause}",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrDatabaseError,
		"database operation failed",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrRedisError,
		"redis operation failed",
		code.WithAffectStability(true),
	)
	code.Register(
		ErrIDGenError,
		"id generator failed",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrWorkflowNotFound,
		"workflow {id} not found, please check if the workflow exists and not deleted",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrSerializationDeserializationFail,
		"data serialization/deserialization fail, please contact support team",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowSnapshotNotFound,
		"workflow {id} snapshot {commit_id} not found, please contact support team",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrInternalBadRequest,
		"one of the request parameters for {scene} is invalid, please contact support team",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrSchemaConversionFail,
		"schema conversion failed, please contact support team",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowCompileFail,
		"workflow compile failed, please contact support team",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrNotifyWorkflowResourceChangeErr,
		"notify workflow resource change failed, please try again later",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrInvalidVersionName,
		"workflow version name is invalid",
		code.WithAffectStability(false),
	)
}

var errnoMap = map[int]int{
	ErrWorkflowNotPublished:  ErrOpenAPIWorkflowNotPublished,
	ErrMissingRequiredParam:  ErrOpenAPIBadRequest,
	ErrInterruptNotSupported: ErrOpenAPIInterruptNotSupported,
	ErrInvalidParameter:      ErrOpenAPIBadRequest,
	ErrArrIndexOutOfRange:    ErrOpenAPIBadRequest,
	ErrWorkflowTimeout:       ErrOpenAPIWorkflowTimeout,
}

func CodeForOpenAPI(err errorx.StatusError) int {
	if err == nil {
		return 0
	}

	if c, ok := errnoMap[int(err.Code())]; ok {
		return c
	}

	return int(err.Code())
}
