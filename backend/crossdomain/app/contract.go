package app

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/app/entity"
)

var defaultSVC AppService

func DefaultSVC() AppService {
	return defaultSVC
}

func SetDefaultSVC(c AppService) {
	defaultSVC = c
}

type AppService interface {
	GetDraftAPP(ctx context.Context, appID int64) (app *entity.APP, err error)
}
