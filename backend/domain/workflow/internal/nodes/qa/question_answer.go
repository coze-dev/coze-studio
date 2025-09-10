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

package qa

import (
	"context"
	"errors"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"unicode"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	crossmodel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	crossmodelmgr "github.com/coze-dev/coze-studio/backend/crossdomain/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	schema2 "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type QuestionAnswer struct {
	model    model.BaseChatModel
	nodeMeta entity.NodeTypeMeta

	questionTpl string
	answerType  AnswerType

	choiceType   ChoiceType
	fixedChoices []string

	needExtractFromAnswer     bool
	additionalSystemPromptTpl string
	maxAnswerCount            int

	nodeKey      vo.NodeKey
	outputFields map[string]*vo.TypeInfo
}

type Config struct {
	QuestionTpl string
	AnswerType  AnswerType

	ChoiceType   ChoiceType
	FixedChoices []string

	// used for intent recognize if answer by choices and given a custom answer, as well as for extracting structured output from user response
	LLMParams *crossmodel.LLMParams

	// the following are required if AnswerType is AnswerDirectly and needs to extract from answer
	ExtractFromAnswer         bool
	AdditionalSystemPromptTpl string
	MaxAnswerCount            int
}

func (c *Config) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema2.NodeSchema, error) {
	ns := &schema2.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeQuestionAnswer,
		Name:    n.Data.Meta.Title,
		Configs: c,
	}

	qaConf := n.Data.Inputs.QA
	if qaConf == nil {
		return nil, fmt.Errorf("qa config is nil")
	}
	c.QuestionTpl = qaConf.Question

	var llmParams *crossmodel.LLMParams
	if n.Data.Inputs.LLMParam != nil {
		llmParamBytes, err := sonic.Marshal(n.Data.Inputs.LLMParam)
		if err != nil {
			return nil, err
		}
		var qaLLMParams vo.SimpleLLMParam
		err = sonic.Unmarshal(llmParamBytes, &qaLLMParams)
		if err != nil {
			return nil, err
		}

		llmParams, err = convertLLMParams(qaLLMParams)
		if err != nil {
			return nil, err
		}

		c.LLMParams = llmParams
	}

	answerType, err := convertAnswerType(qaConf.AnswerType)
	if err != nil {
		return nil, err
	}
	c.AnswerType = answerType

	var choiceType ChoiceType
	if len(qaConf.OptionType) > 0 {
		choiceType, err = convertChoiceType(qaConf.OptionType)
		if err != nil {
			return nil, err
		}
		c.ChoiceType = choiceType
	}

	if answerType == AnswerByChoices {
		switch choiceType {
		case FixedChoices:
			var options []string
			for _, option := range qaConf.Options {
				options = append(options, option.Name)
			}
			c.FixedChoices = options
		case DynamicChoices:
			inputSources, err := convert.CanvasBlockInputToFieldInfo(qaConf.DynamicOption, compose.FieldPath{DynamicChoicesKey}, n.Parent())
			if err != nil {
				return nil, err
			}
			ns.AddInputSource(inputSources...)

			inputTypes, err := convert.CanvasBlockInputToTypeInfo(qaConf.DynamicOption)
			if err != nil {
				return nil, err
			}
			ns.SetInputType(DynamicChoicesKey, inputTypes)
		default:
			return nil, fmt.Errorf("qa node is answer by options, but option type not provided")
		}
	} else if answerType == AnswerDirectly {
		c.ExtractFromAnswer = qaConf.ExtractOutput
		if qaConf.ExtractOutput {
			if llmParams == nil {
				return nil, fmt.Errorf("qa node needs to extract from answer, but LLMParams not provided")
			}
			c.AdditionalSystemPromptTpl = llmParams.SystemPrompt
			c.MaxAnswerCount = qaConf.Limit
			if err = convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
				return nil, err
			}
		}
	}

	if err = convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func convertLLMParams(params vo.SimpleLLMParam) (*crossmodel.LLMParams, error) {
	p := &crossmodel.LLMParams{}
	p.ModelName = params.ModelName
	p.ModelType = params.ModelType
	p.Temperature = &params.Temperature
	p.MaxTokens = params.MaxTokens
	p.TopP = &params.TopP
	p.ResponseFormat = params.ResponseFormat
	p.SystemPrompt = params.SystemPrompt
	return p, nil
}

