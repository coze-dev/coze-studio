package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"

	"github.com/xuri/excelize/v2"

	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rentity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func (k *knowledgeSVC) GetAlterTableSchema(ctx context.Context, req *knowledge.AlterTableSchemaRequest) (*knowledge.TableSchemaResponse, error) {
	if (req.OriginTableMeta == nil && req.PreviewTableMeta != nil) ||
		(req.OriginTableMeta != nil && req.PreviewTableMeta == nil) {
		return nil, fmt.Errorf("[AlterTableSchema] invalid table meta param")
	}

	tableInfo, err := k.getDocumentTableInfoByID(ctx, req.DocumentID, true)
	if err != nil {
		return nil, fmt.Errorf("[AlterTableSchema] getDocumentTableInfoByID: %w", err)
	}

	return k.formatTableSchemaResponse(&knowledge.TableSchemaResponse{
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

	if req.SourceInfo.FileType != nil && *req.SourceInfo.FileType == entity.FileExtensionXLSX {
		allRawSheets, err := k.loadSourceInfoAllSheets(ctx, req.SourceInfo, &entity.ParsingStrategy{
			HeaderLine:    int(reqSheet.HeaderLineIdx),
			DataStartLine: int(reqSheet.StartLineIdx),
			RowsCount:     int(reqSheet.TotalRows),
		})
		if err != nil {
			return nil, fmt.Errorf("[ImportDataTableSchema] loadSourceInfoAllSheets failed, %w", err)
		}

		for i := range allRawSheets {
			s := allRawSheets[i]
			if s.sheet.SheetId == reqSheet.SheetId {
				sheet = s
			}
			allSheets = append(allSheets, s.sheet)
		}
	} else {
		sheet, err = k.loadSourceInfoSpecificSheet(ctx, req.SourceInfo, &entity.ParsingStrategy{
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
		return k.formatTableSchemaResponse(&knowledge.TableSchemaResponse{
			TableSheet:  sheet.sheet,
			TableMeta:   sheet.cols,
			PreviewData: sheet.vals,
		}, req.PreviewTableMeta, req.TableDataType)
	}

	// import with preview
	savedDoc, err := k.getDocumentTableInfoByID(ctx, *req.DocumentID, true)
	if err != nil {
		return nil, fmt.Errorf("[ImportDataTableSchema] getDocumentTableInfoByID failed, %w", err)
	}

	return k.formatTableSchemaResponse(&knowledge.TableSchemaResponse{
		TableSheet:  savedDoc.TableSheet,
		TableMeta:   sheet.cols,
		PreviewData: sheet.vals,
	}, savedDoc.TableMeta, req.TableDataType)
}

// formatTableSchemaResponse format table schema and data
// originalResp is raw data before format
// prevTableMeta is table schema to be displayed
func (k *knowledgeSVC) formatTableSchemaResponse(originalResp *knowledge.TableSchemaResponse, prevTableMeta []*entity.TableColumn, tableDataType knowledge.TableDataType) (
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

		prevData := make([][]*entity.TableColumnData, 0, len(prevTableMeta))
		for _, row := range originalResp.PreviewData {
			mp := make(map[int64]*entity.TableColumnData, len(row))
			for _, item := range row {
				cp := item
				mp[cp.ColumnID] = cp
			}

			prevRow := make([]*entity.TableColumnData, len(prevTableMeta))
			for i, col := range originalResp.TableMeta {
				if col.ID == 0 && int(col.Sequence) < len(row) { // align by sequence
					prevRow[i] = row[int(col.Sequence)]
				} else if data, found := mp[col.ID]; found { // align by column id
					prevRow[i] = data
				} else {
					prevRow[i] = &entity.TableColumnData{
						ColumnID:   col.ID,
						ColumnName: col.Name,
						Type:       col.Type,
					}
				}
			}

			prevData = append(prevData, prevRow)
		}

		if tableDataType == knowledge.AllData {
			return &knowledge.TableSchemaResponse{
				TableSheet:     originalResp.TableSheet,
				AllTableSheets: originalResp.AllTableSheets,
				TableMeta:      originalResp.TableMeta,
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
			TableMeta:      originalResp.TableMeta,
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

	sheet, err := k.loadSourceInfoSpecificSheet(ctx, request.SourceInfo, &entity.ParsingStrategy{
		SheetID:       request.TableSheet.SheetId,
		HeaderLine:    int(request.TableSheet.HeaderLineIdx),
		DataStartLine: int(request.TableSheet.StartLineIdx),
		RowsCount:     5, // parse few rows for type assertion
	})
	if err != nil {
		return nil, fmt.Errorf("[GetDocumentTableInfo] load sheets failed, %w", err)
	}

	src := docs[0]
	target := sheet
	result := make(map[string]string)

	// validate 通过条件:
	// 1. 表头名称对齐（不要求顺序一致）
	// 2. indexing 列必须有值, 其余列可以为空
	// 3. 值类型可转换
	// 4. 已有表表头字段全包含（TODO: 待讨论）
	srcMapping := make(map[string]*entity.TableColumn)
	for _, col := range src.TableInfo.Columns {
		srcCol := col
		srcMapping[srcCol.Name] = srcCol
	}

	for i, targetCol := range target.cols {
		name := targetCol.Name
		srcCol, found := srcMapping[name]
		if !found {
			continue
		}

		delete(srcMapping, name)
		if convert.TransformColumnType(srcCol.Type, targetCol.Type) != srcCol.Type {
			result[name] = fmt.Sprintf("column type invalid, expected=%d, got=%d", srcCol.Type, targetCol.Type)
			continue
		}

		if srcCol.Indexing {
			for _, val := range target.vals[i] {
				if val.GetStringValue() == "" {
					result[name] = fmt.Sprintf("column indexing requires value, but got none")
					continue

				}
			}
		}
	}

	if len(srcMapping) != 0 {
		for _, col := range srcMapping {
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
		info, err := k.getDocumentTableInfoByID(ctx, *request.DocumentID, true)
		if err != nil {
			return nil, fmt.Errorf("[GetDocumentTableInfo] get document by id failed: %v", err)
		}

		if info.Code != 0 {
			return &knowledge.GetDocumentTableInfoResponse{
				Code: info.Code,
				Msg:  info.Msg,
			}, nil
		}

		prevData := make([]map[int64]string, 0, len(info.PreviewData))
		for _, row := range info.PreviewData {
			mp := make(map[int64]string, len(row))
			for i, col := range row {
				mp[int64(i)] = col.GetStringValue()
			}
			prevData = append(prevData, mp)
		}

		return &knowledge.GetDocumentTableInfoResponse{
			TableSheet:  []*entity.TableSheet{info.TableSheet},
			TableMeta:   map[int64][]*entity.TableColumn{0: info.TableMeta},
			PreviewData: map[int64][]map[int64]string{0: prevData},
		}, nil
	}

	sheets, err := k.loadSourceInfoAllSheets(ctx, *request.SourceInfo, &entity.ParsingStrategy{
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
		tableMeta  = make(map[int64][]*entity.TableColumn, len(sheets))
		prevData   = make(map[int64][]map[int64]string, len(sheets))
	)

	for i, s := range sheets {
		tableSheet = append(tableSheet, s.sheet)
		tableMeta[int64(i)] = s.cols

		data := make([]map[int64]string, 0, len(s.vals))
		for j, row := range s.vals {
			if j > 20 { // get first 20 rows as preview
				break
			}
			valMapping := make(map[int64]string)
			for k, v := range row {
				valMapping[int64(k)] = v.GetStringValue()
			}
			data = append(data, valMapping)
		}
		prevData[int64(i)] = data
	}

	return &knowledge.GetDocumentTableInfoResponse{
		TableSheet:  tableSheet,
		TableMeta:   tableMeta,
		PreviewData: prevData,
	}, nil
}

// getDocumentTableInfoByID 先不作为接口，有需要再改
func (k *knowledgeSVC) getDocumentTableInfoByID(ctx context.Context, documentID int64, needData bool) (*knowledge.TableSchemaResponse, error) {
	docs, err := k.documentRepo.MGetByID(ctx, []int64{documentID})
	if err != nil {
		return nil, err
	}

	if len(docs) == 0 {
		return nil, fmt.Errorf("[getDocumentTableInfoByID] document not found, id=%d", documentID)
	}

	doc := docs[0]
	if doc.DocumentType != int32(entity.DocumentTypeTable) {
		return nil, fmt.Errorf("[getDocumentTableInfoByID] document type invalid, got=%d", doc.DocumentType)
	}

	tblInfo := doc.TableInfo
	sheet := &entity.TableSheet{
		SheetId:       doc.ParseRule.ParsingStrategy.SheetID,
		HeaderLineIdx: int64(doc.ParseRule.ParsingStrategy.HeaderLine),
		StartLineIdx:  int64(doc.ParseRule.ParsingStrategy.DataStartLine),
		SheetName:     doc.Name,
		TotalRows:     doc.SliceCount,
	}

	if !needData {
		return &knowledge.TableSchemaResponse{
			TableSheet: sheet,
			TableMeta:  tblInfo.Columns,
		}, nil
	}

	rows, err := k.rdb.SelectData(ctx, &rdb.SelectDataRequest{
		TableName: tblInfo.PhysicalTableName,
		Limit:     ptr.Of(20),
	})
	if err != nil {
		return nil, fmt.Errorf("[getDocumentTableInfoByID] select data failed, %w", err)
	}

	data, err := k.parseRDBData(tblInfo, rows.ResultSet)
	if err != nil {
		return nil, fmt.Errorf("[getDocumentTableInfoByID] parse data failed, %w", err)
	}

	return &knowledge.TableSchemaResponse{
		TableSheet:  sheet,
		TableMeta:   tblInfo.Columns,
		PreviewData: data,
	}, nil
}

func (k *knowledgeSVC) loadSourceInfoAllSheets(ctx context.Context, sourceInfo knowledge.TableSourceInfo, ps *entity.ParsingStrategy) (
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

		if *sourceInfo.FileType == entity.FileExtensionXLSX {
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

				rs, err := k.loadSheet(ctx, b, newPS, *sourceInfo.FileType, &sheet)
				if err != nil {
					return nil, fmt.Errorf("[loadTableSourceInfo] load xlsx sheet failed, %w", err)
				}

				sheets = append(sheets, rs)
			}
		} else {
			rs, err := k.loadSheet(ctx, b, ps, *sourceInfo.FileType, nil)
			if err != nil {
				return nil, fmt.Errorf("[loadTableSourceInfo] load sheet failed, %w", err)
			}

			sheets = append(sheets, rs)
		}

	case sourceInfo.CustomContent != nil:
		rs, err := k.loadSourceInfoSpecificSheet(ctx, sourceInfo, ps)
		if err != nil {
			return nil, err
		}

		sheets = append(sheets, rs)

	default:
		return nil, fmt.Errorf("[loadTableSourceInfo] invalid table source info")
	}

	return sheets, nil
}

func (k *knowledgeSVC) loadSourceInfoSpecificSheet(ctx context.Context, sourceInfo knowledge.TableSourceInfo, ps *entity.ParsingStrategy) (
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
		return nil, fmt.Errorf("[loadSourceInfoSpecificSheet] invalid table source info")
	}

	if err != nil {
		return nil, fmt.Errorf("[loadSourceInfoSpecificSheet] get content failed, %w", err)
	}

	sheet, err = k.loadSheet(ctx, b, ps, *sourceInfo.FileType, nil)
	if err != nil {
		return nil, fmt.Errorf("[loadSourceInfoSpecificSheet] load sheet failed, %w", err)
	}

	return sheet, nil
}

func (k *knowledgeSVC) loadSheet(ctx context.Context, b []byte, ps *entity.ParsingStrategy, fileExtension string, sheetName *string) (*rawSheet, error) {
	result, err := k.parser.Parse(ctx, bytes.NewReader(b), &entity.Document{FileExtension: fileExtension, ParsingStrategy: ps})
	if err != nil {
		return nil, fmt.Errorf("[loadTableSourceInfo] parse xlsx failed, %w", err)
	}

	vals := make([][]*entity.TableColumnData, 0, len(result.Slices))
	for _, slice := range result.Slices {
		if len(slice.RawContent) != 1 {
			return nil, fmt.Errorf("[loadTableSourceInfo] unexpected sheet row value")
		}

		row := make([]*entity.TableColumnData, 0, len(slice.RawContent[0].Table.Columns))
		for _, v := range slice.RawContent[0].Table.Columns {
			val := v
			row = append(row, &val)
		}
	}

	sheet := &entity.TableSheet{
		SheetId:       ps.SheetID,
		HeaderLineIdx: int64(ps.HeaderLine),
		StartLineIdx:  int64(ps.DataStartLine),
		TotalRows:     int64(len(result.Slices)),
	}
	if sheetName != nil {
		sheet.SheetName = *sheetName
	}

	return &rawSheet{
		sheet: sheet,
		cols:  result.TableSchema,
		vals:  vals,
	}, nil
}

func (k *knowledgeSVC) parseRDBData(tableInfo *entity.TableInfo, resultSet *rentity.ResultSet) (
	resp [][]*entity.TableColumnData, err error) {

	names := make([]string, 0, len(tableInfo.Columns))
	for _, c := range tableInfo.Columns {
		names = append(names, convert.ColumnIDToRDBField(c.ID))
	}

	for _, row := range resultSet.Rows {
		parsedData := make([]*entity.TableColumnData, len(tableInfo.Columns))
		for i, col := range tableInfo.Columns {
			val, found := row[names[i]]
			if !found { // columns are not aligned when altering table
				return nil, fmt.Errorf("[parseRDBData] altering table, retry later")
			}
			colData, err := convert.ParseAnyData(col, val)
			if err != nil {
				return nil, err
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

type rawSheet struct {
	sheet *entity.TableSheet
	cols  []*entity.TableColumn
	vals  [][]*entity.TableColumnData
}
