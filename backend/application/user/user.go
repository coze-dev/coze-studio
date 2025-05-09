package user

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/api/model/passport"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var SVC = &User{}

func Init(userDomainSVC user.User, oss storage.Storage) error {
	SVC.userDomainSVC = userDomainSVC
	SVC.oss = oss
	return nil
}

type User struct {
	oss           storage.Storage
	userDomainSVC user.User
}

func (u *User) PassportWebEmailRegisterV2(ctx context.Context, req *passport.PassportWebEmailRegisterV2PostRequest) (
	resp *passport.PassportWebEmailRegisterV2PostResponse, err error,
) {
	userInfo, err := u.userDomainSVC.Create(ctx, &user.CreateUserRequest{
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
	resp *passport.PassportWebLogoutGetResponse, err error,
) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "no session data provided"))
	}

	err = u.userDomainSVC.Logout(ctx, *uid)
	if err != nil {
		return nil, err
	}

	return &passport.PassportWebLogoutGetResponse{
		Data: &passport.PassportWebLogoutGetResponseData{},
	}, nil
}

// PassportWebEmailLoginPost 处理用户邮箱登录请求
func (u *User) PassportWebEmailLoginPost(ctx context.Context, req *passport.PassportWebEmailLoginPostRequest) (
	resp *passport.PassportWebEmailLoginPostResponse, err error,
) {
	userEntity, err := u.userDomainSVC.Login(ctx, &user.LoginRequest{
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
	resp *passport.PassportWebEmailPasswordResetGetResponse, err error,
) {
	resetResp, err := u.userDomainSVC.ResetPassword(ctx, &user.ResetPasswordRequest{
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
	resp *passport.PassportAccountInfoV2Response, err error,
) {
	uidPtr := ctxutil.GetUIDFromCtx(ctx)
	if uidPtr == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *uidPtr

	userEntity, err := u.userDomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		return nil, err
	}

	_ = userEntity

	return &passport.PassportAccountInfoV2Response{}, nil
}

// UserUpdateAvatar 更新用户头像
func (u *User) UserUpdateAvatar(ctx context.Context, req *passport.UserUpdateAvatarRequest) (
	resp *passport.UserUpdateAvatarResponse, err error,
) {
	err = u.userDomainSVC.UpdateAvatar(ctx, 0, nil)
	if err != nil {
		return nil, err
	}

	return &passport.UserUpdateAvatarResponse{}, nil
}

// UserUpdateProfile 更新用户资料
func (u *User) UserUpdateProfile(ctx context.Context, req *passport.UserUpdateProfileRequest) (
	resp *passport.UserUpdateProfileResponse, err error,
) {
	uidStr := ctxutil.GetUIDFromCtx(ctx)
	if uidStr == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	userID := *uidStr

	updateResp, err := u.userDomainSVC.UpdateProfile(ctx, &user.UpdateProfileRequest{
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
	resp *playground.GetSpaceListV2Response, err error,
) {

	spaceIconURI := "default_icon/team_default_icon.png"

	url, err := u.oss.GetObjectUrl(ctx, spaceIconURI)
	if err != nil {
		return nil, err
	}

	bs := &playground.BotSpaceV2{
		ID:          666,
		Name:        "OpenCoze",
		Description: "Personal Space",
		SpaceType:   playground.SpaceType_Personal,
		IconURL:     url,
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
