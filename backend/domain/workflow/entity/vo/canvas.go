/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package vo

import (
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
)

type Canvas struct {
	Nodes    []*Node `json:"nodes"`
	Edges    []*Edge `json:"edges"`
	Versions any     `json:"versions"`
}

type Node struct {
	ID      string    `json:"id"`
	Type    BlockType `json:"type"`
	Meta    any       `json:"meta"`
	Data    *Data     `json:"data"`
	Blocks  []*Node   `json:"blocks,omitempty"`
	Edges   []*Edge   `json:"edges,omitempty"`
	Version string    `json:"version,omitempty"`

	parent *Node
}

func (n *Node) SetParent(parent *Node) {
	n.parent = parent
}

func (n *Node) Parent() *Node {
	return n.parent
}

type NodeMeta struct {
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Icon        string `json:"icon,omitempty"`
	SubTitle    string `json:"subTitle,omitempty"`
	MainColor   string `json:"mainColor,omitempty"`
}

type Edge struct {
	SourceNodeID string `json:"sourceNodeID"`
	TargetNodeID string `json:"targetNodeID"`
	SourcePortID string `json:"sourcePortID,omitempty"`
	TargetPortID string `json:"targetPortID,omitempty"`
}

type Data struct {
	Meta    *NodeMeta `json:"nodeMeta,omitempty"`
	Outputs []any     `json:"outputs,omitempty"` // either []*Variable or []*Param
	Inputs  *Inputs   `json:"inputs,omitempty"`
	Size    any       `json:"size,omitempty"`
}

type Inputs struct {
	InputParameters    []*Param        `json:"inputParameters"`
	Content            *BlockInput     `json:"content"`
	TerminatePlan      *TerminatePlan  `json:"terminatePlan,omitempty"`
	StreamingOutput    bool            `json:"streamingOutput,omitempty"`
	CallTransferVoice  bool            `json:"callTransferVoice,omitempty"`
	ChatHistoryWriting string          `json:"chatHistoryWriting,omitempty"`
	LLMParam           any             `json:"llmParam,omitempty"` // The LLMParam type may be one of the LLMParam or IntentDetectorLLMParam type or QALLMParam type
	FCParam            *FCParam        `json:"fcParam,omitempty"`
	SettingOnError     *SettingOnError `json:"settingOnError,omitempty"`

	LoopType           LoopType    `json:"loopType,omitempty"`
	LoopCount          *BlockInput `json:"loopCount,omitempty"`
	VariableParameters []*Param    `json:"variableParameters,omitempty"`

	Branches []*struct {
		Condition struct {
			Logic      LogicType    `json:"logic"`
			Conditions []*Condition `json:"conditions"`
		} `json:"condition"`
	} `json:"branches,omitempty"`

	NodeBatchInfo *NodeBatch `json:"batch,omitempty"` // node in batch mode

	*TextProcessor
	*SubWorkflow
	*IntentDetector
	*DatabaseNode
	*HttpRequestNode
	*KnowledgeIndexer
	*CodeRunner
	*PluginAPIParam
	*VariableAggregator
	*VariableAssigner
	*QA
	*Batch
	*Comment

	OutputSchema string `json:"outputSchema,omitempty"`
}

type Comment struct {
	SchemaType string `json:"schemaType,omitempty"`
	Note       any    `json:"note,omitempty"`
}

type TextProcessor struct {
	Method       TextProcessingMethod `json:"method,omitempty"`
	ConcatParams []*Param             `json:"concatParams,omitempty"`
	SplitParams  []*Param             `json:"splitParams,omitempty"`
}

type VariableAssigner struct {
	VariableTypeMap map[string]any `json:"variableTypeMap,omitempty"`
}

type LLMParam = []*Param
type IntentDetectorLLMParam = map[string]any
type QALLMParam struct {
	GenerationDiversity string               `json:"generationDiversity"`
	MaxTokens           int                  `json:"maxTokens"`
	ModelName           string               `json:"modelName"`
	ModelType           int64                `json:"modelType"`
	ResponseFormat      model.ResponseFormat `json:"responseFormat"`
	SystemPrompt        string               `json:"systemPrompt"`
	Temperature         float64              `json:"temperature"`
	TopP                float64              `json:"topP"`
}

