package openauth

type GetAccessTokenRequest struct {
	UserID    int64
	OAuthInfo *OAuthInfo
}

type OAuthInfo struct {
	OAuthProvider     OAuthProvider
	OAuthMode         OAuthMode
	ClientCredentials *ClientCredentials
}

type ClientCredentials struct {
	ClientID     string
	ClientSecret string
	TokenURL     string
	Scopes       []string
}
