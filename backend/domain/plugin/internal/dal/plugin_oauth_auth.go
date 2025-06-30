package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

func NewPluginOAuthAuthDAO(db *gorm.DB, idGen idgen.IDGenerator) *PluginOAuthAuthDAO {
	return &PluginOAuthAuthDAO{
		idGen: idGen,
		query: query.Use(db),
	}
}

type pluginOAuthAuthPO model.PluginOauthAuth

func (p pluginOAuthAuthPO) ToDO() *entity.AuthorizationCodeInfo {
	return &entity.AuthorizationCodeInfo{
		Meta: &entity.AuthorizationCodeMeta{
			UserID:   p.UserID,
			PluginID: p.PluginID,
			IsDraft:  p.IsDraft,
		},
		Config:               p.OauthConfig,
		AccessToken:          p.AccessToken,
		RefreshToken:         p.RefreshToken,
		TokenExpiredAtMS:     p.TokenExpiresIn,
		NextTokenRefreshAtMS: p.NextTokenRefreshAt,
	}
}

type PluginOAuthAuthDAO struct {
	idGen idgen.IDGenerator
	query *query.Query
}

func (p *PluginOAuthAuthDAO) Get(ctx context.Context, meta *entity.AuthorizationCodeMeta) (info *entity.AuthorizationCodeInfo, exist bool, err error) {
	table := p.query.PluginOauthAuth
	res, err := table.WithContext(ctx).
		Where(
			table.UserID.Eq(meta.UserID),
			table.PluginID.Eq(meta.PluginID),
			table.IsDraft.Is(meta.IsDraft),
		).
		First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, nil
		}
		return nil, false, err
	}

	info = pluginOAuthAuthPO(*res).ToDO()

	return info, true, nil
}

func (p *PluginOAuthAuthDAO) Upsert(ctx context.Context, info *entity.AuthorizationCodeInfo) (err error) {
	if info.Meta == nil || info.Meta.UserID == "" || info.Meta.PluginID <= 0 {
		return fmt.Errorf("meta info is required")
	}

	meta := info.Meta

	table := p.query.PluginOauthAuth
	_, err = table.WithContext(ctx).
		Select(table.ID).
		Where(
			table.UserID.Eq(meta.UserID),
			table.PluginID.Eq(meta.PluginID),
			table.IsDraft.Is(meta.IsDraft),
		).First()
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		id, err := p.idGen.GenID(ctx)
		if err != nil {
			return err
		}

		po := &model.PluginOauthAuth{
			ID:                 id,
			UserID:             meta.UserID,
			PluginID:           meta.PluginID,
			IsDraft:            meta.IsDraft,
			AccessToken:        info.AccessToken,
			RefreshToken:       info.RefreshToken,
			TokenExpiresIn:     info.TokenExpiredAtMS,
			OauthConfig:        info.Config,
			LastActiveAt:       time.Now().UnixMilli(),
			NextTokenRefreshAt: info.NextTokenRefreshAtMS,
		}

		return table.WithContext(ctx).Create(po)
	}

	updateMap := map[string]any{}
	if info.AccessToken != "" {
		updateMap[table.AccessToken.ColumnName().String()] = info.AccessToken
	}
	if info.RefreshToken != "" {
		updateMap[table.RefreshToken.ColumnName().String()] = info.RefreshToken
	}
	if info.NextTokenRefreshAtMS > 0 {
		updateMap[table.NextTokenRefreshAt.ColumnName().String()] = info.NextTokenRefreshAtMS
	}
	if info.TokenExpiredAtMS > 0 {
		updateMap[table.TokenExpiresIn.ColumnName().String()] = info.TokenExpiredAtMS
	}
	if info.Config != nil {
		b, err := json.Marshal(info.Config)
		if err != nil {
			return err
		}
		updateMap[table.OauthConfig.ColumnName().String()] = b
	}

	_, err = table.WithContext(ctx).
		Where(
			table.UserID.Eq(meta.UserID),
			table.PluginID.Eq(meta.PluginID),
			table.IsDraft.Is(meta.IsDraft),
		).
		Updates(updateMap)

	return err
}

func (p *PluginOAuthAuthDAO) UpdateLastActiveAt(ctx context.Context, meta *entity.AuthorizationCodeMeta, lastActiveAtMs int64) (err error) {
	po := &model.PluginOauthAuth{
		LastActiveAt: lastActiveAtMs,
	}

	table := p.query.PluginOauthAuth
	_, err = table.WithContext(ctx).
		Where(
			table.UserID.Eq(meta.UserID),
			table.PluginID.Eq(meta.PluginID),
			table.IsDraft.Is(meta.IsDraft),
		).
		Updates(po)

	return err
}
