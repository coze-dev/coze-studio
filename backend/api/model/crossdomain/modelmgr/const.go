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

type ModelMetaStatus int64 // 模型实体状态

const (
	StatusInUse   ModelMetaStatus = 1  // 应用中，可使用可新建
	StatusPending ModelMetaStatus = 5  // 待下线，可使用不可新建
	StatusDeleted ModelMetaStatus = 10 // 已下线，不可使用不可新建
)

type Widget string

const (
	WidgetSlider       Widget = "slider"
	WidgetRadioButtons Widget = "radio_buttons"
)

type ModelEntityStatus int64

const (
	ModelEntityStatusDefault ModelEntityStatus = 0
	ModelEntityStatusInUse   ModelEntityStatus = 1
	ModelEntityStatusPending ModelEntityStatus = 5
	ModelEntityStatusDeleted ModelEntityStatus = 10
)
