package entity

type ApiKey struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	ApiKey      string `json:"api_key"`
	ConnectorID int64  `json:"connector"`
	UserID      int64  `json:"user_id"`
	ExpiredAt   int64  `json:"expired_at"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

type CreateApiKey struct {
	Name   string `json:"name"`
	Expire int64  `json:"expire"`
	UserID int64  `json:"user_id"`
}

type DeleteApiKey struct {
	ID     int64 `json:"id"`
	UserID int64 `json:"user_id"`
}

type GetApiKey struct {
	ID int64 `json:"id"`
}

type ListApiKey struct {
	UserID int64 `json:"user_id"`
	Limit  int64 `json:"limit"`
	Page   int64 `json:"page"`
}

type ListApiKeyResp struct {
	ApiKeys []*ApiKey `json:"api_keys"`
	HasMore bool      `json:"has_more"`
}

type SaveMeta struct {
	ID     int64  `json:"id"`
	Name   string `json:"name"`
	UserID int64  `json:"user_id"`
}
type CheckPermission struct {
	ApiKey string `json:"api_key"`
	UserID int64  `json:"user_id"`
}
