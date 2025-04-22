package builtin

//func TestParseDocx(t *testing.T) {
//	fn := parseDocx(nil)
//	f, err := os.Open("/Users/bytedance/Downloads/444.docx")
//
//	assert.NoError(t, err)
//	_, err = fn(context.Background(), f, &entity.Document{
//		ParsingStrategy: &entity.ParsingStrategy{
//			HeaderLine:    0,
//			DataStartLine: 1,
//			RowsCount:     20,
//			ExtractImage:  true,
//			ExtractTable:  true,
//		},
//		ChunkingStrategy: &entity.ChunkingStrategy{
//			ChunkType:       entity.ChunkTypeCustom,
//			ChunkSize:       100,
//			Separator:       ",",
//			Overlap:         20,
//			TrimSpace:       true,
//			TrimURLAndEmail: true,
//		},
//	})
//	assert.NoError(t, err)
//}
