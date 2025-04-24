package imagex

import "github.com/volcengine/volc-sdk-golang/service/imagex/v2"

type Imagex struct {
	*imagex.Imagex
	ServiceID string
	Domain    string
}
