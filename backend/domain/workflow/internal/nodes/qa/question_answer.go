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
	"strconv"
	"strings"
	"unicode"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type QuestionAnswer struct {
	config   *Config
	nodeMeta entity.NodeTypeMeta
}

type Config struct {
	QuestionTpl string
	AnswerType  AnswerType

	ChoiceType   ChoiceType
	FixedChoices []string

	// used for intent recognize if answer by choices and given a custom answer, as well as for extracting structured output from user response
	Model model.BaseChatModel

	// the following are required if AnswerType is AnswerDirectly and needs to extract from answer
	ExtractFromAnswer         bool
	AdditionalSystemPromptTpl string
	MaxAnswerCount            int
	OutputFields              map[string]*vo.TypeInfo

	NodeKey vo.NodeKey
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

func NewQuestionAnswer(_ context.Context, conf *Config) (*QuestionAnswer, error) {
	if conf == nil {
		return nil, errors.New("config is nil")
	}

	if conf.AnswerType == AnswerDirectly {
		if conf.ExtractFromAnswer {
			if conf.Model == nil {
				return nil, errors.New("model is required when extract from answer")
			}
			if len(conf.OutputFields) == 0 {
				return nil, errors.New("output fields is required when extract from answer")
			}
		}
	} else if conf.AnswerType == AnswerByChoices {
		if conf.ChoiceType == FixedChoices {
			if len(conf.FixedChoices) == 0 {
				return nil, errors.New("fixed choices is required when extract from answer")
			}
		}
	} else {
		return nil, fmt.Errorf("unknown answer type: %s", conf.AnswerType)
	}

	nodeMeta := entity.NodeMetaByNodeType(entity.NodeTypeQuestionAnswer)
	if nodeMeta == nil {
		return nil, errors.New("node meta not found for question answer")
	}

	return &QuestionAnswer{
		config:   conf,
		nodeMeta: *nodeMeta,
	}, nil
}

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

// Execute formats the question (optionally with choices), interrupts, then extracts the answer.
// input: the references by input fields, as well as the dynamic choices array if needed.
// output: USER_RESPONSE for direct answer, structured output if needs to extract from answer, and option ID / content for answer by choices.
func (q *QuestionAnswer) Execute(ctx context.Context, in map[string]any) (out map[string]any, err error) {
	var (
		questions  []*Question
		answers    []string
		isFirst    bool
		notResumed bool
	)

	questions, answers, isFirst, notResumed, err = q.extractCurrentState(in)
	if err != nil {
		return nil, err
	}

	if notResumed { // previously interrupted but not resumed this time, interrupt immediately
		return nil, compose.InterruptAndRerun
	}

	out = make(map[string]any)
	out[QuestionsKey] = questions
	out[AnswersKey] = answers

	switch q.config.AnswerType {
	case AnswerDirectly:
		if isFirst { // first execution, ask the question
			// format the question. Which is common to all use cases
			firstQuestion, err := nodes.TemplateRender(q.config.QuestionTpl, in)
			if err != nil {
				return nil, err
			}

			return nil, q.interrupt(ctx, firstQuestion, nil, nil, nil)
		}

		if q.config.ExtractFromAnswer {
			return q.extractFromAnswer(ctx, in, questions, answers)
		}

		out[UserResponseKey] = answers[0]
		return out, nil
	case AnswerByChoices:
		if !isFirst {
			lastAnswer := answers[len(answers)-1]
			lastQuestion := questions[len(questions)-1]
			for i, choice := range lastQuestion.Choices {
				if lastAnswer == choice {
					out[OptionIDKey] = intToAlphabet(i)
					out[OptionContentKey] = choice
					return out, nil
				}
			}

			index, err := q.intentDetect(ctx, lastAnswer, lastQuestion.Choices)
			if err != nil {
				return nil, err
			}

			if index >= 0 {
				out[OptionIDKey] = intToAlphabet(index)
				out[OptionContentKey] = lastQuestion.Choices[index]
				return out, nil
			}

			out[OptionIDKey] = "other"
			out[OptionContentKey] = lastAnswer
			return out, nil
		}

		// format the question. Which is common to all use cases
		firstQuestion, err := nodes.TemplateRender(q.config.QuestionTpl, in)
		if err != nil {
			return nil, err
		}

		var formattedChoices []string
		switch q.config.ChoiceType {
		case FixedChoices:
			for _, choice := range q.config.FixedChoices {
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
			return nil, fmt.Errorf("unknown choice type: %s", q.config.ChoiceType)
		}

		return nil, q.interrupt(ctx, firstQuestion, formattedChoices, nil, nil)
	default:
		return nil, fmt.Errorf("unknown answer type: %s", q.config.AnswerType)
	}
}

func (q *QuestionAnswer) extractFromAnswer(ctx context.Context, in map[string]any, questions []*Question, answers []string) (map[string]any, error) {
	fieldInfo := "FieldInfo"
	s, err := vo.TypeInfoToJSONSchema(q.config.OutputFields, &fieldInfo)
	if err != nil {
		return nil, err
	}

	sysPrompt := fmt.Sprintf(extractSystemPrompt, s)

	var requiredFields []string
	for fName, tInfo := range q.config.OutputFields {
		if tInfo.Required {
			requiredFields = append(requiredFields, fName)
		}
	}

	var formattedAdditionalPrompt string
	if len(q.config.AdditionalSystemPromptTpl) > 0 {
		additionalPrompt, err := nodes.TemplateRender(q.config.AdditionalSystemPromptTpl, in)
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
		messages = append(messages, schema.AssistantMessage(questions[i].Question, nil))

		answer := answers[i]
		if i == len(questions)-1 {
			userResponse = answer
			answer = answer + userPromptSuffix
		}
		messages = append(messages, schema.UserMessage(answer))
	}

	out, err := q.config.Model.Generate(ctx, messages)
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
			if len(answers) >= q.config.MaxAnswerCount {
				return nil, fmt.Errorf("max answer count= %d exceeded", q.config.MaxAnswerCount)
			}

			return nil, q.interrupt(ctx, nextQuestionStr, nil, questions, answers)
		}
	}

	fields, ok := outMap["fields"]
	if !ok {
		return nil, fmt.Errorf("field %s not found", fieldInfo)
	}

	realOutput, ws, err := nodes.ConvertInputs(ctx, fields.(map[string]any), q.config.OutputFields, nodes.SkipRequireCheck())
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

func (q *QuestionAnswer) extractCurrentState(in map[string]any) (
	qResult []*Question,
	aResult []string,
	isFirst bool, // whether this execution if the first ever execution for this node
	notResumed bool, // whether this node is previously interrupted, but not resumed this time, because another node is resumed
	err error) {
	questions, ok := in[QuestionsKey]
	if ok {
		qResult = questions.([]*Question)
	}

	answers, ok := in[AnswersKey]
	if ok {
		aResult = answers.([]string)
	}

	if len(qResult) == 0 && len(aResult) == 0 {
		return nil, nil, true, false, nil
	}

	if len(qResult) != len(aResult) && len(qResult) != len(aResult)+1 {
		return nil, nil, false, false,
			fmt.Errorf("invalid state, question count is expected to be equal to answer count or 1 more than answer count: %v", in)
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

	out, err := q.config.Model.Generate(ctx, messages)
	if err != nil {
		return -1, err
	}

	index, err := strconv.Atoi(out.Content)
	if err != nil {
		return -1, err
	}

	return index, nil
}

type QuestionAnswerAware interface {
	AddQuestion(nodeKey vo.NodeKey, question *Question)
	AddAnswer(nodeKey vo.NodeKey, answer string)
	GetQuestionsAndAnswers(nodeKey vo.NodeKey) ([]*Question, []string)
}

func (q *QuestionAnswer) interrupt(ctx context.Context, newQuestion string, choices []string, oldQuestions []*Question, oldAnswers []string) error {
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
		NodeKey:       q.config.NodeKey,
		NodeType:      entity.NodeTypeQuestionAnswer,
		NodeTitle:     q.nodeMeta.Name,
		NodeIcon:      q.nodeMeta.IconURL,
		InterruptData: interruptData,
		EventType:     entity.InterruptEventQuestion,
	}

	_ = compose.ProcessState(ctx, func(ctx context.Context, setter QuestionAnswerAware) error {
		setter.AddQuestion(q.config.NodeKey, &Question{
			Question: newQuestion,
			Choices:  choices,
		})
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

func AlphabetToInt(str string) (int, bool) {
	if len(str) != 1 {
		return 0, false
	}
	char := rune(str[0])
	char = unicode.ToUpper(char)
	if char >= 'A' && char <= 'Z' {
		return int(char - 'A'), true
	}
	return 0, false
}

func (q *QuestionAnswer) generateHistory(oldQuestions []*Question, oldAnswers []string, newQuestion *string, choices []string) []*message {
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
		contentType := ternary.IFElse(q.config.AnswerType == AnswerByChoices, "option", "text")
		questionMsg := &message{
			Type:        "question",
			ContentType: contentType,
			ID:          fmt.Sprintf("%s_%d", q.config.NodeKey, i*2),
		}

		if q.config.AnswerType == AnswerByChoices {
			questionMsg.Content = optionContent{
				Options:  conv(oldQuestion.Choices),
				Question: oldQuestion.Question,
			}
		} else {
			questionMsg.Content = oldQuestion.Question
		}

		answerMsg := &message{
			Type:        "answer",
			ContentType: contentType,
			Content:     oldAnswer,
			ID:          fmt.Sprintf("%s_%d", q.config.NodeKey, i+1),
		}

		history = append(history, questionMsg, answerMsg)
	}

	if newQuestion != nil {
		if q.config.AnswerType == AnswerByChoices {
			history = append(history, &message{
				Type:        "question",
				ContentType: "option",
				Content: optionContent{
					Options:  conv(choices),
					Question: *newQuestion,
				},
				ID: fmt.Sprintf("%s_%d", q.config.NodeKey, len(oldQuestions)*2),
			})
		} else {
			history = append(history, &message{
				Type:        "question",
				ContentType: "text",
				Content:     *newQuestion,
				ID:          fmt.Sprintf("%s_%d", q.config.NodeKey, len(oldQuestions)*2),
			})
		}
	}

	return history
}

func (q *QuestionAnswer) ToCallbackOutput(_ context.Context, out map[string]any) (*nodes.StructuredCallbackOutput, error) {
	questions := out[QuestionsKey].([]*Question)
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

	sOut := &nodes.StructuredCallbackOutput{
		Output: out,
		RawOutput: map[string]any{
			"messages": history,
		},
	}

	if hasSelected {
		sOut.RawOutput["selected"] = selected
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
