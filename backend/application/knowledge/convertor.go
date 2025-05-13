package knowledge

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"strconv"
	"strings"
	"time"

	common2 "code.byted.org/flow/opencoze/backend/api/model/common"
	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

func assertValAs(typ entity.TableColumnType, val string) (*entity.TableColumnData, error) {
	// TODO: 先不处理 image
	switch typ {
	case entity.TableColumnTypeString:
		return &entity.TableColumnData{
			Type:      entity.TableColumnTypeString,
			ValString: &val,
		}, nil

	case entity.TableColumnTypeInteger:
		i, err := strconv.ParseInt(val, 10, 64)
		if err != nil {
			return nil, err
		}
		return &entity.TableColumnData{
			Type:       entity.TableColumnTypeInteger,
			ValInteger: &i,
		}, nil

	case entity.TableColumnTypeTime:
		// 支持时间戳和时间字符串
		i, err := strconv.ParseInt(val, 10, 64)
		if err == nil {
			t := time.Unix(i, 0)
			return &entity.TableColumnData{
				Type:    entity.TableColumnTypeTime,
				ValTime: &t,
			}, nil

		}
		t, err := time.Parse(TimeFormat, val)
		if err != nil {
			return nil, err
		}
		return &entity.TableColumnData{
			Type:    entity.TableColumnTypeTime,
			ValTime: &t,
		}, nil

	case entity.TableColumnTypeNumber:
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return nil, err
		}

		return &entity.TableColumnData{
			Type:      entity.TableColumnTypeNumber,
			ValNumber: &f,
		}, nil

	case entity.TableColumnTypeBoolean:
		t, err := strconv.ParseBool(val)
		if err != nil {
			return nil, err
		}
		return &entity.TableColumnData{
			Type:       entity.TableColumnTypeBoolean,
			ValBoolean: &t,
		}, nil

	default:
		return nil, fmt.Errorf("[assertValAs] type not support, type=%d, val=%s", typ, val)
	}
}

func convertTableDataType2Entity(t dataset.TableDataType) knowledge.TableDataType {
	switch t {
	case dataset.TableDataType_AllData:
		return knowledge.AllData
	case dataset.TableDataType_OnlySchema:
		return knowledge.OnlySchema
	case dataset.TableDataType_OnlyPreview:
		return knowledge.OnlyPreview
	default:
		return knowledge.AllData
	}
}

func convertTableSheet2Entity(sheet *dataset.TableSheet) *entity.TableSheet {
	if sheet == nil {
		return nil
	}
	return &entity.TableSheet{
		SheetId:       sheet.GetSheetID(),
		StartLineIdx:  sheet.GetHeaderLineIdx(),
		HeaderLineIdx: sheet.GetHeaderLineIdx(),
	}
}

func convertDocTableSheet2Model(sheet entity.TableSheet) *dataset.DocTableSheet {
	return &dataset.DocTableSheet{
		ID:        sheet.SheetId,
		SheetName: sheet.SheetName,
		TotalRow:  sheet.TotalRows,
	}
}

func convertTableMeta(t []*entity.TableColumn) []*common2.DocTableColumn {
	if len(t) == 0 {
		return nil
	}
	resp := make([]*common2.DocTableColumn, 0)
	for i := range t {
		if t[i] == nil {
			continue
		}

		resp = append(resp, &common2.DocTableColumn{
			ID:         t[i].ID,
			ColumnName: t[i].Name,
			IsSemantic: t[i].Indexing,
			Desc:       &t[i].Description,
			Sequence:   t[i].Sequence,
			ColumnType: convertColumnType(t[i].Type),
		})
	}
	return resp
}

func convertColumnType(t entity.TableColumnType) *common2.ColumnType {
	switch t {
	case entity.TableColumnTypeString:
		return common2.ColumnTypePtr(common2.ColumnType_Text)
	case entity.TableColumnTypeBoolean:
		return common2.ColumnTypePtr(common2.ColumnType_Boolean)
	case entity.TableColumnTypeNumber:
		return common2.ColumnTypePtr(common2.ColumnType_Float)
	case entity.TableColumnTypeTime:
		return common2.ColumnTypePtr(common2.ColumnType_Date)
	case entity.TableColumnTypeInteger:
		return common2.ColumnTypePtr(common2.ColumnType_Number)
	case entity.TableColumnTypeImage:
		return common2.ColumnTypePtr(common2.ColumnType_Image)
	default:
		return common2.ColumnTypePtr(common2.ColumnType_Text)
	}
}

