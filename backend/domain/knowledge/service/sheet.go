/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/xuri/excelize/v2"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	rentity "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) GetAlterTableSchema(ctx context.Context, req *AlterTableSchemaRequest) (*TableSchemaResponse, error) {
	if (req.OriginTableMeta == nil && req.PreviewTableMeta != nil) ||
		(req.OriginTableMeta != nil && req.PreviewTableMeta == nil) {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid table meta param"))
	}

	tableInfo, err := k.GetDocumentTableInfoByID(ctx, req.DocumentID, true)
	if err != nil {
		return nil, fmt.Errorf("[AlterTableSchema] getDocumentTableInfoByID: %w", err)
	}

	return k.FormatTableSchemaResponse(&TableSchemaResponse{
		TableSheet:     tableInfo.TableSheet,
		AllTableSheets: []*entity.TableSheet{tableInfo.TableSheet},
		TableMeta:      tableInfo.TableMeta,
		PreviewData:    tableInfo.PreviewData,
	}, req.PreviewTableMeta, req.TableDataType)
}

func (k *knowledgeSVC) GetImportDataTableSchema(ctx context.Context, req *ImportDataTableSchemaRequest) (resp *TableSchemaResponse, err error) {
	if (req.OriginTableMeta == nil && req.PreviewTableMeta != nil) ||
		(req.OriginTableMeta != nil && req.PreviewTableMeta == nil) {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid table meta param"))
	}

	reqSheet := req.TableSheet
	if reqSheet == nil {
		reqSheet = &entity.TableSheet{
			SheetId:       0,
			HeaderLineIdx: 0,
			StartLineIdx:  1,
			TotalRows:     20,
		}
	}

	var (
		sheet             *rawSheet
		savedDoc          = &TableSchemaResponse{}
		targetColumns     []*entity.TableColumn
		alignCurrentTable = req.DocumentID != nil && req.PreviewTableMeta == nil
		allSheets         []*entity.TableSheet
	)

	if alignCurrentTable {
		savedDoc, err = k.GetDocumentTableInfoByID(ctx, *req.DocumentID, false)
		if err != nil {
			return nil, fmt.Errorf("[GetImportDataTableSchema] getDocumentTableInfoByID failed, %w", err)
		}
		targetColumns = savedDoc.TableMeta
	} else {
		targetColumns = req.PreviewTableMeta
	}

	if req.SourceInfo.FileType != nil && *req.SourceInfo.FileType == string(parser.FileExtensionXLSX) {
		allRawSheets, err := k.LoadSourceInfoAllSheets(ctx, req.SourceInfo, &entity.ParsingStrategy{
			HeaderLine:    int(reqSheet.HeaderLineIdx),
			DataStartLine: int(reqSheet.StartLineIdx),
			RowsCount:     int(reqSheet.TotalRows),
		}, targetColumns)
		if err != nil {
			return nil, fmt.Errorf("[GetImportDataTableSchema] LoadSourceInfoAllSheets failed, %w", err)
		}

		for i := range allRawSheets {
			s := allRawSheets[i]
			allSheets = append(allSheets, s.sheet)
			if s.sheet.SheetId == reqSheet.SheetId {
				sheet = s
			}
		}
	} else {
		sheet, err = k.LoadSourceInfoSpecificSheet(ctx, req.SourceInfo, &entity.ParsingStrategy{
			SheetID:       reqSheet.SheetId,
			HeaderLine:    int(reqSheet.HeaderLineIdx),
			DataStartLine: int(reqSheet.StartLineIdx),
			RowsCount:     int(reqSheet.TotalRows),
		}, targetColumns)
		if err != nil {
			return nil, fmt.Errorf("[GetImportDataTableSchema] loadTableSourceInfo failed, %w", err)
		}
		if sheet.sheet.SheetName == "" {
			sheet.sheet.SheetName = "default"
		}
		allSheets = []*entity.TableSheet{sheet.sheet}
	}

	// first time import / import with current document schema
	if !alignCurrentTable {
		return k.FormatTableSchemaResponse(&TableSchemaResponse{
			TableSheet:     sheet.sheet,
			AllTableSheets: allSheets,
			TableMeta:      sheet.cols,
			PreviewData:    sheet.vals,
		}, req.PreviewTableMeta, req.TableDataType)
	}

	return k.FormatTableSchemaResponse(&TableSchemaResponse{
		TableSheet:     savedDoc.TableSheet,
		AllTableSheets: allSheets,
		TableMeta:      sheet.cols,
		PreviewData:    sheet.vals,
	}, savedDoc.TableMeta, req.TableDataType)
}

