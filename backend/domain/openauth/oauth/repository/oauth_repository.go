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
	UserID   int64
	TokenURL string
	ClientID string
	Scopes   []string
}

type SetAccessTokenRequest struct {
	UserID      int64
	ClientID    string
	TokenURL    string
	AccessToken string
	Scopes      []string
	ExpiresIn   *time.Duration
}
