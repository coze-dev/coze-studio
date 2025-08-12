/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

	uploadEntity "github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	userEntity "github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/domain/user/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/user/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Components struct {
	IconOSS   storage.Storage
	IDGen     idgen.IDGenerator
	UserRepo  repository.UserRepository
	SpaceRepo repository.SpaceRepository
}

func NewUserDomain(ctx context.Context, c *Components) User {
	return &userImpl{
		Components: c,
	}
}

type userImpl struct {
	*Components
}

func (u *userImpl) Login(ctx context.Context, email, password string) (user *userEntity.User, err error) {
	userModel, exist, err := u.UserRepo.GetUsersByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	if !exist {
		return nil, errorx.New(errno.ErrUserInfoInvalidateCode)
	}

	// Verify the password using the Argon2id algorithm
	valid, err := verifyPassword(password, userModel.Password)
	if err != nil {
		return nil, err
	}
	if !valid {
		return nil, errorx.New(errno.ErrUserInfoInvalidateCode)
	}

	uniqueSessionID, err := u.IDGen.GenID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate session id: %w", err)
	}

	sessionKey, err := generateSessionKey(uniqueSessionID)
	if err != nil {
		return nil, err
	}

	// Update user session key
	err = u.UserRepo.UpdateSessionKey(ctx, userModel.ID, sessionKey)
	if err != nil {
		return nil, err
	}

	userModel.SessionKey = sessionKey

	resURL, err := u.IconOSS.GetObjectUrl(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL), nil
}

func (u *userImpl) Logout(ctx context.Context, userID int64) (err error) {
	err = u.UserRepo.ClearSessionKey(ctx, userID)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) ResetPassword(ctx context.Context, email, password string) (err error) {
	// Hashing passwords using the Argon2id algorithm
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return err
	}

	err = u.UserRepo.UpdatePassword(ctx, email, hashedPassword)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) GetUserInfo(ctx context.Context, userID int64) (resp *userEntity.User, err error) {
	if userID <= 0 {
		return nil, errorx.New(errno.ErrUserInvalidParamCode,
			errorx.KVf("msg", "invalid user id : %d", userID))
	}

	userModel, err := u.UserRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	resURL, err := u.IconOSS.GetObjectUrl(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL), nil
}

func (u *userImpl) UpdateAvatar(ctx context.Context, userID int64, ext string, imagePayload []byte) (url string, err error) {
	avatarKey := "user_avatar/" + strconv.FormatInt(userID, 10) + "." + ext
	err = u.IconOSS.PutObject(ctx, avatarKey, imagePayload)
	if err != nil {
		return "", err
	}

	err = u.UserRepo.UpdateAvatar(ctx, userID, avatarKey)
	if err != nil {
		return "", err
	}

	url, err = u.IconOSS.GetObjectUrl(ctx, avatarKey)
	if err != nil {
		return "", err
	}

	return url, nil
}

func (u *userImpl) ValidateProfileUpdate(ctx context.Context, req *ValidateProfileUpdateRequest) (
	resp *ValidateProfileUpdateResponse, err error,
) {
	if req.UniqueName == nil && req.Email == nil {
		return nil, errorx.New(errno.ErrUserInvalidParamCode, errorx.KV("msg", "missing parameter"))
	}

	if req.UniqueName != nil {
		uniqueName := ptr.From(req.UniqueName)
		charNum := utf8.RuneCountInString(uniqueName)

		if charNum < 4 || charNum > 20 {
			return &ValidateProfileUpdateResponse{
				Code: UniqueNameTooShortOrTooLong,
				Msg:  "unique name length should be between 4 and 20",
			}, nil
		}

		exist, err := u.UserRepo.CheckUniqueNameExist(ctx, uniqueName)
		if err != nil {
			return nil, err
		}

		if exist {
			return &ValidateProfileUpdateResponse{
				Code: UniqueNameExist,
				Msg:  "unique name existed",
			}, nil
		}
	}

	return &ValidateProfileUpdateResponse{
		Code: ValidateSuccess,
		Msg:  "success",
	}, nil
}