func convertAnswerType(t vo.QAAnswerType) (AnswerType, error) {
	switch t {
	case vo.QAAnswerTypeOption:
		return AnswerByChoices, nil
	case vo.QAAnswerTypeText:
		return AnswerDirectly, nil
	default:
		return "", fmt.Errorf("invalid QAAnswerType: %s", t)
	}
}

func convertChoiceType(t vo.QAOptionType) (ChoiceType, error) {
	switch t {
	case vo.QAOptionTypeStatic:
		return FixedChoices, nil
	case vo.QAOptionTypeDynamic:
		return DynamicChoices, nil
	default:
		return "", fmt.Errorf("invalid QAOptionType: %s", t)
	}
}

func (c *Config) Build(ctx context.Context, ns *schema2.NodeSchema, _ ...schema2.BuildOption) (any, error) {
	if c.AnswerType == AnswerDirectly {
		if c.ExtractFromAnswer {
			if c.LLMParams == nil {
				return nil, errors.New("model is required when extract from answer")
			}
			if len(ns.OutputTypes) == 0 {
				return nil, errors.New("output fields is required when extract from answer")
			}
		}
	} else if c.AnswerType == AnswerByChoices {
		if c.ChoiceType == FixedChoices {
			if len(c.FixedChoices) == 0 {
				return nil, errors.New("fixed choices is required when extract from answer")
			}
		}
	} else {
		return nil, fmt.Errorf("unknown answer type: %s", c.AnswerType)
	}

	nodeMeta := entity.NodeMetaByNodeType(entity.NodeTypeQuestionAnswer)
	if nodeMeta == nil {
		return nil, errors.New("node meta not found for question answer")
	}

	var (
		m   model.BaseChatModel
		err error
	)
	if c.LLMParams != nil {
		m, _, err = crossmodelmgr.DefaultSVC().GetModel(ctx, c.LLMParams)
		if err != nil {
			return nil, err
		}
	}

	return &QuestionAnswer{
		model:                     m,
		nodeMeta:                  *nodeMeta,
		questionTpl:               c.QuestionTpl,
		answerType:                c.AnswerType,
		choiceType:                c.ChoiceType,
		fixedChoices:              c.FixedChoices,
		needExtractFromAnswer:     c.ExtractFromAnswer,
		additionalSystemPromptTpl: c.AdditionalSystemPromptTpl,
		maxAnswerCount:            c.MaxAnswerCount,
		nodeKey:                   ns.Key,
		outputFields:              ns.OutputTypes,
	}, nil
}

func (c *Config) BuildBranch(_ context.Context) (
	func(ctx context.Context, nodeOutput map[string]any) (int64, bool, error), bool) {
	if c.AnswerType != AnswerByChoices {
		return nil, false
	}

	return func(ctx context.Context, nodeOutput map[string]any) (int64, bool, error) {
		optionID, ok := nodeOutput[OptionIDKey]
		if !ok {
			return -1, false, fmt.Errorf("failed to take option id from input map: %v", nodeOutput)
		}

		if c.ChoiceType == DynamicChoices {
			if optionID.(string) == "other" {
				return -1, true, nil
			} else {
				return 0, false, nil
			}
		}

		if optionID.(string) == "other" {
			return -1, true, nil
		}

		optionIDInt, ok := AlphabetToInt(optionID.(string))
		if !ok {
			return -1, false, fmt.Errorf("failed to convert option id from input map: %v", optionID)
		}

		return optionIDInt, false, nil
	}, true
}

func (c *Config) ExpectPorts(_ context.Context, n *vo.Node) (expects []string) {
	if n.Data.Inputs.QA.AnswerType != vo.QAAnswerTypeOption {
		return expects
	}

	if n.Data.Inputs.QA.OptionType == vo.QAOptionTypeStatic {
		for index := range n.Data.Inputs.QA.Options {
			expects = append(expects, fmt.Sprintf(schema2.PortBranchFormat, index))
		}

		expects = append(expects, schema2.PortDefault)
		return expects
	}

	if n.Data.Inputs.QA.OptionType == vo.QAOptionTypeDynamic {
		expects = append(expects, fmt.Sprintf(schema2.PortBranchFormat, 0))
		expects = append(expects, schema2.PortDefault)
	}

	return expects
}

func (c *Config) RequireCheckpoint() bool {
	return true
}

type AnswerType string

const (
	AnswerDirectly  AnswerType = "directly"
	AnswerByChoices AnswerType = "by_choices"
)

type ChoiceType string

const (
	FixedChoices   ChoiceType = "fixed"
	DynamicChoices ChoiceType = "dynamic"
)

