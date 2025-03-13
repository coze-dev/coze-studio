//go:build wireinject

package infra

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestInitializeProvider(t *testing.T) {
	db, err := InitializeORMProvider(context.Background())
	assert.NoError(t, err)
	assert.NotNil(t, db)
}
