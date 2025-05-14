package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/xuri/excelize/v2"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rentity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func (k *knowledgeSVC) GetAlterTableSchema(ctx context.Context, req *knowledge.AlterTableSchemaRequest) (*knowledge.TableSchemaResponse, error) {
	if (req.OriginTableMeta == nil && req.PreviewTableMeta != nil) ||
		(req.OriginTableMeta != nil && req.PreviewTableMeta == nil) {
		return nil, fmt.Errorf("[AlterTableSchema] invalid table meta param")
	}

	tableInfo, err := k.GetDocumentTableInfoByID(ctx, req.DocumentID, true)
	if err != nil {
		return nil, fmt.Errorf("[AlterTableSchema] getDocumentTableInfoByID: %w", err)
	}

	return k.FormatTableSchemaResponse(&knowledge.TableSchemaResponse{
		TableSheet:     tableInfo.TableSheet,
		AllTableSheets: []*entity.TableSheet{tableInfo.TableSheet},
		TableMeta:      tableInfo.TableMeta,
		PreviewData:    tableInfo.PreviewData,
	}, req.PreviewTableMeta, req.TableDataType)
}

func (k *knowledgeSVC) GetImportDataTableSchema(ctx context.Context, req *knowledge.ImportDataTableSchemaRequest) (resp *knowledge.TableSchemaResponse, err error) {
	if (req.OriginTableMeta == nil && req.PreviewTableMeta != nil) ||
		(req.OriginTableMeta != nil && req.PreviewTableMeta == nil) {
		return nil, fmt.Errorf("[ImportDataTableSchema] invalid table meta param")
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
		sheet     *rawSheet
		allSheets []*entity.TableSheet
	)

	if req.SourceInfo.FileType != nil && *req.SourceInfo.FileType == string(parser.FileExtensionXLSX) {
		allRawSheets, err := k.LoadSourceInfoAllSheets(ctx, req.SourceInfo, &entity.ParsingStrategy{
			HeaderLine:    int(reqSheet.HeaderLineIdx),
			DataStartLine: int(reqSheet.StartLineIdx),
			RowsCount:     int(reqSheet.TotalRows),
		})
		if err != nil {
			return nil, fmt.Errorf("[ImportDataTableSchema] LoadSourceInfoAllSheets failed, %w", err)
		}

		for i := range allRawSheets {
			s := allRawSheets[i]
			if s.sheet.SheetId == reqSheet.SheetId {
				sheet = s
			}
			allSheets = append(allSheets, s.sheet)
		}
	} else {
		sheet, err = k.LoadSourceInfoSpecificSheet(ctx, req.SourceInfo, &entity.ParsingStrategy{
			SheetID:       reqSheet.SheetId,
			HeaderLine:    int(reqSheet.HeaderLineIdx),
			DataStartLine: int(reqSheet.StartLineIdx),
			RowsCount:     int(reqSheet.TotalRows),
		})
		if err != nil {
			return nil, fmt.Errorf("[ImportDataTableSchema] loadTableSourceInfo failed, %w", err)
		}

		allSheets = append(allSheets, sheet.sheet)
	}

	// first time import / import with current document schema
	if req.DocumentID == nil || req.PreviewTableMeta != nil {
		return k.FormatTableSchemaResponse(&knowledge.TableSchemaResponse{
			TableSheet:  sheet.sheet,
			TableMeta:   sheet.cols,
			PreviewData: sheet.vals,
		}, req.PreviewTableMeta, req.TableDataType)
	}

	// import with preview
	savedDoc, err := k.GetDocumentTableInfoByID(ctx, *req.DocumentID, true)
	if err != nil {
		return nil, fmt.Errorf("[ImportDataTableSchema] getDocumentTableInfoByID failed, %w", err)
	}

	return k.FormatTableSchemaResponse(&knowledge.TableSchemaResponse{
		TableSheet:  savedDoc.TableSheet,
		TableMeta:   sheet.cols,
		PreviewData: sheet.vals,
	}, savedDoc.TableMeta, req.TableDataType)
}

