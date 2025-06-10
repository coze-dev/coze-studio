package entity

// NodeTypeMetas holds the metadata for all available node types.
// It is initialized with built-in types and potentially extended by loading from external sources.
var NodeTypeMetas = []*NodeTypeMeta{
	{
		ID:           1,
		Name:         "Start",
		Type:         NodeTypeEntry,
		Category:     "Input&Output", // Mapped from cate_list
		Desc:         "The starting node of the workflow, used to set the information needed to initiate the workflow.",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
		PostFillNil:  true,
	},
	{
		ID:              2,
		Name:            "End",
		Type:            NodeTypeExit,
		Category:        "Input&Output", // Mapped from cate_list
		Desc:            "The final node of the workflow, used to return the result information after the workflow runs.",
		Color:           "#5C62FF",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 1
		PreFillZero:     true,
		CallbackEnabled: true,
	},
	{
		ID:               3,
		Name:             "LLM",
		Type:             NodeTypeLLM,
		Category:         "", // Mapped from cate_list
		Desc:             "Invoke the large language model, generate responses using variables and prompt words.",
		Color:            "#5C62FF",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
		IsComposite:      false,
		SupportBatch:     true,          // supportBatch: 2
		DefaultTimeoutMS: 3 * 60 * 1000, // 3 minutes
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               4,
		Name:             "Plugin",
		Type:             NodeTypePlugin,
		Category:         "", // Mapped from cate_list
		Desc:             "Used to access external real-time data and perform operations",
		Color:            "#CA61FF",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Plugin-v2.jpg",
		IsComposite:      false,
		SupportBatch:     true,          // supportBatch: 2
		DefaultTimeoutMS: 3 * 60 * 1000, // 3 minutes
		PreFillZero:      true,
		PostFillNil:      true,
	},
	{
		ID:               5,
		Name:             "Code",
		Type:             NodeTypeCodeRunner,
		Category:         "Logic", // Mapped from cate_list
		Desc:             "Write code to process input variables to generate return values.",
		Color:            "#00B2B2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Code-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               6,
		Name:             "Knowledge retrieval",
		Type:             NodeTypeKnowledgeRetriever,
		Category:         "Data", // Mapped from cate_list
		Desc:             "In the selected knowledge, the best matching information is recalled based on the input variable and returned as an Array.",
		Color:            "#FF811A",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeQuery-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
	},
	{
		ID:              8,
		Name:            "Condition",
		Type:            NodeTypeSelector,
		Category:        "Logic", // Mapped from cate_list
		Desc:            "Connect multiple downstream branches. Only the corresponding branch will be executed if the set conditions are met. If none are met, only the 'else' branch will be executed.",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Condition-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 1
		CallbackEnabled: true,
	},
	{
		ID:              9,
		Name:            "Workflow",
		Type:            NodeTypeSubWorkflow,
		Category:        "", // Mapped from cate_list
		Desc:            "Add published workflows to execute subtasks",
		Color:           "#00B83E",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Workflow-v2.jpg",
		IsComposite:     false, // Assuming false as it's not explicitly composite like Loop/Batch
		SupportBatch:    true,  // supportBatch: 2
		CallbackEnabled: true,
	},
	{
		ID:               12,
		Name:             "SQL Customization",
		Type:             NodeTypeDatabaseCustomSQL,
		Category:         "Database", // Mapped from cate_list
		Desc:             "Complete the operations of adding, deleting, modifying and querying the database based on user-defined SQL",
		Color:            "#FF811A",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Database-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 2
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
	},
	{
		ID:              13,
		Name:            "Output",
		Type:            NodeTypeOutputEmitter,
		Category:        "Input&Output", // Mapped from cate_list
		Desc:            "The node is renamed from \"message\" to \"output\", Supports message output in the intermediate process and streaming and non-streaming methods",
		Color:           "#5C62FF",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Output-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false,
		PreFillZero:     true,
		CallbackEnabled: true,
	},
	{
		ID:              15,
		Name:            "Text Processing",
		Type:            NodeTypeTextProcessor,
		Category:        "Utilities", // Mapped from cate_list
		Desc:            "The format used for handling multiple string-type variables.",
		Color:           "#3071F2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-StrConcat-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 2
		PreFillZero:     true,
		CallbackEnabled: true,
	},
	{
		ID:               18,
		Name:             "Question",
		Type:             NodeTypeQuestionAnswer,
		Category:         "Utilities", // Mapped from cate_list
		Desc:             "Support asking questions to the user in the middle of the conversation, with both preset options and open-ended questions",
		Color:            "#3071F2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Direct-Question-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:           19,
		Name:         "Break",
		Type:         NodeTypeBreak,
		Category:     "Logic", // Mapped from cate_list
		Desc:         "Used to immediately terminate the current loop and jump out of the loop",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Break-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           20,
		Name:         "Set Variable",
		Type:         NodeTypeVariableAssignerWithinLoop,
		Category:     "Logic", // Mapped from cate_list
		Desc:         "Used to reset the value of the loop variable so that it uses the reset value in the next iteration",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LoopSetVariable-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:               21,
		Name:             "Loop",
		Type:             NodeTypeLoop,
		Category:         "Logic", // Mapped from cate_list
		Desc:             "Used to repeatedly execute a series of tasks by setting the number of iterations and logic",
		Color:            "#00B2B2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Loop-v2.jpg",
		IsComposite:      true,      // Assuming true based on functionality
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               22,
		Name:             "Intent recognition",
		Type:             NodeTypeIntentDetector,
		Category:         "Logic", // Mapped from cate_list
		Desc:             "Used for recognizing the intent in user input and matching it with preset intent options.",
		Color:            "#00B2B2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Intent-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               27,
		Name:             "Knowledge writing",
		Type:             NodeTypeKnowledgeIndexer,
		Category:         "Data", // Mapped from cate_list
		Desc:             "The write node can add a knowledge base of type text. Only one knowledge base can be added.",
		Color:            "#FF811A",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeWriting-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
	},
	{
		ID:               28,
		Name:             "Batch",
		Type:             NodeTypeBatch,
		Category:         "Logic", // Mapped from cate_list
		Desc:             "By setting the number of batch runs and logic, run the tasks in the batch body.",
		Color:            "#00B2B2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Batch-v2.jpg",
		IsComposite:      true,      // Assuming true based on functionality
		SupportBatch:     false,     // supportBatch: 1 (Corrected from previous assumption)
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:           29,
		Name:         "Continue",
		Type:         NodeTypeContinue,
		Category:     "Logic", // Mapped from cate_list
		Desc:         "Used to immediately terminate the current loop and execute next loop",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Continue-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           30,
		Name:         "Input",
		Type:         NodeTypeInputReceiver,
		Category:     "Input&Output", // Mapped from cate_list
		Desc:         "Support intermediate information input",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Input-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
		PostFillNil:  true,
	},
	{
		ID:           31,
		Name:         "注释",
		Type:         "",
		Category:     "",             // Not found in cate_list
		Desc:         "comment_desc", // Placeholder from JSON
		Color:        "",
		IconURL:      "comment_icon", // Placeholder from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:              32,
		Name:            "Variable Merge",
		Type:            NodeTypeVariableAggregator,
		Category:        "Logic", // Mapped from cate_list
		Desc:            "Aggregate the outputs of multiple branches.",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/VariableMerge-icon.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 1
		PostFillNil:     true,
		CallbackEnabled: true,
	},
	{
		ID:           37,
		Name:         "Query message list",
		Type:         NodeTypeMessageList,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "Used to query the message list",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-List.jpeg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
		PreFillZero:  true,
		PostFillNil:  true,
		Disabled:     true,
	},
	{
		ID:           38,
		Name:         "Clear conversation history",
		Type:         NodeTypeClearMessage,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "Used to clear conversation history. After clearing, the conversation history visible to the LLM node will be empty.",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Delete.jpeg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
		PreFillZero:  true,
		PostFillNil:  true,
		Disabled:     true,
	},
	{
		ID:           39,
		Name:         "Create conversation",
		Type:         NodeTypeCreateConversation,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "This node is used to create a conversation.",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Create.jpeg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
		PreFillZero:  true,
		PostFillNil:  true,
		Disabled:     true,
	},
	{
		ID:           40,
		Name:         "Variable assign",
		Type:         NodeTypeVariableAssigner,
		Category:     "Data", // Mapped from cate_list
		Desc:         "Assigns values to variables that support the write operation, including app and user variables.",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/Variable.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:               42,
		Name:             "Update Data",
		Type:             NodeTypeDatabaseUpdate,
		Category:         "Database", // Mapped from cate_list
		Desc:             "Modify the existing data records in the table, and the user specifies the update conditions and contents to update the data",
		Color:            "#F2B600",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-update.jpg", // Corrected Icon URL from JSON
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               43,
		Name:             "Query Data", // Corrected Name from JSON (was "插入数据")
		Type:             NodeTypeDatabaseQuery,
		Category:         "Database",                                                                                                                                 // Mapped from cate_list
		Desc:             "Query data from the table, and the user can define query conditions, select columns, etc., and output the data that meets the conditions", // Corrected Desc from JSON
		Color:            "#F2B600",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icaon-database-select.jpg", // Corrected Icon URL from JSON
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               44,
		Name:             "Delete Data",
		Type:             NodeTypeDatabaseDelete,
		Category:         "Database",                                                                                                                          // Mapped from cate_list
		Desc:             "Delete data records from the table, and the user specifies the deletion conditions to delete the records that meet the conditions", // Corrected Desc from JSON
		Color:            "#F2B600",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-delete.jpg", // Corrected Icon URL from JSON
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               45,
		Name:             "HTTP request",
		Type:             NodeTypeHTTPRequester,
		Category:         "Utilities",                                                           // Mapped from cate_list
		Desc:             "It is used to send API requests and return data from the interface.", // Corrected Desc from JSON
		Color:            "#3071F2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-HTTP.png", // Corrected Icon URL from JSON
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
	},
	{
		ID:               46,
		Name:             "Add Data", // Corrected Name from JSON (was "查询数据")
		Type:             NodeTypeDatabaseInsert,
		Category:         "Database",                                                                                                    // Mapped from cate_list
		Desc:             "Add new data records to the table, and insert them into the database after the user enters the data content", // Corrected Desc from JSON
		Color:            "#F2B600",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-insert.jpg", // Corrected Icon URL from JSON
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		CallbackEnabled:  true,
	},
	// --- End of nodes parsed from template_list ---
}

// PluginNodeMetas holds metadata for specific plugin API entity.
var PluginNodeMetas []*PluginNodeMeta

// PluginCategoryMetas holds metadata for plugin category entity.
var PluginCategoryMetas []*PluginCategoryMeta

func NodeMetaByNodeType(t NodeType) *NodeTypeMeta {
	for _, meta := range NodeTypeMetas {
		if meta.Type == t {
			return meta
		}
	}

	return nil
}
