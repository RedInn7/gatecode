package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB(dsn string) error {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return err
	}

	// 设置连接池以应对 OJ 高并发
	db.SetMaxOpenConns(100)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(time.Hour)

	if err := db.Ping(); err != nil {
		return err
	}

	DB = db
	fmt.Println("✅ 数据库连接成功")
	return nil
}
