package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type OpenAI struct {
	BaseURL    string
	APIType    string
	APIVersion string
	APIKey     string
}

func (o *OpenAI) Protocol() Protocol {
	return model.ProtocolOpenAI
}