const (
	DynamicChoicesKey = "dynamic_option"
	QuestionsKey      = "$questions"
	AnswersKey        = "$answers"
	UserResponseKey   = "USER_RESPONSE"
	OptionIDKey       = "optionId"
	OptionContentKey  = "optionContent"
)

const (
	extractSystemPrompt = `# 角色
你是一个参数提取 agent，你的工作是从用户的回答中提取出多个字段的值，每个字段遵循以下规则
# 字段说明
%s
## 输出要求
- 严格以 json 格式返回答案。
- 严格确保答案采用有效的 JSON 格式。
- 按照字段说明提取出字段的值，将已经提取到的字段放在 fields 字段
- 对于未提取到的<必填字段>生成一个新的追问问题question
- 确保在追问问题中只包含所有未提取的<必填字段>
- 不要重复问之前问过的问题
- 问题的语种请和用户的输入保持一致，如英文、中文等
- 输出按照下面结构体格式返回，包含提取到的字段或者追问的问题
- 不要回复和提取无关的问题
type Output struct {
fields FieldInfo // According to the field description, the fields that have been extracted
question string // Follow-up question for the next round
}`
	extractUserPromptSuffix = `
- 严格以 json 格式返回答案。
- 严格确保答案采用有效的 JSON 格式。
- - 必填字段没有获取全则继续追问
- 必填字段: %s
%s
`
	additionalPersona = `
追问人设设定: %s
`
	choiceIntentDetectPrompt = `# Role
You are a semantic matching expert, good at analyzing the option that the user wants to choose based on the current context.
##Skill
Skill 1: Clearly identify which of the following options the user's reply is semantically closest to:
%s

##Restrictions
Strictly identify the intention and select the most suitable option. You can only reply with the option_id and no other content. If you think there is no suitable option, output -1
##Output format
Note: You can only output the id or -1. Your output can only be a pure number and no other content (including the reason)!`
)

type Question struct {
	Question string
	Choices  []string
}

type namedOpt struct {
	Name string `json:"name"`
}

type optionContent struct {
	Options  []namedOpt `json:"options"`
	Question string     `json:"question"`
}

type message struct {
	Type        string `json:"type"`
	ContentType string `json:"content_type"`
	Content     any    `json:"content"` // either optionContent or string
	ID          string `json:"id,omitempty"`
}

const (
	QuestionKey = "question_key"
	ChoicesKey  = "choices_key"
)

// Invoke formats the question (optionally with choices), interrupts, then extracts the answer.
// input: the references by input fields, as well as the dynamic choices array if needed.
// output: USER_RESPONSE for direct answer, structured output if needs to extract from answer, and option ID / content for answer by choices.
func (q *QuestionAnswer) Invoke(ctx context.Context, in map[string]any) (out map[string]any, err error) {
	var (
		questions                []map[string]any
		answers                  []string
		isFirst                  bool
		interruptedButNotResumed bool
	)

	questions, answers, isFirst, interruptedButNotResumed, err = q.extractCurrentState(ctx)
	if err != nil {
		return nil, err
	}

	if interruptedButNotResumed { // previously interrupted but not resumed this time, interrupt immediately
		return nil, compose.InterruptAndRerun
	}

	out = make(map[string]any)
	out[QuestionsKey] = questions
	out[AnswersKey] = answers

	switch q.answerType {
	case AnswerDirectly:
		if isFirst { // first execution, ask the question
			// format the question. Which is common to all use cases
			firstQuestion, err := nodes.TemplateRender(q.questionTpl, in)
			if err != nil {
				return nil, err
			}

			return nil, q.interrupt(ctx, firstQuestion, nil, nil, nil)
		}

		if q.needExtractFromAnswer {
			return q.extractFromAnswer(ctx, in, questions, answers)
		}

		out[UserResponseKey] = answers[0]
		return out, nil
	case AnswerByChoices:
		if !isFirst {
			lastAnswer := answers[len(answers)-1]
			lastQuestion := questions[len(questions)-1]
			choicesAny := lastQuestion[ChoicesKey].([]string)
			choices := make([]string, len(choicesAny))
			for i := range choicesAny {
				choices[i] = choicesAny[i]
			}
			for i, choice := range choices {
				if lastAnswer == choice {
					out[OptionIDKey] = intToAlphabet(i)
					out[OptionContentKey] = choice
					return out, nil
				}
			}

			index, err := q.intentDetect(ctx, lastAnswer, choices)
			if err != nil {
				return nil, err
			}

			if index >= 0 {
				out[OptionIDKey] = intToAlphabet(index)
				out[OptionContentKey] = choices[index]
				return out, nil
			}

			out[OptionIDKey] = "other"
			out[OptionContentKey] = lastAnswer
			return out, nil
		}

		// format the question. Which is common to all use cases
		firstQuestion, err := nodes.TemplateRender(q.questionTpl, in)
		if err != nil {
			return nil, err
		}

		var formattedChoices []string
		switch q.choiceType {
		case FixedChoices:
			for _, choice := range q.fixedChoices {
				formattedChoice, err := nodes.TemplateRender(choice, in)
				if err != nil {
					return nil, err
				}
				formattedChoices = append(formattedChoices, formattedChoice)
			}
		case DynamicChoices:
			dynamicChoices, ok := nodes.TakeMapValue(in, compose.FieldPath{DynamicChoicesKey})
			if !ok || len(dynamicChoices.([]any)) == 0 {
				return nil, vo.NewError(errno.ErrQuestionOptionsEmpty)
			}

			const maxDynamicChoices = 26
			for i, choice := range dynamicChoices.([]any) {
				if i >= maxDynamicChoices {
					break // take first 26 choices, discard the others
				}
				c := choice.(string)
				formattedChoices = append(formattedChoices, c)
			}
		default:
			return nil, fmt.Errorf("unknown choice type: %s", q.choiceType)
		}

		return nil, q.interrupt(ctx, firstQuestion, formattedChoices, nil, nil)
	default:
		return nil, fmt.Errorf("unknown answer type: %s", q.answerType)
	}
}