func (u *userImpl) UpdateProfile(ctx context.Context, req *UpdateProfileRequest) error {
	updates := map[string]interface{}{
		"updated_at": time.Now().UnixMilli(),
	}

	if req.UniqueName != nil {
		resp, err := u.ValidateProfileUpdate(ctx, &ValidateProfileUpdateRequest{
			UniqueName: req.UniqueName,
		})
		if err != nil {
			return err
		}

		if resp.Code != ValidateSuccess {
			return errorx.New(errno.ErrUserInvalidParamCode, errorx.KV("msg", resp.Msg))
		}

		updates["unique_name"] = ptr.From(req.UniqueName)
	}

	if req.Name != nil {
		updates["name"] = ptr.From(req.Name)
	}

	if req.Description != nil {
		updates["description"] = ptr.From(req.Description)
	}

	if req.Locale != nil {
		updates["locale"] = ptr.From(req.Locale)
	}

	err := u.UserRepo.UpdateProfile(ctx, req.UserID, updates)
	if err != nil {
		return err
	}

	return nil
}

func (u *userImpl) Create(ctx context.Context, req *CreateUserRequest) (user *userEntity.User, err error) {
	exist, err := u.UserRepo.CheckEmailExist(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	if exist {
		return nil, errorx.New(errno.ErrUserEmailAlreadyExistCode, errorx.KV("email", req.Email))
	}

	if req.UniqueName != "" {
		exist, err = u.UserRepo.CheckUniqueNameExist(ctx, req.UniqueName)
		if err != nil {
			return nil, err
		}
		if exist {
			return nil, errorx.New(errno.ErrUserUniqueNameAlreadyExistCode, errorx.KV("name", req.UniqueName))
		}
	}

	// Hashing passwords using the Argon2id algorithm
	hashedPassword, err := hashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	name := req.Name
	if name == "" {
		name = strings.Split(req.Email, "@")[0]
	}

	userID, err := u.IDGen.GenID(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate id error: %w", err)
	}

	now := time.Now().UnixMilli()

	spaceID := req.SpaceID
	if spaceID <= 0 {
		var sid int64
		sid, err = u.IDGen.GenID(ctx)
		if err != nil {
			return nil, fmt.Errorf("gen space_id failed: %w", err)
		}

		err = u.SpaceRepo.CreateSpace(ctx, &model.Space{
			ID:          sid,
			Name:        "Personal Space",
			Description: "This is your personal space",
			IconURI:     uploadEntity.EnterpriseIconURI,
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
		IconURI:      uploadEntity.UserIconURI,
		Name:         name,
		UniqueName:   u.getUniqueNameFormEmail(ctx, req.Email),
		Email:        req.Email,
		Password:     hashedPassword,
		Description:  req.Description,
		UserVerified: false,
		Locale:       req.Locale,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	err = u.UserRepo.CreateUser(ctx, newUser)
	if err != nil {
		return nil, fmt.Errorf("insert user failed: %w", err)
	}

	err = u.SpaceRepo.AddSpaceUser(ctx, &model.SpaceUser{
		SpaceID:   spaceID,
		UserID:    userID,
		RoleType:  1,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return nil, fmt.Errorf("add space user failed: %w", err)
	}

	iconURL, err := u.IconOSS.GetObjectUrl(ctx, newUser.IconURI)
	if err != nil {
		return nil, fmt.Errorf("get icon url failed: %w", err)
	}

	return userPo2Do(newUser, iconURL), nil
}

func (u *userImpl) getUniqueNameFormEmail(ctx context.Context, email string) string {
	arr := strings.Split(email, "@")
	if len(arr) != 2 {
		return email
	}

	username := arr[0]

	exist, err := u.UserRepo.CheckUniqueNameExist(ctx, username)
	if err != nil {
		logs.CtxWarnf(ctx, "check unique name exist failed: %v", err)
		return email
	}

	if exist {
		logs.CtxWarnf(ctx, "unique name %s already exist", username)

		return email
	}

	return username
}

func (u *userImpl) ValidateSession(ctx context.Context, sessionKey string) (
	session *userEntity.Session, exist bool, err error,
) {
	// authentication session key
	sessionModel, err := verifySessionKey(sessionKey)
	if err != nil {
		return nil, false, errorx.New(errno.ErrUserAuthenticationFailed, errorx.KV("reason", "access denied"))
	}

	// Retrieve user information from the database
	userModel, exist, err := u.UserRepo.GetUserBySessionKey(ctx, sessionKey)
	if err != nil {
		return nil, false, err
	}

	if !exist {
		return nil, false, nil
	}

	return &userEntity.Session{
		UserID:    userModel.ID,
		Locale:    userModel.Locale,
		CreatedAt: sessionModel.CreatedAt,
		ExpiresAt: sessionModel.ExpiresAt,
	}, true, nil
}

func (u *userImpl) MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*userEntity.User, err error) {
	userModels, err := u.UserRepo.GetUsersByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	users = make([]*userEntity.User, 0, len(userModels))
	for _, um := range userModels {
		// Get image URL
		resURL, err := u.IconOSS.GetObjectUrl(ctx, um.IconURI)
		if err != nil {
			continue // If getting the image URL fails, skip the user
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
		return nil, errorx.New(errno.ErrUserResourceNotFound, errorx.KV("type", "user"),
			errorx.KV("id", conv.Int64ToStr(userID)))
	}

	return userInfos[0], nil
}

func (u *userImpl) GetUserSpaceList(ctx context.Context, userID int64) (spaces []*userEntity.Space, err error) {
	userSpaces, err := u.SpaceRepo.GetSpaceList(ctx, userID)
	if err != nil {
		return nil, err
	}
	spaceIDs := slices.Transform(userSpaces, func(us *model.SpaceUser) int64 {
		return us.SpaceID
	})

	spaceModels, err := u.SpaceRepo.GetSpaceByIDs(ctx, spaceIDs)
	if err != nil {
		return nil, err
	}
	uris := slices.ToMap(spaceModels, func(sm *model.Space) (string, bool) {
		return sm.IconURI, false
	})

	urls := make(map[string]string, len(uris))
	for uri := range uris {
		url, err := u.IconOSS.GetObjectUrl(ctx, uri)
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

// Argon2id parameter
type argon2Params struct {
	memory      uint32
	iterations  uint32
	parallelism uint8
	saltLength  uint32
	keyLength   uint32
}

// Default Argon2id parameters
var defaultArgon2Params = &argon2Params{
	memory:      64 * 1024, // 64MB
	iterations:  3,
	parallelism: 4,
	saltLength:  16,
	keyLength:   32,
}

// Hashing passwords using the Argon2id algorithm
func hashPassword(password string) (string, error) {
	p := defaultArgon2Params

	// Generate random salt values
	salt := make([]byte, p.saltLength)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}

	// Calculate the hash value using the Argon2id algorithm
	hash := argon2.IDKey(
		[]byte(password),
		salt,
		p.iterations,
		p.memory,
		p.parallelism,
		p.keyLength,
	)

	// Encoding to base64 format
	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)

	// Format: $argon2id $v = 19 $m = 65536, t = 3, p = 4 $< salt > $< hash >
	encoded := fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		p.memory, p.iterations, p.parallelism, b64Salt, b64Hash)

	return encoded, nil
}

// Verify that the passwords match
func verifyPassword(password, encodedHash string) (bool, error) {
	// Parse the encoded hash string
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

	// Calculate the hash value using the same parameters and salt values
	computedHash := argon2.IDKey(
		[]byte(password),
		salt,
		p.iterations,
		p.memory,
		p.parallelism,
		p.keyLength,
	)

	// Compare the calculated hash value with the stored hash value
	return subtle.ConstantTimeCompare(decodedHash, computedHash) == 1, nil
}

// Session structure, which contains session information
type Session struct {
	ID        int64     `json:"id"`         // Session unique device identifier
	CreatedAt time.Time `json:"created_at"` // creation time
	ExpiresAt time.Time `json:"expires_at"` // expiration time
}

// The key used for signing (in practice you should read from the configuration or use environment variables)
var hmacSecret = []byte("opencoze-session-hmac-key")

// Generate a secure session key
func generateSessionKey(sessionID int64) (string, error) {
	// Create the default session structure (without the user ID, which will be set in the Login method)
	session := Session{
		ID:        sessionID,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(consts.DefaultSessionDuration),
	}

	// Serialize session data
	sessionData, err := json.Marshal(session)
	if err != nil {
		return "", err
	}

	// Calculate HMAC signatures to ensure integrity
	h := hmac.New(sha256.New, hmacSecret)
	h.Write(sessionData)
	signature := h.Sum(nil)

	// Combining session data and signatures
	finalData := append(sessionData, signature...)

	// Base64 encoding final result
	return base64.RawURLEncoding.EncodeToString(finalData), nil
}

// Verify the validity of the session key
func verifySessionKey(sessionKey string) (*Session, error) {
	// Decode session data
	data, err := base64.RawURLEncoding.DecodeString(sessionKey)
	if err != nil {
		return nil, fmt.Errorf("invalid session format: %w", err)
	}

	// Make sure the data is long enough to include at least session data and signatures
	if len(data) < 32 { // Simple inspection should actually be more rigorous
		return nil, fmt.Errorf("session data too short")
	}

	// Separating session data and signatures
	sessionData := data[:len(data)-32] // Assume the signature is 32 bytes
	signature := data[len(data)-32:]

	// verify signature
	h := hmac.New(sha256.New, hmacSecret)
	h.Write(sessionData)
	expectedSignature := h.Sum(nil)

	if !hmac.Equal(signature, expectedSignature) {
		return nil, fmt.Errorf("invalid session signature")
	}

	// Parsing session data
	var session Session
	if err := json.Unmarshal(sessionData, &session); err != nil {
		return nil, fmt.Errorf("invalid session data: %w", err)
	}

	// Check if the session has expired
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
		Locale:       model.Locale,
		SessionKey:   model.SessionKey,
		CreatedAt:    model.CreatedAt,
		UpdatedAt:    model.UpdatedAt,
	}
}

// GetSpaceMembers 获取空间成员列表
func (u *userImpl) GetSpaceMembers(ctx context.Context, spaceID int64, page, pageSize int32, roleType *int32) (members []*userEntity.SpaceMember, total int64, err error) {
	spaceUsers, total, err := u.SpaceRepo.GetSpaceMembers(ctx, spaceID, page, pageSize, roleType)
	if err != nil {
		return nil, 0, fmt.Errorf("get space members failed: %w", err)
	}

	if len(spaceUsers) == 0 {
		return make([]*userEntity.SpaceMember, 0), total, nil
	}

	// 获取用户信息
	userIDs := make([]int64, len(spaceUsers))
	for i, su := range spaceUsers {
		userIDs[i] = su.UserID
	}

	userModels, err := u.UserRepo.GetUsersByIDs(ctx, userIDs)
	if err != nil {
		return nil, 0, fmt.Errorf("get users by IDs failed: %w", err)
	}

	// 创建用户ID到用户信息的映射
	userMap := make(map[int64]*model.User)
	for _, user := range userModels {
		userMap[user.ID] = user
	}

	// 构建成员列表
	members = make([]*userEntity.SpaceMember, len(spaceUsers))
	for i, su := range spaceUsers {
		user := userMap[su.UserID]
		if user == nil {
			continue
		}

		iconURL := ""
		if u.IconOSS != nil {
			iconURL, _ = u.IconOSS.GetObjectUrl(ctx, user.IconURI)
		}

		userInfo := &userEntity.User{
			UserID:      user.ID,
			Name:        user.Name,
			UniqueName:  user.UniqueName,
			Email:       user.Email,
			IconURL:     iconURL,
			CreatedAt:   user.CreatedAt,
		}

		members[i] = &userEntity.SpaceMember{
			ID:        su.ID,
			SpaceID:   su.SpaceID,
			UserID:    su.UserID,
			User:      userInfo,
			RoleType:  userEntity.RoleType(su.RoleType),
			CreatedAt: su.CreatedAt,
			UpdatedAt: su.UpdatedAt,
		}
	}

	return members, total, nil
}

// SearchUsers 搜索用户
func (u *userImpl) SearchUsers(ctx context.Context, keyword string, excludeSpaceID int64, limit int32) (users []*userEntity.User, err error) {
	userModels, err := u.SpaceRepo.SearchUsersByKeyword(ctx, keyword, excludeSpaceID, limit)
	if err != nil {
		return nil, fmt.Errorf("search users by keyword failed: %w", err)
	}

	users = make([]*userEntity.User, len(userModels))
	for i, user := range userModels {
		iconURL := ""
		if u.IconOSS != nil {
			iconURL, _ = u.IconOSS.GetObjectUrl(ctx, user.IconURI)
		}

		users[i] = &userEntity.User{
			UserID:     user.ID,
			Name:       user.Name,
			UniqueName: user.UniqueName,
			Email:      user.Email,
			IconURL:    iconURL,
			CreatedAt:  user.CreatedAt,
		}
	}

	return users, nil
}

// InviteMember 邀请成员
func (u *userImpl) InviteMember(ctx context.Context, operatorID, spaceID, userID int64, roleType int32) (member *userEntity.SpaceMember, err error) {
	// 检查操作者权限
	operatorSU, exist, err := u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, operatorID)
	if err != nil {
		return nil, fmt.Errorf("get operator space user failed: %w", err)
	}
	if !exist {
		return nil, fmt.Errorf("operator is not a member of this space")
	}
	if operatorSU.RoleType != int32(userEntity.RoleTypeOwner) && operatorSU.RoleType != int32(userEntity.RoleTypeAdmin) {
		return nil, fmt.Errorf("operator has no permission to invite members")
	}

	// 检查用户是否已在空间中
	_, exist, err = u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, userID)
	if err != nil {
		return nil, fmt.Errorf("check user space membership failed: %w", err)
	}
	if exist {
		return nil, fmt.Errorf("user is already a member of this space")
	}

	// 检查用户是否存在
	userModel, err := u.UserRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get user by ID failed: %w", err)
	}

	now := time.Now().UnixMilli()

	// 添加用户到空间
	spaceUser := &model.SpaceUser{
		SpaceID:   spaceID,
		UserID:    userID,
		RoleType:  roleType,
		CreatedAt: now,
		UpdatedAt: now,
	}

	err = u.SpaceRepo.AddSpaceUser(ctx, spaceUser)
	if err != nil {
		return nil, fmt.Errorf("add space user failed: %w", err)
	}

	// 构建返回结果
	iconURL := ""
	if u.IconOSS != nil {
		iconURL, _ = u.IconOSS.GetObjectUrl(ctx, userModel.IconURI)
	}

	userInfo := &userEntity.User{
		UserID:     userModel.ID,
		Name:       userModel.Name,
		UniqueName: userModel.UniqueName,
		Email:      userModel.Email,
		IconURL:    iconURL,
		CreatedAt:  userModel.CreatedAt,
	}

	return &userEntity.SpaceMember{
		ID:        spaceUser.ID,
		SpaceID:   spaceID,
		UserID:    userID,
		User:      userInfo,
		RoleType:  userEntity.RoleType(roleType),
		CreatedAt: now,
		UpdatedAt: now,
	}, nil
}

