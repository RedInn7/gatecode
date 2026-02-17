package main

import (
	api "github.com/RedInn7/gatecode/backend/internal/handler"
	"github.com/RedInn7/gatecode/backend/internal/model"
	"github.com/RedInn7/gatecode/backend/internal/repository"
	"github.com/RedInn7/gatecode/backend/internal/service"
	"github.com/RedInn7/gatecode/backend/pkg/database"
	"github.com/gin-gonic/gin"
	"net/http"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func main() {
	// 1. 初始化数据库
	db := database.InitDB()

	// 2. 自动同步表结构
	db.AutoMigrate(&model.Problem{})

	// 3. 依赖注入 (DAO -> Service -> Handler)
	problemRepo := repository.NewProblemRepository(db)
	problemSvc := service.NewProblemService(problemRepo)
	problemHandler := api.NewProblemHandler(problemSvc)

	// 4. 路由设置
	r := gin.Default()
	r.Use(corsMiddleware())

	v1 := r.Group("/api/v1")
	{
		v1.GET("/problems", problemHandler.GetProblems)
		v1.GET("/problems/:slug", problemHandler.GetProblemBySlug)
	}

	r.Run(":8081")
}
