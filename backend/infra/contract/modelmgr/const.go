package modelmgr

type ParameterName string

const (
	Temperature      ParameterName = "temperature"
	TopP             ParameterName = "top_p"
	TopK             ParameterName = "top_k"
	MaxTokens        ParameterName = "max_tokens"
	RespFormat       ParameterName = "response_format"
	FrequencyPenalty ParameterName = "frequency_penalty"
	PresencePenalty  ParameterName = "presence_penalty"
)

type ValueType string

const (
	ValueTypeInt     ValueType = "int"
	ValueTypeFloat   ValueType = "float"
	ValueTypeBoolean ValueType = "boolean"
	ValueTypeString  ValueType = "string"
)

type DefaultType string

const (
	DefaultTypeDefault  DefaultType = "default_val"
	DefaultTypeCreative DefaultType = "creative"
	DefaultTypeBalance  DefaultType = "balance"
	DefaultTypePrecise  DefaultType = "precise"
)

// Deprecated
type Scenario int64 // 模型实体使用场景

type Modal string

const (
	ModalText  Modal = "text"
	ModalImage Modal = "image"
	ModalFile  Modal = "file"
	ModalAudio Modal = "audio"
	ModalVideo Modal = "video"
)

type ModelStatus int64

const (
	StatusDefault ModelStatus = 0  // 未配置时的默认状态，表现等同 StatusInUse
	StatusInUse   ModelStatus = 1  // 应用中，可使用可新建
	StatusPending ModelStatus = 5  // 待下线，可使用不可新建
	StatusDeleted ModelStatus = 10 // 已下线，不可使用不可新建
)

type Widget string

const (
	WidgetSlider       Widget = "slider"
	WidgetRadioButtons Widget = "radio_buttons"
)
