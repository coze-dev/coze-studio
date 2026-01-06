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
	"context"
	"fmt"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"
	"go.uber.org/mock/gomock"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/mock/dal/dao"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/rdb"
	rentity "github.com/coze-dev/coze-studio/backend/infra/rdb/entity"
	mrdb "github.com/coze-dev/coze-studio/backend/internal/mock/infra/rdb"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestValidateTableSchema(t *testing.T) {
	PatchConvey("test ValidateTableSchema", t, func() {
		ctx := context.Background()
		dst := &model.KnowledgeDocument{
			TableInfo: &entity.TableInfo{
				Columns: []*entity.TableColumn{
					{
						ID:       1,
						Name:     "test_col_1",
						Type:     document.TableColumnTypeString,
						Indexing: true,
						Sequence: 0,
					},
					{
						ID:       2,
						Name:     "test_col_2",
						Type:     document.TableColumnTypeInteger,
						Indexing: false,
						Sequence: 1,
					},
					{
						ID:       3,
						Name:     "test_col_3",
						Type:     document.TableColumnTypeString,
						Indexing: true,
						Sequence: 2,
					},
					{
						ID:          4,
						Name:        consts.RDBFieldID,
						Type:        document.TableColumnTypeInteger,
						Description: "主键ID",
						Indexing:    false,
						Sequence:    -1,
					},
				},
			},
		}

		ctrl := gomock.NewController(t)
		mockRepo := dao.NewMockKnowledgeDocumentRepo(ctrl)
		k := &knowledgeSVC{documentRepo: mockRepo}

		PatchConvey("test with fail reasons", func() {
			src := &rawSheet{
				cols: []*entity.TableColumn{
					{
						Name:     "test_col_3",
						Type:     document.TableColumnTypeString,
						Indexing: true,
						Sequence: 1,
					},
					{
						Name:     "test_col_2",
						Type:     document.TableColumnTypeString,
						Indexing: false,
						Sequence: 2,
					},
					{
						Name:     "another_field",
						Type:     document.TableColumnTypeString,
						Indexing: false,
						Sequence: 3,
					},
				},
				vals: [][]*document.ColumnData{
					{
						// 1. column not found
						//{
						//	ColumnName: "test_col_1",
						//	Type:       document.TableColumnTypeString,
						//	ValString:  ptr.Of("hello"),
						//},
						{
							// 2. indexing value is nil
							ColumnName: "test_col_3",
							Type:       document.TableColumnTypeString,
						},
						{
							// 3. type conversion failure
							ColumnName: "test_col_2",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("azaz"),
						},
						{
							ColumnName: "another_field",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("bye"),
						},
					},
				},
			}

			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{dst}, nil).Times(1)
			Mock(GetMethod(k, "LoadSourceInfoSpecificSheet")).Return(src, nil).Build()
			resp, err := k.ValidateTableSchema(ctx, &ValidateTableSchemaRequest{
				DocumentID: 123,
				SourceInfo: TableSourceInfo{
					Uri: ptr.Of("zxcqwe"),
				},
				TableSheet: &entity.TableSheet{
					SheetId:       0,
					HeaderLineIdx: 0,
					StartLineIdx:  1,
					SheetName:     "asd",
					TotalRows:     0,
				},
			})
			convey.So(err, convey.ShouldBeNil)
			exp := map[string]string{
				"test_col_1": "column not found in provided data",
				"test_col_2": "column type invalid, expected=2, got=1",
				"test_col_3": "column indexing requires value, but got none",
			}
			convey.So(resp.ColumnValidResult, convey.ShouldEqual, exp)
		})

		PatchConvey("test success", func() {
			src := &rawSheet{
				cols: []*entity.TableColumn{
					{
						Name:     "test_col_1",
						Type:     document.TableColumnTypeString,
						Indexing: true,
						Sequence: 0,
					},
					{
						Name:     "test_col_3",
						Type:     document.TableColumnTypeNumber,
						Indexing: true,
						Sequence: 1,
					},
					{
						Name:     "test_col_2",
						Type:     document.TableColumnTypeInteger,
						Indexing: false,
						Sequence: 2,
					},
					{
						Name:     "another_field",
						Type:     document.TableColumnTypeString,
						Indexing: false,
						Sequence: 3,
					},
				},
				vals: [][]*document.ColumnData{
					{
						{
							ColumnName: "test_col_1",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("hello"),
						},
						{
							ColumnName: "test_col_3",
							Type:       document.TableColumnTypeNumber,
							ValNumber:  ptr.Of(1.0),
						},
						{
							ColumnName: "test_col_2",
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(1)),
						},
						{
							ColumnName: "another_field",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("bye"),
						},
					},
				},
			}

			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{dst}, nil).Times(1)
			Mock(GetMethod(k, "LoadSourceInfoSpecificSheet")).Return(src, nil).Build()
			resp, err := k.ValidateTableSchema(ctx, &ValidateTableSchemaRequest{
				DocumentID: 123,
				SourceInfo: TableSourceInfo{
					Uri: ptr.Of("zxcqwe"),
				},
				TableSheet: &entity.TableSheet{
					SheetId:       0,
					HeaderLineIdx: 0,
					StartLineIdx:  1,
					SheetName:     "asd",
					TotalRows:     0,
				},
			})
			convey.So(err, convey.ShouldBeNil)
			convey.So(len(resp.ColumnValidResult), convey.ShouldBeZeroValue)
		})
	})
}

