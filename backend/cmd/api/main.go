package main

import (
	api "github.com/RedInn7/gatecode/backend/internal/handler"
	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/internal/repository"
	"github.com/RedInn7/gatecode/backend/internal/service"
	"github.com/RedInn7/gatecode/backend/pkg/database"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. 初始化数据库
	db := database.InitDB()

	// 2. 自动同步表结构 (#3)
	db.AutoMigrate(&model.Problem{})

	// 3. 依赖注入 (DAO -> Service -> Handler)
	problemRepo := repository.NewProblemRepository(db)
	problemSvc := service.NewProblemService(problemRepo)
	problemHandler := api.NewProblemHandler(problemSvc)

	// 4. 路由设置
	r := gin.Default()

	v1 := r.Group("/api/v1")
	{
		v1.GET("/problems", problemHandler.GetProblems) // 你的第一个 API
	}

	r.Run(":8080")
}
