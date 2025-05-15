package connector

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConnectorImpl_List(t *testing.T) {
	svc := NewService()
	connectors, err := svc.List(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	jsonString, err := json.Marshal(connectors)
	assert.NoError(t, err)

	t.Log("list", string(jsonString))

	assert.Equal(t, 3, len(connectors))
}

func TestConnectorImpl_Get(t *testing.T) {
	svc := NewService()
	connectors, err := svc.GetByIDs(context.Background(), []int64{999})
	assert.NoError(t, err)

	assert.Equal(t, 1, len(connectors))
	assert.Equal(t, int64(999), connectors[0].ID)

}
