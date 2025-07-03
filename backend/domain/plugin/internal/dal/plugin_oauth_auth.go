package dal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/plugin/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
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
		RecordID: p.ID,
		Meta: &entity.AuthorizationCodeMeta{
			UserID:   p.UserID,
			PluginID: p.PluginID,
			IsDraft:  p.IsDraft,
		},
		Config:               p.OauthConfig,
		AccessToken:          p.AccessToken,
		RefreshToken:         p.RefreshToken,
		TokenExpiredAtMS:     p.TokenExpiredAt,
		NextTokenRefreshAtMS: &p.NextTokenRefreshAt,
		LastActiveAtMS:       p.LastActiveAt,
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
			TokenExpiredAt:     info.TokenExpiredAtMS,
			NextTokenRefreshAt: info.GetNextTokenRefreshAtMS(),
			OauthConfig:        info.Config,
			LastActiveAt:       info.LastActiveAtMS,
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
	if info.NextTokenRefreshAtMS != nil {
		updateMap[table.NextTokenRefreshAt.ColumnName().String()] = *info.NextTokenRefreshAtMS
	}
	if info.TokenExpiredAtMS > 0 {
		updateMap[table.TokenExpiredAt.ColumnName().String()] = info.TokenExpiredAtMS
	}
	if info.LastActiveAtMS > 0 {
		updateMap[table.LastActiveAt.ColumnName().String()] = info.LastActiveAtMS
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

func (p *PluginOAuthAuthDAO) GetRefreshTokenList(ctx context.Context, nextRefreshAt int64, limit int) (infos []*entity.AuthorizationCodeInfo, err error) {
	const size = 50
	table := p.query.PluginOauthAuth

	infos = make([]*entity.AuthorizationCodeInfo, 0, limit)

	for limit > 0 {
		res, err := table.WithContext(ctx).
			Where(
				table.NextTokenRefreshAt.Gt(0),
				table.NextTokenRefreshAt.Lt(nextRefreshAt),
			).
			Order(table.NextTokenRefreshAt.Asc()).
			Limit(size).
			Find()
		if err != nil {
			return nil, err
		}

		infos = make([]*entity.AuthorizationCodeInfo, 0, len(res))
		for _, v := range res {
			infos = append(infos, pluginOAuthAuthPO(*v).ToDO())
		}

		limit -= size

		if len(res) < size {
			break
		}
	}

	return infos, nil
}

func (p *PluginOAuthAuthDAO) BatchDeleteByIDs(ctx context.Context, ids []int64) (err error) {
	table := p.query.PluginOauthAuth

	chunks := slices.Chunks(ids, 20)

	for _, chunk := range chunks {
		_, err = table.WithContext(ctx).
			Where(table.ID.In(chunk...)).
			Delete()
		if err != nil {
			return err
		}
	}

	return nil
}

func (p *PluginOAuthAuthDAO) Delete(ctx context.Context, meta *entity.AuthorizationCodeMeta) (err error) {
	table := p.query.PluginOauthAuth
	_, err = table.WithContext(ctx).
		Where(
			table.UserID.Eq(meta.UserID),
			table.PluginID.Eq(meta.PluginID),
			table.IsDraft.Is(meta.IsDraft),
		).
		Delete()
	return err
}

func (p *PluginOAuthAuthDAO) DeleteExpiredTokens(ctx context.Context, expireAt int64, limit int) (err error) {
	const size = 50
	table := p.query.PluginOauthAuth

	for limit > 0 {
		res, err := table.WithContext(ctx).
			Where(
				table.TokenExpiredAt.Gt(0),
				table.TokenExpiredAt.Lt(expireAt),
			).
			Limit(size).
			Delete()
		if err != nil {
			return err
		}

		limit -= size

		if res.RowsAffected < size {
			break
		}
	}

	return nil
}

func (p *PluginOAuthAuthDAO) DeleteInactiveTokens(ctx context.Context, lastActiveAt int64, limit int) (err error) {
	const size = 50
	table := p.query.PluginOauthAuth

	for limit > 0 {
		res, err := table.WithContext(ctx).
			Where(
				table.LastActiveAt.Gt(0),
				table.LastActiveAt.Lt(lastActiveAt),
			).
			Limit(size).
			Delete()
		if err != nil {
			return err
		}

		limit -= size

		if res.RowsAffected < size {
			break
		}
	}

	return nil
}
