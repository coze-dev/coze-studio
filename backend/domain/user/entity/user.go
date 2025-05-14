package entity

// UserIdentity
// TODO: 删除掉此实体，直接使用 UserID 即可
type UserIdentity struct {
	UserID  int64
	SpaceID int64
}

type User struct {
	UserID int64

	Name         string // 昵称
	UniqueName   string // 唯一名称
	Email        string // 邮箱
	Description  string // 用户描述
	IconURI      string // 头像URI
	IconURL      string // 头像URL
	UserVerified bool   // 用户是否已验证
	CountryCode  int64  // 国家代码
	SessionKey   string // 会话密钥

	CreatedAt int64 // 创建时间
	UpdatedAt int64 // 更新时间
}
