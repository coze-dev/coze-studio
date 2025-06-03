package builtin

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"strings"
	"unicode/utf8"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"
	"github.com/fumiama/go-docx"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/ocr"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

func parseDocx(config *contract.Config, storage storage.Storage, ocr ocr.OCR) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		options := parser.GetCommonOptions(&parser.Options{}, opts...)
		all, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		ra := bytes.NewReader(all)
		d, err := docx.Parse(ra, int64(len(all)))
		if err != nil {
			return nil, err
		}

		ps := config.ParsingStrategy
		cs := config.ChunkingStrategy

		switch cs.ChunkType {
		case contract.ChunkTypeCustom:

			var (
				last       *schema.Document
				emptySlice bool
			)

			addSliceContent := func(plainText string) {
				emptySlice = false
				last.Content += plainText
			}

			newSlice := func(needOverlap bool) {
				last = &schema.Document{
					MetaData: map[string]any{},
				}
				for k, v := range options.ExtraMeta {
					last.MetaData[k] = v
				}
				if needOverlap && cs.Overlap > 0 && len(docs) > 0 {
					overlap := getOverlap([]rune(docs[len(docs)-1].Content), cs.Overlap, cs.ChunkSize)
					addSliceContent(string(overlap))
				}
				emptySlice = true
			}

			pushSlice := func() {
				if !emptySlice && last.Content != "" { // filter empty content
					docs = append(docs, last)
					newSlice(true)
				}
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

			findImage := func(drawing *docx.Drawing) (media *docx.Media, found bool, err error) {
				var g *docx.AGraphic

				if drawing.Anchor != nil && drawing.Anchor.Graphic != nil {
					g = drawing.Anchor.Graphic
				} else if drawing.Inline != nil {
					g = drawing.Inline.Graphic
				} else {
					return nil, false, nil
				}

				if g == nil ||
					g.GraphicData == nil ||
					g.GraphicData.Pic == nil ||
					g.GraphicData.Pic.BlipFill == nil {
					return nil, false, nil
				}

				pic := g.GraphicData.Pic
				rid := pic.BlipFill.Blip.Embed

				if err = d.RangeRelationships(func(relationship *docx.Relationship) error {
					if found || relationship == nil || relationship.ID != rid {
						return nil
					}
					name := strings.TrimPrefix(relationship.Target, "media/")
					media = d.Media(name)
					if media == nil {
						return nil
					}
					found = true
					return nil
				}); err != nil {
					return nil, false, err
				}

				return
			}

			var traversal func(items []interface{}) error
			traversal = func(items []interface{}) error {
				for _, it := range items {
					switch t := it.(type) {
					case *docx.Text:
						for _, part := range strings.Split(trim(t.Text), cs.Separator) {
							runes := []rune(part)
							for partLength := int64(len(runes)); partLength > 0; partLength = int64(len(runes)) {
								pos := min(partLength, cs.ChunkSize-charCount(last.Content))
								chunk := runes[:pos]
								addSliceContent(string(chunk))
								runes = runes[pos:]
								if charCount(last.Content) >= cs.ChunkSize {
									pushSlice()
								}
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
							pushSlice()
						} else {
							newSlice(false)
						}

						media, found, err := findImage(t)
						if err != nil {
							return err
						}
						if !found {
							continue
						}

						imgSrc, err := putImageObject(ctx, storage, getExtension(media.Name), getCreatorIDFromExtraMeta(options.ExtraMeta), media.Data)
						if err != nil {
							return err
						}

						newSlice(false)
						addSliceContent(fmt.Sprintf("\n%s\n", imgSrc))

						if config.ParsingStrategy.ImageOCR && ocr != nil {
							texts, err := ocr.FromBase64(ctx, base64.StdEncoding.EncodeToString(media.Data))
							if err != nil {
								return err
							}
							addSliceContent(strings.Join(texts, "\n"))
						}

						if charCount(last.Content) >= cs.ChunkSize {
							pushSlice()
						}

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
				pushSlice()
			}

			return docs, nil
		default:
			return nil, fmt.Errorf("[parseDocx] chunk type not support, chunk type=%d", cs.ChunkType)
		}
	}
}

func charCount(text string) int64 {
	return int64(utf8.RuneCountInString(text))
}
