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
	db, err := gorm.Open(mysql.Open(dsn))
	if err != nil {
		log.Fatalf("gorm.Open failed, err=%v", err)
	}

	goPATH := os.Getenv("GOPATH")
	rootPath := goPATH + "/src/code.byted.org/flow/opencoze/backend/"

	g := gen.NewGenerator(gen.Config{
		OutPath:      rootPath + "domain/prompt/internal/dal/query",
		ModelPkgPath: rootPath + "domain/prompt/internal/dal/model",
		Mode:         gen.WithoutContext | gen.WithDefaultQuery | gen.WithQueryInterface,
	})

	// 复用工程原本使用的SQL连接配置db (*gorm.DB)，也可以根据需求在此处之间建立连接
	g.UseDB(db)

	// 1. 指定要同步的表名
	g.ApplyBasic(g.GenerateModel("prompt_resource"))

	// 执行并生成代码
	g.Execute()
}
