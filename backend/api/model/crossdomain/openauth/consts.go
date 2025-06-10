package openauth

type OAuthProvider string

const (
	OAuthProviderOfLark     OAuthProvider = "lark"
	OAuthProviderOfStandard OAuthProvider = "standard"
)

type OAuthMode string

const (
	OAuthModeClientCredentials = "client_credentials"
)
