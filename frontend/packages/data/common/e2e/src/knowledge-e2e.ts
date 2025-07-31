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

export enum KnowledgeE2e {
  KnowledgeTab = 'knowledge.tab',
  // Knowledge Base List
  // KnowledgeSearch = 'ui.search_input',
  KnowledgeSearchType = 'knowledge.list.search.type.select',
  KnowledgeSearchFounder = 'knowledge.list.search.founder.select',
  KnowledgeCreateBtn = 'knowledge.list.create.btn',
  /** The one starting with the ui prefix is the original mark, and the list page needs to be positioned according to the index. */
  // KnowledgeListName = 'knowledge.list.name.text',
  // KnowledgeListIcon = 'ui.table-meta',
  // KnowledgeListIconDel = 'ui.table-action.delete',
  // KnowledgeListIconEdit = 'ui.table-action.edit',
  KnowledgeListSwitch = 'knowledge.list.switch',
  KnowledgeListAllTab = 'knowledge.list.all.tab',
  KnowledgeListTextTab = 'knowledge.list.text.tab',
  KnowledgeListTableTab = 'knowledge.list.table.tab',
  KnowledgeEditModalDescInput = 'knowledge.edit.modal.desc.input',
  KnowledgeEditModalNameInput = 'knowledge.edit.modal.name.input',
  // Create a knowledge base popup
  CreateKnowledgeModal = 'knowledge.create.modal',
  CreateKnowledgeModalTitle = 'knowledge.create.modal.title.text',
  CreateKnowledgeModalTextRadioGroup = 'knowledge.create.modal.text.RadioGroup',
  CreateKnowledgeModalTableRadioGroup = 'knowledge.create.modal.table.RadioGroup',
  CreateKnowledgeModalPhotoRadioGroup = 'knowledge.create.modal.photo.RadioGroup',
  CreateKnowledgeModalNameInput = 'knowledge.create.modal.name.input',
  CreateKnowledgeModalDescInput = 'knowledge.create.modal.desc.input',
  CreateKnowledgeModalAvatarUploader = 'knowledge.create.modal.avatar.uploader',
  CreateKnowledgeModalTextLocalRadio = 'knowledge.create.modal.text.local.radio',
  CreateKnowledgeModalTextOnlineRadio = 'knowledge.create.modal.text.online.radio',
  CreateKnowledgeModalTextNotionRadio = 'knowledge.create.modal.text.notion.radio',
  CreateKnowledgeModalTextGoogleRadio = 'knowledge.create.modal.text.google.radio',
  CreateKnowledgeModalTextFeishuRadio = 'knowledge.create.modal.text.feishu.radio',
  CreateKnowledgeModalTextWechatRadio = 'knowledge.create.modal.text.wechat.radio',
  CreateKnowledgeModalTextCustomRadio = 'knowledge.create.modal.text.custom.radio',
  CreateKnowledgeModalTableLocalRadio = 'knowledge.create.modal.table.local.radio',
  CreateKnowledgeModalTableApiRadio = 'knowledge.create.modal.table.api.radio',
  CreateKnowledgeModalTableGoogleRadio = 'knowledge.create.modal.table.google.radio',
  CreateKnowledgeModalTableFeishuRadio = 'knowledge.create.modal.table.feishu.radio',
  CreateKnowledgeModalTableCustomRadio = 'knowledge.create.modal.table.custom.radio',
  CreateKnowledgeModalPhotoImgRadio = 'knowledge.create.modal.photo.img.radio',
  CreateKnowledgeModalTextLarkRadio = 'knowledge.create.modal.text.lark.radio',
  CreateKnowledgeModalTableLarkRadio = 'knowledge.create.modal.table.lark.radio',
  CreateKnowledgeModalSubmitAndImportButton = 'knowledge.create.modal.submit_and_import.button',
  // Create a text type
  CreateTextUploadNav = 'knowledge.create.text.upload.nav.text',
  /** Create a knowledge base step bar */
  // CreateKnowledgeStepUploadFile = 'knowledge.create.step.upload',
  // CreateKnowledgeStepSegment = 'knowledge.create.step.segment',
  // CreateKnowledgeStepProcess = 'knowledge.create.step.process',
  UploadUnitFile = 'knowledge.create.upload.unit.file.upload',
  UploadUnitNextBtn = 'knowledge.create.unit.next.btn',
  UploadUnitUpBtn = 'knowledge.create.unit.up.btn',
  UploadUnitAddBtn = 'knowledge.create.unit.add.btn',
  UploadUnitCancelBtn = 'knowledge.create.unit.cancel.btn',
  CreateUnitConfirmBtn = 'knowledge.create.unit.confirm.btn',
  /** local upload list */
  LocalUploadListName = 'knowledge.upload.list.name.input',
  LocalUploadListNameView = 'knowledge.upload.list.name.text',
  LocalUploadListStatus = 'knowledge.upload.list.status.text',
  LocalUploadListFileSize = 'knowledge.upload.list.file_size.text',
  LocalUploadListFrequency = 'knowledge.create.text.upload.list.frequency.text',
  LocalUploadListDelete = 'ui.table-action.delete',
  CreateUnitResegmentAutoRadio = 'knowledge.create.unit.resegment.auto.radio',
  CreateUnitResegmentCustomRadio = 'knowledge.create.unit.resegment.custom.radio',
  ResegmentCustomIdentifierSelect = 'knowledge.create.unit.resegment.custom.identifier.select',
  ResegmentCustomMaxLenInput = 'knowledge.create.unit.resegment.custom.max_len.input',
  ResegmentCustomRuleText = 'knowledge.create.unit.resegment.custom.rule.text',
  CreateUnitProgressTitle = 'knowledge.create.unit.progress.title.text',
  CreateUnitListProgressSuccessIcon = 'knowledge.create.unit.progress.success.icon',
  CreateUnitListProgressName = 'knowledge.create.unit.progress.name.text',
  CreateUnitListProgressPercent = 'knowledge.create.unit.progress.percent.text',

