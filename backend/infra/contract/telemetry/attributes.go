package telemetry

import "go.opentelemetry.io/otel/attribute"

const (
	AttributeLogID       = "_log_id"    // string
	AttributeSpaceID     = "_space_id"  // int64
	AttributeType        = "_type"      // int
	AttributeUserID      = "_user_id"   // string
	AttributeEntityID    = "_entity_id" // int64
	AttributeEnvironment = "_env"       // string
	AttributeVersion     = "_version"   // string

	AttributeInput       = "_input"        // string
	AttributeOutput      = "_output"       // string
	AttributeInputTokens = "_input_tokens" // int64
	AttributeOutputToken = "_output_token" // int64

	AttributeModel            = "_model"       // string of chatmodel.Config
	AttributeTemperature      = "_temperature" // float64
	AttributeMessageID        = "_message_id"  // string
	AttributeTimeToFirstToken = "_ttft"        // int64, ms
	AttributePrompt           = "_prompt"      // string
	AttributeToolName         = "_tool_name"   // string
	AttributeExecuteID        = "_execute_id"  // string
)

func NewSpanAttrLogID(logID string) attribute.KeyValue {
	return attribute.String(AttributeLogID, logID)
}

func NewSpanAttrSpaceID(spaceID int64) attribute.KeyValue {
	return attribute.Int64(AttributeSpaceID, spaceID)
}

func NewSpanAttrType(typ int64) attribute.KeyValue {
	return attribute.Int64(AttributeType, typ)
}

func NewSpanAttrUserID(userID int64) attribute.KeyValue {
	return attribute.Int64(AttributeUserID, userID)
}

func NewSpanAttrEntityID(entityID int64) attribute.KeyValue {
	return attribute.Int64(AttributeEntityID, entityID)
}

func NewSpanAttrEnvironment(env string) attribute.KeyValue {
	return attribute.String(AttributeEnvironment, env)
}

func NewSpanAttrVersion(version string) attribute.KeyValue {
	return attribute.String(AttributeVersion, version)
}

func NewSpanAttrInput(input string) attribute.KeyValue {
	return attribute.String(AttributeInput, input)
}

func NewSpanAttrInputTokens(inputTokens int64) attribute.KeyValue {
	return attribute.Int64(AttributeInputTokens, inputTokens)
}

func NewSpanAttrOutput(output string) attribute.KeyValue {
	return attribute.String(AttributeOutput, output)
}

func NewSpanAttrOutputTokens(outputTokens int64) attribute.KeyValue {
	return attribute.Int64(AttributeOutputToken, outputTokens)
}

func NewSpanAttrModel(model string) attribute.KeyValue {
	return attribute.String(AttributeModel, model)
}

func NewSpanAttrTemperature(temperature float64) attribute.KeyValue {
	return attribute.Float64(AttributeTemperature, temperature)
}

func NewSpanAttrMessageID(messageID string) attribute.KeyValue {
	return attribute.String(AttributeMessageID, messageID)
}

func NewSpanAttrTimeToFirstToken(timeToFirstToken int64) attribute.KeyValue {
	return attribute.Int64(AttributeTimeToFirstToken, timeToFirstToken)
}

func NewSpanAttrPrompt(prompt string) attribute.KeyValue {
	return attribute.String(AttributePrompt, prompt)
}

func NewSpanAttrToolName(toolName string) attribute.KeyValue {
	return attribute.String(AttributeToolName, toolName)
}

func NewSpanAttrExecuteID(executeID string) attribute.KeyValue {
	return attribute.String(AttributeExecuteID, executeID)
}
