package mysql

import (
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func New() (*gorm.DB, error) {
	dsn := os.Getenv("MYSQL_DSN")
	return gorm.Open(mysql.Open(dsn))
}
