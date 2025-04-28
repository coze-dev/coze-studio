package entity

type SessionData struct {
	UserID       int64
	SpaceID      int64
	DeviceID     int64
	RegisterTime int64
	ExpireAge    int64
	SessionID    string
}