  /** Create a text-online type (url) */
  OnlineUploadAutoBtn = 'knowledge.create.text.online.auto.btn',
  OnlineUploadManualBtn = 'knowledge.create.text.online.manual.btn',
  OnlineUploadModal = 'knowledge.create.text.online.upload.modal',
  OnlineUploadModalAddTypeSelect = 'knowledge.create.text.online.upload.modal.add_type.select',
  OnlineUploadModalFrequencySelect = 'knowledge.create.text.online.upload.modal.frequency.select',
  OnlineUploadModalExampleUrlSelect = 'knowledge.create.text.online.upload.modal.example_url.input',
  /** Create a text-custom type */
  CustomUploadNameInput = 'knowledge.create.custom.upload.name.input',
  SegmentEditor = 'knowledge.segment.editor',
  SegmentEditorInsertImgBtn = 'knowledge.segment.editor.insert_img.btn',
  /** feishu */
  FeishuUploadCountText = 'knowledge.create.feishu.upload.count.text',
  FeishuUploadAccountText = 'knowledge.create.feishu.upload.account.text',
  FeishuUploadListName = 'knowledge.create.feishu.upload.list.name.text',
  FeishuUploadSourceSpaceMine = 'knowledge.create.feishu.upload.source.space.mine',
  FeishuUploadSourceSpaceWiki = 'knowledge.create.feishu.upload.source.space.wiki',
  FeishuUploadUpdateFrequencyValue = 'knowledge.create.feishu.upload.update.frequency.value',
  FeishuUploadAppendFrequencyValue = 'knowledge.create.feishu.upload.append.frequency.value',
  /** table-doc */
  TableLocalTableConfigurationDataSheet = 'knowledge.create.table.local.table_configuration.data_sheet.select',
  TableLocalTableConfigurationSheetHeader = 'knowledge.create.table.local.table_configuration.sheet_header.select',
  TableLocalTableConfigurationStarRow = 'knowledge.create.table.local.table_configuration.star_row.select',
  TableLocalTableConfigurationIndex = 'knowledge.create.table.local.table_configuration.index.text',
  TableLocalTableConfigurationColumnName = 'knowledge.create.table.local.table_configuration.column_name.text',
  TableLocalTableConfigurationDesc = 'knowledge.create.table.local.table_configuration.desc.text',
  TableLocalTableConfigurationType = 'knowledge.create.table.local.table_configuration.type.text',
  TableLocalTableConfigurationAction = 'knowledge.create.table.local.table_configuration.action.text',
  TableLocalPreviewTitle = 'knowledge.create.table.local.preview.title.text',
  TableLocalPreviewSemantic = 'knowledge.create.table.local.preview.semantic.tag',
  TableLocalPreviewFooterTotal = 'knowledge.create.table.local.preview.footer.total.text',
  TableLocalTableStructureTitle = 'knowledge.create.table.local.table_structure.title.text',
  /** table-api */
  TableApiAddUrlModalWebInput = 'knowledge.create.table.api.modal.web.input',
  TableApiAddUrlModalFrequency = 'knowledge.create.table.api.modal.frequency.select',
  /** table-custom */
  TableCustomUAddFieldBtn = 'knowledge.create.table.custom.add_field.btn',
  TableStructureIndexCheckbox = 'knowledge.create.table.table_structure.index.checkbox',

