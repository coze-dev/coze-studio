package openauth

type GetAccessTokenRequest struct {
	UserID    string
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
