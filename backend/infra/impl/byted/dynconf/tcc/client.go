package tcc

import "code.byted.org/gopkg/tccclient"

type client struct {
	*tccclient.ClientV2
}

func (c *client) AddListener(key string, callback func(value string, err error)) error {
	return c.AddListener(key, callback)
}
