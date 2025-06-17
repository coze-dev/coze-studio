package openauth

type OAuthProvider string

const (
	OAuthProviderOfLarkPlugin OAuthProvider = "lark_plugin"
	OAuthProviderOfLark       OAuthProvider = "lark"
	OAuthProviderOfStandard   OAuthProvider = "standard"
)

type OAuthMode string

const (
	OAuthModeClientCredentials = "client_credentials"
)
