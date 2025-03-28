package agentflow

import (
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
)

var (
	chatPrompt = prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage(REACT_SYSTEM_PROMPT_JINJA2),
		schema.MessagesPlaceholder(placeholderOfChatHistory, true),
		schema.MessagesPlaceholder(placeholderOfUserInput, false),
	)
)
