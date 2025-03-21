package orm

import (
	"context"
	"fmt"
	"sync"

	"gorm.io/gorm"
)

type DB = gorm.DB

var dbContainer sync.Map

// GetTable retrieves a database instance for the given database and table names
func GetTable(ctx context.Context, dbName string, table string) (*DB, error) {
	db, ok := dbContainer.Load(dbName)
	if !ok {
		var err error
		provider, err := getORMProvider()
		if err != nil {
			return nil, fmt.Errorf("failed to getORMProvider, dbName=%v, err=%w", dbName, err)
		}
		db, err = provider.Initialize(ctx, dbName)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize database, dbName=%s, table=%v, err=%w", dbName, table, err)
		}
		dbContainer.Store(dbName, db)
	}

	return db.(*DB).Table(table), nil
}
