package postgres

import (
	"context"
	"fmt"

	"github.com/google/wire"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/infra-contract/orm"
)

// Provider implements the orm.Provider interface for PostgreSQL
type Provider struct {
	config *Config
}

// Config holds PostgreSQL connection configuration
type Config struct {
	Host     string
	Port     int
	Username string
	Password string
	SSLMode  string
}

// NewProvider creates a new PostgreSQL provider instance
func NewProvider(config *Config) *Provider {
	return &Provider{config: config}
}

// Initialize implements orm.Provider interface
func (p *Provider) Initialize(ctx context.Context, dbName string) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		p.config.Host,
		p.config.Port,
		p.config.Username,
		p.config.Password,
		dbName,
		p.config.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	return db, nil
}

// ProviderSet is the Wire provider set for PostgreSQL
var ProviderSet = wire.NewSet(
	NewProvider,
	wire.Bind(new(orm.Provider), new(*Provider)),
)
