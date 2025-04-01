package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type Claude struct {
	ByBedrock bool `json:"by_bedrock"`

	// default config
	BaseURL string `json:"base_url,omitempty"`
	APIKey  string `json:"api_key,omitempty"`

	// bedrock config
	AccessKey       string `json:"access_key,omitempty"`
	SecretAccessKey string `json:"secret_access_key,omitempty"`
	SessionToken    string `json:"session_token,omitempty"`
	Region          string `json:"region,omitempty"`
}

func (c *Claude) Protocol() Protocol {
	return model.ProtocolClaude
}
