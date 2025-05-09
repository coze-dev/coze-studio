package service

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/argon2"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type Config struct {
	DB      *gorm.DB
	IconOSS storage.Storage
	IDGen   idgen.IDGenerator
}

func NewUserDomain(ctx context.Context, conf *Config) user.User {
	return &userImpl{
		userDAO: dal.NewUserDAO(conf.DB),
		oss:     conf.IconOSS,
		idGen:   conf.IDGen,
	}
}

type userImpl struct {
	userDAO *dal.UserDAO
	oss     storage.Storage
	idGen   idgen.IDGenerator
}

func (u *userImpl) Login(ctx context.Context, req *user.LoginRequest) (resp *entity.User, err error) {

	userModel, err := u.userDAO.GetUsersByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	// 验证密码，使用 Argon2id 算法
	valid, err := verifyPassword(req.Password, userModel.Password)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, fmt.Errorf("password error")
	}

	uniqueSessionID, err := u.idGen.GenID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate session id: %w", err)
	}

	sessionKey := generateSessionKey(uniqueSessionID)

	// 更新用户会话密钥
	err = u.userDAO.UpdateSessionKey(ctx, userModel.ID, sessionKey)
	if err != nil {
		return nil, err
	}

	resURL, err := u.oss.GetObjectUrl(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL), nil
}

func (u *userImpl) Logout(ctx context.Context, userID int64) (err error) {

	err = u.userDAO.ClearSessionKey(ctx, userID)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) ResetPassword(ctx context.Context, req *user.ResetPasswordRequest) (resp *user.ResetPasswordResponse, err error) {

	// 使用 Argon2id 算法对密码进行哈希处理
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	err = u.userDAO.UpdatePassword(ctx, req.Email, hashedPassword)
	if err != nil {
		return nil, err
	}

	return &user.ResetPasswordResponse{
		Success: true,
	}, nil
}

func (u *userImpl) GetUserInfo(ctx context.Context, userID int64) (resp *entity.User, err error) {

	userModel, err := u.userDAO.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	resURL, err := u.oss.GetObjectUrl(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL), nil
}

func (u *userImpl) UpdateAvatar(ctx context.Context, userID int64, imagePayload []byte) (err error) {

	avatarKey := "user_avatar/" + strconv.FormatInt(userID, 10) + ".png"
	err = u.oss.PutObject(ctx, avatarKey, imagePayload)
	if err != nil {
		return err
	}

	err = u.userDAO.UpdateAvatar(ctx, userID, avatarKey)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) UpdateProfile(ctx context.Context, req *user.UpdateProfileRequest) (resp *user.UpdateProfileResponse, err error) {

	if req.UniqueName != "" {
		exist, err := u.userDAO.CheckUniqueNameExist(ctx, req.UniqueName)
		if err != nil {
			return nil, err
		}
		if exist {
			return nil, fmt.Errorf("unique name exists")
		}
	}

	updates := map[string]interface{}{
		"updated_at": time.Now().UnixMilli(),
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.UniqueName != "" {
		updates["unique_name"] = req.UniqueName
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}

	err = u.userDAO.UpdateProfile(ctx, req.UserID, updates)
	if err != nil {
		return nil, err
	}

	return &user.UpdateProfileResponse{
		Success: true,
	}, nil
}

func (u *userImpl) Create(ctx context.Context, req *user.CreateUserRequest) (resp *user.CreateUserResponse, err error) {

	exist, err := u.userDAO.CheckEmailExist(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if exist {
		return nil, fmt.Errorf("email exists")
	}

	if req.UniqueName != "" {
		exist, err = u.userDAO.CheckUniqueNameExist(ctx, req.UniqueName)
		if err != nil {
			return nil, err
		}
		if exist {
			return nil, fmt.Errorf("unique name exists")
		}
	}

	// 使用 Argon2id 算法对密码进行哈希处理
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	name := req.Name
	if name == "" {
		name = strings.Split(req.Email, "@")[0]
	}

	userID, err := u.idGen.GenID(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate id error: %w", err)
	}

	now := time.Now().UnixMilli()
	newUser := &model.User{
		ID:           userID,
		IconURI:      "default_icon/user_default_icon.png",
		Name:         name,
		UniqueName:   req.Email,
		Email:        req.Email,
		Password:     hashedPassword,
		Description:  req.Description,
		UserVerified: false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	err = u.userDAO.CreateUser(ctx, newUser)
	if err != nil {
		return nil, err
	}

	return &user.CreateUserResponse{
		UserID: newUser.ID,
	}, nil
}

func (u *userImpl) VerifySessionKey(ctx context.Context, sessionKey string) (user *entity.User, err error) {
	// 验证会话密钥
	_, err = verifySessionKey(sessionKey)
	if err != nil {
		return nil, fmt.Errorf("invalid session: %w", err)
	}

	// 从数据库获取用户信息
	userModel, err := u.userDAO.GetUserBySessionKey(ctx, sessionKey)
	if err != nil {
		return nil, err
	}

	resURL, err := u.oss.GetObjectUrl(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL), nil
}

func (u *userImpl) MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error) {

	userModels, err := u.userDAO.GetUsersByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	users = make([]*entity.User, 0, len(userModels))
	for _, um := range userModels {
		// 获取图片URL
		resURL, err := u.oss.GetObjectUrl(ctx, um.IconURI)
		if err != nil {
			continue // 如果获取图片URL失败，跳过该用户
		}

		users = append(users, userPo2Do(um, resURL))
	}

	return users, nil
}

func (u *userImpl) GetUserProfiles(ctx context.Context, userID int64) (user *entity.User, err error) {
	userInfos, err := u.MGetUserProfiles(ctx, []int64{userID})
	if err != nil {
		return nil, err
	}

	if len(userInfos) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", "user"),
			errorx.KV("id", strconv.FormatInt(userID, 10)))
	}

	return userInfos[0], nil
}

