package database

import (
	"fmt"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	dsn := "root:@tcp(127.0.0.1:3306)/gatecode?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("数据库连接失败: %v", err))
	}

	sqlDB, err := db.DB()
	if err != nil {
		panic(fmt.Sprintf("获取底层 DB 失败: %v", err))
	}

	// 设置连接池以应对 OJ 高并发
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db
	fmt.Println("✅ 数据库连接成功")
	return db
}
