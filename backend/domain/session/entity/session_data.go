package entity

type SessionData struct {
	UserID      int64
	Name        string
	Description string
	IconURI     string
	DeveloperID int64
	SpaceID     int64

	DeviceID    int64  // 设备ID
	UserAgent   string // 客户端UA
	ClientIP    string // 客户端IP
	DeviceType  string // 设备类型（web/ios/android）
	ExpireAfter int    // 会话有效期
}