func convertDocTableSheet(t *entity.TableSheet) *common2.DocTableSheet {
	if t == nil {
		return nil
	}
	return &common2.DocTableSheet{
		ID:        t.SheetId,
		SheetName: t.SheetName,
		TotalRow:  t.TotalRows,
	}
}

func convertSlice2Model(sliceEntity *entity.Slice) *dataset.SliceInfo {
	if sliceEntity == nil {
		return nil
	}
	return &dataset.SliceInfo{
		SliceID:    sliceEntity.ID,
		Content:    sliceEntity.PlainText,
		Status:     convertSliceStatus2Model(sliceEntity.SliceStatus),
		HitCount:   0, // todo hot count
		CharCount:  sliceEntity.CharCount,
		TokenCount: sliceEntity.ByteCount,
		Sequence:   sliceEntity.Sequence,
		DocumentID: sliceEntity.DocumentID,
		ChunkInfo:  "", // todo chunk info逻辑没写
	}
}

func convertSliceStatus2Model(status entity.SliceStatus) dataset.SliceStatus {
	switch status {
	case entity.SliceStatusInit:
		return dataset.SliceStatus_PendingVectoring
	case entity.SliceStatusFinishStore:
		return dataset.SliceStatus_FinishVectoring
	case entity.SliceStatusFailed:
		return dataset.SliceStatus_Deactive
	default:
		return dataset.SliceStatus_PendingVectoring
	}
}

func convertDocument2Model(documentEntity *entity.Document) *dataset.DocumentInfo {
	if documentEntity == nil {
		return nil
	}
	chunkStrategy := convertChunkingStrategy2Model(documentEntity.ChunkingStrategy)
	parseStrategy, _ := convertParsingStrategy2Model(documentEntity.ParsingStrategy)
	docInfo := &dataset.DocumentInfo{
		Name:                  documentEntity.Name,
		DocumentID:            documentEntity.ID,
		TosURI:                &documentEntity.URI,
		CreateTime:            int32(documentEntity.CreatedAtMs / 1000),
		UpdateTime:            int32(documentEntity.UpdatedAtMs / 1000),
		CreatorID:             ptr.Of(documentEntity.CreatorID),
		SliceCount:            int32(documentEntity.SliceCount),
		Type:                  documentEntity.FileExtension,
		Size:                  int32(documentEntity.Size),
		CharCount:             int32(documentEntity.CharCount),
		Status:                convertDocumentStatus2Model(documentEntity.Status),
		HitCount:              int32(documentEntity.Hits),
		SourceType:            convertDocumentSource2Model(documentEntity.Source),
		FormatType:            convertDocumentTypeEntity2Dataset(documentEntity.Type),
		WebURL:                &documentEntity.URL,
		TableMeta:             convertTableColumns2Model(documentEntity.TableInfo.Columns),
		StatusDescript:        &documentEntity.StatusMsg,
		SpaceID:               ptr.Of(documentEntity.SpaceID),
		EditableAppendContent: nil,
		ChunkStrategy:         chunkStrategy,
		ParsingStrategy:       parseStrategy,
		IndexStrategy:         nil, // todo，好像没啥用
		FilterStrategy:        nil, // todo，好像没啥用
	}
	return docInfo
}

func convertDocumentSource2Entity(sourceType dataset.DocumentSource) entity.DocumentSource {
	switch sourceType {
	case dataset.DocumentSource_Custom:
		return entity.DocumentSourceCustom
	case dataset.DocumentSource_Document:
		return entity.DocumentSourceLocal
	default:
		return entity.DocumentSourceLocal
	}
}

func convertDocumentSource2Model(sourceType entity.DocumentSource) dataset.DocumentSource {
	switch sourceType {
	case entity.DocumentSourceCustom:
		return dataset.DocumentSource_Custom
	case entity.DocumentSourceLocal:
		return dataset.DocumentSource_Document
	default:
		return dataset.DocumentSource_Document
	}
}

