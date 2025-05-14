package user

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/api/model/passport"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/user"
	"code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
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
	resp *passport.PassportWebEmailRegisterV2PostResponse, sessionKey string, err error) {
	userInfo, err := u.userDomainSVC.Create(ctx, &user.CreateUserRequest{
		Email:    req.GetEmail(),
		Password: req.GetPassword(),
	})
	if err != nil {
		return nil, "", errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "register failed"))
	}

	userInfo, err = u.userDomainSVC.Login(ctx, req.GetEmail(), req.GetPassword())
	if err != nil {
		return nil, "", errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "login after registered failed"))
	}

	return &passport.PassportWebEmailRegisterV2PostResponse{
		Data: userDo2PassportTo(userInfo),
		Code: 0,
	}, userInfo.SessionKey, nil
}

// PassportWebLogoutGet 处理用户登出请求
func (u *User) PassportWebLogoutGet(ctx context.Context, req *passport.PassportWebLogoutGetRequest) (
	resp *passport.PassportWebLogoutGetResponse, err error,
) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "missing session_key in cookie"))
	}

	err = u.userDomainSVC.Logout(ctx, *uid)
	if err != nil {
		return nil, err
	}

	return &passport.PassportWebLogoutGetResponse{
		Code: 0,
	}, nil
}

// PassportWebEmailLoginPost 处理用户邮箱登录请求
func (u *User) PassportWebEmailLoginPost(ctx context.Context, req *passport.PassportWebEmailLoginPostRequest) (
	resp *passport.PassportWebEmailLoginPostResponse, sessionKey string, err error,
) {
	userInfo, err := u.userDomainSVC.Login(ctx, req.GetEmail(), req.GetPassword())
	if err != nil {
		return nil, "", errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "register failed"))
	}

	return &passport.PassportWebEmailLoginPostResponse{
		Data: userDo2PassportTo(userInfo),
		Code: 0,
	}, userInfo.SessionKey, nil
}

func (u *User) PassportWebEmailPasswordResetGet(ctx context.Context, req *passport.PassportWebEmailPasswordResetGetRequest) (
	resp *passport.PassportWebEmailPasswordResetGetResponse, err error,
) {
	err = u.userDomainSVC.ResetPassword(ctx, req.GetEmail(), req.GetPassword())
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "reset password failed"))
	}

	return &passport.PassportWebEmailPasswordResetGetResponse{
		Code: 0,
	}, nil
}

func (u *User) PassportAccountInfoV2(ctx context.Context, req *passport.PassportAccountInfoV2Request) (
	resp *passport.PassportAccountInfoV2Response, err error,
) {
	uidPtr := ctxutil.GetUIDFromCtx(ctx)
	if uidPtr == nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "missing session_key in cookie"))
	}

	userID := *uidPtr

	userInfo, err := u.userDomainSVC.GetUserInfo(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &passport.PassportAccountInfoV2Response{
		Data: userDo2PassportTo(userInfo),
		Code: 0,
	}, nil
}

// UserUpdateAvatar 更新用户头像
func (u *User) UserUpdateAvatar(ctx context.Context, req *passport.UserUpdateAvatarRequest) (
	resp *passport.UserUpdateAvatarResponse, err error) {

	uidPtr := ctxutil.GetUIDFromCtx(ctx)
	if uidPtr == nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "missing session_key in cookie"))
	}

	// 根据 MIME type 获取文件后缀
	var ext string
	switch req.GetContentType() {
	case "image/jpeg", "image/jpg":
		ext = "jpg"
	case "image/png":
		ext = "png"
	case "image/gif":
		ext = "gif"
	case "image/webp":
		ext = "webp"
	default:
		return nil, errorx.WrapByCode(err, errno.ErrInvalidParamCode,
			errorx.KV("msg", "unsupported image type"))
	}

	url, err := u.userDomainSVC.UpdateAvatar(ctx, *uidPtr, ext, req.GetAvatar())
	if err != nil {
		return nil, err
	}

	return &passport.UserUpdateAvatarResponse{
		Data: &passport.UserUpdateAvatarResponseData{
			WebURI: url,
		},
		Code: 0,
	}, nil
}

