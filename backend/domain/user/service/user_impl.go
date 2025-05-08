package service

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal"
	"code.byted.org/flow/opencoze/backend/domain/user/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type Config struct {
	DB     *gorm.DB
	ImageX imagex.ImageX
}

func NewUserDomain(ctx context.Context, conf *Config) user.User {
	return &userImpl{
		userDAO: dal.NewUserDAO(conf.DB),
		imageX:  conf.ImageX,
	}
}

type userImpl struct {
	userDAO *dal.UserDAO
	imageX  imagex.ImageX
}

func (u *userImpl) Login(ctx context.Context, req *user.LoginRequest) (resp *entity.User, err error) {
	userModel, err := u.userDAO.GetUsersByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}

	// 验证密码
	// 注意：实际应用中应该使用加密算法比较密码，这里简化处理
	if userModel.Password != req.Password {
		return nil, fmt.Errorf("password error")
	}

	// 生成会话密钥
	sessionKey := generateSessionKey()

	// 更新用户会话密钥
	err = u.userDAO.UpdateSessionKey(ctx, userModel.ID, sessionKey)
	if err != nil {
		return nil, err
	}

	resURL, err := u.imageX.GetResourceURL(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL.URL), nil
}

func (u *userImpl) Logout(ctx context.Context, req *user.LogoutRequest) (resp *user.LogoutResponse, err error) {
	err = u.userDAO.ClearSessionKey(ctx, req.UserID)
	if err != nil {
		return nil, err
	}

	return &user.LogoutResponse{
		Success: true,
	}, nil
}

func (u *userImpl) ResetPassword(ctx context.Context, req *user.ResetPasswordRequest) (resp *user.ResetPasswordResponse, err error) {
	err = u.userDAO.UpdatePassword(ctx, req.Email, req.Password) // 注意：实际应用中应该存储加密后的密码
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

	resURL, err := u.imageX.GetResourceURL(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL.URL), nil
}

func (u *userImpl) UpdateAvatar(ctx context.Context, userID int64, imagePayload []byte) (err error) {
	uploadRest, err := u.imageX.Upload(ctx, imagePayload)
	if err != nil {
		return err
	}

	err = u.userDAO.UpdateAvatar(ctx, userID, uploadRest.FileInfo.Uri)
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

	now := time.Now().UnixMilli()
	newUser := &model.User{
		Name:         req.Name,
		UniqueName:   req.UniqueName,
		Email:        req.Email,
		Password:     req.Password, // 注意：实际应用中应该存储加密后的密码
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

func (u *userImpl) GetUserBySessionKey(ctx context.Context, sessionKey string) (user *entity.User, err error) {
	userModel, err := u.userDAO.GetUserBySessionKey(ctx, sessionKey)
	if err != nil {
		return nil, err
	}

	resURL, err := u.imageX.GetResourceURL(ctx, userModel.IconURI)
	if err != nil {
		return nil, err
	}

	return userPo2Do(userModel, resURL.URL), nil
}

func (u *userImpl) MGetUserProfiles(ctx context.Context, userIDs []int64) (users []*entity.User, err error) {
	userModels, err := u.userDAO.GetUsersByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	users = make([]*entity.User, 0, len(userModels))
	for _, um := range userModels {
		// 获取图片URL
		resURL, err := u.imageX.GetResourceURL(ctx, um.IconURI)
		if err != nil {
			continue // 如果获取图片URL失败，跳过该用户
		}

		users = append(users, userPo2Do(um, resURL.URL))
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

func generateSessionKey() string {
	// 实际应用中应该使用更安全的方式生成会话密钥
	return fmt.Sprintf("%d%s", time.Now().UnixNano(), uuid.New().String())
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
