package repository

import (
	"context"
	"time"
)

type OAuthRepository interface {
	GetAccessToken(ctx context.Context, req *GetAccessTokenRequest) (accessToken string, err error)
	SetAccessToken(ctx context.Context, req *SetAccessTokenRequest) (err error)
}

type GetAccessTokenRequest struct {
	UserID   string
	TokenURL string
	ClientID string
	Scopes   []string
}

type SetAccessTokenRequest struct {
	UserID      string
	ClientID    string
	TokenURL    string
	AccessToken string
	Scopes      []string
	ExpiresIn   *time.Duration
}
