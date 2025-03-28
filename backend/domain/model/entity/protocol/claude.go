package protocol

import "code.byted.org/flow/opencoze/backend/infra/contract/model"

type Claude struct {
	ByBedrock bool

	// default config
	BaseURL string
	APIKey  string

	// bedrock config
	AccessKey       string
	SecretAccessKey string
	SessionToken    string
	Region          string
}

func (c *Claude) Protocol() Protocol {
	return model.ProtocolClaude
}