func convertDocumentStatus2Model(status entity.DocumentStatus) dataset.DocumentStatus {
	switch status {
	case entity.DocumentStatusDeleted:
		return dataset.DocumentStatus_Deleted
	case entity.DocumentStatusEnable:
		return dataset.DocumentStatus_Enable
	case entity.DocumentStatusFailed:
		return dataset.DocumentStatus_Failed
	default:
		return dataset.DocumentStatus_Processing
	}
}

func convertTableColumns2Entity(columns []*dataset.TableColumn) []*entity.TableColumn {
	if len(columns) == 0 {
		return nil
	}
	columnEntities := make([]*entity.TableColumn, 0, len(columns))
	for i := range columns {
		columnEntities = append(columnEntities, &entity.TableColumn{
			ID:          columns[i].GetID(),
			Name:        columns[i].GetColumnName(),
			Type:        convertColumnType2Entity(columns[i].GetColumnType()),
			Description: columns[i].GetDesc(),
			Indexing:    columns[i].GetIsSemantic(),
			Sequence:    columns[i].GetSequence(),
		})
	}
	return columnEntities
}

func convertTableColumns2Model(columns []*entity.TableColumn) []*dataset.TableColumn {
	if len(columns) == 0 {
		return nil
	}
	columnModels := make([]*dataset.TableColumn, 0, len(columns))
	for i := range columns {
		columnType := convertColumnType2Model(columns[i].Type)
		columnModels = append(columnModels, &dataset.TableColumn{
			ID:         columns[i].ID,
			ColumnName: columns[i].Name,
			ColumnType: &columnType,
			Desc:       &columns[i].Description,
			IsSemantic: columns[i].Indexing,
			Sequence:   columns[i].Sequence,
		})
	}
	return columnModels
}

func convertTableColumnDataSlice(cols []*entity.TableColumn, data []*entity.TableColumnData) (map[string]string, error) {
	if len(cols) != len(data) {
		return nil, fmt.Errorf("[convertTableColumnDataSlice] invalid cols and vals, len(cols)=%d, len(vals)=%d", len(cols), len(data))
	}

	resp := make(map[string]string, len(data))
	for i := range data {
		col := cols[i]
		val := data[i]
		resp[strconv.FormatInt(col.Sequence, 10)] = val.GetStringValue()
	}

	return resp, nil
}

func convertColumnType2Model(columnType entity.TableColumnType) dataset.ColumnType {
	switch columnType {
	case entity.TableColumnTypeString:
		return dataset.ColumnType_Text
	case entity.TableColumnTypeInteger:
		return dataset.ColumnType_Number
	case entity.TableColumnTypeImage:
		return dataset.ColumnType_Image
	case entity.TableColumnTypeBoolean:
		return dataset.ColumnType_Boolean
	case entity.TableColumnTypeTime:
		return dataset.ColumnType_Date
	case entity.TableColumnTypeNumber:
		return dataset.ColumnType_Float
	default:
		return dataset.ColumnType_Text
	}
}

func convertColumnType2Entity(columnType dataset.ColumnType) entity.TableColumnType {
	switch columnType {
	case dataset.ColumnType_Text:
		return entity.TableColumnTypeString
	case dataset.ColumnType_Number:
		return entity.TableColumnTypeInteger
	case dataset.ColumnType_Image:
		return entity.TableColumnTypeImage
	case dataset.ColumnType_Boolean:
		return entity.TableColumnTypeBoolean
	case dataset.ColumnType_Date:
		return entity.TableColumnTypeTime
	case dataset.ColumnType_Float:
		return entity.TableColumnTypeNumber
	default:
		return entity.TableColumnTypeString
	}
}

func convertParsingStrategy2Entity(strategy *dataset.ParsingStrategy, sheet *dataset.TableSheet) *entity.ParsingStrategy {
	if strategy == nil {
		return nil
	}
	res := &entity.ParsingStrategy{
		ExtractImage: strategy.GetImageExtraction(),
		ExtractTable: strategy.GetTableExtraction(),
		ImageOCR:     strategy.GetImageOcr(),
	}
	if sheet != nil {
		res.SheetID = sheet.GetSheetID()
		res.HeaderLine = int(sheet.GetHeaderLineIdx())
		res.DataStartLine = int(sheet.GetStartLineIdx())
	}
	return res
}

