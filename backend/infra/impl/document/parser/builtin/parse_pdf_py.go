package builtin

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"

	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	contract "code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
)

func parsePDFPy(config *contract.Config, imageX imagex.ImageX) parseFn {
	return func(ctx context.Context, reader io.Reader, opts ...parser.Option) (docs []*schema.Document, err error) {
		r, w, err := os.Pipe()
		if err != nil {
			return nil, fmt.Errorf("[parsePDFPy create pipe failed: %w", err)
		}
		options := parser.GetCommonOptions(&parser.Options{ExtraMeta: map[string]any{}}, opts...)

		py := ".venv/bin/python3"
		script := "parse_pdf.py"
		cmd := exec.Command(py, script)
		cmd.Stdin = reader
		cmd.Stdout = os.Stdout
		cmd.ExtraFiles = []*os.File{w}

		if err = cmd.Start(); err != nil {
			return nil, fmt.Errorf("[parsePDFPy] failed to start Python script: %w", err)
		}
		if err = w.Close(); err != nil {
			return nil, fmt.Errorf("[parsePDFPy] failed to close write pipe: %w", err)
		}

		result := &pyPDFParseResult{}

		if err = json.NewDecoder(r).Decode(result); err != nil {
			return nil, fmt.Errorf("[parsePDFPy] failed to decode result: %w", err)
		}
		if err = cmd.Wait(); err != nil {
			return nil, fmt.Errorf("[parsePDFPy] cmd wait err: %w", err)
		}

		if result.Error != "" {
			return nil, fmt.Errorf("[parsePDFPy] python execution failed: %s", result.Error)
		}

		for i, item := range result.Content {
			switch item.Type {
			case "text":
				partDocs, err := chunkCustom(ctx, item.Content, config, opts...)
				if err != nil {
					return nil, fmt.Errorf("[parsePDFPy] chunk text failed, %w", err)
				}
				docs = append(docs, partDocs...)
			case "image":
				if !config.ParsingStrategy.ExtractImage {
					continue
				}
				image, err := base64.StdEncoding.DecodeString(item.Content)
				if err != nil {
					return nil, fmt.Errorf("[parsePDFPy] decode image failed, %w", err)
				}
				ret, err := imageX.Upload(ctx, image)
				if err != nil {
					return nil, fmt.Errorf("[parsePDFPy] upload image failed, %w", err)
				}
				resourceURL, err := imageX.GetResourceURL(ctx, ret.Result.Uri)
				if err != nil {
					return nil, fmt.Errorf("wtf")
				}
				label := fmt.Sprintf("\n<img src=\"%s\"/>\n", resourceURL.URL)

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
					result.Content[i+1].Content = label + result.Content[i+1].Content
				}
			case "table":
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
					return nil, fmt.Errorf("[parsePDFPy] parse table failed, %w", err)
				}
				docs = append(docs, partDocs...)
			default:
				return nil, fmt.Errorf("[parsePDFPy] invalid content type: %s", item.Type)
			}
		}

		return docs, nil
	}
}

type pyPDFParseResult struct {
	Error   string               `json:"error"`
	Content []*pyPDFParseContent `json:"content"`
}

type pyPDFParseContent struct {
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