func TestFormatTableSchemaResponse(t *testing.T) {
	PatchConvey("test FormatTableSchemaResponse", t, func() {
		k := &knowledgeSVC{}
		sheet := &entity.TableSheet{
			SheetId:       0,
			HeaderLineIdx: 0,
			StartLineIdx:  1,
			SheetName:     "test1",
			TotalRows:     21,
		}

		allSheets := []*entity.TableSheet{
			sheet,
			{
				SheetId:       1,
				HeaderLineIdx: 0,
				StartLineIdx:  1,
				SheetName:     "test2",
				TotalRows:     22,
			},
		}

		tblMeta := []*entity.TableColumn{
			{
				ID:       1,
				Name:     "test_col_1",
				Type:     document.TableColumnTypeString,
				Indexing: true,
				Sequence: 0,
			},
			{
				ID:       2,
				Name:     "test_col_2",
				Type:     document.TableColumnTypeInteger,
				Indexing: false,
				Sequence: 1,
			},
			{
				ID:       3,
				Name:     "test_col_3",
				Type:     document.TableColumnTypeString,
				Indexing: true,
				Sequence: 2,
			},
		}

		data := [][]*document.ColumnData{
			{
				{
					ColumnID:   1,
					ColumnName: "test_col_1",
					Type:       document.TableColumnTypeString,
					ValString:  ptr.Of("hello"),
				},
				{
					ColumnID:   2,
					ColumnName: "test_col_2",
					Type:       document.TableColumnTypeInteger,
					ValInteger: ptr.Of(int64(22222)),
				},
				{
					ColumnID:   3,
					ColumnName: "test_col_3",
					Type:       document.TableColumnTypeString,
					ValString:  ptr.Of("bye"),
				},
			},
			{
				{
					ColumnID:   1,
					ColumnName: "test_col_1",
					Type:       document.TableColumnTypeString,
					ValString:  ptr.Of("qqq"),
				},
				{
					ColumnID:   2,
					ColumnName: "test_col_2",
					Type:       document.TableColumnTypeInteger,
					ValInteger: ptr.Of(int64(4444)),
				},
				{
					ColumnID:   3,
					ColumnName: "test_col_3",
					Type:       document.TableColumnTypeString,
					ValString:  ptr.Of("eee"),
				},
			},
		}

		r := &TableSchemaResponse{
			TableSheet:     sheet,
			AllTableSheets: allSheets,
			TableMeta:      tblMeta,
			PreviewData:    data,
		}

		PatchConvey("test only schema", func() {
			p := []*entity.TableColumn{
				{
					ID:       1,
					Name:     "test_col_1",
					Type:     document.TableColumnTypeString,
					Indexing: true,
					Sequence: 0,
				},
				{
					ID:       2,
					Name:     "test_col_2",
					Type:     document.TableColumnTypeInteger,
					Indexing: false,
					Sequence: 0,
				},
			}

			resp, err := k.FormatTableSchemaResponse(r, p, OnlySchema)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldNotBeNil)
			convey.So(resp, convey.ShouldEqual, &TableSchemaResponse{
				TableSheet:     r.TableSheet,
				AllTableSheets: r.AllTableSheets,
				TableMeta:      p,
			})
		})

		PatchConvey("test prevTableMeta == nil && AllData", func() {
			resp, err := k.FormatTableSchemaResponse(r, nil, AllData)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldNotBeNil)
			convey.So(resp, convey.ShouldEqual, r)
		})

		PatchConvey("test prevTableMeta == nil && OnlyPreview", func() {
			resp, err := k.FormatTableSchemaResponse(r, nil, OnlyPreview)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldNotBeNil)
			convey.So(resp, convey.ShouldEqual, &TableSchemaResponse{
				PreviewData: r.PreviewData,
			})
		})

		PatchConvey("test align first import", func() {
			p := []*entity.TableColumn{
				{
					ID:       0,
					Name:     "test_col_1",
					Type:     document.TableColumnTypeString,
					Indexing: true,
					Sequence: 0,
				},
				{
					ID:       0,
					Name:     "test_col_3",
					Type:     document.TableColumnTypeString,
					Indexing: true,
					Sequence: 2,
				},
				{
					ID:       0,
					Name:     "test_col_2",
					Type:     document.TableColumnTypeInteger,
					Indexing: false,
					Sequence: 1,
				},
				{
					ID:       0,
					Name:     "test_col_append_1",
					Type:     document.TableColumnTypeInteger,
					Indexing: false,
					Sequence: 3,
				},
			}

			rd := [][]*document.ColumnData{
				{
					{
						ColumnID:   0,
						ColumnName: "test_col_1",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("hello"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_2",
						Type:       document.TableColumnTypeInteger,
						ValInteger: ptr.Of(int64(22222)),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_3",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("bye"),
					},
				},
				{
					{
						ColumnID:   0,
						ColumnName: "test_col_1",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("qqq"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_2",
						Type:       document.TableColumnTypeInteger,
						ValInteger: ptr.Of(int64(4444)),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_3",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("eee"),
					},
				},
			}

			rr := &TableSchemaResponse{
				TableSheet:     sheet,
				AllTableSheets: allSheets,
				TableMeta:      tblMeta,
				PreviewData:    rd,
			}

			resp, err := k.FormatTableSchemaResponse(rr, p, AllData)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldNotBeNil)
			exp := [][]*document.ColumnData{
				{
					{
						ColumnID:   0,
						ColumnName: "test_col_1",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("hello"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_3",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("bye"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_2",
						Type:       document.TableColumnTypeInteger,
						ValInteger: ptr.Of(int64(22222)),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_append_1",
						Type:       document.TableColumnTypeInteger,
					},
				},
				{
					{
						ColumnID:   0,
						ColumnName: "test_col_1",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("qqq"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_3",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("eee"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_2",
						Type:       document.TableColumnTypeInteger,
						ValInteger: ptr.Of(int64(4444)),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_append_1",
						Type:       document.TableColumnTypeInteger,
					},
				},
			}
			convey.So(resp, convey.ShouldEqual, &TableSchemaResponse{
				TableSheet:     r.TableSheet,
				AllTableSheets: r.AllTableSheets,
				TableMeta:      p,
				PreviewData:    exp,
			})
		})

		PatchConvey("test align non-first import", func() {
			p := []*entity.TableColumn{
				{
					ID:       1,
					Name:     "test_col_1",
					Type:     document.TableColumnTypeString,
					Indexing: true,
					Sequence: 0,
				},
				{
					ID:       0,
					Name:     "test_col_append_0",
					Type:     document.TableColumnTypeNumber,
					Indexing: false,
					Sequence: 1,
				},
				{
					ID:       3,
					Name:     "test_col_3",
					Type:     document.TableColumnTypeString,
					Indexing: true,
					Sequence: 2,
				},
				{
					ID:       0,
					Name:     "test_col_append_1",
					Type:     document.TableColumnTypeInteger,
					Indexing: false,
					Sequence: 3,
				},
			}

			resp, err := k.FormatTableSchemaResponse(r, p, AllData)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldNotBeNil)
			exp := [][]*document.ColumnData{
				{
					{
						ColumnID:   1,
						ColumnName: "test_col_1",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("hello"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_append_0",
						Type:       document.TableColumnTypeNumber,
					},
					{
						ColumnID:   3,
						ColumnName: "test_col_3",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("bye"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_append_1",
						Type:       document.TableColumnTypeInteger,
					},
				},
				{
					{
						ColumnID:   1,
						ColumnName: "test_col_1",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("qqq"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_append_0",
						Type:       document.TableColumnTypeNumber,
					},
					{
						ColumnID:   3,
						ColumnName: "test_col_3",
						Type:       document.TableColumnTypeString,
						ValString:  ptr.Of("eee"),
					},
					{
						ColumnID:   0,
						ColumnName: "test_col_append_1",
						Type:       document.TableColumnTypeInteger,
					},
				},
			}
			convey.So(resp, convey.ShouldEqual, &TableSchemaResponse{
				TableSheet:     r.TableSheet,
				AllTableSheets: r.AllTableSheets,
				TableMeta:      p,
				PreviewData:    exp,
			})
		})
	})
}

func TestGetDocumentTableInfoByID(t *testing.T) {

	PatchConvey("test GetDocumentTableInfoByID", t, func() {
		ctx := context.Background()
		docID := int64(123)
		doc := &model.KnowledgeDocument{
			ID:           docID,
			KnowledgeID:  333,
			DocumentType: int32(knowledgeModel.DocumentTypeTable),
			ParseRule: &model.DocumentParseRule{
				ParsingStrategy: &entity.ParsingStrategy{
					ExtractImage:  false,
					ExtractTable:  false,
					ImageOCR:      false,
					SheetID:       0,
					HeaderLine:    0,
					DataStartLine: 1,
					RowsCount:     20,
				},
				ChunkingStrategy: nil,
			},
			TableInfo: &entity.TableInfo{
				VirtualTableName:  "virtual_tbl",
				PhysicalTableName: "physical_tbl",
				TableDesc:         "desc",
				Columns: []*entity.TableColumn{
					{
						ID:       1,
						Name:     "test_col_1",
						Type:     document.TableColumnTypeString,
						Indexing: true,
						Sequence: 0,
					},
					{
						ID:       2,
						Name:     "test_col_2",
						Type:     document.TableColumnTypeInteger,
						Indexing: false,
						Sequence: 1,
					},
					{
						ID:       3,
						Name:     "test_col_3",
						Type:     document.TableColumnTypeString,
						Indexing: true,
						Sequence: 2,
					},
					{
						ID:          4,
						Name:        consts.RDBFieldID,
						Type:        document.TableColumnTypeInteger,
						Description: "主键ID",
						Indexing:    false,
						Sequence:    -1,
					},
				},
			},
		}

		sheet := &entity.TableSheet{
			SheetId:       doc.ParseRule.ParsingStrategy.SheetID,
			HeaderLineIdx: int64(doc.ParseRule.ParsingStrategy.HeaderLine),
			StartLineIdx:  int64(doc.ParseRule.ParsingStrategy.DataStartLine),
			SheetName:     doc.Name,
			TotalRows:     doc.SliceCount,
		}

		selectResp := &rdb.SelectDataResponse{
			ResultSet: &rentity.ResultSet{
				Columns: []string{
					consts.RDBFieldID,
					convert.ColumnIDToRDBField(doc.TableInfo.Columns[0].ID),
					convert.ColumnIDToRDBField(doc.TableInfo.Columns[1].ID),
					convert.ColumnIDToRDBField(doc.TableInfo.Columns[2].ID),
				},
				Rows: []map[string]interface{}{
					{
						consts.RDBFieldID: 12345,
						convert.ColumnIDToRDBField(doc.TableInfo.Columns[0].ID): "hello",
						convert.ColumnIDToRDBField(doc.TableInfo.Columns[1].ID): 222,
						convert.ColumnIDToRDBField(doc.TableInfo.Columns[2].ID): "bye",
					},
					{
						consts.RDBFieldID: 12346,
						convert.ColumnIDToRDBField(doc.TableInfo.Columns[0].ID): "qaq",
						convert.ColumnIDToRDBField(doc.TableInfo.Columns[1].ID): 333,
						convert.ColumnIDToRDBField(doc.TableInfo.Columns[2].ID): "quq",
					},
				},
				AffectedRows: 0,
			},
			Total: 2,
		}

		ctrl := gomock.NewController(t)
		mockRepo := dao.NewMockKnowledgeDocumentRepo(ctrl)
		mockRDB := mrdb.NewMockRDB(ctrl)
		k := &knowledgeSVC{documentRepo: mockRepo, rdb: mockRDB}

		PatchConvey("test MGetByID failed", func() {
			expErr := fmt.Errorf("mock err")
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return(nil, expErr).Times(1)
			resp, err := k.GetDocumentTableInfoByID(ctx, docID, false)
			convey.ShouldContainSubstring(err.Error(), expErr.Error())
			convey.So(resp, convey.ShouldBeNil)
		})

		PatchConvey("test document not found", func() {
			expErr := fmt.Errorf("[GetDocumentTableInfoByID] document not found, id=%d", docID)
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return(nil, nil).Times(1)
			resp, err := k.GetDocumentTableInfoByID(ctx, docID, false)
			convey.ShouldContainSubstring(err.Error(), expErr.Error())
			convey.So(resp, convey.ShouldBeNil)
		})

		PatchConvey("test document type invalid", func() {
			d := &model.KnowledgeDocument{ID: docID, DocumentType: int32(knowledgeModel.DocumentTypeText)}
			expErr := fmt.Errorf("[GetDocumentTableInfoByID] document type invalid, got=%d", d.DocumentType)
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{d}, nil).Times(1)
			resp, err := k.GetDocumentTableInfoByID(ctx, docID, false)
			convey.ShouldContainSubstring(err.Error(), expErr.Error())
			convey.So(resp, convey.ShouldBeNil)
		})

		PatchConvey("test not need data", func() {
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{doc}, nil).Times(1)
			resp, err := k.GetDocumentTableInfoByID(ctx, docID, false)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldEqual, &TableSchemaResponse{
				TableSheet:     sheet,
				AllTableSheets: []*entity.TableSheet{sheet},
				TableMeta:      doc.TableInfo.Columns[:3],
			})
		})

		PatchConvey("test SelectData failed", func() {
			expErr := fmt.Errorf("mock err")
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{doc}, nil).Times(1)
			mockRDB.EXPECT().SelectData(gomock.Any(), gomock.Any()).Return(nil, expErr).Times(1)
			resp, err := k.GetDocumentTableInfoByID(ctx, docID, true)
			convey.ShouldContainSubstring(err.Error(), expErr.Error())
			convey.So(resp, convey.ShouldBeNil)
		})

		PatchConvey("test ParseRDBData failed", func() {
			expErr := fmt.Errorf("mock err")
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{doc}, nil).Times(1)
			mockRDB.EXPECT().SelectData(gomock.Any(), gomock.Any()).Return(selectResp, nil).Times(1)
			Mock(GetMethod(k, "ParseRDBData")).Return(nil, expErr).Build()

			resp, err := k.GetDocumentTableInfoByID(ctx, docID, true)
			convey.ShouldContainSubstring(err.Error(), expErr.Error())
			convey.So(resp, convey.ShouldBeNil)
		})

		PatchConvey("test success", func() {
			mockData := [][]*document.ColumnData{
				{{ColumnID: 123123, ColumnName: "zxczxc", Type: document.TableColumnTypeString, ValString: ptr.Of("dddd")}},
			}
			mockRepo.EXPECT().MGetByID(gomock.Any(), gomock.Any()).Return([]*model.KnowledgeDocument{doc}, nil).Times(1)
			mockRDB.EXPECT().SelectData(gomock.Any(), gomock.Any()).Return(selectResp, nil).Times(1)
			Mock(GetMethod(k, "ParseRDBData")).Return(mockData, nil).Build()

			resp, err := k.GetDocumentTableInfoByID(ctx, docID, true)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldEqual, &TableSchemaResponse{
				TableSheet:     sheet,
				AllTableSheets: []*entity.TableSheet{sheet},
				TableMeta:      doc.TableInfo.Columns[:3],
				PreviewData:    mockData,
			})
		})
	})
}

