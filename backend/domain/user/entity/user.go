package entity

// UserIdentity
// TODO: 删除掉此实体，直接使用 UserID 即可
type UserIdentity struct {
	UserID  int64
	SpaceID int64
}

type User struct {
	UserID  int64
	SpaceID int64

	Name        string // 昵称
	UniqueName  string // 唯一名称 ·
	Description string
	IconURI     string
	IconURL     string
}
