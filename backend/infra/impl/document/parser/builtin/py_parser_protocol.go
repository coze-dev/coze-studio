package builtin

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/document/ocr"
	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

const (
	contentTypeText  = "text"
	contentTypeImage = "image"
	contentTypeTable = "table"
)

type pyParseRequest struct {
	ExtractImages bool `json:"extract_images"`
	ExtractTables bool `json:"extract_tables"`
}

type pyParseResult struct {
	Error   string            `json:"error"`
	Content []*pyParseContent `json:"content"`
}

type pyParseContent struct {
	Type    string     `json:"type"`
	Content string     `json:"content"`
	Table   [][]string `json:"table"`
	Page    int        `json:"page"`
}

type pyPDFTableIterator struct {
	i    int
	rows [][]string
}

func (p *pyPDFTableIterator) NextRow() (row []string, end bool, err error) {
	if p.i >= len(p.rows) {
		return nil, true, nil
	}
	row = p.rows[p.i]
	p.i++
	return row, false, nil
}

func parseByPython(config *contract.Config, storage storage.Storage, ocr ocr.OCR, pyPath, scriptPath string) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		pr, pw, err := os.Pipe()
		if err != nil {
			return nil, fmt.Errorf("[parseByPython] create rpipe failed, %w", err)
		}
		r, w, err := os.Pipe()
		if err != nil {
			return nil, fmt.Errorf("[parseByPython] create pipe failed: %w", err)
		}
		options := parser.GetCommonOptions(&parser.Options{ExtraMeta: map[string]any{}}, opts...)

		reqb, err := json.Marshal(pyParseRequest{
			ExtractImages: config.ParsingStrategy.ExtractImage,
			ExtractTables: config.ParsingStrategy.ExtractTable,
		})
		if err != nil {
			return nil, fmt.Errorf("[parseByPython] create parse request failed, %w", err)
		}
		if _, err = pw.Write(reqb); err != nil {
			return nil, fmt.Errorf("[parseByPython] write parse request bytes failed, %w", err)
		}
		if err = pw.Close(); err != nil {
			return nil, fmt.Errorf("[parseByPython] close write request pipe failed, %w", err)
		}

		cmd := exec.Command(pyPath, scriptPath)
		cmd.Stdin = reader
		cmd.Stdout = os.Stdout
		cmd.ExtraFiles = []*os.File{w, pr}
		if err = cmd.Start(); err != nil {
			return nil, fmt.Errorf("[parseByPython] failed to start Python script: %w", err)
		}
		if err = w.Close(); err != nil {
			return nil, fmt.Errorf("[parseByPython] failed to close write pipe: %w", err)
		}

		result := &pyParseResult{}

		if err = json.NewDecoder(r).Decode(result); err != nil {
			return nil, fmt.Errorf("[parseByPython] failed to decode result: %w", err)
		}
		if err = cmd.Wait(); err != nil {
			return nil, fmt.Errorf("[parseByPython] cmd wait err: %w", err)
		}

		if result.Error != "" {
			return nil, fmt.Errorf("[parseByPython] python execution failed: %s", result.Error)
		}

		for i, item := range result.Content {
			switch item.Type {
			case contentTypeText:
				partDocs, err := chunkCustom(ctx, item.Content, config, opts...)
				if err != nil {
					return nil, fmt.Errorf("[parseByPython] chunk text failed, %w", err)
				}
				docs = append(docs, partDocs...)
			case contentTypeImage:
				if !config.ParsingStrategy.ExtractImage {
					continue
				}
				image, err := base64.StdEncoding.DecodeString(item.Content)
				if err != nil {
					return nil, fmt.Errorf("[parseByPython] decode image failed, %w", err)
				}
				imgSrc, err := putImageObject(ctx, storage, "png", getCreatorIDFromExtraMeta(options.ExtraMeta), image)
				if err != nil {
					return nil, err
				}
				label := fmt.Sprintf("\n%s", imgSrc)
				if config.ParsingStrategy.ImageOCR && ocr != nil {
					texts, err := ocr.FromBase64(ctx, item.Content)
					if err != nil {
						return nil, fmt.Errorf("[parseByPython] FromBase64 failed, %w", err)
					}
					label += strings.Join(texts, "\n")
				}

				if i == len(result.Content)-1 || result.Content[i+1].Type != "text" {
					doc := &schema.Document{
						Content:  label,
						MetaData: map[string]any{},
					}
					for k, v := range options.ExtraMeta {
						doc.MetaData[k] = v
					}
					docs = append(docs, doc)
				} else {
					// TODO: 这里有点问题，img label 可能被较短的 chunk size 截断
					result.Content[i+1].Content = label + result.Content[i+1].Content
				}
			case contentTypeTable:
				if !config.ParsingStrategy.ExtractTable {
					continue
				}
				iterator := &pyPDFTableIterator{i: 0, rows: item.Table}
				partDocs, err := parseByRowIterator(iterator, &contract.Config{
					FileExtension: contract.FileExtensionCSV,
					ParsingStrategy: &contract.ParsingStrategy{
						HeaderLine:    0,
						DataStartLine: 1,
						RowsCount:     0,
					},
					ChunkingStrategy: config.ChunkingStrategy,
				}, opts...)
				if err != nil {
					return nil, fmt.Errorf("[parseByPython] parse table failed, %w", err)
				}
				docs = append(docs, partDocs...)
			default:
				return nil, fmt.Errorf("[parseByPython] invalid content type: %s", item.Type)
			}
		}

		return docs, nil
	}
}
