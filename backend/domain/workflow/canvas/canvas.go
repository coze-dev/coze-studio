package canvas

type Canvas struct {
	Nodes []*Node `json:"nodes"`
	Edges []*Edge `json:"edges"`
}

type Node struct {
	ID     string    `json:"id"`
	Type   BlockType `json:"type"`
	Data   *Data     `json:"data"`
	Blocks []*Node   `json:"blocks,omitempty"`
	Edges  []*Edge   `json:"edges,omitempty"`

	parent *Node
}

type NodeMeta struct {
	Title string `json:"title"`
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
	Inputs  *struct {
		InputParameters []*Param       `json:"inputParameters,omitempty"`
		Content         *BlockInput    `json:"content"`
		TerminatePlan   *TerminatePlan `json:"terminatePlan,omitempty"`
		StreamingOutput bool           `json:"streamingOutput,omitempty"`

		LLMParam       any             `json:"llmParam,omitempty"` // The LLMParam type may be one of the LLMParam or IntentDetectorLLMParam type
		SettingOnError *SettingOnError `json:"settingOnError,omitempty"`

		Branches []*struct {
			Condition struct {
				Logic      LogicType    `json:"logic"`
				Conditions []*Condition `json:"conditions"`
			} `json:"condition"`
		} `json:"branches,omitempty"`

		Method       TextProcessingMethod `json:"method,omitempty"`
		ConcatParams []*Param             `json:"concatParams,omitempty"`
		SplitParams  []*Param             `json:"splitParams,omitempty"`

		LoopType           LoopType    `json:"loopType,omitempty"`
		LoopCount          *BlockInput `json:"loopCount,omitempty"`
		VariableParameters []*Param    `json:"variableParameters,omitempty"`

		Intents []*Intent `json:"intents,omitempty"`
		Mode    string    `json:"mode,omitempty"`

		DatabaseInfoList []*DatabaseInfo `json:"databaseInfoList,omitempty"`
		SQL              string          `json:"sql,omitempty"`

		SelectParam *SelectParam `json:"selectParam,omitempty"`

		InsertParam *InsertParam `json:"insertParam,omitempty"`

		DeleteParam *DeleteParam `json:"deleteParam,omitempty"`

		UpdateParam *UpdateParam `json:"updateParam,omitempty"`
	} `json:"inputs,omitempty"`
}
type LLMParam = []*Param
type IntentDetectorLLMParam = map[string]any

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

type Intent struct {
	Name string `json:"name"`
}
type Param struct {
	Name  string      `json:"name,omitempty"`
	Input *BlockInput `json:"input,omitempty"`
	Left  *BlockInput `json:"left,omitempty"`
	Right *BlockInput `json:"right,omitempty"`
}

type Variable struct {
	Name       string       `json:"name"`
	Type       VariableType `json:"type"`
	Required   bool         `json:"required,omitempty"`
	AssistType AssistType   `json:"assistType,omitempty"`
	Schema     any          `json:"schema,omitempty"` // either []*Variable (for object) or *Variable (for list)
}

type BlockInput struct {
	Type       VariableType     `json:"type,omitempty" yaml:"Type,omitempty"`
	AssistType AssistType       `json:"assistType,omitempty" yaml:"AssistType,omitempty"`
	Schema     any              `json:"schema,omitempty" yaml:"Schema,omitempty"` // either *Param or []*Param (for object)
	Value      *BlockInputValue `json:"value,omitempty" yaml:"Value,omitempty"`
}

type BlockInputValue struct {
	Type    BlockInputValueType `json:"type"`
	Content any                 `json:"content,omitempty"` // either string for text such as template, or BlockInputReference
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

type BlockType string

func (b BlockType) String() string {
	return string(b)
}

const (
	BlockTypeVirtualStart BlockType = "virtual_start"
	BlockTypeVirtualEnd   BlockType = "virtual_end"
	BlockTypePlaceholder  BlockType = "placeholder" // loop嵌套块占位节点
	BlockTypeMock         BlockType = "mock"

	BlockTypeBotStart           BlockType = "1"
	BlockTypeBotEnd             BlockType = "2"
	BlockTypeBotLLM             BlockType = "3"
	BlockTypeBotAPI             BlockType = "4"
	BlockTypeBotCode            BlockType = "5"
	BlockTypeBotDataset         BlockType = "6"
	BlockTypeCondition          BlockType = "8"
	BlockTypeBotSubWorkflow     BlockType = "9"
	BlockTypeBotTypeConvert     BlockType = "10"
	BlockTypeVariable           BlockType = "11"
	BlockTypeDatabase           BlockType = "12"
	BlockTypeBotMessage         BlockType = "13"
	BlockTypeBotText            BlockType = "15"
	BlockTypeImageGenerate      BlockType = "16"
	BlockTypeImageReference     BlockType = "17"
	BlockTypeQuestion           BlockType = "18"
	BlockTypeBotBreak           BlockType = "19"
	BlockTypeBotLoopSetVariable BlockType = "20"
	BlockTypeBotLoop            BlockType = "21"
	BlockTypeBotIntent          BlockType = "22"
	BlockTypeDrawingBoard       BlockType = "23"
	BlockTypeBotSceneVariable   BlockType = "24"
	BlockTypeBotSceneChat       BlockType = "25"
	BlockTypeBotDatasetWrite    BlockType = "27"
	BlockTypeBotInput           BlockType = "30"
	BlockTypeBotBatch           BlockType = "28"
	BlockTypeBotContinue        BlockType = "29"
	BlockTypeBotComment         BlockType = "31"

	BlockTypeBotVariableMerge      BlockType = "32"
	BlockTypeBotUpsertTimeTrigger  BlockType = "34"
	BlockTypeBotDeleteTimeTrigger  BlockType = "35"
	BlockTypeBotQueryTimeTrigger   BlockType = "36"
	BlockTypeBotMessageList        BlockType = "37"
	BlockTypeBotClearConversation  BlockType = "38"
	BlockTypeBotCreateConversation BlockType = "39"

	BlockTypeBotAssignVariable BlockType = "40"
	BlockTypeDatabaseUpdate    BlockType = "42"
	BlockTypeDatabaseSelect    BlockType = "43"
	BlockTypeDatabaseDelete    BlockType = "44"
	BlockTypeBotHttp           BlockType = "45"
	BlockTypeDatabaseInsert    BlockType = "46"
	BlockTypeBotLocalPlugin    BlockType = "7"
)

type VariableType string

const (
	VariableTypeString  VariableType = "string"
	VariableTypeInteger VariableType = "integer"
	VariableTypeFloat   VariableType = "float"
	VariableTypeBoolean VariableType = "boolean"
	VariableTypeObject  VariableType = "object"
	VariableTypeList    VariableType = "list"
	VariableTypeAny     VariableType = "any"
	VariableTypeUnknown VariableType = "unknown"
	VariableTypeImage   VariableType = "image"

	VariableTypeStreamString VariableType = "__StreamString"
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

type SettingOnError struct {
	DataOnErr string `json:"dataOnErr"`
	Switch    bool   `json:"switch"`
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
