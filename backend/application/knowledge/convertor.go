package knowledge

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"strconv"
	"strings"
	"time"

	modelCommon "code.byted.org/flow/opencoze/backend/api/model/common"
	knowledgeModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/application/upload"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/parser"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func assertValAs(typ document.TableColumnType, val string) (*document.ColumnData, error) {
	cd := &document.ColumnData{
		Type: typ,
	}
	if val == "" {
		return cd, nil
	}
	// TODO: 先不处理 image
	switch typ {
	case document.TableColumnTypeString:
		return &document.ColumnData{
			Type:      document.TableColumnTypeString,
			ValString: &val,
		}, nil

	case document.TableColumnTypeInteger:
		i, err := strconv.ParseInt(val, 10, 64)
		if err != nil {
			return nil, err
		}
		return &document.ColumnData{
			Type:       document.TableColumnTypeInteger,
			ValInteger: &i,
		}, nil

	case document.TableColumnTypeTime:
		// 支持时间戳和时间字符串
		i, err := strconv.ParseInt(val, 10, 64)
		if err == nil {
			t := time.Unix(i, 0)
			return &document.ColumnData{
				Type:    document.TableColumnTypeTime,
				ValTime: &t,
			}, nil

		}
		t, err := time.Parse(TimeFormat, val)
		if err != nil {
			return nil, err
		}
		return &document.ColumnData{
			Type:    document.TableColumnTypeTime,
			ValTime: &t,
		}, nil

	case document.TableColumnTypeNumber:
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return nil, err
		}

		return &document.ColumnData{
			Type:      document.TableColumnTypeNumber,
			ValNumber: &f,
		}, nil

	case document.TableColumnTypeBoolean:
		t, err := strconv.ParseBool(val)
		if err != nil {
			return nil, err
		}
		return &document.ColumnData{
			Type:       document.TableColumnTypeBoolean,
			ValBoolean: &t,
		}, nil

	default:
		return nil, fmt.Errorf("[assertValAs] type not support, type=%d, val=%s", typ, val)
	}
}

func convertTableDataType2Entity(t dataset.TableDataType) service.TableDataType {
	switch t {
	case dataset.TableDataType_AllData:
		return service.AllData
	case dataset.TableDataType_OnlySchema:
		return service.OnlySchema
	case dataset.TableDataType_OnlyPreview:
		return service.OnlyPreview
	default:
		return service.AllData
	}
}

func convertTableSheet2Entity(sheet *dataset.TableSheet) *entity.TableSheet {
	if sheet == nil {
		return nil
	}
	return &entity.TableSheet{
		SheetId:       sheet.GetSheetID(),
		StartLineIdx:  sheet.GetStartLineIdx(),
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

func convertTableMeta(t []*entity.TableColumn) []*modelCommon.DocTableColumn {
	if len(t) == 0 {
		return nil
	}
	resp := make([]*modelCommon.DocTableColumn, 0)
	for i := range t {
		if t[i] == nil {
			continue
		}

		resp = append(resp, &modelCommon.DocTableColumn{
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

func convertColumnType(t document.TableColumnType) *modelCommon.ColumnType {
	switch t {
	case document.TableColumnTypeString:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Text)
	case document.TableColumnTypeBoolean:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Boolean)
	case document.TableColumnTypeNumber:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Float)
	case document.TableColumnTypeTime:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Date)
	case document.TableColumnTypeInteger:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Number)
	case document.TableColumnTypeImage:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Image)
	default:
		return modelCommon.ColumnTypePtr(modelCommon.ColumnType_Text)
	}
}

func convertDocTableSheet(t *entity.TableSheet) *modelCommon.DocTableSheet {
	if t == nil {
		return nil
	}
	return &modelCommon.DocTableSheet{
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
		Content:    convertSliceContent(sliceEntity),
		Status:     convertSliceStatus2Model(sliceEntity.SliceStatus),
		HitCount:   sliceEntity.Hit,
		CharCount:  sliceEntity.CharCount,
		Sequence:   sliceEntity.Sequence,
		DocumentID: sliceEntity.DocumentID,
		ChunkInfo:  "", // todo chunk info逻辑没写
	}
}

