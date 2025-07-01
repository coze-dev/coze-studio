package telemetry

import (
	"go.opentelemetry.io/otel/attribute"
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

type SpanType int64

const (
	Unknown                 SpanType = 1
	UserInput               SpanType = 2
	ThirdParty              SpanType = 3
	ScheduledTasks          SpanType = 4
	OpenDialog              SpanType = 5
	InvokeAgent             SpanType = 6
	RestartAgent            SpanType = 7
	SwitchAgent             SpanType = 8
	LLMCall                 SpanType = 9
	LLMBatchCall            SpanType = 10
	Workflow                SpanType = 11
	WorkflowStart           SpanType = 12
	WorkflowEnd             SpanType = 13
	PluginTool              SpanType = 14
	PluginToolBatch         SpanType = 15
	Knowledge               SpanType = 16
	Code                    SpanType = 17
	CodeBatch               SpanType = 18
	Condition               SpanType = 19
	Chain                   SpanType = 20
	Card                    SpanType = 21
	WorkflowMessage         SpanType = 22
	WorkflowLLMCall         SpanType = 23
	WorkflowLLMBatchCall    SpanType = 24
	WorkflowCode            SpanType = 25
	WorkflowCodeBatch       SpanType = 26
	WorkflowCondition       SpanType = 27
	WorkflowPluginTool      SpanType = 28
	WorkflowPluginToolBatch SpanType = 29
	WorkflowKnowledge       SpanType = 30
	WorkflowVariable        SpanType = 31
	WorkflowDatabase        SpanType = 32
	Variable                SpanType = 33
	Database                SpanType = 34
	LongTermMemory          SpanType = 35
	Hook                    SpanType = 36
	BWStart                 SpanType = 37
	BWEnd                   SpanType = 38
	BWBatch                 SpanType = 39
	BWLoop                  SpanType = 40
	BWCondition             SpanType = 41
	BWLLM                   SpanType = 42
	BWParallel              SpanType = 43
	BWScript                SpanType = 44
	BWVariable              SpanType = 45
	BWCallFlow              SpanType = 46
	BWConnector             SpanType = 47
	UserInputV2             SpanType = 48
)