// FormatTableSchemaResponse format table schema and data
// originalResp is raw data before format
// prevTableMeta is table schema to be displayed
func (k *knowledgeSVC) FormatTableSchemaResponse(originalResp *TableSchemaResponse, prevTableMeta []*entity.TableColumn, tableDataType TableDataType) (
	*TableSchemaResponse, error,
) {
	switch tableDataType {
	case AllData, OnlyPreview:
		if prevTableMeta == nil {
			if tableDataType == AllData {
				return &TableSchemaResponse{
					TableSheet:     originalResp.TableSheet,
					AllTableSheets: originalResp.AllTableSheets,
					TableMeta:      originalResp.TableMeta,
					PreviewData:    originalResp.PreviewData,
				}, nil
			} else {
				return &TableSchemaResponse{
					PreviewData: originalResp.PreviewData,
				}, nil
			}
		}

		isFirstImport := true
		for _, col := range prevTableMeta {
			if col.ID != 0 {
				isFirstImport = false
				break
			}
		}
		prevData := make([][]*document.ColumnData, 0, len(originalResp.PreviewData))
		for _, row := range originalResp.PreviewData {
			prevRow := make([]*document.ColumnData, len(prevTableMeta))

			if isFirstImport {
				// align by sequence, for there's no column id
				for i, col := range prevTableMeta {
					if int(col.Sequence) < len(row) {
						prevRow[i] = row[int(col.Sequence)]
						prevRow[i].Type = col.Type
						prevRow[i].ColumnName = col.Name
					} else {
						prevRow[i] = &document.ColumnData{
							ColumnID:   col.ID,
							ColumnName: col.Name,
							Type:       col.Type,
						}
					}
				}
			} else {
				// align by column id
				mp := make(map[int64]*document.ColumnData, len(row))
				for _, item := range row {
					cp := item
					mp[cp.ColumnID] = cp
				}

				for i, col := range prevTableMeta {
					if data, found := mp[col.ID]; found && col.ID != 0 {
						prevRow[i] = data
					} else {
						prevRow[i] = &document.ColumnData{
							ColumnID:   col.ID,
							ColumnName: col.Name,
							Type:       col.Type,
						}
					}
				}
			}

			prevData = append(prevData, prevRow)
		}

		if tableDataType == AllData {
			return &TableSchemaResponse{
				TableSheet:     originalResp.TableSheet,
				AllTableSheets: originalResp.AllTableSheets,
				TableMeta:      prevTableMeta,
				PreviewData:    prevData,
			}, nil
		}

		return &TableSchemaResponse{
			PreviewData: prevData,
			TableSheet:  originalResp.TableSheet,
			TableMeta:   prevTableMeta,
		}, nil

	case OnlySchema:
		return &TableSchemaResponse{
			TableSheet:     originalResp.TableSheet,
			AllTableSheets: originalResp.AllTableSheets,
			TableMeta:      prevTableMeta,
		}, nil

	default:
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid table data type"))
	}
}

func (k *knowledgeSVC) ValidateTableSchema(ctx context.Context, request *ValidateTableSchemaRequest) (*ValidateTableSchemaResponse, error) {
	if request.DocumentID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid document id"))
	}

	docs, err := k.documentRepo.MGetByID(ctx, []int64{request.DocumentID})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if len(docs) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "document not found"))
	}

	doc := docs[0]
	sheet, err := k.LoadSourceInfoSpecificSheet(ctx, request.SourceInfo, &entity.ParsingStrategy{
		SheetID:       request.TableSheet.SheetId,
		HeaderLine:    int(request.TableSheet.HeaderLineIdx),
		DataStartLine: int(request.TableSheet.StartLineIdx),
		RowsCount:     5, // parse few rows for type assertion
	}, doc.TableInfo.Columns)
	if err != nil {
		return nil, err
	}

	src := sheet
	dst := doc.TableInfo
	result := make(map[string]string)

	// Validate the conditions:
	// 1. Header name alignment (consistent order is not required)
	// 2. The indexing column must have a value, and the remaining columns can be empty
	// 3. Value types are convertible
	// 4. All existing table header fields are included
	dstMapping := make(map[string]*entity.TableColumn)
	for _, col := range dst.Columns {
		dstCol := col
		if col.Name == consts.RDBFieldID {
			continue
		}
		dstMapping[dstCol.Name] = dstCol
	}

	for i, srcCol := range src.cols {
		name := srcCol.Name
		dstCol, found := dstMapping[name]
		if !found {
			continue
		}

		delete(dstMapping, name)
		if convert.TransformColumnType(srcCol.Type, dstCol.Type) != dstCol.Type {
			result[name] = fmt.Sprintf("column type invalid, expected=%d, got=%d", dstCol.Type, srcCol.Type)
			continue
		}

		if dstCol.Indexing {
			for _, vals := range src.vals {
				val := vals[i]
				if val.GetStringValue() == "" {
					result[name] = "column indexing requires value, but got none"
					continue

				}
			}
		}
	}

	if len(dstMapping) != 0 {
		for _, col := range dstMapping {
			result[col.Name] = "column not found in provided data"
		}
	}

	return &ValidateTableSchemaResponse{
		ColumnValidResult: result,
	}, nil
}

