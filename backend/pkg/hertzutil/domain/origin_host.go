package domain

import (
	"net/url"

	"github.com/cloudwego/hertz/pkg/app"
)

const (
	HeaderKeyOfOrigin = "Origin"
	HeaderKeyOfHost   = "Host"
)

func GetOriginHost(c *app.RequestContext) string {
	origin := c.Request.Header.Get(HeaderKeyOfOrigin)
	if origin != "" {
		u, err := url.Parse(origin)
		if err == nil {
			return u.Hostname()
		}
	}

	host := c.Request.Header.Get(HeaderKeyOfHost)
	if host != "" {
		return host
	}

	return string(c.Request.URI().Host())
}
