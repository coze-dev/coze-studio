package main

import (
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("MYSQL_DSN")
	gormDB, err := gorm.Open(mysql.Open(dsn))
	if err != nil {
		log.Fatalf("gorm.Open failed, err=%v", err)
	}

	g := gen.NewGenerator(gen.Config{
		OutPath: "../../domain/agent/singleagent/dal/query",
		Mode:    gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
	})

	g.UseDB(gormDB)

	g.ApplyBasic(
		g.GenerateModel("single_agent_draft"),
		g.GenerateModel("single_agent_version"),
	)

	g.Execute()
}
