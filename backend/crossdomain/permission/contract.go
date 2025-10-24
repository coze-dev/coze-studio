package permission

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/crossdomain/permission/model"
)

var defaultSVC Permission

func DefaultSVC() Permission {
	return defaultSVC
}

func SetDefaultSVC(c Permission) {
	defaultSVC = c
}

type Permission interface {
	CheckAuthz(ctx context.Context, req *model.CheckAuthzData) (*model.CheckAuthzResult, error)
}