func (q *QuestionAnswer) extractFromAnswer(ctx context.Context, in map[string]any, questions []map[string]any,
	answers []string) (map[string]any, error) {
	fieldInfo := "FieldInfo"
	s, err := vo.TypeInfoToJSONSchema(q.outputFields, &fieldInfo)
	if err != nil {
		return nil, err
	}

	sysPrompt := fmt.Sprintf(extractSystemPrompt, s)

	var requiredFields []string
	for fName, tInfo := range q.outputFields {
		if tInfo.Required {
			requiredFields = append(requiredFields, fName)
		}
	}

	var formattedAdditionalPrompt string
	if len(q.additionalSystemPromptTpl) > 0 {
		additionalPrompt, err := nodes.TemplateRender(q.additionalSystemPromptTpl, in)
		if err != nil {
			return nil, err
		}

		formattedAdditionalPrompt = fmt.Sprintf(additionalPersona, additionalPrompt)
	}

	userPromptSuffix := fmt.Sprintf(extractUserPromptSuffix, requiredFields, formattedAdditionalPrompt)

	var (
		messages     = make([]*schema.Message, 0, len(questions)*2+1)
		userResponse string
	)
	messages = append(messages, schema.SystemMessage(sysPrompt))
	for i := range questions {
		messages = append(messages, schema.AssistantMessage(questions[i][QuestionKey].(string), nil))

		answer := answers[i]
		if i == len(questions)-1 {
			userResponse = answer
			answer = answer + userPromptSuffix
		}
		messages = append(messages, schema.UserMessage(answer))
	}

	out, err := q.model.Generate(ctx, messages)
	if err != nil {
		return nil, err
	}

	content := nodes.ExtractJSONString(out.Content)

	var outMap = make(map[string]any)
	err = sonic.UnmarshalString(content, &outMap)
	if err != nil {
		return nil, err
	}

	nextQuestion, ok := outMap["question"]
	if ok {
		nextQuestionStr, ok := nextQuestion.(string)
		if ok && len(nextQuestionStr) > 0 {
			if len(answers) >= q.maxAnswerCount {
				return nil, fmt.Errorf("max answer count= %d exceeded", q.maxAnswerCount)
			}

			return nil, q.interrupt(ctx, nextQuestionStr, nil, questions, answers)
		}
	}

	fields, ok := outMap["fields"]
	if !ok {
		return nil, fmt.Errorf("field %s not found", fieldInfo)
	}

	realOutput, ws, err := nodes.ConvertInputs(ctx, fields.(map[string]any), q.outputFields, nodes.SkipRequireCheck())
	if err != nil {
		return nil, err
	}

	if ws != nil {
		logs.CtxWarnf(ctx, "convert inputs warnings: %v", *ws)
	}

	realOutput[UserResponseKey] = userResponse
	realOutput[QuestionsKey] = questions
	realOutput[AnswersKey] = answers
	return realOutput, nil
}

