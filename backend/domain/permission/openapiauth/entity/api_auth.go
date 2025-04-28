package entity

type ApiKey struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	ApiKey    string `json:"api_key"`
	Expire    int64  `json:"expire"`
	CreatedAt int64  `json:"created_at"`
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
	Cursor int64 `json:"cursor"`
}

type ListApiKeyResp struct {
	ApiKeys []*ApiKey `json:"api_keys"`
	HasMore bool      `json:"has_more"`
	Cursor  int64     `json:"cursor"`
}

type CheckPermission struct {
	ApiKey string `json:"api_key"`
	UserId int64  `json:"user_id"`
}
