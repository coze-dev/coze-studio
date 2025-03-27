package intentrecognition

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

const SystemIntentPrompt = `
# Role
You are an intention classification expert, good at being able to judge which classification the user's input belongs to.

## Skills
Skill 1: Clearly determine which of the following intention classifications the user's input belongs to.
Intention classification list:
[
{"classificationId": 0, "content": "Other intentions"},
{{intents}}
]

Note:
- Please determine the match only between the user's input content and the Intention classification list content, without judging or categorizing the match with the classification ID.

{{advance}}

## Reply requirements
- The answer must be returned in JSON format.
- Strictly ensure that the output is in a valid JSON format.
- Do not add prefix "json or suffix""
- The answer needs to include the following fields such as:
{
"classificationId": 0,
"reason": "Unclear intentions"
}

##Limit
- Please do not reply in text.
`

const TopSeedSystemIntentPrompt = `
# Role
You are an intention classification expert, good at  being able to judge which classification the user's input belongs to.

## Skills
Skill 1: Clearly determine which of the following intention classifications the user's input belongs to.
Intention classification list:
[
{"classificationId": 0, "content": "Other intentions"},
{{intents}}
]

Note:
- Please determine the match only between the user's input content and the Intention classification list content, without judging or categorizing the match with the classification ID.

{{advance}}


##Limit
- Please do not reply in text.`

const TopSpeedAdvance = `## Reply requirements
- The answer must be a number indicated classificationId.
- if not match, please just output an number 0.
- do not output json format data, just output an number.`

type ModelConfig struct {
	ModelConfig *model.Config
	Protocol    model.Protocol
}

type Config struct {
	Intents      []string
	SystemPrompt string
	TopSeed      bool
	ModelConfig  *ModelConfig
}

type NodeOutput struct {
	ClassificationID any    `json:"classificationId"`
	Reason           string `json:"reason"`
}
type IntentResponse struct {
	Content     string
	InputToken  int
	OutputToken int
}
