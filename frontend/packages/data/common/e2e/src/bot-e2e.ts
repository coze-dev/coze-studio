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

export enum BotE2e {
  BotTab = 'bot.tab',
  BotListSearch = 'bot.list.search.input',
  BotListCreateBtn = 'bot.list.create.btn',
  BotListIcon = 'bot.list.icon',
  BotListIconDel = 'bot.list.delete.icon',
  BotListIconEdit = 'bot.list.edit.icon',
  BotKnowledgeAutoMaticBtn = 'bot.knowledge.auto_matic.btn',
  /** Knowledge base settings pop-up box */
  BotKnowledgeSettingModalTitle = 'bot.knowledge.setting.modal.title.text',
  BotKnowledgeSettingModalAutoRadio = 'bot.knowledge.setting.modal.auto.radio',
  BotKnowledgeSettingModalManualRadio = 'bot.knowledge.setting.modal.manual.radio',
  BotKnowledgeSettingNoRecallReplyModeDefaultRadio = 'bot.knowledge.setting.reply.mode.default.radio',
  BotKnowledgeSettingNoRecallReplyModeCustomizePromptRadio = 'bot.knowledge.setting.reply.mode.customizeprompt.radio',
  BotKnowledgeSettingShowSourceDisplayTitle = 'bot.knowledge.setting.show.source.display.title.text',
  BotKnowledgeSettingShowSourceDisplaySwitch = 'bot.knowledge.setting.show.source.display.switch',
  BotKnowledgeSettingShowSourceModeCardRadio = 'bot.knowledge.setting.show.source.mode.cardlist.radio',
  BotKnowledgeSettingShowSourceModeTextRadio = 'bot.knowledge.setting.show.source.mode.replybottom.radio',
  /** Select Knowledge Base List */
  BotKnowledgeSelectListModalCreateBtn = 'bot.knowledge.select.list.modal.create.btn',
  BotKnowledgeSelectListModalCreateDateSelect = 'bot.knowledge.select.list.modal.create.date.select',
  BotKnowledgeSelectListModalAllTab = 'bot.knowledge.select.list.modal.all.tab',
  BotKnowledgeSelectListModalTextTab = 'bot.knowledge.select.list.modal.text.tab',
  BotKnowledgeSelectListModalTableTab = 'bot.knowledge.select.list.modal.table.tab',
  BotKnowledgeSelectListModalPhotoTab = 'bot.knowledge.select.list.modal.photo.tab',
  BotKnowledgeSelectListModalName = 'bot.knowledge.select.list.modal.name.text',
  BotKnowledgeSelectListModalAddBtn = 'bot.knowledge.select.list.modal.add.btn',
  /** variable */
  BotVariableAddModalNameInput = 'bot.variable.add.modal.name.input',
  BotVariableAddModalDefaultValueInput = 'bot.variable.add.modal.default_value.input',
  BotVariableAddModalDescInput = 'bot.variable.add.modal.desc.input',
  BotVariableAddModalDelBtn = 'bot.variable.add.modal.del.btn',
  BotVariableAddModalSwitch = 'bot.variable.add.modal.switch',
  BotVariableAddModalNameText = 'bot.variable.add.modal.name.text',
  BotVariableAddModalDefaultValueText = 'bot.variable.add.modal.default_value.text',
  BotVariableAddModalDescText = 'bot.variable.add.modal.desc.text',
  BotVariableAddModalAddBtn = 'bot.variable.add.modal.add.btn',
  BotVariableAddModalSaveBtn = 'bot.variable.add.modal.save.btn',
  BotVariableAddModalCancelBtn = 'bot.variable.add.modal.cancel.btn',
  /** variable-debug */
  BotVariableDebugModalNameText = 'bot.variable.debug.modal.name.text',
  BotVariableDebugModalValueInput = 'bot.variable.debug.modal.value.input',
  BotVariableDebugModalEditDateText = 'bot.variable.debug.modal.edit_date.text',
  BotVariableDebugModalNameTitleText = 'bot.variable.debug.modal.name.title.text',
  BotVariableDebugModalValueTitleText = 'bot.variable.debug.modal.value.title.text',
  BotVariableDebugModalEditDateTitleText = 'bot.variable.debug.modal.edit_date.title.text',
  BotVariableDebugModalResetBtn = 'bot.variable.debug.modal.reset.btn',
  /** Ltm-debug */
  BotLtmDebugModalResetBtn = 'bot.ltm.debug.modal.reset.btn',
  /** database */
  BotDatabaseAddModalTitle = 'bot.database.add.modal.title.text',
  BotDatabaseAddModalTitleCreateAiBtn = 'bot.database.add.modal.title.create_ai.btn',
  BotDatabaseAddModalTitleCreateAiModalTitle = 'bot.database.add.modal.title.create_ai.modal.title.text',
  BotDatabaseAddModalTitleCreateAiModalDesc = 'bot.database.add.modal.title.create_ai.modal.desc.input',
  BotDatabaseAddModalTitleCreateAiModalCreateBtn = 'bot.database.add.modal.title.create_ai.modal.create.btn',
  BotDatabaseAddModalTitleCloseIcon = 'bot.database.add.modal.title.close.icon',
  BotDatabaseAddModalAddCustomBtn = 'bot.database.add.modal.add_custom.btn',
  BotDatabaseAddModalTemplateTitle = 'bot.database.add.modal.template.title.text',
  BotDatabaseAddModalUseTemplateBtn = 'bot.database.add.modal.use_template.btn',
  BotDatabaseAddModalPreviewTemplateBtn = 'bot.database.add.modal.preview_template.btn',
  BotDatabaseAddModalTableNameInput = 'bot.database.add.modal.table_name.input',
  BotDatabaseAddModalTableDescInput = 'bot.database.add.modal.table_desc.input',
  BotDatabaseAddModalTableQueryModeSelect = 'bot.database.add.modal.table_query_mode.select',
  BotDatabaseAddModalFieldNameInput = 'bot.database.add.modal.field_name.input',
  BotDatabaseAddModalFieldDescInput = 'bot.database.add.modal.field_desc.input',
  BotDatabaseAddModalFieldTypeSelect = 'bot.database.add.modal.field_type.select',
  BotDatabaseAddModalFieldRequiredSwitch = 'bot.database.add.modal.field_required.switch',
  BotDatabaseAddModalFieldDelBtn = 'bot.database.add.modal.field_del.btn',
  BotDatabaseAddModalAddBtn = 'bot.database.add.modal.add.btn',
  BotDatabaseAddModalSubmitBtn = 'bot.database.add.modal.submit.btn',
  BotDatabaseEditTableStructureBtn = 'bot.database.edit_table_structure.btn',
  /** database-debug */
  BotDatabaseDebugModalTableNameTab = 'bot.database.debug.modal.table_name.tab',
  BotDatabaseDebugModalResetBtn = 'bot.database.debug.modal.reset.btn',
  /** memory */
  BotMemoryDebugBtn = 'bot.memory_debug.btn',
  BotMemoryDebugDropdownItem = 'bot.memory_debug.dropdown',
  BotMemoryDebugModalTab = 'bot.memory_debug.modal.tab',
  // BotMemoryModalVariableTab = 'bot.memory.modal.variable.tab',
  // BotMemoryModalDatabaseTab = 'bot.memory.modal.database.tab',
  // BotMemoryModalLtmTab = 'bot.memory.modal.ltm.tab',
}
