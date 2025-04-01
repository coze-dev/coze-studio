package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type Ark struct {
	BaseURL   string `json:"base_url"`
	Region    string `json:"region"`
	APIKey    string `json:"api_key,omitempty"`
	AccessKey string `json:"access_key,omitempty"`
	SecretKey string `json:"secret_key,omitempty"`
}

func (a *Ark) Protocol() Protocol {
	return model.ProtocolArk
}