func (k *knowledgeSVC) GetDocumentTableInfo(ctx context.Context, request *GetDocumentTableInfoRequest) (*GetDocumentTableInfoResponse, error) {
	if request.DocumentID == nil && request.SourceInfo == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid param"))
	}

	if request.DocumentID != nil {
		info, err := k.GetDocumentTableInfoByID(ctx, *request.DocumentID, true)
		if err != nil {
			return nil, err
		}

		if info.Code != 0 {
			return &GetDocumentTableInfoResponse{
				Code: info.Code,
				Msg:  info.Msg,
			}, nil
		}

		prevData := make([]map[string]string, 0, len(info.PreviewData))
		for _, row := range info.PreviewData {
			mp := make(map[string]string, len(row))
			for i, col := range row {
				mp[strconv.FormatInt(int64(i), 10)] = col.GetStringValue()
			}
			prevData = append(prevData, mp)
		}

		return &GetDocumentTableInfoResponse{
			TableSheet:  []*entity.TableSheet{info.TableSheet},
			TableMeta:   map[string][]*entity.TableColumn{"0": info.TableMeta},
			PreviewData: map[string][]map[string]string{"0": prevData},
		}, nil
	}

	sheets, err := k.LoadSourceInfoAllSheets(ctx, *request.SourceInfo, &entity.ParsingStrategy{
		HeaderLine:    0,
		DataStartLine: 1,
		RowsCount:     0, // get all rows
	}, nil)
	if err != nil {
		return nil, err
	}

	var (
		tableSheet = make([]*entity.TableSheet, 0, len(sheets))
		tableMeta  = make(map[string][]*entity.TableColumn, len(sheets))
		prevData   = make(map[string][]map[string]string, len(sheets))
	)

	for i, s := range sheets {
		tableSheet = append(tableSheet, s.sheet)
		tableMeta[strconv.FormatInt(int64(i), 10)] = s.cols

		data := make([]map[string]string, 0, len(s.vals))
		for j, row := range s.vals {
			if j > 20 { // get first 20 rows as preview
				break
			}
			valMapping := make(map[string]string)
			for k, v := range row {
				valMapping[strconv.FormatInt(int64(k), 10)] = v.GetStringValue()
			}
			data = append(data, valMapping)
		}
		prevData[strconv.FormatInt(int64(i), 10)] = data
	}

	return &GetDocumentTableInfoResponse{
		TableSheet:  tableSheet,
		TableMeta:   tableMeta,
		PreviewData: prevData,
	}, nil
}

