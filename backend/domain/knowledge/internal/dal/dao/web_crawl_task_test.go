package dao

import (
	"context"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/query"
)

func TestWebCrawlTask(t *testing.T) {
	dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
	if os.Getenv("CI_JOB_NAME") != "" {
		dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
	}
	gormDB, err := gorm.Open(mysql.Open(dsn))
	assert.NoError(t, err)

	dao := WebCrawlTaskDAO{DB: gormDB, Query: query.Use(gormDB)}
	ctx := context.Background()
	err = dao.Create(ctx, &model.WebCrawlTask{
		ID:        123,
		WebURL:    "https://example.com",
		Title:     "example title",
		CreatedAt: time.Now().UnixMilli(),
		UpdatedAt: time.Now().UnixMilli(),
	})
	assert.NoError(t, err)

	err = dao.BatchCreate(ctx, []*model.WebCrawlTask{
		{
			ID:        124,
			WebURL:    "https://example.com2",
			Title:     "example title1",
			CreatedAt: time.Now().UnixMilli(),
			UpdatedAt: time.Now().UnixMilli(),
		},
		{
			ID:        125,
			WebURL:    "https://example.com3",
			Title:     "example title2",
			CreatedAt: time.Now().UnixMilli(),
			UpdatedAt: time.Now().UnixMilli(),
		},
	})
	assert.NoError(t, err)
	tasks, err := dao.BatchGetByID(ctx, []int64{123, 124, 125})
	assert.NoError(t, err)
	assert.Len(t, tasks, 3)

	task, err := dao.GetByID(ctx, 123)
	assert.NoError(t, err)
	assert.Equal(t, "https://example.com", task.WebURL)
	assert.Equal(t, "example title", task.Title)

	err = dao.Update(ctx, 123, map[string]any{
		"title": "example title123",
	})
	assert.NoError(t, err)
	task, err = dao.GetByID(ctx, 123)
	assert.NoError(t, err)
	assert.Equal(t, "example title123", task.Title)

	dao.Upsert(ctx, &model.WebCrawlTask{
		ID:     123,
		Status: 1,
		Title:  "example title321",
	})
	task, err = dao.GetByID(ctx, 123)
	assert.NoError(t, err)
	assert.Equal(t, "example title321", task.Title)
	assert.Equal(t, int32(1), task.Status)

	err = dao.DeleteByID(ctx, 123)
	assert.NoError(t, err)
	task, err = dao.GetByID(ctx, 123)
	assert.NoError(t, err)
	assert.Nil(t, task)
	err = dao.DeleteByID(ctx, 124)
	assert.NoError(t, err)
	err = dao.DeleteByID(ctx, 125)
	assert.NoError(t, err)
}