  /** image */
  ImageAnnotationAiRadio = 'knowledge.create.image.annotation.ai.radio',
  ImageAnnotationManualRadio = 'knowledge.create.image.annotation.manual.radio',
  ImageAnnotationAllTab = 'knowledge.create.image.annotation.all.tab',
  ImageAnnotationUnAnnotationTab = 'knowledge.create.image.annotation.un_annotation.tab',
  ImageAnnotationAnnotationedTab = 'knowledge.create.image.annotation.annotationed.tab',
  /** increment */
  IncrementTableUploadStructureTitle = 'knowledge.increment.table.upload.structure_title.text',
  IncrementTableUploadStructureColumnName = 'knowledge.increment.table.upload.structure_column_name.input',
  IncrementTableUploadStructureAddBtn = 'knowledge.increment.table.upload.structure_add.btn',

  // CreateKnowledgeModalCancelBtn = 'knowledge.create.modal.cancel.btn',
  // CreateKnowledgeModalNextBtn = 'knowledge.create.modal.next.btn',
  /** Segment details page */
  SegmentDetailUpdateBtn = 'knowledge.segment.detail.update.btn',
  SegmentDetailTitle = 'knowledge.segment.detail.title.text',
  SegmentDetailTitleEditIcon = 'knowledge.segment.detail.title.edit.icon',
  SegmentDetailResetBtn = 'knowledge.segment.detail.reset.btn',
  SegmentDetailAddBtn = 'knowledge.segment.detail.add.btn',
  SegmentDetailSystemBtn = 'knowledge.segment.detail.system.btn',
  SegmentDetailSystemDropdownMenu = 'knowledge.segment.detail.system.dropdown_menu',
  SegmentDetailSystemWebUrlDropdownMenu = 'knowledge.segment.detail.system.web_url.dropdown_menu',
  SegmentDetailTableConfigBtn = 'knowledge.segment.detail.table_config.btn',
  SegmentDetailDropdownItem = 'knowledge.segment.detail.dropdown.item',
  SegmentDetailLocalFileItem = 'knowledge.segment.detail.dropdown.item.text_doc',
  SegmentDetailContentItemEditIcon = 'knowledge.segment.detail.content.edit.icon',
  SegmentDetailContentItemFrequencyIcon = 'knowledge.segment.detail.content.frequency.icon',
  SegmentDetailContentItemAddTopIcon = 'knowledge.segment.detail.content.add_top.icon',

  SegmentDetailContentItemAddBottomIcon = 'knowledge.segment.detail.content.add_bottom.icon',
  SegmentDetailContentItemFetchSliceIcon = 'knowledge.segment.detail.content.fetch_slice.icon',
  SegmentDetailContentItemFetchSliceModalSaveBtn = 'knowledge.segment.detail.content.fetch_slice.modal.save.btn',
  SegmentDetailContentItemWebUrlIcon = 'knowledge.segment.detail.content.web_url.icon',
  SegmentDetailContentDeleteIcon = 'knowledge.segment.detail.content.delete.icon',
  SegmentDetailContentAddRowBtn = 'knowledge.segment.detail.content.add_row.btn',
  SegmentDetailContentSelectTrigger = 'knowledge.segment.detail.content.select.trigger',
  SegmentDetailContentSelectTriggerEditIcon = 'knowledge.segment.detail.content.select.trigger.edit.icon',
  // SegmentDetailContentDeleteSliceModalDeleteBtn = 'knowledge.segment.detail.content.delete_slice.modal.delete.btn',
  // SegmentDetailContentDeleteSliceModalCancelBtn = 'knowledge.segment.detail.content.delete_slice.modal.cancel.btn',
  SegmentDetailBatchFrequencyModalSelect = 'knowledge.segment.detail.batch_frequency.modal.select',
  SegmentDetailBatchFrequencyModalcheckboxAll = 'knowledge.segment.detail.batch_frequency.modal.checkbox_all',
  SegmentDetailBatchFrequencyModalcheckboxItem = 'knowledge.segment.detail.batch_frequency.modal.checkbox_item',
  /** Segment details page Re-segment process page */
  ResegmentUploadUnitNextBtn = 'knowledge.resegment.unit.next.btn',
  ResegmentUnitConfirmBtn = 'knowledge.resegment.unit.confirm.btn',
  /** Common knowledge */
  UnitDetailTags = 'knowledge.unit.detail.tags',
  UnitDetailTagsProcessing = 'knowledge.unit.detail.tags.processing.tag',
  UnitDetailTagsFailed = 'knowledge.unit.detail.tags.failed.tag',
  KnowledgeAddContentNavBar = 'knowledge.unit.add.content.navbar',
}
/** underlying components */
export const UIE2E = [
  'ui.select.option',
  'ui.table-action.delete',
  'ui.table-action.edit',
  'ui.table-meta',
  'ui.search_input',
];