// GetDocumentTableInfoByID not as an interface first, and then change it if necessary
func (k *knowledgeSVC) GetDocumentTableInfoByID(ctx context.Context, documentID int64, needData bool) (*TableSchemaResponse, error) {
	docs, err := k.documentRepo.MGetByID(ctx, []int64{documentID})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KVf("msg", "get document failed: %v", err))
	}

	if len(docs) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KVf("msg", "document not found, id=%d", documentID))
	}

	doc := docs[0]
	if doc.DocumentType != int32(knowledgeModel.DocumentTypeTable) {
		return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "document type invalid"))
	}

	tblInfo := doc.TableInfo
	cols := k.filterIDColumn(tblInfo.Columns) // filter `id`
	var sheet *entity.TableSheet
	if doc.ParseRule.ParsingStrategy != nil {
		sheet = &entity.TableSheet{
			SheetId:       doc.ParseRule.ParsingStrategy.SheetID,
			HeaderLineIdx: int64(doc.ParseRule.ParsingStrategy.HeaderLine),
			StartLineIdx:  int64(doc.ParseRule.ParsingStrategy.DataStartLine),
			SheetName:     doc.Name,
			TotalRows:     doc.SliceCount,
		}
	} else {
		sheet = &entity.TableSheet{
			SheetId:       0,
			HeaderLineIdx: 0,
			StartLineIdx:  1,
			SheetName:     "default",
			TotalRows:     0,
		}
	}
	if !needData {
		return &TableSchemaResponse{
			TableSheet:     sheet,
			AllTableSheets: []*entity.TableSheet{sheet},
			TableMeta:      cols,
		}, nil
	}

	rows, err := k.rdb.SelectData(ctx, &rdb.SelectDataRequest{
		TableName: tblInfo.PhysicalTableName,
		Limit:     ptr.Of(20),
	})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KVf("msg", "select data failed: %v", err))
	}

	data, err := k.ParseRDBData(cols, rows.ResultSet)
	if err != nil {
		return nil, err
	}

	return &TableSchemaResponse{
		TableSheet:     sheet,
		AllTableSheets: []*entity.TableSheet{sheet},
		TableMeta:      cols,
		PreviewData:    data,
	}, nil
}

func (k *knowledgeSVC) LoadSourceInfoAllSheets(ctx context.Context, sourceInfo TableSourceInfo, ps *entity.ParsingStrategy, columns []*entity.TableColumn) (
	sheets []*rawSheet, err error,
) {
	switch {
	case sourceInfo.FileType != nil && (sourceInfo.Uri != nil || sourceInfo.FileBase64 != nil):
		var b []byte
		if sourceInfo.Uri != nil {
			b, err = k.storage.GetObject(ctx, *sourceInfo.Uri)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KVf("msg", "get object failed: %v", err))
			}
		} else {
			b, err = base64.StdEncoding.DecodeString(*sourceInfo.FileBase64)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KVf("msg", "decode base64 failed: %v", err))
			}
		}
		if *sourceInfo.FileType == string(parser.FileExtensionXLSX) {
			f, err := excelize.OpenReader(bytes.NewReader(b))
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KVf("msg", "open xlsx file failed: %v", err))
			}
			for i, sheet := range f.GetSheetList() {
				newPS := &entity.ParsingStrategy{
					SheetID:       int64(i),
					HeaderLine:    ps.HeaderLine,
					DataStartLine: ps.DataStartLine,
					RowsCount:     ps.RowsCount,
				}

				rs, err := k.LoadSheet(ctx, b, newPS, *sourceInfo.FileType, &sheet, columns)
				if err != nil {
					return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KVf("msg", "load xlsx sheet failed: %v", err))
				}

				sheets = append(sheets, rs)
			}
		} else {
			rs, err := k.LoadSheet(ctx, b, ps, *sourceInfo.FileType, nil, columns)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KVf("msg", "load xlsx sheet failed: %v", err))
			}

			sheets = append(sheets, rs)
		}

	case sourceInfo.CustomContent != nil:
		rs, err := k.LoadSourceInfoSpecificSheet(ctx, sourceInfo, ps, columns)
		if err != nil {
			return nil, err
		}

		sheets = append(sheets, rs)

	default:
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid table source info"))
	}

	return sheets, nil
}

func (k *knowledgeSVC) LoadSourceInfoSpecificSheet(ctx context.Context, sourceInfo TableSourceInfo, ps *entity.ParsingStrategy, columns []*entity.TableColumn) (
	sheet *rawSheet, err error,
) {
	var b []byte
	switch {
	case sourceInfo.FileType != nil && (sourceInfo.Uri != nil || sourceInfo.FileBase64 != nil):
		if sourceInfo.Uri != nil {
			b, err = k.storage.GetObject(ctx, *sourceInfo.Uri)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeGetObjectURLFailCode, errorx.KVf("msg", "get object failed: %v", err))
			}
		} else {
			b, err = base64.StdEncoding.DecodeString(*sourceInfo.FileBase64)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KVf("msg", "decode base64 failed: %v", err))
			}
		}
	case sourceInfo.CustomContent != nil:
		b, err = json.Marshal(sourceInfo.CustomContent)
		if err != nil {
			return nil, errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KVf("msg", "marshal custom content failed: %v", err))
		}
	default:
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "invalid table source info"))
	}

	sheet, err = k.LoadSheet(ctx, b, ps, *sourceInfo.FileType, nil, columns)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KVf("msg", "load sheet failed: %v", err))
	}

	return sheet, nil
}

