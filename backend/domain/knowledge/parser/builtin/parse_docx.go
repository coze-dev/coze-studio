package builtin

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"strings"
	"unicode/utf8"

	"github.com/fumiama/go-docx"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
)

func parseDocx(imageX imagex.ImageX) parseTextFn {
	return func(ctx context.Context, reader io.Reader, document *entity.Document) (slices []*entity.Slice, err error) {
		all, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		ra := bytes.NewReader(all)
		d, err := docx.Parse(ra, int64(len(all)))
		if err != nil {
			return nil, err
		}

		ps := document.ParsingStrategy
		cs := document.ChunkingStrategy

		switch cs.ChunkType {
		case entity.ChunkTypeCustom:

			var (
				last       *entity.Slice
				emptySlice bool
			)

			addSliceContent := func(plainText string, rawContent ...*entity.SliceContent) {
				emptySlice = false
				last.PlainText += plainText
				last.ByteCount += int64(len(plainText))
				last.CharCount += int64(utf8.RuneCountInString(plainText))
				last.RawContent = append(last.RawContent, rawContent...)
			}

			newSlice := func(needOverlap bool) {
				last = &entity.Slice{
					KnowledgeID:  document.KnowledgeID,
					DocumentID:   document.ID,
					DocumentName: document.Name,
					Sequence:     int64(len(slices)),
				}
				if needOverlap && cs.Overlap > 0 && len(slices) > 0 {
					overlap := getOverlap(slices[len(slices)-1].PlainText, cs.Overlap)
					addSliceContent(overlap, &entity.SliceContent{
						Type: entity.SliceContentTypeText,
						Text: &overlap,
					})
				}
				emptySlice = true
			}

			addSlice := func() {
				slices = append(slices, last)
				newSlice(true)
			}

			trim := func(text string) string {
				if cs.TrimURLAndEmail {
					text = urlRegex.ReplaceAllString(text, "")
					text = emailRegex.ReplaceAllString(text, "")
				}
				if cs.TrimSpace {
					text = strings.TrimSpace(text)
					text = spaceRegex.ReplaceAllString(text, " ")
				}
				return text
			}

			var traversal func(items []interface{}) error
			traversal = func(items []interface{}) error {
				for _, it := range items {
					switch t := it.(type) {
					case *docx.Text:
						for _, part := range strings.Split(trim(t.Text), cs.Separator) {
							for partLength := int64(len(part)); partLength > 0; partLength = int64(len(part)) {
								pos := min(partLength, cs.ChunkSize-last.ByteCount)
								p := part[:pos]
								addSliceContent(p, &entity.SliceContent{
									Type: entity.SliceContentTypeText,
									Text: &p,
								})
								addSlice()
								part = part[pos:]
							}
						}
					case *docx.Paragraph:
						if err = traversal(t.Children); err != nil {
							return err
						}
					case *docx.Run:
						if err = traversal(t.Children); err != nil {
							return err
						}
					case *docx.Hyperlink:
						if err = traversal([]any{&t.Run}); err != nil {
							return err
						}
					case *docx.Drawing:
						if !ps.ExtractImage {
							continue
						}
						// image 不保留 overlap, 一个 chunk 至多放一个图片
						if !emptySlice {
							addSlice()
						} else {
							newSlice(false)
						}

						// 先不处理 inline
						if t.Anchor == nil || t.Anchor.Graphic == nil ||
							t.Anchor.Graphic.GraphicData == nil || t.Anchor.Graphic.GraphicData.Pic == nil ||
							t.Anchor.Graphic.GraphicData.Pic.BlipFill == nil {
							continue
						}

						pic := t.Anchor.Graphic.GraphicData.Pic
						rid := pic.BlipFill.Blip.Embed

						var (
							uri string
							b64 []byte
						)
						if err = d.RangeRelationships(func(relationship *docx.Relationship) error {
							if relationship == nil || relationship.ID != rid {
								return nil
							}

							name := strings.TrimPrefix(relationship.Target, "media/")
							media := d.Media(name)
							if media == nil {
								return nil
							}

							ret, err := imageX.Upload(ctx, media.Data)
							if err != nil {
								return err
							}

							uri = ret.Result.Uri
							b64 = make([]byte, base64.StdEncoding.EncodedLen(len(media.Data)))
							base64.RawStdEncoding.Encode(b64, media.Data)

							return nil
						}); err != nil {
							return err
						}

						newSlice(false)
						addSliceContent(fmt.Sprintf("\n<img src=\"%s\"/>\n", uri), &entity.SliceContent{
							Type: entity.SliceContentTypeImage,
							Image: &entity.SliceImage{
								Base64:  b64, // todo 确认下是否还需要存
								URI:     uri,
								OCR:     false, // todo ocr
								OCRText: nil,
							},
						})

					case *docx.Table:
						if !ps.ExtractTable {
							continue
						}

						// TODO: 解析
					default:
						// skip unsupported tags
					}
				}

				return nil
			}

			newSlice(false)
			if err = traversal(d.Document.Body.Items); err != nil {
				return nil, err
			}

			if !emptySlice { // last
				addSlice()
			}

			return slices, nil
		default:
			return nil, fmt.Errorf("[parseDocx] chunk type not support, chunk type=%d", cs.ChunkType)
		}
	}
}