func (q *QuestionAnswer) extractCurrentState(ctx context.Context) (
	qResult []map[string]any,
	aResult []string,
	isFirst bool, // whether this execution if the first ever execution for this node
	interruptedButNotResumed bool, // whether this node is previously interrupted, but not resumed this time, because another node is resumed
	err error) {
	var (
		intermediateResult map[string]any
		resumeData         string
		resumed            bool
	)
	_ = compose.ProcessState(ctx, func(_ context.Context, state nodes.IntermediateResultStore) error {
		intermediateResult = state.GetIntermediateResult(q.nodeKey)
		return nil
	})
	_ = compose.ProcessState(ctx, func(_ context.Context, state nodes.InterruptEventStore) error {
		resumeData, resumed = state.GetAndClearResumeData(q.nodeKey)
		return nil
	})

	if len(intermediateResult) == 0 {
		return nil, nil, true, false, nil
	}

	questions, ok := intermediateResult[QuestionsKey]
	if ok {
		qResult = questions.([]map[string]any)
	}

	answers, ok := intermediateResult[AnswersKey]
	if ok {
		aResult = answers.([]string)
		if resumed {
			newAnswers := append(slices.Clone(aResult), resumeData)
			_ = compose.ProcessState(ctx, func(_ context.Context, state nodes.IntermediateResultStore) error {
				state.SetIntermediateResult(q.nodeKey, map[string]any{
					QuestionsKey: questions,
					AnswersKey:   newAnswers,
				})
				return nil
			})
		}
	}

	if resumed {
		aResult = append(aResult, resumeData)
	}

	if len(qResult) == 0 && len(aResult) == 0 {
		return nil, nil, true, false, nil
	}

	if len(qResult) != len(aResult) && len(qResult) != len(aResult)+1 {
		return nil, nil, false, false,
			fmt.Errorf("invalid state, question count is expected to be equal to answer count "+
				"or 1 more than answer count. questions: %v, answers: %v", qResult, aResult)
	}

	return qResult, aResult, false, len(qResult) == len(aResult)+1, nil
}

func (q *QuestionAnswer) intentDetect(ctx context.Context, answer string, choices []string) (int, error) {
	type option struct {
		Option   string `json:"option"`
		OptionID int    `json:"option_id"`
	}

	options := make([]option, 0, len(choices))
	for i := range choices {
		options = append(options, option{Option: choices[i], OptionID: i})
	}

	optionsStr, err := sonic.MarshalString(options)
	if err != nil {
		return -1, err
	}

	sysPrompt := fmt.Sprintf(choiceIntentDetectPrompt, optionsStr)
	messages := []*schema.Message{
		schema.SystemMessage(sysPrompt),
		schema.UserMessage(answer),
	}

	out, err := q.model.Generate(ctx, messages)
	if err != nil {
		return -1, err
	}

	index, err := strconv.Atoi(out.Content)
	if err != nil {
		return -1, err
	}

	return index, nil
}

func (q *QuestionAnswer) interrupt(ctx context.Context, newQuestion string, choices []string,
	oldQuestions []map[string]any, oldAnswers []string) error {
	history := q.generateHistory(oldQuestions, oldAnswers, &newQuestion, choices)

	historyList := map[string][]*message{
		"messages": history,
	}
	interruptData, err := sonic.MarshalString(historyList)
	if err != nil {
		return err
	}

	eventID, err := workflow.GetRepository().GenID(ctx)
	if err != nil {
		return err
	}

	event := &entity.InterruptEvent{
		ID:            eventID,
		NodeKey:       q.nodeKey,
		NodeType:      entity.NodeTypeQuestionAnswer,
		NodeTitle:     q.nodeMeta.Name,
		NodeIcon:      q.nodeMeta.IconURI,
		InterruptData: interruptData,
		EventType:     entity.InterruptEventQuestion,
	}

	intermediateResult := map[string]any{
		QuestionsKey: oldQuestions,
		AnswersKey:   oldAnswers,
	}

	intermediateResult[QuestionsKey] = append(intermediateResult[QuestionsKey].([]map[string]any),
		map[string]any{
			QuestionKey: newQuestion,
			ChoicesKey:  choices,
		})

	_ = compose.ProcessState(ctx, func(ctx context.Context, state nodes.IntermediateResultStore) error {
		state.SetIntermediateResult(q.nodeKey, intermediateResult)
		return nil
	})

	return compose.NewInterruptAndRerunErr(event)
}

