package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/api/model/passport"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var UserSVC = &User{}

type User struct{}

func (u *User) PassportWebEmailRegisterV2(ctx context.Context, req *passport.PassportWebEmailRegisterV2PostRequest) (
	resp *passport.PassportWebEmailRegisterV2PostResponse, err error) {

	userInfo, err := userDomainSVC.Create(ctx, &user.CreateUserRequest{
		Email:    req.GetEmail(),
		Password: req.GetPassword(),
	})
	if err != nil {
		return nil, err
	}

	_ = userInfo

	return &passport.PassportWebEmailRegisterV2PostResponse{
		Data: &passport.PassportWebEmailRegisterV2PostResponseData{},
	}, nil
}

// PassportWebLogoutGet 处理用户登出请求
func (u *User) PassportWebLogoutGet(ctx context.Context, req *passport.PassportWebLogoutGetRequest) (
	resp *passport.PassportWebLogoutGetResponse, err error) {

	session := getUserSessionFromCtx(ctx)
	if session == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	logoutResp, err := userDomainSVC.Logout(ctx, &user.LogoutRequest{
		UserID:     session.UserID,
		SessionKey: session.SessionID,
	})
	if err != nil {
		return nil, err
	}

	_ = logoutResp

	return &passport.PassportWebLogoutGetResponse{
		Data: &passport.PassportWebLogoutGetResponseData{},
	}, nil
}

// PassportWebEmailLoginPost 处理用户邮箱登录请求
func (u *User) PassportWebEmailLoginPost(ctx context.Context, req *passport.PassportWebEmailLoginPostRequest) (
	resp *passport.PassportWebEmailLoginPostResponse, err error) {

	userEntity, err := userDomainSVC.Login(ctx, &user.LoginRequest{
		Email:    req.GetEmail(),
		Password: req.GetPassword(),
	})
	if err != nil {
		return nil, err
	}

	return &passport.PassportWebEmailLoginPostResponse{
		Data: &passport.PassportWebEmailLoginPostResponseData{
			UserID:       userEntity.UserID,
			Name:         userEntity.Name,
			Description:  userEntity.Description,
			AvatarURL:    userEntity.IconURL,
			SessionKey:   userEntity.SessionKey,
			UserVerified: userEntity.UserVerified,
			CountryCode:  userEntity.CountryCode,
		},
	}, nil
}

func (u *User) PassportWebEmailPasswordResetGet(ctx context.Context, req *passport.PassportWebEmailPasswordResetGetRequest) (
	resp *passport.PassportWebEmailPasswordResetGetResponse, err error) {

	resetResp, err := userDomainSVC.ResetPassword(ctx, &user.ResetPasswordRequest{
		Email:    req.GetEmail(),
		Code:     req.GetCode(),
		Password: req.GetPassword(),
	})
	if err != nil {
		return nil, err
	}

	_ = resetResp

	return &passport.PassportWebEmailPasswordResetGetResponse{
		Data: &passport.PassportWebEmailPasswordResetGetResponseData{},
	}, nil
}

func (u *User) PassportAccountInfoV2(ctx context.Context, req *passport.PassportAccountInfoV2Request) (
	resp *passport.PassportAccountInfoV2Response, err error) {

	uidStr := getUIDFromCtx(ctx)
	if uidStr == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *uidStr

	userEntity, err := userDomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		return nil, err
	}

	_ = userEntity

	return &passport.PassportAccountInfoV2Response{}, nil
}

// UserUpdateAvatar 更新用户头像
func (u *User) UserUpdateAvatar(ctx context.Context, req *passport.UserUpdateAvatarRequest) (
	resp *passport.UserUpdateAvatarResponse, err error) {

	err = userDomainSVC.UpdateAvatar(ctx, 0, nil)
	if err != nil {
		return nil, err
	}

	return &passport.UserUpdateAvatarResponse{}, nil
}

// UserUpdateProfile 更新用户资料
func (u *User) UserUpdateProfile(ctx context.Context, req *passport.UserUpdateProfileRequest) (
	resp *passport.UserUpdateProfileResponse, err error) {

	uidStr := getUIDFromCtx(ctx)
	if uidStr == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *uidStr

	updateResp, err := userDomainSVC.UpdateProfile(ctx, &user.UpdateProfileRequest{
		UserID:      userID,
		Name:        "",
		UniqueName:  "",
		Description: "",
	})
	if err != nil {
		return nil, err
	}

	_ = updateResp

	return &passport.UserUpdateProfileResponse{}, nil
}

func (u *User) GetSpaceListV2(ctx context.Context, req *playground.GetSpaceListV2Request) (
	resp *playground.GetSpaceListV2Response, err error) {

	bs := &playground.BotSpaceV2{
		ID:          666,
		Name:        "OpenCoze",
		Description: "great space",
		SpaceType:   playground.SpaceType_Personal,
		IconURL:     "",
		OwnerName:   ptr.Of("IPender"),
	}

	return &playground.GetSpaceListV2Response{
		Data: &playground.SpaceInfo{
			BotSpaceList:          []*playground.BotSpaceV2{bs},
			HasPersonalSpace:      true,
			TeamSpaceNum:          0,
			RecentlyUsedSpaceList: []*playground.BotSpaceV2{bs},
			Total:                 ptr.Of(int32(1)),
			HasMore:               ptr.Of(false),
		},
		Code: 0,
	}, nil
}