// FormatTableSchemaResponse format table schema and data
// originalResp is raw data before format
// prevTableMeta is table schema to be displayed
func (k *knowledgeSVC) FormatTableSchemaResponse(originalResp *knowledge.TableSchemaResponse, prevTableMeta []*entity.TableColumn, tableDataType knowledge.TableDataType) (
	*knowledge.TableSchemaResponse, error) {

	switch tableDataType {
	case knowledge.AllData, knowledge.OnlyPreview:
		if prevTableMeta == nil {
			if tableDataType == knowledge.AllData {
				return &knowledge.TableSchemaResponse{
					TableSheet:     originalResp.TableSheet,
					AllTableSheets: originalResp.AllTableSheets,
					TableMeta:      originalResp.TableMeta,
					PreviewData:    originalResp.PreviewData,
				}, nil
			} else {
				return &knowledge.TableSchemaResponse{
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

		if tableDataType == knowledge.AllData {
			return &knowledge.TableSchemaResponse{
				TableSheet:     originalResp.TableSheet,
				AllTableSheets: originalResp.AllTableSheets,
				TableMeta:      prevTableMeta,
				PreviewData:    prevData,
			}, nil
		}

		return &knowledge.TableSchemaResponse{
			PreviewData: prevData,
		}, nil

	case knowledge.OnlySchema:
		return &knowledge.TableSchemaResponse{
			TableSheet:     originalResp.TableSheet,
			AllTableSheets: originalResp.AllTableSheets,
			TableMeta:      prevTableMeta,
		}, nil

	default:
		return nil, fmt.Errorf("[AlterTableSchema] invalid table data type")
	}
}

func (k *knowledgeSVC) ValidateTableSchema(ctx context.Context, request *knowledge.ValidateTableSchemaRequest) (*knowledge.ValidateTableSchemaResponse, error) {
	if request.DocumentID == 0 {
		return nil, fmt.Errorf("[ValidateTableSchema] document id not provided")
	}

	docs, err := k.documentRepo.MGetByID(ctx, []int64{request.DocumentID})
	if err != nil {
		return nil, fmt.Errorf("[ValidateTableSchema] get document failed: %v", err)
	}

	if len(docs) == 0 {
		return nil, fmt.Errorf("[ValidateTableSchema] document not found, id=%d", request.DocumentID)
	}

	sheet, err := k.LoadSourceInfoSpecificSheet(ctx, request.SourceInfo, &entity.ParsingStrategy{
		SheetID:       request.TableSheet.SheetId,
		HeaderLine:    int(request.TableSheet.HeaderLineIdx),
		DataStartLine: int(request.TableSheet.StartLineIdx),
		RowsCount:     5, // parse few rows for type assertion
	})
	if err != nil {
		return nil, fmt.Errorf("[GetDocumentTableInfo] load sheets failed, %w", err)
	}

	src := sheet
	dst := docs[0].TableInfo
	result := make(map[string]string)

	// validate 通过条件:
	// 1. 表头名称对齐（不要求顺序一致）
	// 2. indexing 列必须有值, 其余列可以为空
	// 3. 值类型可转换
	// 4. 已有表表头字段全包含（TODO: 待讨论）
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
					result[name] = fmt.Sprintf("column indexing requires value, but got none")
					continue

				}
			}
		}
	}

	if len(dstMapping) != 0 {
		for _, col := range dstMapping {
			result[col.Name] = fmt.Sprintf("column not found in provided data")
		}
	}

	return &knowledge.ValidateTableSchemaResponse{
		ColumnValidResult: result,
	}, nil
}