func TestParseRDBData(t *testing.T) {
	PatchConvey("test ParseRDBData", t, func() {
		cols := []*entity.TableColumn{
			{
				ID:       1,
				Name:     "test_col_1",
				Type:     document.TableColumnTypeString,
				Indexing: true,
				Sequence: 0,
			},
			{
				ID:       2,
				Name:     "test_col_2",
				Type:     document.TableColumnTypeInteger,
				Indexing: false,
				Sequence: 1,
			},
			{
				ID:       3,
				Name:     "test_col_3",
				Type:     document.TableColumnTypeString,
				Indexing: true,
				Sequence: 2,
			},
			{
				ID:          4,
				Name:        consts.RDBFieldID,
				Type:        document.TableColumnTypeInteger,
				Description: "主键ID",
				Indexing:    false,
				Sequence:    -1,
			},
		}

		rs := &rentity.ResultSet{
			Columns: []string{
				consts.RDBFieldID,
				convert.ColumnIDToRDBField(cols[0].ID),
				convert.ColumnIDToRDBField(cols[1].ID),
				convert.ColumnIDToRDBField(cols[2].ID),
			},
			Rows: []map[string]interface{}{
				{
					consts.RDBFieldID:                      12345,
					convert.ColumnIDToRDBField(cols[0].ID): "hello",
					convert.ColumnIDToRDBField(cols[1].ID): 222,
					convert.ColumnIDToRDBField(cols[2].ID): "bye",
				},
				{
					consts.RDBFieldID:                      12346,
					convert.ColumnIDToRDBField(cols[0].ID): "qaq",
					convert.ColumnIDToRDBField(cols[1].ID): 333,
					convert.ColumnIDToRDBField(cols[2].ID): "quq",
				},
			},
		}

		k := &knowledgeSVC{}

		PatchConvey("test parse with column id", func() {
			c := cols

			PatchConvey("test column not found", func() {
				nc := append(c, &entity.TableColumn{
					ID:   9,
					Name: "unknown_field",
					Type: document.TableColumnTypeString,
				})
				resp, err := k.ParseRDBData(nc, rs)
				convey.ShouldContainSubstring(err.Error(), "[ParseRDBData] column not found, col=unknown_field")
				convey.So(resp, convey.ShouldBeNil)
			})

			PatchConvey("test ParseAnyData failed", func() {
				nrs := &rentity.ResultSet{
					Columns: []string{
						consts.RDBFieldID,
						convert.ColumnIDToRDBField(cols[0].ID),
						convert.ColumnIDToRDBField(cols[1].ID),
						convert.ColumnIDToRDBField(cols[2].ID),
					},
					Rows: []map[string]interface{}{
						{
							consts.RDBFieldID:                      12345,
							convert.ColumnIDToRDBField(cols[0].ID): "hello",
							convert.ColumnIDToRDBField(cols[1].ID): 222,
							convert.ColumnIDToRDBField(cols[2].ID): 1.1,
						},
					},
				}
				resp, err := k.ParseRDBData(c, nrs)
				convey.ShouldContainSubstring(err.Error(), "[ParseRDBData] invalid column type")
				convey.So(resp, convey.ShouldBeNil)
			})

			PatchConvey("test success", func() {
				exp := [][]*document.ColumnData{
					{
						{
							ColumnID:   1,
							ColumnName: "test_col_1",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("hello"),
						},
						{
							ColumnID:   2,
							ColumnName: "test_col_2",
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(222)),
						},
						{
							ColumnID:   3,
							ColumnName: "test_col_3",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("bye"),
						},
						{
							ColumnID:   4,
							ColumnName: consts.RDBFieldID,
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(12345)),
						},
					},
					{
						{
							ColumnID:   1,
							ColumnName: "test_col_1",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("qaq"),
						},
						{
							ColumnID:   2,
							ColumnName: "test_col_2",
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(333)),
						},
						{
							ColumnID:   3,
							ColumnName: "test_col_3",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("quq"),
						},
						{
							ColumnID:   4,
							ColumnName: consts.RDBFieldID,
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(12346)),
						},
					},
				}

				resp, err := k.ParseRDBData(c, rs)
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, exp)
			})
		})

		PatchConvey("test parse without column id", func() {
			c := cols[:len(cols)-1]

			PatchConvey("test column not found", func() {
				nc := append(c, &entity.TableColumn{
					ID:   9,
					Name: "unknown_field",
					Type: document.TableColumnTypeString,
				})
				resp, err := k.ParseRDBData(nc, rs)
				convey.ShouldContainSubstring(err.Error(), "[ParseRDBData] altering table, retry later, col=unknown_field")
				convey.So(resp, convey.ShouldBeNil)
			})

			PatchConvey("test ParseAnyData failed", func() {
				nrs := &rentity.ResultSet{
					Columns: []string{
						consts.RDBFieldID,
						convert.ColumnIDToRDBField(cols[0].ID),
						convert.ColumnIDToRDBField(cols[1].ID),
						convert.ColumnIDToRDBField(cols[2].ID),
					},
					Rows: []map[string]interface{}{
						{
							consts.RDBFieldID:                      12345,
							convert.ColumnIDToRDBField(cols[0].ID): "hello",
							convert.ColumnIDToRDBField(cols[1].ID): 222,
							convert.ColumnIDToRDBField(cols[2].ID): 1.1,
						},
					},
				}
				resp, err := k.ParseRDBData(c, nrs)
				convey.ShouldContainSubstring(err.Error(), "[ParseRDBData] invalid column type")
				convey.So(resp, convey.ShouldBeNil)
			})

			PatchConvey("test success", func() {
				exp := [][]*document.ColumnData{
					{
						{
							ColumnID:   1,
							ColumnName: "test_col_1",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("hello"),
						},
						{
							ColumnID:   2,
							ColumnName: "test_col_2",
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(222)),
						},
						{
							ColumnID:   3,
							ColumnName: "test_col_3",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("bye"),
						},
					},
					{
						{
							ColumnID:   1,
							ColumnName: "test_col_1",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("qaq"),
						},
						{
							ColumnID:   2,
							ColumnName: "test_col_2",
							Type:       document.TableColumnTypeInteger,
							ValInteger: ptr.Of(int64(333)),
						},
						{
							ColumnID:   3,
							ColumnName: "test_col_3",
							Type:       document.TableColumnTypeString,
							ValString:  ptr.Of("quq"),
						},
					},
				}

				resp, err := k.ParseRDBData(c, rs)
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, exp)
			})
		})
	})
}
