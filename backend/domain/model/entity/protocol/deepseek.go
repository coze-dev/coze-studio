package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type Deepseek struct {
	BaseURL string
	APIKey  string
}

func (d *Deepseek) Protocol() Protocol {
	return model.ProtocolDeepseek
}
