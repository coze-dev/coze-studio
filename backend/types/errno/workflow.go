package errno

import (
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

const (
	ErrWorkflowNotPublished  = 720702011
	ErrMissingRequiredParam  = 720702002
	ErrInterruptNotSupported = 720702078
	ErrInvalidParameter      = 720702001
	ErrArrIndexOutOfRange    = 720712014
	ErrWorkflowExecuteFail   = 720701013
	ErrCodeExecuteFail       = 305000002
)

const (
	ErrOpenAPIWorkflowNotPublished  = 6031
	ErrOpenAPIBadRequest            = 4000
	ErrOpenAPIInterruptNotSupported = 6039
)

func init() {
	code.Register(
		ErrWorkflowNotPublished,
		"Workflow not published. The requested operation cannot be performed on an unpublished workflow. Please publish the workflow and try again.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrMissingRequiredParam,
		"Missing required parameters. Please review the API documentation and ensure all mandatory fields are included in your request.",
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
		"Array index out of bounds: The requested index exceeds the array's length. Please ensure the index is within the valid range of the array. You can refer to debug_url for more details.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrWorkflowExecuteFail,
		"We're currently experiencing server issues. Please try your request again after a short delay. If the problem persists, contact our support team.",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCodeExecuteFail,
		"code node execute fail",
		code.WithAffectStability(false),
	)
}

var errnoMap = map[int]int{
	ErrWorkflowNotPublished:  ErrOpenAPIWorkflowNotPublished,
	ErrMissingRequiredParam:  ErrOpenAPIBadRequest,
	ErrInterruptNotSupported: ErrOpenAPIInterruptNotSupported,
	ErrInvalidParameter:      ErrOpenAPIBadRequest,
	ErrArrIndexOutOfRange:    ErrOpenAPIBadRequest,
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
