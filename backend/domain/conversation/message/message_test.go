package message

import (
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"context"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"os"
	"testing"
)

// Test_NewListMessage tests the NewListMessage function
func TestListMessage(t *testing.T) {

	ctx := context.Background()
	dsn := os.Getenv("MYSQL_DSN")
	mockDB, _ := gorm.Open(mysql.Open(dsn))

	components := &Components{
		DB: mockDB,
	}

	msgData, err := NewService(components).List(ctx, &entity.ListRequest{
		ConversationID: 1,
		Limit:          1,
		UserID:         1,
		Page:           1,
	})

	log.Fatalf("TestListMessage, msgData:%v, err:%v", msgData, err)

}

// Test_NewListMessage tests the NewListMessage function
func TestCreateMessage(t *testing.T) {

	ctx := context.Background()
	dsn := os.Getenv("MYSQL_DSN")
	mockDB, _ := gorm.Open(mysql.Open(dsn))
	//idgen, _ := idgen2.New()
	components := &Components{
		DB: mockDB,
	}
	msgData, err := NewService(components).Create(ctx, &entity.CreateRequest{
		Message: &entity.Message{
			ID:             1,
			ConversationID: 1,
			AgentID:        1,
			Content:        "test content",
			Role:           "test",
		},
	})
	if err != nil {
		log.Fatalf("TestCreateMessage, err:%v", err)
	}

	log.Fatalf("TestCreateMessage, msgData:%v, err:%v", msgData, err)

}
