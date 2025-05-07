package http

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHTTPEmbedding(t *testing.T) {
	if os.Getenv("TEST_HTTP_EMBEDDING") != "true" {
		return
	}

	ctx := context.Background()
	emb, err := NewEmbedding("http://127.0.0.1:6543")
	assert.NoError(t, err)
	texts := []string{
		"hello",
		"Eiffel Tower: Located in Paris, France, it is one of the most famous landmarks in the world.",
	}

	dense, err := emb.EmbedStrings(ctx, texts)
	assert.NoError(t, err)
	fmt.Println(dense)

	dense, sparse, err := emb.EmbedStringsHybrid(ctx, texts)
	assert.NoError(t, err)
	fmt.Println(dense, sparse)
}