func (k *knowledgeSVC) LoadSheet(ctx context.Context, b []byte, ps *entity.ParsingStrategy, fileExtension string, sheetName *string, columns []*entity.TableColumn) (*rawSheet, error) {
	pConfig := convert.ToParseConfig(parser.FileExtension(fileExtension), ps, nil, false, columns)
	p, err := k.parseManager.GetParser(pConfig)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KVf("msg", "get parser failed: %v", err))
	}

	docs, err := p.Parse(ctx, bytes.NewReader(b))
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KVf("msg", "parse failed: %v", err))
	}

	if len(docs) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeParseResultEmptyCode, errorx.KVf("msg", "parse result is empty"))
	}

	sheet := &entity.TableSheet{
		SheetId:       ps.SheetID,
		HeaderLineIdx: int64(ps.HeaderLine),
		StartLineIdx:  int64(ps.DataStartLine),
		TotalRows:     int64(len(docs)),
	}
	if sheetName != nil {
		sheet.SheetName = ptr.From(sheetName)
	}

	srcColumns, err := document.GetDocumentColumns(docs[0])
	if err != nil {
		return nil, fmt.Errorf("[LoadSheet] get columns failed, %w", err)
	}

	cols := make([]*entity.TableColumn, 0, len(srcColumns))
	for i, col := range srcColumns {
		cols = append(cols, &entity.TableColumn{
			ID:          col.ID,
			Name:        col.Name,
			Type:        col.Type,
			Description: col.Description,
			Indexing:    false,
			Sequence:    int64(i),
		})
	}

	if columnsOnly, err := document.GetDocumentsColumnsOnly(docs); err != nil { // unexpected
		return nil, fmt.Errorf("[LoadSheet] get data status failed, %w", err)
	} else if columnsOnly {
		return &rawSheet{
			sheet: sheet,
			cols:  cols,
		}, nil
	}

	vals := make([][]*document.ColumnData, 0, len(docs))
	for _, doc := range docs {
		v, ok := doc.MetaData[document.MetaDataKeyColumnData].([]*document.ColumnData)
		if !ok {
			return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KVf("msg", "[LoadSheet] get columns data failed"))
		}
		vals = append(vals, v)
	}

	return &rawSheet{
		sheet: sheet,
		cols:  cols,
		vals:  vals,
	}, nil
}

func (k *knowledgeSVC) ParseRDBData(columns []*entity.TableColumn, resultSet *rentity.ResultSet) (
	resp [][]*document.ColumnData, err error,
) {
	names := make([]string, 0, len(columns))
	for _, c := range columns {
		if c.Name == consts.RDBFieldID {
			names = append(names, consts.RDBFieldID)
		} else {
			names = append(names, convert.ColumnIDToRDBField(c.ID))
		}
	}

	for _, row := range resultSet.Rows {
		parsedData := make([]*document.ColumnData, len(columns))
		for i, col := range columns {
			val, found := row[names[i]]
			if !found { // columns are not aligned when altering table
				if names[i] == consts.RDBFieldID {
					continue
				}
				return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KVf("msg", "[ParseRDBData] altering table, retry later, col=%s", col.Name))
			}
			colData, err := convert.ParseAnyData(col, val)
			if err != nil {
				return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KVf("msg", "[ParseRDBData] invalid column type, col=%s, type=%d", col.Name, col.Type))
			}
			parsedData[i] = colData
		}

		resp = append(resp, parsedData)
	}

	return resp, nil
}

func (k *knowledgeSVC) getDocumentTableInfo(ctx context.Context, documentID int64) (*entity.TableInfo, error) {
	docs, err := k.documentRepo.MGetByID(ctx, []int64{documentID})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KVf("msg", "get document failed: %v", err))
	}
	if len(docs) != 1 {
		return nil, errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KVf("msg", "document not found, id=%d", documentID))
	}
	return docs[0].TableInfo, nil
}

func (k *knowledgeSVC) filterIDColumn(cols []*entity.TableColumn) []*entity.TableColumn {
	resp := make([]*entity.TableColumn, 0, len(cols))
	for i := range cols {
		col := cols[i]
		if col.Name == consts.RDBFieldID {
			continue
		}

		resp = append(resp, col)
	}

	return resp
}

type rawSheet struct {
	sheet *entity.TableSheet
	cols  []*entity.TableColumn
	vals  [][]*document.ColumnData
}