func intToAlphabet(num int) string {
	if num >= 0 && num <= 25 {
		char := rune('A' + num)
		return string(char)
	}
	return ""
}

func AlphabetToInt(str string) (int64, bool) {
	if len(str) != 1 {
		return 0, false
	}
	char := rune(str[0])
	char = unicode.ToUpper(char)
	if char >= 'A' && char <= 'Z' {
		return int64(char - 'A'), true
	}
	return 0, false
}

func (q *QuestionAnswer) generateHistory(oldQuestions []map[string]any, oldAnswers []string,
	newQuestion *string, choices []string) []*message {
	conv := func(opts []string) (namedOpts []namedOpt) {
		for _, opt := range opts {
			namedOpts = append(namedOpts, namedOpt{
				Name: opt,
			})
		}
		return namedOpts
	}

	history := make([]*message, 0, len(oldQuestions)+len(oldAnswers)+1)
	for i := 0; i < len(oldQuestions); i++ {
		oldQuestion := oldQuestions[i]
		oldAnswer := oldAnswers[i]
		contentType := ternary.IFElse(q.answerType == AnswerByChoices, "option", "text")
		questionMsg := &message{
			Type:        "question",
			ContentType: contentType,
			ID:          fmt.Sprintf("%s_%d", q.nodeKey, i*2),
		}

		if q.answerType == AnswerByChoices {
			questionMsg.Content = optionContent{
				Options:  conv(oldQuestion[ChoicesKey].([]string)),
				Question: oldQuestion[QuestionKey].(string),
			}
		} else {
			questionMsg.Content = oldQuestion[QuestionKey].(string)
		}

		answerMsg := &message{
			Type:        "answer",
			ContentType: contentType,
			Content:     oldAnswer,
			ID:          fmt.Sprintf("%s_%d", q.nodeKey, i+1),
		}

		history = append(history, questionMsg, answerMsg)
	}

	if newQuestion != nil {
		if q.answerType == AnswerByChoices {
			history = append(history, &message{
				Type:        "question",
				ContentType: "option",
				Content: optionContent{
					Options:  conv(choices),
					Question: *newQuestion,
				},
				ID: fmt.Sprintf("%s_%d", q.nodeKey, len(oldQuestions)*2),
			})
		} else {
			history = append(history, &message{
				Type:        "question",
				ContentType: "text",
				Content:     *newQuestion,
				ID:          fmt.Sprintf("%s_%d", q.nodeKey, len(oldQuestions)*2),
			})
		}
	}

	return history
}

func (q *QuestionAnswer) ToCallbackOutput(_ context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	questions := out[QuestionsKey].([]map[string]any)
	answers := out[AnswersKey].([]string)
	selected, hasSelected := out[OptionContentKey]
	history := q.generateHistory(questions, answers, nil, nil)
	for _, msg := range history {
		optionC, ok := msg.Content.(optionContent)
		if ok {
			msg.Content = optionC.Question
		}
		msg.ID = ""
	}

	delete(out, QuestionsKey)
	delete(out, AnswersKey)

	rawOutput := map[string]any{
		"messages": history,
	}

	if hasSelected {
		rawOutput["selected"] = selected
	}

	rawOutputStr, err := sonic.MarshalString(rawOutput)
	if err != nil {
		return nil, err
	}

	sOut := &nodes.StructuredCallbackOutput{
		Output:    out,
		RawOutput: ptr.Of(rawOutputStr),
	}

	return sOut, nil
}

func AppendInterruptData(interruptData string, resumeData string) (string, error) {
	var historyList = make(map[string][]*message)
	err := sonic.UnmarshalString(interruptData, &historyList)
	if err != nil {
		return "", err
	}

	lastQuestion := historyList["messages"][len(historyList["messages"])-1]
	segments := strings.Split(lastQuestion.ID, "_")
	nodeKey := segments[0]
	i, err := strconv.Atoi(segments[1])
	if err != nil {
		return "", err
	}

	answerMsg := &message{
		Type:        "answer",
		ContentType: lastQuestion.ContentType,
		Content:     resumeData,
		ID:          fmt.Sprintf("%s_%d", nodeKey, i+1),
	}

	historyList["messages"] = append(historyList["messages"], answerMsg)
	m, err := sonic.MarshalString(historyList)
	if err != nil {
		return "", err
	}

	return m, nil
}
