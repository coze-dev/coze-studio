package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type OpenAI struct {
	BaseURL    string `json:"base_url,omitempty"`
	ByAzure    bool   `json:"by_azure,omitempty"`
	APIType    string `json:"api_type,omitempty"`
	APIVersion string `json:"api_version,omitempty"`
	APIKey     string `json:"api_key"`
}

func (o *OpenAI) Protocol() Protocol {
	return model.ProtocolOpenAI
}
