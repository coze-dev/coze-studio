package orm

import (
	"fmt"
	"reflect"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// MockDB represents a test database setup helper
type MockDB struct {
	db     *gorm.DB
	tables map[any]*Table
}

// NewMockDB creates a new MockDB instance
func NewMockDB() *MockDB {
	return &MockDB{
		tables: make(map[any]*Table),
	}
}

// AddTable adds a table to the test database
func (s *MockDB) AddTable(tableModel any) *Table {
	if tb, ok := s.tables[tableModel]; ok {
		return tb
	}

	tb := &Table{
		rows: make([]any, 0, 10),
	}

	s.tables[tableModel] = tb
	return tb
}

type Table struct {
	rows []any
}

func (t *Table) AddRows(rows ...any) *Table {
	t.rows = append(t.rows, rows...)
	return t
}

// DB returns the underlying gorm.DB instance
func (s *MockDB) DB() (*gorm.DB, error) {
	db, err := newSQLiteDB(":memory:")
	if err != nil {
		return nil, err
	}
	s.db = db

	if err := s.setup(); err != nil {
		return nil, err
	}

	return s.db, nil
}

func (s *MockDB) SharedDB(name string) (*gorm.DB, error) {
	db, err := newSQLiteDB(fmt.Sprintf("file:%s?mode=memory&cache=shared", name))
	if err != nil {
		return nil, err
	}
	s.db = db

	if err := s.setup(); err != nil {
		return nil, err
	}

	return s.db, nil
}

// Close cleans up the test database
func (s *MockDB) Close() error {
	tables := make([]any, 0, len(s.tables))
	for tb := range s.tables {
		tables = append(tables, tb)
	}
	if err := s.tearDown(tables...); err != nil {
		return fmt.Errorf("failed to tear down database: %w", err)
	}
	return nil
}

func (s *MockDB) setup() error {

	for tableModel, tb := range s.tables {
		// Create tables
		if err := s.createTableFromStruct(tableModel); err != nil {
			return fmt.Errorf("failed to create table: %w", err)
		}

		// Insert test data
		if err := s.tearUp(tableModel, tb.rows); err != nil {
			return fmt.Errorf("failed to insert test data: %w", err)
		}
	}

	return nil
}

// newSQLiteDB creates a new in-memory SQLite database for testing
func newSQLiteDB(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}
	return db, nil
}

// createTableFromStruct creates a table in the database based on the provided struct
func (s *MockDB) createTableFromStruct(model any) error {
	if reflect.TypeOf(model).Kind() != reflect.Ptr {
		return fmt.Errorf("model must be a pointer to struct")
	}

	return s.db.AutoMigrate(model)
}

// tearUp inserts test data into the database
func (s *MockDB) tearUp(tableModel any, rows []any) error {
	if len(rows) == 0 {
		return nil
	}

	for _, row := range rows {
		err := s.db.Model(tableModel).Create(row).Error
		if err != nil {
			return err
		}
	}

	return nil
}

// tearDown cleans up the test data
func (s *MockDB) tearDown(models ...any) error {
	for _, model := range models {
		if err := s.db.Where("1 = 1").Delete(model).Error; err != nil {
			return err
		}

		if err := s.db.Migrator().DropTable(model); err != nil {
			return err
		}
	}
	return nil
}