type QA struct {
	AnswerType    QAAnswerType `json:"answer_type"`
	Limit         int          `json:"limit,omitempty"`
	ExtractOutput bool         `json:"extra_output,omitempty"`
	OptionType    QAOptionType `json:"option_type,omitempty"`
	Options       []struct {
		Name string `json:"name"`
	} `json:"options,omitempty"`
	Question      string      `json:"question,omitempty"`
	DynamicOption *BlockInput `json:"dynamic_option,omitempty"`
}

type QAAnswerType string

const (
	QAAnswerTypeOption QAAnswerType = "option"
	QAAnswerTypeText   QAAnswerType = "text"
)

type QAOptionType string

const (
	QAOptionTypeStatic  QAOptionType = "static"
	QAOptionTypeDynamic QAOptionType = "dynamic"
)

type RequestParameter struct {
	Name string
}

type FCParam struct {
	WorkflowFCParam *struct {
		WorkflowList []struct {
			WorkflowID      string `json:"workflow_id"`
			WorkflowVersion string `json:"workflow_version"`
			PluginID        string `json:"plugin_id"`
			PluginVersion   string `json:"plugin_version"`
			IsDraft         bool   `json:"is_draft"`
			FCSetting       *struct {
				RequestParameters  []*workflow.APIParameter `json:"request_params"`
				ResponseParameters []*workflow.APIParameter `json:"response_params"`
			} `json:"fc_setting,omitempty"`
		} `json:"workflowList,omitempty"`
	} `json:"workflowFCParam,omitempty"`
	PluginFCParam *struct {
		PluginList []struct {
			PluginID      string `json:"plugin_id"`
			ApiId         string `json:"api_id"`
			ApiName       string `json:"api_name"`
			PluginVersion string `json:"plugin_version"`
			IsDraft       bool   `json:"is_draft"`
			FCSetting     *struct {
				RequestParameters  []*workflow.APIParameter `json:"request_params"`
				ResponseParameters []*workflow.APIParameter `json:"response_params"`
			} `json:"fc_setting,omitempty"`
		}
	} `json:"pluginFCParam,omitempty"`

	KnowledgeFCParam *struct {
		GlobalSetting *struct {
			SearchMode                   int64   `json:"search_mode"`
			TopK                         int64   `json:"top_k"`
			MinScore                     float64 `json:"min_score"`
			UseNL2SQL                    bool    `json:"use_nl2_sql"`
			UseRewrite                   bool    `json:"use_rewrite"`
			UseRerank                    bool    `json:"use_rerank"`
			NoRecallReplyCustomizePrompt string  `json:"no_recall_reply_customize_prompt"`
			NoRecallReplyMode            int64   `json:"no_recall_reply_mode"`
		} `json:"global_setting,omitempty"`
		KnowledgeList []*struct {
			ID string `json:"id"`
		} `json:"knowledgeList,omitempty"`
	} `json:"knowledgeFCParam,omitempty"`
}

type Batch struct {
	BatchSize      *BlockInput `json:"batchSize,omitempty"`
	ConcurrentSize *BlockInput `json:"concurrentSize,omitempty"`
}

type NodeBatch struct {
	BatchEnable    bool     `json:"batchEnable"`
	BatchSize      int64    `json:"batchSize"`
	ConcurrentSize int64    `json:"concurrentSize"`
	InputLists     []*Param `json:"inputLists,omitempty"`
}

type IntentDetectorLLMConfig struct {
	ModelName      string     `json:"modelName"`
	ModelType      int        `json:"modelType"`
	Temperature    *float64   `json:"temperature"`
	TopP           *float64   `json:"topP"`
	MaxTokens      int        `json:"maxTokens"`
	ResponseFormat int64      `json:"responseFormat"`
	SystemPrompt   BlockInput `json:"systemPrompt"`
}

type VariableAggregator struct {
	MergeGroups []*Param `json:"mergeGroups,omitempty"`
}

type PluginAPIParam struct {
	APIParams []*Param `json:"apiParam"`
}

type CodeRunner struct {
	Code     string `json:"code"`
	Language int64  `json:"language"`
}

type KnowledgeIndexer struct {
	DatasetParam  []*Param      `json:"datasetParam,omitempty"`
	StrategyParam StrategyParam `json:"strategyParam,omitempty"`
}

