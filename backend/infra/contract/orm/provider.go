package orm

import (
	"context"
	"fmt"

	"gorm.io/gorm"
)

var provider Provider

// Provider defines the interface that must be implemented by all ORM providers
type Provider interface {
	// Initialize creates and returns a new database connection
	Initialize(ctx context.Context, dbName string, opts ...gorm.Option) (*DB, error)
}

func RegisterORMProvider(p Provider) error {
	if provider != nil {
		return fmt.Errorf("duplicate Register for ORMProvider, current=%T, new=%v", provider, p)
	}
	provider = p
	return nil
}

func getORMProvider() (Provider, error) {
	if provider == nil {
		return nil, fmt.Errorf("ORMProvider hasn't been registered")
	}

	return provider, nil
}
