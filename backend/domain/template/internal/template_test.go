package internal

import (
	"context"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/domain/template/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	mock "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/idgen"
)

func setupTestDB(t *testing.T) (*gorm.DB, rdb.RDB) {
	dsn := "root:root@tcp(127.0.0.1:3306)/opencoze?charset=utf8mb4&parseTime=True&loc=Local"
	if os.Getenv("CI_JOB_NAME") != "" {
		dsn = strings.ReplaceAll(dsn, "127.0.0.1", "mysql")
	}
	db, err := gorm.Open(mysql.Open(dsn))
	assert.NoError(t, err)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)
	idGen.EXPECT().GenID(gomock.Any()).Return(int64(123), nil).AnyTimes()

	return db, nil
}

func cleanupTestEnv(t *testing.T, db *gorm.DB, additionalTables ...string) {
	sqlDB, err := db.DB()
	assert.NoError(t, err)

	daosToClean := []string{"template"}
	for _, tableName := range daosToClean {
		_, err := sqlDB.Exec(fmt.Sprintf("DELETE FROM `%s` WHERE 1=1", tableName))
		if err != nil {
			t.Logf("Failed to clean table %s: %v", tableName, err)
		}
	}

	rows, err := sqlDB.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name LIKE 'table_%'")
	assert.NoError(t, err, "Failed to query tables")
	defer rows.Close()

	var tablesToDrop []string
	for rows.Next() {
		var tableName string
		if err := rows.Scan(&tableName); err != nil {
			t.Logf("Error scanning table name: %v", err)
			continue
		}
		tablesToDrop = append(tablesToDrop, tableName)
	}

	tablesToDrop = append(tablesToDrop, additionalTables...)

	for _, tableName := range tablesToDrop {
		_, err := sqlDB.Exec(fmt.Sprintf("DROP TABLE IF EXISTS `%s`", tableName))
		if err != nil {
			t.Logf("Failed to drop table %s: %v", tableName, err)
		}
	}
}

func TestDeleteData(t *testing.T) {
	db, _ := setupTestDB(t)
	//defer cleanupTestEnv(t, db)

	ctrl := gomock.NewController(t)
	idGen := mock.NewMockIDGenerator(ctrl)

	baseID := time.Now().UnixNano()
	idGen.EXPECT().GenID(gomock.Any()).DoAndReturn(func(ctx context.Context) (int64, error) {
		id := baseID
		baseID++
		return id, nil
	}).AnyTimes()

	idGen.EXPECT().GenMultiIDs(gomock.Any(), gomock.Any()).DoAndReturn(func(ctx context.Context, count int) ([]int64, error) {
		ids := make([]int64, count)
		for i := 0; i < count; i++ {
			ids[i] = baseID
			baseID++
		}
		return ids, nil
	}).AnyTimes()

	templateDAO := dal.NewTemplateDAO(db, idGen)

	err := db.Exec("INSERT INTO template (agent_id, space_id, meta_info) VALUES (?, ?, ?)",
		1, 1, "{\n        \"category\": {\n            \"active_icon_url\": \"\",\n            \"count\": 0,\n            \"icon_url\": \"\",\n            \"id\": \"7420259113692643328\",\n            \"index\": 0,\n            \"name\": \"学习教育\"\n        },\n        \"covers\": [\n            {\n                \"uri\": \"626e91b2dfa749eabd6f36a3d4f1389c\",\n                \"url\": \"https://p9-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/626e91b2dfa749eabd6f36a3d4f1389c~tplv-13w3uml6bg-resize:800:320.image?rk3s=2e2596fd\\u0026x-expires=1751509027\\u0026x-signature=gUaV0W4ukFHF%2B%2BtECEK186%2Fa%2BOM%3D\"\n            }\n        ],\n        \"description\": \"Passionate and open-minded English foreign teacher\",\n        \"entity_id\": \"7414035883517165606\",\n        \"entity_type\": 21,\n        \"entity_version\": \"1727684312066\",\n        \"favorite_count\": 0,\n        \"heat\": 5426,\n        \"icon_url\": \"https://p6-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/8704258ad88944c8a412d25bd4e5cf9f~tplv-13w3uml6bg-resize:128:128.image?rk3s=2e2596fd\\u0026x-expires=1751509027\\u0026x-signature=hSSYRFyMMIJrE4aTm5onLASh1%2Bg%3D\",\n        \"id\": \"7416518827749425204\",\n        \"is_favorited\": false,\n        \"is_free\": true,\n        \"is_official\": true,\n        \"is_professional\": false,\n        \"is_template\": true,\n        \"labels\": [\n            {\n                \"name\": \"语音\"\n            },\n            {\n                \"name\": \"Prompt\"\n            }\n        ],\n        \"listed_at\": \"1730815551\",\n        \"medium_icon_url\": \"\",\n        \"name\": \"英语聊天\",\n        \"origin_icon_url\": \"\",\n        \"readme\": \"{\\\"0\\\":{\\\"ops\\\":[{\\\"insert\\\":\\\"英语外教Lucas，尝试跟他进行英语话题的聊天吧！可以在闲聊中对你的口语语法进行纠错，非常自然地提升你的语法能力。\\\\n\\\"},{\\\"attributes\\\":{\\\"lmkr\\\":\\\"1\\\"},\\\"insert\\\":\\\"*\\\"},{\\\"insert\\\":\\\"如何快速使用：复制后，在原Prompt的基础上调整自己的语言偏好即可。\\\\n\\\"}],\\\"zoneId\\\":\\\"0\\\",\\\"zoneType\\\":\\\"Z\\\"}}\",\n        \"seller\": {\n            \"avatar_url\": \"https://p6-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/78f519713ce46901120fb7695f257c9a.png~tplv-13w3uml6bg-resize:128:128.image?rk3s=2e2596fd\\u0026x-expires=1751510484\\u0026x-signature=V5ZBsHdoZtmioAgoW7JHs0J3wZ0%3D\",\n            \"id\": \"0\",\n            \"name\": \"\"\n        },\n        \"status\": 1,\n        \"user_info\": {\n            \"avatar_url\": \"https://p6-flow-product-sign.byteimg.com/tos-cn-i-13w3uml6bg/78f519713ce46901120fb7695f257c9a.png~tplv-13w3uml6bg-resize:128:128.image?rk3s=2e2596fd\\u0026x-expires=1751510484\\u0026x-signature=V5ZBsHdoZtmioAgoW7JHs0J3wZ0%3D\",\n            \"name\": \"扣子官方\",\n            \"user_id\": \"0\",\n            \"user_name\": \"\"\n        }\n    }").Error

	assert.NoError(t, err, "Failed to insert test data")

	list, _, err := templateDAO.List(context.Background(), nil, nil, "")
	if err != nil {
		return
	}

	println(len(list))

}