// UpdateMemberRole 更新成员角色
func (u *userImpl) UpdateMemberRole(ctx context.Context, operatorID, spaceID, userID int64, roleType int32) (member *userEntity.SpaceMember, err error) {
	// 检查操作者权限(只有所有者可以更改角色)
	operatorSU, exist, err := u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, operatorID)
	if err != nil {
		return nil, fmt.Errorf("get operator space user failed: %w", err)
	}
	if !exist {
		return nil, fmt.Errorf("operator is not a member of this space")
	}
	if operatorSU.RoleType != int32(userEntity.RoleTypeOwner) {
		return nil, fmt.Errorf("only owner can update member roles")
	}

	// 检查目标用户是否在空间中
	targetSU, exist, err := u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, userID)
	if err != nil {
		return nil, fmt.Errorf("get target user space user failed: %w", err)
	}
	if !exist {
		return nil, fmt.Errorf("target user is not a member of this space")
	}

	// 不允许修改所有者的角色
	if targetSU.RoleType == int32(userEntity.RoleTypeOwner) {
		return nil, fmt.Errorf("cannot change owner role")
	}

	// 更新角色
	err = u.SpaceRepo.UpdateSpaceUserRole(ctx, spaceID, userID, roleType)
	if err != nil {
		return nil, fmt.Errorf("update space user role failed: %w", err)
	}

	// 获取用户信息并返回
	userModel, err := u.UserRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get user by ID failed: %w", err)
	}

	iconURL := ""
	if u.IconOSS != nil {
		iconURL, _ = u.IconOSS.GetObjectUrl(ctx, userModel.IconURI)
	}

	userInfo := &userEntity.User{
		UserID:     userModel.ID,
		Name:       userModel.Name,
		UniqueName: userModel.UniqueName,
		Email:      userModel.Email,
		IconURL:    iconURL,
		CreatedAt:  userModel.CreatedAt,
	}

	return &userEntity.SpaceMember{
		ID:        targetSU.ID,
		SpaceID:   spaceID,
		UserID:    userID,
		User:      userInfo,
		RoleType:  userEntity.RoleType(roleType),
		CreatedAt: targetSU.CreatedAt,
		UpdatedAt: time.Now().UnixMilli(),
	}, nil
}

