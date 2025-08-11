package clickhouse

import (
	"github.com/ClickHouse/clickhouse-go/v2"
	ckdriver "gorm.io/driver/clickhouse"
	"gorm.io/gorm"
)

func newClickhouseDB(cfg *clickhouse.Options) (*gorm.DB, error) {
	opt := *cfg
	opt.MaxOpenConns = 0
	opt.MaxIdleConns = 0
	opt.ConnMaxLifetime = 0

	conn := clickhouse.OpenDB(&opt)
	if cfg.MaxIdleConns > 0 {
		conn.SetMaxIdleConns(cfg.MaxIdleConns)
	}
	if cfg.MaxOpenConns > 0 {
		conn.SetMaxOpenConns(cfg.MaxOpenConns)
	}
	if cfg.ConnMaxLifetime > 0 {
		conn.SetConnMaxLifetime(cfg.ConnMaxLifetime)
	}

	if err := conn.Ping(); err != nil {
		return nil, err
	}

	db, err := gorm.Open(ckdriver.New(ckdriver.Config{
		Conn: conn,
	}))
	if err != nil {
		return nil, err
	}

	return db, nil
}