type StrategyParam struct {
	ParsingStrategy struct {
		ParsingType     string `json:"parsingType,omitempty"`
		ImageExtraction bool   `json:"imageExtraction"`
		TableExtraction bool   `json:"tableExtraction"`
		ImageOcr        bool   `json:"imageOcr"`
	} `json:"parsingStrategy,omitempty"`
	ChunkStrategy struct {
		ChunkType     string  `json:"chunkType,omitempty"`
		SeparatorType string  `json:"separatorType,omitempty"`
		Separator     string  `json:"separator,omitempty"`
		MaxToken      int64   `json:"maxToken,omitempty"`
		Overlap       float64 `json:"overlap,omitempty"`
	} `json:"chunkStrategy,omitempty"`
	IndexStrategy any `json:"indexStrategy"`
}

type HttpRequestNode struct {
	APIInfo APIInfo             `json:"apiInfo,omitempty"`
	Body    Body                `json:"body,omitempty"`
	Headers []*Param            `json:"headers"`
	Params  []*Param            `json:"params"`
	Auth    *Auth               `json:"auth"`
	Setting *HttpRequestSetting `json:"setting"`
}

type APIInfo struct {
	Method string `json:"method"`
	URL    string `json:"url"`
}
type Body struct {
	BodyType string    `json:"bodyType"`
	BodyData *BodyData `json:"bodyData"`
}
type BodyData struct {
	Json     string `json:"json,omitempty"`
	FormData *struct {
		Data []*Param `json:"data"`
	} `json:"formData,omitempty"`
	FormURLEncoded []*Param `json:"formURLEncoded,omitempty"`
	RawText        string   `json:"rawText,omitempty"`
	Binary         struct {
		FileURL *BlockInput `json:"fileURL"`
	} `json:"binary"`
}

type Auth struct {
	AuthType string `json:"authType"`
	AuthData struct {
		CustomData struct {
			AddTo string   `json:"addTo"`
			Data  []*Param `json:"data,omitempty"`
		} `json:"customData"`
		BearerTokenData []*Param `json:"bearerTokenData,omitempty"`
	} `json:"authData"`

	AuthOpen bool `json:"authOpen"`
}

type HttpRequestSetting struct {
	Timeout    int64 `json:"timeout"`
	RetryTimes int64 `json:"retryTimes"`
}

type DatabaseNode struct {
	DatabaseInfoList []*DatabaseInfo `json:"databaseInfoList,omitempty"`
	SQL              string          `json:"sql,omitempty"`
	SelectParam      *SelectParam    `json:"selectParam,omitempty"`

	InsertParam *InsertParam `json:"insertParam,omitempty"`

	DeleteParam *DeleteParam `json:"deleteParam,omitempty"`

	UpdateParam *UpdateParam `json:"updateParam,omitempty"`
}

type DatabaseLogicType string

const (
	DatabaseLogicAnd DatabaseLogicType = "AND"
	DatabaseLogicOr  DatabaseLogicType = "OR"
)

type DBCondition struct {
	ConditionList [][]*Param        `json:"conditionList,omitempty"`
	Logic         DatabaseLogicType `json:"logic"`
}

type UpdateParam struct {
	Condition DBCondition `json:"condition"`
	FieldInfo [][]*Param  `json:"fieldInfo"`
}

type DeleteParam struct {
	Condition DBCondition `json:"condition"`
}

type InsertParam struct {
	FieldInfo [][]*Param `json:"fieldInfo"`
}

type SelectParam struct {
	Condition   *DBCondition `json:"condition,omitempty"` // may be nil
	OrderByList []struct {
		FieldID int64 `json:"fieldID"`
		IsAsc   bool  `json:"isAsc"`
	} `json:"orderByList,omitempty"`
	Limit     int64 `json:"limit"`
	FieldList []struct {
		FieldID    int64 `json:"fieldID"`
		IsDistinct bool  `json:"isDistinct"`
	} `json:"fieldList,omitempty"`
}

type DatabaseInfo struct {
	DatabaseInfoID string `json:"databaseInfoID"`
}

type IntentDetector struct {
	ChatHistorySetting *ChatHistorySetting `json:"chatHistorySetting,omitempty"`
	Intents            []*Intent           `json:"intents,omitempty"`
	Mode               string              `json:"mode,omitempty"`
}
type ChatHistorySetting struct {
	EnableChatHistory bool  `json:"enableChatHistory,omitempty"`
	ChatHistoryRound  int64 `json:"chatHistoryRound,omitempty"`
}

