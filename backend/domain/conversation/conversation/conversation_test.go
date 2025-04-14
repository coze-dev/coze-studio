package conversation

import (
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
	idgen2 "code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"context"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"os"
	"testing"
)

// Test_NewListMessage tests the NewListMessage function
func TestCreateConversation(t *testing.T) {

	ctx := context.Background()
	dsn := os.Getenv("MYSQL_DSN")
	mockDB, _ := gorm.Open(mysql.Open(dsn))
	idgen, _ := idgen2.New()
	msgData, err := service.NewCreateConversation(ctx, mockDB, idgen, &CreateRequest{
		UserID: "test",
	}).Create()

	log.Fatalf("TestCreateConversation, msgData:%v, err:%v", msgData, err)

}