func (k *knowledgeSVC) GetDocumentTableInfo(ctx context.Context, request *knowledge.GetDocumentTableInfoRequest) (*knowledge.GetDocumentTableInfoResponse, error) {
	if request.DocumentID == nil && request.SourceInfo == nil {
		return nil, fmt.Errorf("[GetDocumentTableInfo] invalid param")
	}

	if request.DocumentID != nil {
		info, err := k.GetDocumentTableInfoByID(ctx, *request.DocumentID, true)
		if err != nil {
			return nil, fmt.Errorf("[GetDocumentTableInfo] get document by id failed: %v", err)
		}

		if info.Code != 0 {
			return &knowledge.GetDocumentTableInfoResponse{
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

		return &knowledge.GetDocumentTableInfoResponse{
			TableSheet:  []*entity.TableSheet{info.TableSheet},
			TableMeta:   map[string][]*entity.TableColumn{"0": info.TableMeta},
			PreviewData: map[string][]map[string]string{"0": prevData},
		}, nil
	}

	sheets, err := k.LoadSourceInfoAllSheets(ctx, *request.SourceInfo, &entity.ParsingStrategy{
		HeaderLine:    0,
		DataStartLine: 1,
		RowsCount:     0, // get all rows
	})
	if err != nil {
		// TODO: resp code msg 具体填写
		return nil, fmt.Errorf("[GetDocumentTableInfo] load sheets failed, %w", err)
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

	return &knowledge.GetDocumentTableInfoResponse{
		TableSheet:  tableSheet,
		TableMeta:   tableMeta,
		PreviewData: prevData,
	}, nil
}

// GetDocumentTableInfoByID 先不作为接口，有需要再改
func (k *knowledgeSVC) GetDocumentTableInfoByID(ctx context.Context, documentID int64, needData bool) (*knowledge.TableSchemaResponse, error) {
	docs, err := k.documentRepo.MGetByID(ctx, []int64{documentID})
	if err != nil {
		return nil, err
	}

	if len(docs) == 0 {
		return nil, fmt.Errorf("[GetDocumentTableInfoByID] document not found, id=%d", documentID)
	}

	doc := docs[0]
	if doc.DocumentType != int32(entity.DocumentTypeTable) {
		return nil, fmt.Errorf("[GetDocumentTableInfoByID] document type invalid, got=%d", doc.DocumentType)
	}

	tblInfo := doc.TableInfo
	cols := k.filterIDColumn(tblInfo.Columns) // filter `id`
	sheet := &entity.TableSheet{
		SheetId:       doc.ParseRule.ParsingStrategy.SheetID,
		HeaderLineIdx: int64(doc.ParseRule.ParsingStrategy.HeaderLine),
		StartLineIdx:  int64(doc.ParseRule.ParsingStrategy.DataStartLine),
		SheetName:     doc.Name,
		TotalRows:     doc.SliceCount,
	}

	if !needData {
		return &knowledge.TableSchemaResponse{
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
		return nil, fmt.Errorf("[GetDocumentTableInfoByID] select data failed, %w", err)
	}

	data, err := k.ParseRDBData(cols, rows.ResultSet)
	if err != nil {
		return nil, fmt.Errorf("[GetDocumentTableInfoByID] parse data failed, %w", err)
	}

	return &knowledge.TableSchemaResponse{
		TableSheet:     sheet,
		AllTableSheets: []*entity.TableSheet{sheet},
		TableMeta:      cols,
		PreviewData:    data,
	}, nil
}

func (k *knowledgeSVC) LoadSourceInfoAllSheets(ctx context.Context, sourceInfo knowledge.TableSourceInfo, ps *entity.ParsingStrategy) (
	sheets []*rawSheet, err error) {

	switch {
	case sourceInfo.FileType != nil && (sourceInfo.Uri != nil || sourceInfo.FileBase64 != nil):
		var b []byte
		if sourceInfo.Uri != nil {
			b, err = k.storage.GetObject(ctx, *sourceInfo.Uri)
		} else {
			b, err = base64.StdEncoding.DecodeString(*sourceInfo.FileBase64)
		}
		if err != nil {
			return nil, fmt.Errorf("[loadTableSourceInfo] get sheet content failed, %w", err)
		}

		if *sourceInfo.FileType == string(parser.FileExtensionXLSX) {
			f, err := excelize.OpenReader(bytes.NewReader(b))
			if err != nil {
				return nil, fmt.Errorf("[loadTableSourceInfo] open xlsx file failed, %w", err)
			}
			for i, sheet := range f.GetSheetList() {
				newPS := &entity.ParsingStrategy{
					SheetID:       int64(i),
					HeaderLine:    ps.HeaderLine,
					DataStartLine: ps.DataStartLine,
					RowsCount:     ps.RowsCount,
				}

				rs, err := k.LoadSheet(ctx, b, newPS, *sourceInfo.FileType, &sheet)
				if err != nil {
					return nil, fmt.Errorf("[loadTableSourceInfo] load xlsx sheet failed, %w", err)
				}

				sheets = append(sheets, rs)
			}
		} else {
			rs, err := k.LoadSheet(ctx, b, ps, *sourceInfo.FileType, nil)
			if err != nil {
				return nil, fmt.Errorf("[loadTableSourceInfo] load sheet failed, %w", err)
			}

			sheets = append(sheets, rs)
		}

	case sourceInfo.CustomContent != nil:
		rs, err := k.LoadSourceInfoSpecificSheet(ctx, sourceInfo, ps)
		if err != nil {
			return nil, err
		}

		sheets = append(sheets, rs)

	default:
		return nil, fmt.Errorf("[loadTableSourceInfo] invalid table source info")
	}

	return sheets, nil
}

func (k *knowledgeSVC) LoadSourceInfoSpecificSheet(ctx context.Context, sourceInfo knowledge.TableSourceInfo, ps *entity.ParsingStrategy) (
	sheet *rawSheet, err error) {

	var b []byte
	switch {
	case sourceInfo.FileType != nil && (sourceInfo.Uri != nil || sourceInfo.FileBase64 != nil):
		if sourceInfo.Uri != nil {
			b, err = k.storage.GetObject(ctx, *sourceInfo.Uri)
		} else {
			b, err = base64.StdEncoding.DecodeString(*sourceInfo.FileBase64)
		}
	case sourceInfo.CustomContent != nil:
		b, err = json.Marshal(sourceInfo.CustomContent)
	default:
		return nil, fmt.Errorf("[LoadSourceInfoSpecificSheet] invalid table source info")
	}

	if err != nil {
		return nil, fmt.Errorf("[LoadSourceInfoSpecificSheet] get content failed, %w", err)
	}

	sheet, err = k.LoadSheet(ctx, b, ps, *sourceInfo.FileType, nil)
	if err != nil {
		return nil, fmt.Errorf("[LoadSourceInfoSpecificSheet] load sheet failed, %w", err)
	}

	return sheet, nil
}

func (k *knowledgeSVC) LoadSheet(ctx context.Context, b []byte, ps *entity.ParsingStrategy, fileExtension string, sheetName *string) (*rawSheet, error) {
	pConfig := convert.ToParseConfig(parser.FileExtension(fileExtension), ps, nil, false, nil)
	p, err := k.parseManager.GetParser(pConfig)
	if err != nil {
		return nil, fmt.Errorf("[LoadSheet] get parser failed, %w", err)
	}

	docs, err := p.Parse(ctx, bytes.NewReader(b))
	if err != nil {
		return nil, fmt.Errorf("[LoadSheet] parse sheet failed, %w", err)
	}

	if len(docs) == 0 {
		return nil, fmt.Errorf("[LoadSheet] result is empty")
	}

	srcColumns, err := document.GetDocumentColumns(docs[0])
	if err != nil {
		return nil, fmt.Errorf("[LoadSheet] get columns failed, %w", err)
	}

	cols := make([]*entity.TableColumn, len(srcColumns))
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

	vals := make([][]*document.ColumnData, 0, len(docs))
	for _, doc := range docs {
		v, ok := doc.MetaData[document.MetaDataKeyColumnData].([]*document.ColumnData)
		if !ok {
			return nil, fmt.Errorf("[LoadSheet] get columns data failed")
		}
		vals = append(vals, v)
	}

	sheet := &entity.TableSheet{
		SheetId:       ps.SheetID,
		HeaderLineIdx: int64(ps.HeaderLine),
		StartLineIdx:  int64(ps.DataStartLine),
		TotalRows:     int64(len(docs)),
	}
	if sheetName != nil {
		sheet.SheetName = *sheetName
	}

	return &rawSheet{
		sheet: sheet,
		cols:  cols,
		vals:  vals,
	}, nil
}

func (k *knowledgeSVC) ParseRDBData(columns []*entity.TableColumn, resultSet *rentity.ResultSet) (
	resp [][]*document.ColumnData, err error) {

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
				return nil, fmt.Errorf("[ParseRDBData] altering table, retry later, col=%s", col.Name)
			}
			colData, err := convert.ParseAnyData(col, val)
			if err != nil {
				return nil, fmt.Errorf("[ParseRDBData] invalid column type, col=%s, type=%d", col.Name, col.Type)
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
		return nil, fmt.Errorf("[getDocumentTableInfo] get document failed, %w", err)
	}
	if len(docs) != 1 {
		return nil, fmt.Errorf("[getDocumentTableInfo] document not found, id=%d", documentID)
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