// UserUpdateProfile 更新用户资料
func (u *User) UserUpdateProfile(ctx context.Context, req *passport.UserUpdateProfileRequest) (
	resp *passport.UserUpdateProfileResponse, err error) {
	uidStr := ctxutil.GetUIDFromCtx(ctx)
	if uidStr == nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "missing session_key in cookie"))
	}

	userID := *uidStr

	err = u.userDomainSVC.UpdateProfile(ctx, &user.UpdateProfileRequest{
		UserID:      userID,
		Name:        req.Name,
		UniqueName:  req.UserUniqueName,
		Description: req.Description,
	})
	if err != nil {
		return nil, err
	}

	return &passport.UserUpdateProfileResponse{
		Code: 0,
	}, nil
}

func (u *User) GetSpaceListV2(ctx context.Context, req *playground.GetSpaceListV2Request) (
	resp *playground.GetSpaceListV2Response, err error) {

	uidPtr := ctxutil.GetUIDFromCtx(ctx)
	if uidPtr == nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "missing session_key in cookie"))
	}

	spaces, err := u.userDomainSVC.GetUserSpaceList(ctx, *uidPtr)
	if err != nil {
		return nil, err
	}

	botSpaces := slices.Transform(spaces, func(space *entity.Space) *playground.BotSpaceV2 {
		return &playground.BotSpaceV2{
			ID:          space.ID,
			Name:        space.Name,
			Description: space.Description,
			SpaceType:   playground.SpaceType(space.SpaceType),
			IconURL:     space.IconURL,
		}
	})

	return &playground.GetSpaceListV2Response{
		Data: &playground.SpaceInfo{
			BotSpaceList:          botSpaces,
			HasPersonalSpace:      true,
			TeamSpaceNum:          0,
			RecentlyUsedSpaceList: botSpaces,
			Total:                 ptr.Of(int32(len(botSpaces))),
			HasMore:               ptr.Of(false),
		},
		Code: 0,
	}, nil
}

func (u *User) MGetUserBasicInfo(ctx context.Context, req *playground.MGetUserBasicInfoRequest) (
	resp *playground.MGetUserBasicInfoResponse, err error) {

	userIDs, err := slices.TransformWithErrorCheck(req.GetUserIds(), func(s string) (int64, error) {
		return strconv.ParseInt(s, 10, 64)
	})
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrInvalidParamCode, errorx.KV("msg", "invalid user id"))
	}

	userInfos, err := u.userDomainSVC.MGetUserProfiles(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	return &playground.MGetUserBasicInfoResponse{
		UserBasicInfoMap: slices.ToMap(userInfos, func(userInfo *entity.User) (string, *playground.UserBasicInfo) {
			return strconv.FormatInt(userInfo.UserID, 10), userDo2PlaygroundTo(userInfo)
		}),
		Code: 0,
	}, nil
}

func (u *User) ValidateSession(ctx context.Context, sessionKey string) (*entity.Session, error) {
	session, exist, err := u.userDomainSVC.ValidateSession(ctx, sessionKey)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAuthenticationFailed,
			errorx.KV("reason", "unknown session error"))
	}

	if !exist {
		return nil, errorx.New(errno.ErrAuthenticationFailed,
			errorx.KV("reason", "session not exist"))
	}

	return session, nil
}

func userDo2PassportTo(userDo *entity.User) *passport.User {
	return &passport.User{
		UserIDStr:      userDo.UserID,
		Name:           userDo.Name,
		ScreenName:     ptr.Of(userDo.Name),
		UserUniqueName: userDo.UniqueName,
		Email:          userDo.Email,
		Description:    userDo.Description,
		AvatarURL:      userDo.IconURL,
		AppUserInfo: &passport.AppUserInfo{
			UserUniqueName: userDo.UniqueName,
		},

		UserCreateTime: userDo.CreatedAt / 1000,
	}
}

func userDo2PlaygroundTo(userDo *entity.User) *playground.UserBasicInfo {
	return &playground.UserBasicInfo{
		UserId:         userDo.UserID,
		Username:       userDo.Name,
		UserUniqueName: ptr.Of(userDo.UniqueName),
		UserAvatar:     userDo.IconURL,
		CreateTime:     ptr.Of(userDo.CreatedAt / 1000),
	}
}
