package internal

const (
	DefaultErrorMsg          = "Service Internal Error"
	DefaultIsAffectStability = true
)

var (
	ServiceInternalErrorCode int32 = 1
	CodeDefinitions                = make(map[int32]*CodeDefinition)
)

type CodeDefinition struct {
	Code              int32
	Message           string
	IsAffectStability bool
}

type RegisterOption func(definition *CodeDefinition)

func WithAffectStability(affectStability bool) RegisterOption {
	return func(definition *CodeDefinition) {
		definition.IsAffectStability = affectStability
	}
}

func Register(code int32, msg string, opts ...RegisterOption) {
	definition := &CodeDefinition{
		Code:              code,
		Message:           msg,
		IsAffectStability: DefaultIsAffectStability,
	}

	for _, opt := range opts {
		opt(definition)
	}

	CodeDefinitions[code] = definition
}

func SetDefaultErrorCode(code int32) {
	ServiceInternalErrorCode = code
}
