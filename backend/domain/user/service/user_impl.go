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
	"unicode/utf8"

	"golang.org/x/crypto/argon2"
	"gorm.io/gorm"

	iconEntity "code.byted.org/flow/opencoze/backend/domain/icon/entity"
	"code.byted.org/flow/opencoze/backend/domain/user"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type Config struct {
	DB      *gorm.DB
	IconOSS storage.Storage
	IDGen   idgen.IDGenerator
}

func NewUserDomain(ctx context.Context, conf *Config) user.User {
	return &userImpl{
		userDAO:      dal.NewUserDAO(conf.DB),
		spaceDAO:     dal.NewSpaceDAO(conf.DB),
		spaceUserDAO: dal.NewSpaceUserDAO(conf.DB),
		oss:          conf.IconOSS,
		idGen:        conf.IDGen,
	}
}

type userImpl struct {
	userDAO      *dal.UserDAO
	spaceDAO     *dal.SpaceDAO
	spaceUserDAO *dal.SpaceUserDAO
	oss          storage.Storage
	idGen        idgen.IDGenerator
}

func (u *userImpl) Login(ctx context.Context, email, password string) (user *userEntity.User, err error) {
	userModel, err := u.userDAO.GetUsersByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	// 验证密码，使用 Argon2id 算法
	valid, err := verifyPassword(password, userModel.Password)
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

	sessionKey, err := generateSessionKey(uniqueSessionID)
	if err != nil {
		return nil, err
	}

	// 更新用户会话密钥
	err = u.userDAO.UpdateSessionKey(ctx, userModel.ID, sessionKey)
	if err != nil {
		return nil, err
	}

	userModel.SessionKey = sessionKey

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

func (u *userImpl) ResetPassword(ctx context.Context, email, password string) (err error) {
	// 使用 Argon2id 算法对密码进行哈希处理
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return err
	}

	err = u.userDAO.UpdatePassword(ctx, email, hashedPassword)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) GetUserInfo(ctx context.Context, userID int64) (resp *userEntity.User, err error) {
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

func (u *userImpl) UpdateAvatar(ctx context.Context, userID int64, ext string, imagePayload []byte) (url string, err error) {
	avatarKey := "user_avatar/" + strconv.FormatInt(userID, 10) + "." + ext
	err = u.oss.PutObject(ctx, avatarKey, imagePayload)
	if err != nil {
		return "", err
	}

	err = u.userDAO.UpdateAvatar(ctx, userID, avatarKey)
	if err != nil {
		return "", err
	}

	url, err = u.oss.GetObjectUrl(ctx, avatarKey)
	if err != nil {
		return "", err
	}

	return url, nil
}

func (u *userImpl) UpdateProfile(ctx context.Context, req *user.UpdateProfileRequest) (err error) {
	updates := map[string]interface{}{
		"updated_at": time.Now().UnixMilli(),
	}

	if req.UniqueName != nil {
		uniqueName := ptr.From(req.UniqueName)
		charNum := utf8.RuneCountInString(uniqueName)
		if charNum < 4 || charNum > 20 {
			return errorx.New(errno.ErrInvalidParamCode, errorx.KV("msg", "unique name length must be between 4 and 20"))
		}

		exist, err := u.userDAO.CheckUniqueNameExist(ctx, uniqueName)
		if err != nil {
			return err
		}
		if exist {
			return errorx.New(errno.ErrInvalidParamCode,
				errorx.KV("msg", "unique name exists"))
		}

		updates["unique_name"] = uniqueName
	}

	if req.Name != nil {
		updates["name"] = ptr.From(req.Name)
	}

	if req.Description != nil {
		updates["description"] = ptr.From(req.Description)
	}

	err = u.userDAO.UpdateProfile(ctx, req.UserID, updates)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) Create(ctx context.Context, req *user.CreateUserRequest) (user *userEntity.User, err error) {
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

	spaceID := req.SpaceID
	if spaceID <= 0 {
		sid, err := u.idGen.GenID(ctx)
		if err != nil {
			return nil, fmt.Errorf("gen space_id failed: %w", err)
		}

		err = u.spaceDAO.CreateSpace(ctx, &model.Space{
			ID:          sid,
			Name:        "Personal Space",
			Description: "This is your personal space",
			IconURI:     iconEntity.EnterpriseIconURI,
			OwnerID:     userID,
			CreatorID:   userID,
			CreatedAt:   now,
			UpdatedAt:   now,
		})
		if err != nil {
			return nil, fmt.Errorf("create personal space failed: %w", err)
		}

		spaceID = sid
	}

	newUser := &model.User{
		ID:           userID,
		IconURI:      iconEntity.UserIconURI,
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
		return nil, fmt.Errorf("insert user failed: %w", err)
	}

	err = u.spaceUserDAO.AddSpaceUser(ctx, &model.SpaceUser{
		SpaceID:   spaceID,
		UserID:    userID,
		RoleType:  1,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return nil, fmt.Errorf("add space user failed: %w", err)
	}

	iconURL, err := u.oss.GetObjectUrl(ctx, newUser.IconURI)
	if err != nil {
		return nil, fmt.Errorf("get icon url failed: %w", err)
	}

	return userPo2Do(newUser, iconURL), nil
}

func (u *userImpl) ValidateSession(ctx context.Context, sessionKey string) (
	session *userEntity.Session, exist bool, err error,
) {
	// 验证会话密钥
	sessionModel, err := verifySessionKey(sessionKey)
	if err != nil {
		return nil, false, fmt.Errorf("invalid session: %w", err)
	}

	// 从数据库获取用户信息
	userModel, exist, err := u.userDAO.GetUserBySessionKey(ctx, sessionKey)
	if err != nil {
		return nil, false, err
	}

	if !exist {
		return nil, false, nil
	}

	return &userEntity.Session{
		UserID:    userModel.ID,
		CreatedAt: sessionModel.CreatedAt,
		ExpiresAt: sessionModel.ExpiresAt,
	}, true, nil
}

func (u *userImpl) MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*userEntity.User, err error) {
	userModels, err := u.userDAO.GetUsersByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	users = make([]*userEntity.User, 0, len(userModels))
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

func (u *userImpl) GetUserProfiles(ctx context.Context, userID int64) (user *userEntity.User, err error) {
	userInfos, err := u.MGetUserProfiles(ctx, []int64{userID})
	if err != nil {
		return nil, err
	}

	if len(userInfos) == 0 {
		return nil, errorx.New(errno.ErrResourceNotFound, errorx.KV("type", "user"),
			errorx.KV("id", conv.Int64ToStr(userID)))
	}

	return userInfos[0], nil
}

func (u *userImpl) GetUserSpaceList(ctx context.Context, userID int64) (spaces []*userEntity.Space, err error) {
	userSpaces, err := u.spaceUserDAO.GetSpaceList(ctx, userID)
	if err != nil {
		return nil, err
	}
	spaceIDs := slices.Transform(userSpaces, func(us *model.SpaceUser) int64 {
		return us.SpaceID
	})

	spaceModels, err := u.spaceDAO.GetSpaceByIDs(ctx, spaceIDs)
	if err != nil {
		return nil, err
	}
	uris := slices.ToMap(spaceModels, func(sm *model.Space) (string, bool) {
		return sm.IconURI, false
	})

	urls := make(map[string]string, len(uris))
	for uri := range uris {
		url, err := u.oss.GetObjectUrl(ctx, uri)
		if err != nil {
			return nil, err
		}
		urls[uri] = url
	}
	return slices.Transform(spaceModels, func(sm *model.Space) *userEntity.Space {
		return spacePo2Do(sm, urls[sm.IconURI])
	}), nil
}

func spacePo2Do(space *model.Space, iconUrl string) *userEntity.Space {
	return &userEntity.Space{
		ID:          space.ID,
		Name:        space.Name,
		Description: space.Description,
		IconURL:     iconUrl,
		SpaceType:   userEntity.SpaceTypePersonal,
		OwnerID:     space.OwnerID,
		CreatorID:   space.CreatorID,
		CreatedAt:   space.CreatedAt,
		UpdatedAt:   space.UpdatedAt,
	}
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
	ID        int64     `json:"id"`         // 会话唯一标识符
	CreatedAt time.Time `json:"created_at"` // 创建时间
	ExpiresAt time.Time `json:"expires_at"` // 过期时间
}

// 用于签名的密钥（在实际应用中应从配置中读取或使用环境变量）
var hmacSecret = []byte("opencoze-session-hmac-key")

// 生成安全的会话密钥
func generateSessionKey(sessionID int64) (string, error) {
	// 创建默认会话结构（不包含用户ID，将在Login方法中设置）
	session := Session{
		ID:        sessionID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(consts.DefaultSessionDuration),
	}

	// 序列化会话数据
	sessionData, err := json.Marshal(session)
	if err != nil {
		return "", err
	}

	// 计算HMAC签名以确保完整性
	h := hmac.New(sha256.New, hmacSecret)
	h.Write(sessionData)
	signature := h.Sum(nil)

	// 组合会话数据和签名
	finalData := append(sessionData, signature...)

	// Base64编码最终结果
	return base64.RawURLEncoding.EncodeToString(finalData), nil
}

// 验证会话密钥的有效性
func verifySessionKey(sessionKey string) (*Session, error) {
	// 解码会话数据
	data, err := base64.RawURLEncoding.DecodeString(sessionKey)
	if err != nil {
		return nil, fmt.Errorf("invalid session format: %w", err)
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
		return nil, fmt.Errorf("invalid session data: %w", err)
	}

	// 检查会话是否过期
	if time.Now().After(session.ExpiresAt) {
		return nil, fmt.Errorf("session expired")
	}

	return &session, nil
}

func userPo2Do(model *model.User, iconURL string) *userEntity.User {
	return &userEntity.User{
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
