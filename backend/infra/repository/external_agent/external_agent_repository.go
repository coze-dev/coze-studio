package external_agent

import (
	"context"
	"fmt"

	"gorm.io/gorm"
	"github.com/coze-dev/coze-studio/backend/infra/impl/mysql"
	"github.com/coze-dev/coze-studio/backend/api/model/ynet_agent"
)

type ExternalAgentRepository struct {
	db *gorm.DB
}

func NewExternalAgentRepository() (*ExternalAgentRepository, error) {
	db, err := mysql.New()
	if err != nil {
		return nil, err
	}
	return &ExternalAgentRepository{
		db: db,
	}, nil
}

// GetListBySpaceID 根据空间ID获取外部智能体列表
func (r *ExternalAgentRepository) GetListBySpaceID(ctx context.Context, spaceID int64, page, pageSize int32) ([]*ynet_agent.HiAgentInfo, int32, error) {
	// 计算偏移量
	offset := (page - 1) * pageSize

	// 定义表结构
	type ExternalAgentConfig struct {
		ID          int64   `gorm:"column:id"`
		SpaceID     int64   `gorm:"column:space_id"`
		Name        string  `gorm:"column:name"`
		Description *string `gorm:"column:description"`
		Platform    string  `gorm:"column:platform"`
		AgentURL    string  `gorm:"column:agent_url"`
		AgentKey    *string `gorm:"column:agent_key"`
		AgentID     *string `gorm:"column:agent_id"`
		AppID       *string `gorm:"column:app_id"`
		Icon        *string `gorm:"column:icon"`
		Category    *string `gorm:"column:category"`
		Status      int32   `gorm:"column:status"`
		Metadata    *string `gorm:"column:metadata"`
		CreatedBy   int64   `gorm:"column:created_by"`
		UpdatedBy   *int64  `gorm:"column:updated_by"`
		CreatedAt   string  `gorm:"column:created_at"`
		UpdatedAt   string  `gorm:"column:updated_at"`
	}

	// 查询总数
	var total int64
	err := r.db.WithContext(ctx).Table("external_agent_config").
		Where("space_id = ? AND deleted_at IS NULL", spaceID).
		Count(&total).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count agents: %w", err)
	}

	// 查询数据
	var configs []ExternalAgentConfig
	err = r.db.WithContext(ctx).Table("external_agent_config").
		Where("space_id = ? AND deleted_at IS NULL", spaceID).
		Order("created_at DESC").
		Limit(int(pageSize)).
		Offset(int(offset)).
		Find(&configs).Error
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query agents: %w", err)
	}

	// 转换为响应格式
	var agents []*ynet_agent.HiAgentInfo
	for _, config := range configs {
		agent := &ynet_agent.HiAgentInfo{
			ID:          config.ID,
			SpaceID:     config.SpaceID,
			Name:        config.Name,
			Description: config.Description,
			Platform:    config.Platform,
			AgentURL:    config.AgentURL,
			AgentID:     config.AgentID,
			AppID:       config.AppID,
			Icon:        config.Icon,
			Category:    config.Category,
			Status:      config.Status,
			Metadata:    config.Metadata,
			CreatedBy:   config.CreatedBy,
			UpdatedBy:   config.UpdatedBy,
			CreatedAt:   config.CreatedAt,
			UpdatedAt:   config.UpdatedAt,
		}

		// 不返回密钥明文
		agent.AgentKey = nil

		agents = append(agents, agent)
	}

	return agents, int32(total), nil
}

// CreateAgent 创建外部智能体
func (r *ExternalAgentRepository) CreateAgent(ctx context.Context, agent *ynet_agent.HiAgentInfo) (*ynet_agent.HiAgentInfo, error) {
	query := `
		INSERT INTO external_agent_config
		(space_id, name, description, platform, agent_url, agent_key, agent_id, app_id, icon, category, status, metadata, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := r.db.ExecContext(ctx, query,
		agent.SpaceID,
		agent.Name,
		agent.Description,
		agent.Platform,
		agent.AgentURL,
		agent.AgentKey,
		agent.AgentID,
		agent.AppID,
		agent.Icon,
		agent.Category,
		agent.Status,
		agent.Metadata,
		agent.CreatedBy,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create agent: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	agent.ID = id
	return agent, nil
}

// UpdateAgent 更新外部智能体
func (r *ExternalAgentRepository) UpdateAgent(ctx context.Context, id int64, updates map[string]interface{}) error {
	// 构建动态更新SQL
	setClauses := []string{}
	args := []interface{}{}

	for field, value := range updates {
		setClauses = append(setClauses, fmt.Sprintf("%s = ?", field))
		args = append(args, value)
	}

	args = append(args, id)

	query := fmt.Sprintf(
		"UPDATE external_agent_config SET %s WHERE id = ? AND deleted_at IS NULL",
		string.Join(setClauses, ", "),
	)

	_, err := r.db.ExecContext(ctx, query, args...)
	return err
}

// DeleteAgent 软删除外部智能体
func (r *ExternalAgentRepository) DeleteAgent(ctx context.Context, id int64) error {
	query := `UPDATE external_agent_config SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}