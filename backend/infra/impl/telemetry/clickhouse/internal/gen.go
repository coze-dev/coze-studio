package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	ckdriver "gorm.io/driver/clickhouse"
	"gorm.io/gen"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

func main() {
	opt := &clickhouse.Options{
		Addr: []string{"10.37.30.142:9000"},
		Auth: clickhouse.Auth{
			Database: "default",
			Username: "n3ko",
			Password: "shuffleralt1999",
		},
		Debug: true,
		Debugf: func(format string, v ...any) {
			fmt.Printf(format+"\n", v...)
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		Compression: &clickhouse.Compression{
			Method: clickhouse.CompressionZSTD,
			Level:  1,
		},
		DialTimeout:          time.Second * 30,
		MaxOpenConns:         5,
		MaxIdleConns:         5,
		ConnMaxLifetime:      time.Duration(10) * time.Minute,
		ConnOpenStrategy:     clickhouse.ConnOpenInOrder,
		BlockBufferSize:      10,
		MaxCompressionBuffer: 10240,
	}
	opt2 := *opt
	opt2.MaxOpenConns = 0
	opt2.MaxIdleConns = 0
	opt2.ConnMaxLifetime = 0
	conn := clickhouse.OpenDB(&opt2)
	conn.SetMaxIdleConns(5)
	conn.SetMaxOpenConns(5)
	conn.SetConnMaxLifetime(time.Minute * 10)

	db, err := gorm.Open(ckdriver.New(ckdriver.Config{
		Conn: conn,
	}), &gorm.Config{NamingStrategy: schema.NamingStrategy{SingularTable: true}})
	if err != nil {
		panic(err)
	}

	pwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	g := gen.NewGenerator(gen.Config{
		OutPath:          filepath.Join(pwd, "infra/impl/telemetry/clickhouse/internal/query"),
		FieldNullable:    true,
		Mode:             gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
		FieldWithTypeTag: true,
	})

	g.UseDB(db)

	g.ApplyBasic(
		g.GenerateModel("spans_index"),
		g.GenerateModel("spans_data"),
	)

	g.Execute()
}
