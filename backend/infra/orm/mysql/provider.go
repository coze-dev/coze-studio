package mysql

import (
	"context"
	"fmt"

	"github.com/google/wire"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/infra-contract/orm"
)

// Provider implements the orm.Provider interface for MySQL
type Provider struct {
	config *Config
}

// Config holds MySQL connection configuration
type Config struct {
	Host     string
	Port     int
	Username string
	Password string
}

func ProviderConfig(ctx context.Context) (*Config, error) {
	return &Config{}, nil
}

// NewProvider creates a new MySQL provider instance
func NewProvider(config *Config) *Provider {
	return &Provider{config: config}
}

// Initialize implements orm.Provider interface
func (p *Provider) Initialize(ctx context.Context, dbName string) (*gorm.DB, error) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		p.config.Username,
		p.config.Password,
		p.config.Host,
		p.config.Port,
		dbName,
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL: %w", err)
	}

	return db, nil
}

// ProviderSet is the Wire provider set for MySQL
var ProviderSet = wire.NewSet(
	ProviderConfig,
	NewProvider,
	wire.Bind(new(orm.Provider), new(*Provider)),
	orm.RegisterORMProvider,
)