// Argon2id 参数
type argon2Params struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

// 默认的 Argon2id 参数
var defaultArgon2Params = &argon2Params{
	memory:      64 * 1024, // 64MB
	iterations:  3,
	parallelism: 4,
	saltLength:  16,
	keyLength:   32,
}

// 使用 Argon2id 算法对密码进行哈希处理
func hashPassword(password string) (string, error) {
	p := defaultArgon2Params

	// 生成随机盐值
	salt := make([]byte, p.saltLength)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}

	// 使用 Argon2id 算法计算哈希值
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		p.iterations,
		p.memory,
		p.parallelism,
		p.keyLength,
	)

	// 编码为 base64 格式
	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	// 格式：$argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
	encoded := fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		p.memory, p.iterations, p.parallelism, b64Salt, b64Hash)

	return encoded, nil
}

// 验证密码是否匹配
func verifyPassword(password, encodedHash string) (bool, error) {
	// 解析编码后的哈希字符串
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 {
		return false, fmt.Errorf("invalid hash format")
	}

	var p argon2Params
	_, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &p.memory, &p.iterations, &p.parallelism)
	if err != nil {
		return false, err
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false, err
	}
	p.saltLength = uint32(len(salt))

	decodedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false, err
	}
	p.keyLength = uint32(len(decodedHash))

	// 使用相同的参数和盐值计算哈希值
	computedHash := argon2.IDKey(
		[]byte(password),
		salt,
		p.iterations,
		p.memory,
		p.parallelism,
		p.keyLength,
	)

	// 比较计算得到的哈希值与存储的哈希值
	return subtle.ConstantTimeCompare(decodedHash, computedHash) == 1, nil
}

// Session 结构体，包含会话信息
type Session struct {
	ID        int64     // 会话唯一标识符
	CreatedAt time.Time // 创建时间
	ExpiresAt time.Time // 过期时间
}

// 默认会话有效期（24小时）
const defaultSessionDuration = 24 * time.Hour

// 用于签名的密钥（在实际应用中应从配置中读取或使用环境变量）
var hmacSecret = []byte("opencoze-session-hmac-key")

// 生成安全的会话密钥
func generateSessionKey(sessionID int64) string {
	// 生成随机字节作为会话ID
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		// 如果随机数生成失败，回退到UUID（不太可能发生）
		return uuid.New().String()
	}

	// 创建默认会话结构（不包含用户ID，将在Login方法中设置）
	session := Session{
		ID:        sessionID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(defaultSessionDuration),
	}

	// 序列化会话数据
	sessionData, err := json.Marshal(session)
	if err != nil {
		// 序列化失败时的回退方案
		return fmt.Sprintf("%d%s", time.Now().UnixNano(), uuid.New().String())
	}

	// 计算HMAC签名以确保完整性
	h := hmac.New(sha256.New, hmacSecret)
	h.Write(sessionData)
	signature := h.Sum(nil)

	// 组合会话数据和签名
	finalData := append(sessionData, signature...)

	// Base64编码最终结果
	return base64.URLEncoding.EncodeToString(finalData)
}

// 验证会话密钥的有效性
func verifySessionKey(sessionKey string) (*Session, error) {
	// 解码会话数据
	data, err := base64.URLEncoding.DecodeString(sessionKey)
	if err != nil {
		return nil, fmt.Errorf("invalid session format")
	}

	// 确保数据长够长，至少包含会话数据和签名
	if len(data) < 32 { // 简单检查，实际应该更严格
		return nil, fmt.Errorf("session data too short")
	}

	// 分离会话数据和签名
	sessionData := data[:len(data)-32] // 假设签名是32字节
	signature := data[len(data)-32:]

	// 验证签名
	h := hmac.New(sha256.New, hmacSecret)
	h.Write(sessionData)
	expectedSignature := h.Sum(nil)

	if !hmac.Equal(signature, expectedSignature) {
		return nil, fmt.Errorf("invalid session signature")
	}

	// 解析会话数据
	var session Session
	if err := json.Unmarshal(sessionData, &session); err != nil {
		return nil, fmt.Errorf("invalid session data")
	}

	// 检查会话是否过期
	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("session expired")
	}

	return &session, nil
}

func userPo2Do(model *model.User, iconURL string) *entity.User {
	return &entity.User{
		UserID:       model.ID,
		Name:         model.Name,
		UniqueName:   model.UniqueName,
		Email:        model.Email,
		Description:  model.Description,
		IconURI:      model.IconURI,
		IconURL:      iconURL,
		UserVerified: model.UserVerified,
		CountryCode:  model.CountryCode,
		SessionKey:   model.SessionKey,
		CreatedAt:    model.CreatedAt,
		UpdatedAt:    model.UpdatedAt,
	}
}