func convertParsingStrategy2Model(strategy *entity.ParsingStrategy) (s *dataset.ParsingStrategy, sheet *dataset.TableSheet) {
	if strategy == nil {
		return nil, nil
	}
	sheet = &dataset.TableSheet{
		SheetID:       strategy.SheetID,
		HeaderLineIdx: int64(strategy.HeaderLine),
		StartLineIdx:  int64(strategy.DataStartLine),
	}
	return &dataset.ParsingStrategy{
		ImageExtraction: &strategy.ExtractImage,
		TableExtraction: &strategy.ExtractTable,
		ImageOcr:        &strategy.ImageOCR,
	}, sheet
}

func convertChunkingStrategy2Entity(strategy *dataset.ChunkStrategy) *entity.ChunkingStrategy {
	if strategy == nil {
		return nil
	}
	return &entity.ChunkingStrategy{
		ChunkType:       convertChunkType2Entity(strategy.ChunkType),
		ChunkSize:       strategy.GetMaxTokens(),
		Separator:       strategy.GetSeparator(),
		Overlap:         strategy.GetOverlap(),
		TrimSpace:       strategy.GetRemoveExtraSpaces(),
		TrimURLAndEmail: strategy.GetRemoveUrlsEmails(),
		MaxDepth:        strategy.GetMaxLevel(),
		SaveTitle:       strategy.GetSaveTitle(),
	}
}

func GetExtension(uri string) string {
	if uri == "" {
		return ""
	}
	fileExtension := path.Base(uri)
	return path.Ext(fileExtension)
}

func convertDatasetStatus2Entity(status dataset.DatasetStatus) entity.KnowledgeStatus {
	switch status {
	case dataset.DatasetStatus_DatasetReady:
		return entity.KnowledgeStatusEnable
	case dataset.DatasetStatus_DatasetForbid, dataset.DatasetStatus_DatasetDeleted:
		return entity.KnowledgeStatusDisable
	default:
		return entity.KnowledgeStatusEnable
	}
}

func convertChunkType2model(chunkType entity.ChunkType) dataset.ChunkType {
	switch chunkType {
	case entity.ChunkTypeCustom:
		return dataset.ChunkType_CustomChunk
	case entity.ChunkTypeDefault:
		return dataset.ChunkType_DefaultChunk
	case entity.ChunkTypeLeveled:
		return dataset.ChunkType_LevelChunk
	default:
		return dataset.ChunkType_CustomChunk
	}
}

func convertChunkType2Entity(chunkType dataset.ChunkType) entity.ChunkType {
	switch chunkType {
	case dataset.ChunkType_CustomChunk:
		return entity.ChunkTypeCustom
	case dataset.ChunkType_DefaultChunk:
		return entity.ChunkTypeDefault
	case dataset.ChunkType_LevelChunk:
		return entity.ChunkTypeLeveled
	default:
		return entity.ChunkTypeDefault
	}
}

func convertChunkingStrategy2Model(chunkingStrategy *entity.ChunkingStrategy) *dataset.ChunkStrategy {
	if chunkingStrategy == nil {
		return nil
	}
	return &dataset.ChunkStrategy{
		Separator:         chunkingStrategy.Separator,
		MaxTokens:         chunkingStrategy.ChunkSize,
		RemoveExtraSpaces: chunkingStrategy.TrimSpace,
		RemoveUrlsEmails:  chunkingStrategy.TrimURLAndEmail,
		ChunkType:         convertChunkType2model(chunkingStrategy.ChunkType),
		CaptionType:       nil, // todo，图片型知识
		Overlap:           &chunkingStrategy.Overlap,
		MaxLevel:          &chunkingStrategy.MaxDepth,
		SaveTitle:         &chunkingStrategy.SaveTitle,
	}
}