type Intent struct {
	Name string `json:"name"`
}
type Param struct {
	Name      string        `json:"name,omitempty"`
	Input     *BlockInput   `json:"input,omitempty"`
	Left      *BlockInput   `json:"left,omitempty"`
	Right     *BlockInput   `json:"right,omitempty"`
	Variables []*BlockInput `json:"variables,omitempty"`
}

type Variable struct {
	Name         string       `json:"name"`
	Type         VariableType `json:"type"`
	Required     bool         `json:"required,omitempty"`
	AssistType   AssistType   `json:"assistType,omitempty"`
	Schema       any          `json:"schema,omitempty"` // either []*Variable (for object) or *Variable (for list)
	Description  string       `json:"description,omitempty"`
	ReadOnly     bool         `json:"readOnly,omitempty"`
	DefaultValue any          `json:"defaultValue,omitempty"`
}

type BlockInput struct {
	Type       VariableType     `json:"type,omitempty" yaml:"Type,omitempty"`
	AssistType AssistType       `json:"assistType,omitempty" yaml:"AssistType,omitempty"`
	Schema     any              `json:"schema,omitempty" yaml:"Schema,omitempty"` // either *BlockInput(or *Variable) for list or []*Variable (for object)
	Value      *BlockInputValue `json:"value,omitempty" yaml:"Value,omitempty"`
}

type BlockInputValue struct {
	Type    BlockInputValueType `json:"type"`
	Content any                 `json:"content,omitempty"` // either string for text such as template, or BlockInputReference
	RawMeta any                 `json:"rawMeta,omitempty"`
}

type BlockInputReference struct {
	BlockID string        `json:"blockID"`
	Name    string        `json:"name,omitempty"`
	Path    []string      `json:"path,omitempty"`
	Source  RefSourceType `json:"source"`
}

type Condition struct {
	Operator OperatorType `json:"operator"`
	Left     *Param       `json:"left"`
	Right    *Param       `json:"right,omitempty"`
}

type SubWorkflow struct {
	WorkflowID      string `json:"workflowId,omitempty"`
	WorkflowVersion string `json:"workflowVersion,omitempty"`
	TerminationType int    `json:"type,omitempty"`
	SpaceID         string `json:"spaceId,omitempty"`
}

// BlockType is the enumeration of node types for front-end canvas schema.
// To add a new BlockType, start from a really big number such as 1000, to avoid conflict with future extensions.
type BlockType string

func (b BlockType) String() string {
	return string(b)
}

const (
	BlockTypeBotStart            BlockType = "1"
	BlockTypeBotEnd              BlockType = "2"
	BlockTypeBotLLM              BlockType = "3"
	BlockTypeBotAPI              BlockType = "4"
	BlockTypeBotCode             BlockType = "5"
	BlockTypeBotDataset          BlockType = "6"
	BlockTypeCondition           BlockType = "8"
	BlockTypeBotSubWorkflow      BlockType = "9"
	BlockTypeDatabase            BlockType = "12"
	BlockTypeBotMessage          BlockType = "13"
	BlockTypeBotText             BlockType = "15"
	BlockTypeQuestion            BlockType = "18"
	BlockTypeBotBreak            BlockType = "19"
	BlockTypeBotLoopSetVariable  BlockType = "20"
	BlockTypeBotLoop             BlockType = "21"
	BlockTypeBotIntent           BlockType = "22"
	BlockTypeBotDatasetWrite     BlockType = "27"
	BlockTypeBotInput            BlockType = "30"
	BlockTypeBotBatch            BlockType = "28"
	BlockTypeBotContinue         BlockType = "29"
	BlockTypeBotComment          BlockType = "31"
	BlockTypeBotVariableMerge    BlockType = "32"
	BlockTypeBotAssignVariable   BlockType = "40"
	BlockTypeDatabaseUpdate      BlockType = "42"
	BlockTypeDatabaseSelect      BlockType = "43"
	BlockTypeDatabaseDelete      BlockType = "44"
	BlockTypeBotHttp             BlockType = "45"
	BlockTypeDatabaseInsert      BlockType = "46"
	BlockTypeJsonSerialization   BlockType = "58"
	BlockTypeJsonDeserialization BlockType = "59"
	BlockTypeBotDatasetDelete    BlockType = "60"
)

type VariableType string

const (
	VariableTypeString  VariableType = "string"
	VariableTypeInteger VariableType = "integer"
	VariableTypeFloat   VariableType = "float"
	VariableTypeBoolean VariableType = "boolean"
	VariableTypeObject  VariableType = "object"
	VariableTypeList    VariableType = "list"
)

