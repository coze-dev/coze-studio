package builtin

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	mimagex "code.byted.org/flow/opencoze/backend/internal/mock/infra/contract/imagex"
)

func TestParseDocx(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockImageX := mimagex.NewMockImageX(ctrl)
	fn := parseDocx(mockImageX)
	f, err := os.Open("./test_data/test_docx_1.docx")
	assert.NoError(t, err)

	getResult := func() func() *imagex.UploadResult {
		i := -1
		return func() *imagex.UploadResult {
			i++
			return &imagex.UploadResult{
				Result: &imagex.Result{
					Uri:       fmt.Sprintf("uri:%d", i),
					UriStatus: 0,
				},
				RequestId: "",
				FileInfo:  nil,
			}
		}
	}()

	mockImageX.EXPECT().Upload(gomock.Any(), gomock.Any()).Return(getResult(), nil).AnyTimes()

	slices, err := fn(context.Background(), f, &entity.Document{
		ParsingStrategy: &entity.ParsingStrategy{
			HeaderLine:    0,
			DataStartLine: 1,
			RowsCount:     20,
			ExtractImage:  true,
			ExtractTable:  true,
		},
		ChunkingStrategy: &entity.ChunkingStrategy{
			ChunkType:       entity.ChunkTypeCustom,
			ChunkSize:       25,
			Separator:       ",",
			Overlap:         5,
			TrimSpace:       true,
			TrimURLAndEmail: true,
		},
	})
	assert.NoError(t, err)

	for i, slice := range slices {
		for _, rc := range slice.RawContent {
			switch rc.Type {
			case entity.SliceContentTypeText:
				fmt.Println(i, "text", *rc.Text)
			case entity.SliceContentTypeImage:
				fmt.Println(i, "iamge", rc.Image.URI)
			case entity.SliceContentTypeTable:
				fmt.Println(i, "table", *rc.Table)
			}
		}
	}
}