func convertDocumentTypeEntity2Dataset(formatType entity.DocumentType) dataset.FormatType {
	switch formatType {
	case entity.DocumentTypeText:
		return dataset.FormatType_Text
	case entity.DocumentTypeTable:
		return dataset.FormatType_Table
	case entity.DocumentTypeImage:
		return dataset.FormatType_Image
	default:
		return dataset.FormatType_Text
	}
}

func convertDocumentTypeDataset2Entity(formatType dataset.FormatType) entity.DocumentType {
	switch formatType {
	case dataset.FormatType_Text:
		return entity.DocumentTypeText
	case dataset.FormatType_Table:
		return entity.DocumentTypeTable
	case dataset.FormatType_Image:
		return entity.DocumentTypeImage
	default:
		return entity.DocumentTypeUnknown
	}
}

func batchConvertKnowledgeEntity2Model(ctx context.Context, knowledgeEntity []*entity.Knowledge) (map[int64]*dataset.Dataset, error) {
	knowledgeMap := map[int64]*dataset.Dataset{}
	for _, k := range knowledgeEntity {
		documentEntity, err := knowledgeDomainSVC.ListDocument(ctx, &knowledge.ListDocumentRequest{
			KnowledgeID: k.ID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "list document failed, err: %v", err)
			return nil, err
		}
		datasetStatus := dataset.DatasetStatus_DatasetReady
		if k.Status == entity.KnowledgeStatusDisable {
			datasetStatus = dataset.DatasetStatus_DatasetForbid
		}

		var (
			rule                 *entity.ChunkingStrategy
			totalSize            int64
			sliceCount           int32
			processingFileList   []string
			processingFileIDList []string
		)
		for i := range documentEntity.Documents {
			doc := documentEntity.Documents[i]
			totalSize += doc.Size
			sliceCount += int32(doc.SliceCount)
			if doc.Status == entity.DocumentStatusChunking || doc.Status == entity.DocumentStatusUploading {
				processingFileList = append(processingFileList, doc.Name)
				processingFileIDList = append(processingFileIDList, strconv.FormatInt(doc.ID, 10))
			}
			if i == 0 {
				rule = doc.ChunkingStrategy
			}
		}
		knowledgeMap[k.ID] = &dataset.Dataset{
			DatasetID:            k.ID,
			Name:                 k.Name,
			FileList:             nil, // 现在和前端服务端的交互也是空
			AllFileSize:          totalSize,
			BotUsedCount:         0, // todo，这个看看咋获取
			Status:               datasetStatus,
			ProcessingFileList:   processingFileList,
			UpdateTime:           int32(k.UpdatedAtMs / 1000),
			IconURI:              k.IconURI,
			IconURL:              k.IconURL,
			Description:          k.Description,
			CanEdit:              true, // todo，判断user id是否等于creator id
			CreateTime:           int32(k.CreatedAtMs / 1000),
			CreatorID:            k.CreatorID,
			SpaceID:              k.SpaceID,
			FailedFileList:       nil, // 原本的dataset服务里也没有
			FormatType:           convertDocumentTypeEntity2Dataset(k.Type),
			SliceCount:           sliceCount,
			HitCount:             0, // todo记录每个slice的hit次数，这个还没搞
			ChunkStrategy:        convertChunkingStrategy2Model(rule),
			ProcessingFileIDList: processingFileIDList,
			ProjectID:            strconv.FormatInt(k.ProjectID, 10),
		}
	}
	return knowledgeMap, nil
}

func convertSourceInfo(sourceInfo *dataset.SourceInfo) (*knowledge.TableSourceInfo, error) {
	if sourceInfo == nil {
		return nil, nil
	}

	fType := sourceInfo.FileType
	if fType == nil && sourceInfo.TosURI != nil {
		split := strings.Split(sourceInfo.GetTosURI(), ".")
		fType = &split[len(split)-1]
	}

	var customContent []map[string]string
	if sourceInfo.CustomContent != nil {
		if err := json.Unmarshal([]byte(sourceInfo.GetCustomContent()), &customContent); err != nil {
			return nil, err
		}
	}

	return &knowledge.TableSourceInfo{
		FileType:      fType,
		Uri:           sourceInfo.TosURI,
		FileBase64:    sourceInfo.FileBase64,
		CustomContent: customContent,
	}, nil
}