type AssistType = int64

const (
	AssistTypeNotSet  AssistType = 0
	AssistTypeDefault AssistType = 1
	AssistTypeImage   AssistType = 2
	AssistTypeDoc     AssistType = 3
	AssistTypeCode    AssistType = 4
	AssistTypePPT     AssistType = 5
	AssistTypeTXT     AssistType = 6
	AssistTypeExcel   AssistType = 7
	AssistTypeAudio   AssistType = 8
	AssistTypeZip     AssistType = 9
	AssistTypeVideo   AssistType = 10
	AssistTypeSvg     AssistType = 11
	AssistTypeVoice   AssistType = 12

	AssistTypeTime AssistType = 10000
)

type BlockInputValueType string

const (
	BlockInputValueTypeLiteral   BlockInputValueType = "literal"
	BlockInputValueTypeRef       BlockInputValueType = "ref"
	BlockInputValueTypeObjectRef BlockInputValueType = "object_ref"
)

type RefSourceType string

const (
	RefSourceTypeBlockOutput  RefSourceType = "block-output" // 代表引用了某个 Block 的输出隐式声明的变量
	RefSourceTypeGlobalApp    RefSourceType = "global_variable_app"
	RefSourceTypeGlobalSystem RefSourceType = "global_variable_system"
	RefSourceTypeGlobalUser   RefSourceType = "global_variable_user"
)

type TerminatePlan string

const (
	ReturnVariables  TerminatePlan = "returnVariables"
	UseAnswerContent TerminatePlan = "useAnswerContent"
)

type ErrorProcessType int

const (
	ErrorProcessTypeThrow           ErrorProcessType = 1
	ErrorProcessTypeDefault         ErrorProcessType = 2
	ErrorProcessTypeExceptionBranch ErrorProcessType = 3
)

type SettingOnError struct {
	DataOnErr   string            `json:"dataOnErr,omitempty"`
	Switch      bool              `json:"switch,omitempty"`
	ProcessType *ErrorProcessType `json:"processType,omitempty"`
	RetryTimes  int64             `json:"retryTimes,omitempty"`
	TimeoutMs   int64             `json:"timeoutMs,omitempty"`
	Ext         *struct {
		BackupLLMParam string `json:"backupLLMParam,omitempty"` // only for LLM Node, marshaled from QALLMParam
	} `json:"ext,omitempty"`
}

type LogicType int

const (
	_ LogicType = iota
	OR
	AND
)

type OperatorType int

const (
	_ OperatorType = iota
	Equal
	NotEqual
	LengthGreaterThan
	LengthGreaterThanEqual
	LengthLessThan
	LengthLessThanEqual
	Contain
	NotContain
	Empty
	NotEmpty
	True
	False
	GreaterThan
	GreaterThanEqual
	LessThan
	LessThanEqual
)

type TextProcessingMethod string

const (
	Concat TextProcessingMethod = "concat"
	Split  TextProcessingMethod = "split"
)

type LoopType string

const (
	LoopTypeArray    LoopType = "array"
	LoopTypeCount    LoopType = "count"
	LoopTypeInfinite LoopType = "infinite"
)

type WorkflowIdentity struct {
	ID      string `json:"id"`
	Version string `json:"version"`
}

func (c *Canvas) GetAllSubWorkflowIdentities() []*WorkflowIdentity {
	workflowEntities := make([]*WorkflowIdentity, 0)

	var collectSubWorkFlowEntities func(nodes []*Node)
	collectSubWorkFlowEntities = func(nodes []*Node) {
		for _, n := range nodes {
			if n.Type == BlockTypeBotSubWorkflow {
				workflowEntities = append(workflowEntities, &WorkflowIdentity{
					ID:      n.Data.Inputs.WorkflowID,
					Version: n.Data.Inputs.WorkflowVersion,
				})
			}
			if len(n.Blocks) > 0 {
				collectSubWorkFlowEntities(n.Blocks)
			}
		}
	}

	collectSubWorkFlowEntities(c.Nodes)

	return workflowEntities
}

func GenerateNodeIDForBatchMode(key string) string {
	return key + "_inner"
}

func IsGeneratedNodeForBatchMode(key string, parentKey string) bool {
	return key == GenerateNodeIDForBatchMode(parentKey)
}