// RemoveMember 移除成员
func (u *userImpl) RemoveMember(ctx context.Context, operatorID, spaceID, userID int64) (err error) {
	// 检查操作者权限
	operatorSU, exist, err := u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, operatorID)
	if err != nil {
		return fmt.Errorf("get operator space user failed: %w", err)
	}
	if !exist {
		return fmt.Errorf("operator is not a member of this space")
	}
	if operatorSU.RoleType != int32(userEntity.RoleTypeOwner) && operatorSU.RoleType != int32(userEntity.RoleTypeAdmin) {
		return fmt.Errorf("operator has no permission to remove members")
	}

	// 检查目标用户是否在空间中
	targetSU, exist, err := u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, userID)
	if err != nil {
		return fmt.Errorf("get target user space user failed: %w", err)
	}
	if !exist {
		return fmt.Errorf("target user is not a member of this space")
	}

	// 不允许删除所有者
	if targetSU.RoleType == int32(userEntity.RoleTypeOwner) {
		return fmt.Errorf("cannot remove owner from space")
	}

	// 管理员不能删除管理员
	if operatorSU.RoleType == int32(userEntity.RoleTypeAdmin) && targetSU.RoleType == int32(userEntity.RoleTypeAdmin) {
		return fmt.Errorf("admin cannot remove another admin")
	}

	// 删除成员
	err = u.SpaceRepo.RemoveSpaceUser(ctx, spaceID, userID)
	if err != nil {
		return fmt.Errorf("remove space user failed: %w", err)
	}

	return nil
}

