package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type Deepseek struct {
	BaseURL string `json:"base_url"`
	APIKey  string `json:"api_key"`
}

func (d *Deepseek) Protocol() Protocol {
	return model.ProtocolDeepseek
}
