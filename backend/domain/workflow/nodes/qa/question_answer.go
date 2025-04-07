package qa

import (
	"context"
	"errors"
	"fmt"
	"unicode"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type QuestionAnswer struct {
	config *Config
}

type Config struct {
	QuestionTpl string
	AnswerType  AnswerType

	ChoiceType   ChoiceType
	FixedChoices []*Choice

	// the following are required if AnswerType is AnswerDirectly and needs to extract from answer
	Model             model.ChatModel
	SystemPrompt      string
	ExtractFromAnswer bool
	OutputFields      map[string]*nodes.TypeInfo

	NodeKey string
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

type Choice struct {
	ID         string
	ContentTpl string
}

type FormattedChoice struct {
	ID      string
	Content string
}

const maxInterruptCount = 3
const (
	DynamicChoicesKey = "dynamic_choices"
	AnswersKey        = "$answers"
	UserResponseKey   = "USER_RESPONSE"
	OptionIDKey       = "optionId"
	OptionContentKey  = "optionContent"
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
			if len(conf.SystemPrompt) == 0 {
				return nil, errors.New("system prompt is required when extract from answer")
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

	return &QuestionAnswer{
		config: conf,
	}, nil
}

type Question struct {
	Question string
	Choices  []*FormattedChoice
}

type Answer struct {
	UserResponse  *string
	OptionID      *string
	OptionContent *string
}

// Execute formats the question (optionally with choices), interrupts, then extracts the answer.
// input: the references by input fields, as well as the dynamic choices array if needed.
// output: USER_RESPONSE for direct answer, structured output if needs to extract from answer, and option ID / content for answer by choices.
func (q *QuestionAnswer) Execute(ctx context.Context, in map[string]any) (map[string]any, error) {
	// format the question. Which is common to all use cases
	question, err := nodes.Jinja2TemplateRender(q.config.QuestionTpl, in)
	if err != nil {
		return nil, err
	}

	out := make(map[string]any)

	// first do the simplest case: direct answer without extracting to structured output
	switch q.config.AnswerType {
	case AnswerDirectly:
		if q.config.ExtractFromAnswer {
			panic("not implemented")
		}

		a, ok := nodes.TakeMapValue(in, compose.FieldPath{AnswersKey})
		if !ok { // first execution, ask the question
			_ = compose.ProcessState[QuestionSetter](ctx, func(ctx context.Context, setter QuestionSetter) error {
				setter.SetQuestion(q.config.NodeKey, &Question{
					Question: question,
				})
				return nil
			})
			return nil, compose.InterruptAndRerun
		}

		answers, ok := a.([]*Answer)
		if !ok {
			return nil, fmt.Errorf("invalid answers type: %T", a)
		}

		if len(answers) == 0 {
			_ = compose.ProcessState[QuestionSetter](ctx, func(ctx context.Context, setter QuestionSetter) error {
				setter.SetQuestion(q.config.NodeKey, &Question{
					Question: question,
				})
				return nil
			})
			return nil, compose.InterruptAndRerun
		}

		if len(answers) > 1 {
			return nil, fmt.Errorf("direct answer without structured output, returns more than one answer: %v", answers)
		}

		if answers[0].UserResponse == nil {
			return nil, fmt.Errorf("direct answer without structured output, return no user response: %v", answers)
		}

		out[UserResponseKey] = *answers[0].UserResponse
		return out, nil
	case AnswerByChoices:
		a, ok := nodes.TakeMapValue(in, compose.FieldPath{AnswersKey})
		if ok { // second execution, give the answer
			answers, ok := a.([]*Answer)
			if !ok {
				return nil, fmt.Errorf("invalid answers type: %T", a)
			}

			if len(answers) > 1 {
				return nil, fmt.Errorf("answer with choice, returns more than one answer: %v", answers)
			}

			if answers[0].OptionID == nil {
				return nil, fmt.Errorf("answer with choice, return no option ID: %v", answers)
			}

			if len(answers) == 1 {
				out[OptionIDKey] = *answers[0].OptionID
				out[OptionContentKey] = *answers[0].OptionContent
				return out, nil
			}
		}

		var formattedChoices []*FormattedChoice
		switch q.config.ChoiceType {
		case FixedChoices:
			for _, choice := range q.config.FixedChoices {
				formattedChoice, err := nodes.Jinja2TemplateRender(choice.ContentTpl, in)
				if err != nil {
					return nil, err
				}
				formattedChoices = append(formattedChoices, &FormattedChoice{
					ID:      choice.ID,
					Content: formattedChoice,
				})
			}
			_ = compose.ProcessState[QuestionSetter](ctx, func(ctx context.Context, setter QuestionSetter) error {
				setter.SetQuestion(q.config.NodeKey, &Question{
					Question: question,
					Choices:  formattedChoices,
				})
				return nil
			})
			return nil, compose.InterruptAndRerun
		case DynamicChoices:
			dynamicChoices, ok := nodes.TakeMapValue(in, compose.FieldPath{DynamicChoicesKey})
			if !ok {
				return nil, fmt.Errorf("dynamic choices not found")
			}

			const maxDynamicChoices = 26
			for i, choice := range dynamicChoices.([]any) {
				if i >= maxDynamicChoices {
					return nil, fmt.Errorf("dynamic choice with index %d is out of range", i)
				}
				c := choice.(string)
				formattedChoices = append(formattedChoices, &FormattedChoice{
					ID:      IntToAlphabet(i),
					Content: c,
				})
			}
			_ = compose.ProcessState[QuestionSetter](ctx, func(ctx context.Context, setter QuestionSetter) error {
				setter.SetQuestion(q.config.NodeKey, &Question{
					Question: question,
					Choices:  formattedChoices,
				})
				return nil
			})
			return nil, compose.InterruptAndRerun
		default:
			return nil, fmt.Errorf("unknown choice type: %s", q.config.ChoiceType)
		}
	default:
		return nil, fmt.Errorf("unknown answer type: %s", q.config.AnswerType)
	}
}

type QuestionSetter interface {
	SetQuestion(nodeKey string, question *Question)
}

func IntToAlphabet(num int) string {
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