// CheckMemberPermission 检查成员权限
func (u *userImpl) CheckMemberPermission(ctx context.Context, spaceID, userID int64) (isMember bool, roleType int32, canInvite, canManage bool, err error) {
	spaceUser, exist, err := u.SpaceRepo.GetSpaceUserBySpaceIDAndUserID(ctx, spaceID, userID)
	if err != nil {
		return false, 0, false, false, fmt.Errorf("get space user failed: %w", err)
	}

	if !exist {
		return false, 0, false, false, nil
	}

	role := userEntity.RoleType(spaceUser.RoleType)
	return true, spaceUser.RoleType, role.CanInvite(), role.CanManage(), nil
}

// CreateSpace 创建新空间
func (u *userImpl) CreateSpace(ctx context.Context, userID int64, name, description string) (space *userEntity.Space, err error) {
	now := time.Now().UnixMilli()

	// 生成空间ID
	spaceID, err := u.IDGen.GenID(ctx)
	if err != nil {
		return nil, fmt.Errorf("generate space ID failed: %w", err)
	}

	// 创建空间记录
	spaceModel := &model.Space{
		ID:          spaceID,
		Name:        name,
		Description: description,
		IconURI:     uploadEntity.EnterpriseIconURI,
		OwnerID:     userID,
		CreatorID:   userID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	err = u.SpaceRepo.CreateSpace(ctx, spaceModel)
	if err != nil {
		return nil, fmt.Errorf("create space failed: %w", err)
	}

	// 添加创建者为空间所有者
	err = u.SpaceRepo.AddSpaceUser(ctx, &model.SpaceUser{
		SpaceID:   spaceID,
		UserID:    userID,
		RoleType:  1, // 1 = Owner
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return nil, fmt.Errorf("add space user failed: %w", err)
	}

	// 构建并返回Space entity
	iconURL := ""
	if u.IconOSS != nil {
		iconURL, _ = u.IconOSS.GetObjectUrl(ctx, spaceModel.IconURI)
	}
	
	return &userEntity.Space{
		ID:          spaceID,
		Name:        name,
		Description: description,
		IconURL:     iconURL,
		SpaceType:   1, // Personal space
		OwnerID:     userID,
		CreatorID:   userID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}