func convertSliceContent(s *entity.Slice) string {
	if len(s.RawContent) == 0 {
		return ""
	}
	if s.RawContent[0].Type == knowledgeModel.SliceContentTypeTable {
		tableData := make([]sliceContentData, 0, len(s.RawContent[0].Table.Columns))
		for _, col := range s.RawContent[0].Table.Columns {
			tableData = append(tableData, sliceContentData{
				ColumnID:   strconv.FormatInt(col.ColumnID, 10),
				ColumnName: col.ColumnName,
				IsSemantic: false, // TODO: 这个对应 indexing？需要确认下是否有用到的地方，看起来冗余了
				Value:      col.GetNullableStringValue(),
				Desc:       "",
			})
		}
		b, _ := json.Marshal(tableData)
		return string(b)
	}
	return s.GetSliceContent()
}

type sliceContentData struct {
	ColumnID   string `json:"column_id"`
	ColumnName string `json:"column_name"`
	IsSemantic bool   `json:"is_semantic"`
	Value      string `json:"value"`
	Desc       string `json:"desc"`
}

func convertSliceStatus2Model(status knowledgeModel.SliceStatus) dataset.SliceStatus {
	switch status {
	case knowledgeModel.SliceStatusInit:
		return dataset.SliceStatus_PendingVectoring
	case knowledgeModel.SliceStatusFinishStore:
		return dataset.SliceStatus_FinishVectoring
	case knowledgeModel.SliceStatusFailed:
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
		Type:                  string(documentEntity.FileExtension),
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
		PreviewTosURL:         &documentEntity.URL,
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

func convertTableColumnDataSlice(cols []*entity.TableColumn, data []*document.ColumnData) (map[string]string, error) {
	if len(cols) != len(data) {
		return nil, fmt.Errorf("[convertTableColumnDataSlice] invalid cols and vals, len(cols)=%d, len(vals)=%d", len(cols), len(data))
	}

	resp := make(map[string]string, len(data))
	for i := range data {
		col := cols[i]
		val := data[i]
		content := ""
		if val != nil {
			content = val.GetStringValue()
		}
		resp[strconv.FormatInt(col.Sequence, 10)] = content
	}

	return resp, nil
}

func convertColumnType2Model(columnType document.TableColumnType) dataset.ColumnType {
	switch columnType {
	case document.TableColumnTypeString:
		return dataset.ColumnType_Text
	case document.TableColumnTypeInteger:
		return dataset.ColumnType_Number
	case document.TableColumnTypeImage:
		return dataset.ColumnType_Image
	case document.TableColumnTypeBoolean:
		return dataset.ColumnType_Boolean
	case document.TableColumnTypeTime:
		return dataset.ColumnType_Date
	case document.TableColumnTypeNumber:
		return dataset.ColumnType_Float
	default:
		return dataset.ColumnType_Text
	}
}

func convertColumnType2Entity(columnType dataset.ColumnType) document.TableColumnType {
	switch columnType {
	case dataset.ColumnType_Text:
		return document.TableColumnTypeString
	case dataset.ColumnType_Number:
		return document.TableColumnTypeInteger
	case dataset.ColumnType_Image:
		return document.TableColumnTypeImage
	case dataset.ColumnType_Boolean:
		return document.TableColumnTypeBoolean
	case dataset.ColumnType_Date:
		return document.TableColumnTypeTime
	case dataset.ColumnType_Float:
		return document.TableColumnTypeNumber
	default:
		return document.TableColumnTypeString
	}
}

func convertParsingStrategy2Entity(strategy *dataset.ParsingStrategy, sheet *dataset.TableSheet, captionType *dataset.CaptionType) *entity.ParsingStrategy {
	if strategy == nil && sheet == nil && captionType == nil {
		return nil
	}
	res := &entity.ParsingStrategy{}
	if strategy != nil {
		res.ExtractImage = strategy.GetImageExtraction()
		res.ExtractTable = strategy.GetTableExtraction()
		res.ImageOCR = strategy.GetImageOcr()
		res.ParsingType = convertParsingType2Entity(strategy.GetParsingType())
		if strategy.GetParsingType() == dataset.ParsingType_FastParsing {
			res.ExtractImage = false
			res.ExtractTable = false
			res.ImageOCR = false
		}
	}
	if sheet != nil {
		res.SheetID = sheet.GetSheetID()
		res.HeaderLine = int(sheet.GetHeaderLineIdx())
		res.DataStartLine = int(sheet.GetStartLineIdx())
	}
	res.CaptionType = convertCaptionType2Entity(captionType)

	return res
}

func convertParsingType2Entity(pt dataset.ParsingType) entity.ParsingType {
	switch pt {
	case dataset.ParsingType_AccurateParsing:
		return entity.ParsingType_AccurateParsing
	case dataset.ParsingType_FastParsing:
		return entity.ParsingType_FastParsing
	default:
		return entity.ParsingType_FastParsing
	}
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
		ParsingType:     ptr.Of(convertParsingType2Model(strategy.ParsingType)),
		ImageExtraction: &strategy.ExtractImage,
		TableExtraction: &strategy.ExtractTable,
		ImageOcr:        &strategy.ImageOCR,
	}, sheet
}
func convertParsingType2Model(pt entity.ParsingType) dataset.ParsingType {
	switch pt {
	case entity.ParsingType_AccurateParsing:
		return dataset.ParsingType_AccurateParsing
	case entity.ParsingType_FastParsing:
		return dataset.ParsingType_FastParsing
	default:
		return dataset.ParsingType_FastParsing
	}
}
func convertChunkingStrategy2Entity(strategy *dataset.ChunkStrategy) *entity.ChunkingStrategy {
	if strategy == nil {
		return nil
	}
	if strategy.ChunkType == dataset.ChunkType_DefaultChunk {
		return &entity.ChunkingStrategy{
			ChunkType:       convertChunkType2Entity(dataset.ChunkType_DefaultChunk),
			ChunkSize:       defaultChunkSize,
			Separator:       defaultSeparator,
			Overlap:         defaultOverlap,
			TrimSpace:       defaultTrimSpace,
			TrimURLAndEmail: defaultTrimURLAndEmail,
		}
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
	ext := path.Ext(fileExtension)
	if ext != "" {
		return strings.TrimPrefix(ext, ".")
	}
	return ""
}
func convertCaptionType2Entity(ct *dataset.CaptionType) *parser.ImageAnnotationType {
	if ct == nil {
		return nil
	}
	switch ptr.From(ct) {
	case dataset.CaptionType_Auto:
		return ptr.Of(parser.ImageAnnotationTypeModel)
	case dataset.CaptionType_Manual:
		return ptr.Of(parser.ImageAnnotationTypeManual)
	default:
		return ptr.Of(parser.ImageAnnotationTypeModel)
	}
}
func convertDatasetStatus2Entity(status dataset.DatasetStatus) model.KnowledgeStatus {
	switch status {
	case dataset.DatasetStatus_DatasetReady:
		return model.KnowledgeStatusEnable
	case dataset.DatasetStatus_DatasetForbid, dataset.DatasetStatus_DatasetDeleted:
		return model.KnowledgeStatusDisable
	default:
		return model.KnowledgeStatusEnable
	}
}

func convertChunkType2model(chunkType parser.ChunkType) dataset.ChunkType {
	switch chunkType {
	case parser.ChunkTypeCustom:
		return dataset.ChunkType_CustomChunk
	case parser.ChunkTypeDefault:
		return dataset.ChunkType_DefaultChunk
	case parser.ChunkTypeLeveled:
		return dataset.ChunkType_LevelChunk
	default:
		return dataset.ChunkType_CustomChunk
	}
}

func convertChunkType2Entity(chunkType dataset.ChunkType) parser.ChunkType {
	switch chunkType {
	case dataset.ChunkType_CustomChunk:
		return parser.ChunkTypeCustom
	case dataset.ChunkType_DefaultChunk:
		return parser.ChunkTypeDefault
	case dataset.ChunkType_LevelChunk:
		return parser.ChunkTypeLeveled
	default:
		return parser.ChunkTypeDefault
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
		Overlap:           &chunkingStrategy.Overlap,
		MaxLevel:          &chunkingStrategy.MaxDepth,
		SaveTitle:         &chunkingStrategy.SaveTitle,
	}
}

func convertDocumentTypeEntity2Dataset(formatType model.DocumentType) dataset.FormatType {
	switch formatType {
	case model.DocumentTypeText:
		return dataset.FormatType_Text
	case model.DocumentTypeTable:
		return dataset.FormatType_Table
	case model.DocumentTypeImage:
		return dataset.FormatType_Image
	default:
		return dataset.FormatType_Text
	}
}

func convertDocumentTypeDataset2Entity(formatType dataset.FormatType) model.DocumentType {
	switch formatType {
	case dataset.FormatType_Text:
		return model.DocumentTypeText
	case dataset.FormatType_Table:
		return model.DocumentTypeTable
	case dataset.FormatType_Image:
		return model.DocumentTypeImage
	default:
		return model.DocumentTypeUnknown
	}
}

func batchConvertKnowledgeEntity2Model(ctx context.Context, knowledgeEntity []*model.Knowledge) (map[int64]*dataset.Dataset, error) {
	knowledgeMap := map[int64]*dataset.Dataset{}
	for _, k := range knowledgeEntity {
		documentEntity, err := KnowledgeSVC.DomainSVC.ListDocument(ctx, &service.ListDocumentRequest{
			KnowledgeID: k.ID,
		})
		if err != nil {
			logs.CtxErrorf(ctx, "list document failed, err: %v", err)
			return nil, err
		}
		datasetStatus := dataset.DatasetStatus_DatasetReady
		if k.Status == model.KnowledgeStatusDisable {
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
			DocCount:             int32(len(documentEntity.Documents)),
			HitCount:             int32(k.SliceHit),
			ChunkStrategy:        convertChunkingStrategy2Model(rule),
			ProcessingFileIDList: processingFileIDList,
			ProjectID:            strconv.FormatInt(k.AppID, 10),
		}
	}
	return knowledgeMap, nil
}

func convertSourceInfo(sourceInfo *dataset.SourceInfo) (*service.TableSourceInfo, error) {
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

	return &service.TableSourceInfo{
		FileType:      fType,
		Uri:           sourceInfo.TosURI,
		FileBase64:    sourceInfo.FileBase64,
		CustomContent: customContent,
	}, nil
}

func convertCreateDocReviewReq(req *dataset.CreateDocumentReviewRequest) *service.CreateDocumentReviewRequest {
	if req == nil {
		return nil
	}
	var captionType *dataset.CaptionType
	if req.GetChunkStrategy() != nil {
		captionType = req.GetChunkStrategy().CaptionType
	}
	resp := &service.CreateDocumentReviewRequest{
		ChunkStrategy:   convertChunkingStrategy2Entity(req.ChunkStrategy),
		ParsingStrategy: convertParsingStrategy2Entity(req.ParsingStrategy, nil, captionType),
	}
	resp.KnowledgeID = req.GetDatasetID()
	resp.Reviews = slices.Transform(req.GetReviews(), func(r *dataset.ReviewInput) *service.ReviewInput {
		return &service.ReviewInput{
			DocumentName: r.GetDocumentName(),
			DocumentType: r.GetDocumentType(),
			TosUri:       r.GetTosURI(),
			DocumentID:   ptr.Of(r.GetDocumentID()),
		}
	})
	return resp
}

func convertReviewStatus2Model(status *entity.ReviewStatus) *dataset.ReviewStatus {
	if status == nil {
		return nil
	}
	switch *status {
	case entity.ReviewStatus_Enable:
		return dataset.ReviewStatusPtr(dataset.ReviewStatus_Enable)
	case entity.ReviewStatus_Processing:
		return dataset.ReviewStatusPtr(dataset.ReviewStatus_Processing)
	case entity.ReviewStatus_Failed:
		return dataset.ReviewStatusPtr(dataset.ReviewStatus_Failed)
	case entity.ReviewStatus_ForceStop:
		return dataset.ReviewStatusPtr(dataset.ReviewStatus_ForceStop)
	default:
		return dataset.ReviewStatusPtr(dataset.ReviewStatus_Processing)
	}
}

func getIconURI(tp dataset.FormatType) string {
	switch tp {
	case dataset.FormatType_Text:
		return upload.TextKnowledgeDefaultIcon
	case dataset.FormatType_Table:
		return upload.TableKnowledgeDefaultIcon
	case dataset.FormatType_Image:
		return upload.ImageKnowledgeDefaultIcon
	default:
		return upload.TextKnowledgeDefaultIcon
	}
}

func convertFormatType2Entity(tp dataset.FormatType) model.DocumentType {
	switch tp {
	case dataset.FormatType_Text:
		return model.DocumentTypeText
	case dataset.FormatType_Table:
		return model.DocumentTypeTable
	case dataset.FormatType_Image:
		return model.DocumentTypeImage
	default:
		return model.DocumentTypeUnknown
	}
}
