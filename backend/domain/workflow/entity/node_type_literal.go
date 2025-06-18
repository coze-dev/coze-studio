package entity

// NodeTypeMetas holds the metadata for all available node types.
// It is initialized with built-in types and potentially extended by loading from external sources.
var NodeTypeMetas = []*NodeTypeMeta{
	{
		ID:           1,
		Name:         "开始",
		Type:         NodeTypeEntry,
		Category:     "输入&输出", // Mapped from cate_list
		Desc:         "工作流的起始节点，用于设定启动工作流需要的信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
		PostFillNil:  true,
	},
	{
		ID:              2,
		Name:            "结束",
		Type:            NodeTypeExit,
		Category:        "输入&输出", // Mapped from cate_list
		Desc:            "工作流的最终节点，用于返回工作流运行后的结果信息",
		Color:           "#5C62FF",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 1
		PreFillZero:     true,
		CallbackEnabled: true,
	},
	{
		ID:               3,
		Name:             "大模型",
		Type:             NodeTypeLLM,
		Category:         "", // Mapped from cate_list
		Desc:             "调用大语言模型,使用变量和提示词生成回复",
		Color:            "#5C62FF",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
		IsComposite:      false,
		SupportBatch:     true,          // supportBatch: 2
		DefaultTimeoutMS: 3 * 60 * 1000, // 3 minutes
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
		MayUseChatModel:  true,
	},
	{
		ID:               4,
		Name:             "插件",
		Type:             NodeTypePlugin,
		Category:         "", // Mapped from cate_list
		Desc:             "通过添加工具访问实时数据和执行外部操作",
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
		Name:             "代码",
		Type:             NodeTypeCodeRunner,
		Category:         "业务逻辑", // Mapped from cate_list
		Desc:             "编写代码，处理输入变量来生成返回值",
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
		Name:             "知识库检索",
		Type:             NodeTypeKnowledgeRetriever,
		Category:         "知识库&数据", // Mapped from cate_list
		Desc:             "在选定的知识中,根据输入变量召回最匹配的信息,并以列表形式返回",
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
		Name:            "选择器",
		Type:            NodeTypeSelector,
		Category:        "业务逻辑", // Mapped from cate_list
		Desc:            "连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行“否则”分支",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Condition-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 1
		CallbackEnabled: true,
	},
	{
		ID:              9,
		Name:            "工作流",
		Type:            NodeTypeSubWorkflow,
		Category:        "", // Mapped from cate_list
		Desc:            "集成已发布工作流，可以执行嵌套子任务",
		Color:           "#00B83E",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Workflow-v2.jpg",
		IsComposite:     false, // Assuming false as it's not explicitly composite like Loop/Batch
		SupportBatch:    true,  // supportBatch: 2
		CallbackEnabled: true,
	},
	{
		ID:               12,
		Name:             "SQL自定义",
		Type:             NodeTypeDatabaseCustomSQL,
		Category:         "数据库", // Mapped from cate_list
		Desc:             "基于用户自定义的 SQL 完成对数据库的增删改查操作",
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
		Name:            "输出",
		Type:            NodeTypeOutputEmitter,
		Category:        "输入&输出", // Mapped from cate_list
		Desc:            "节点从“消息”更名为“输出”，支持中间过程的消息输出，支持流式和非流式两种方式",
		Color:           "#5C62FF",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Output-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false,
		PreFillZero:     true,
		CallbackEnabled: true,
	},
	{
		ID:              15,
		Name:            "文本处理",
		Type:            NodeTypeTextProcessor,
		Category:        "组件", // Mapped from cate_list
		Desc:            "用于处理多个字符串类型变量的格式",
		Color:           "#3071F2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-StrConcat-v2.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 2
		PreFillZero:     true,
		CallbackEnabled: true,
	},
	{
		ID:               18,
		Name:             "问答",
		Type:             NodeTypeQuestionAnswer,
		Category:         "组件", // Mapped from cate_list
		Desc:             "支持中间向用户提问问题,支持预置选项提问和开放式问题提问两种方式",
		Color:            "#3071F2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Direct-Question-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
		MayUseChatModel:  true,
	},
	{
		ID:           19,
		Name:         "终止循环",
		Type:         NodeTypeBreak,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "用于立即终止当前所在的循环，跳出循环体",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Break-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           20,
		Name:         "设置变量",
		Type:         NodeTypeVariableAssignerWithinLoop,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "用于重置循环变量的值，使其下次循环使用重置后的值",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LoopSetVariable-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:               21,
		Name:             "循环",
		Type:             NodeTypeLoop,
		Category:         "业务逻辑", // Mapped from cate_list
		Desc:             "用于通过设定循环次数和逻辑，重复执行一系列任务",
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
		Name:             "意图识别",
		Type:             NodeTypeIntentDetector,
		Category:         "业务逻辑", // Mapped from cate_list
		Desc:             "用于用户输入的意图识别，并将其与预设意图选项进行匹配。",
		Color:            "#00B2B2",
		IconURL:          "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Intent-v2.jpg",
		IsComposite:      false,
		SupportBatch:     false,     // supportBatch: 1
		DefaultTimeoutMS: 60 * 1000, // 1 minute
		PreFillZero:      true,
		PostFillNil:      true,
		CallbackEnabled:  true,
		MayUseChatModel:  true,
	},
	{
		ID:               27,
		Name:             "知识库写入",
		Type:             NodeTypeKnowledgeIndexer,
		Category:         "知识库&数据", // Mapped from cate_list
		Desc:             "写入节点可以添加 文本类型 的知识库，仅可以添加一个知识库",
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
		Name:             "批处理",
		Type:             NodeTypeBatch,
		Category:         "业务逻辑", // Mapped from cate_list
		Desc:             "通过设定批量运行次数和逻辑，运行批处理体内的任务",
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
		Name:         "继续循环",
		Type:         NodeTypeContinue,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "用于终止当前循环，执行下次循环",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Continue-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           30,
		Name:         "输入",
		Type:         NodeTypeInputReceiver,
		Category:     "输入&输出", // Mapped from cate_list
		Desc:         "支持中间过程的信息输入",
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
		Name:            "变量聚合",
		Type:            NodeTypeVariableAggregator,
		Category:        "业务逻辑", // Mapped from cate_list
		Desc:            "对多个分支的输出进行聚合处理",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/VariableMerge-icon.jpg",
		IsComposite:     false,
		SupportBatch:    false, // supportBatch: 1
		PostFillNil:     true,
		CallbackEnabled: true,
	},
	{
		ID:           37,
		Name:         "查询消息列表",
		Type:         NodeTypeMessageList,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "用于查询消息列表",
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
		Name:         "清除上下文",
		Type:         NodeTypeClearMessage,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "用于清空会话历史，清空后LLM看到的会话历史为空",
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
		Name:         "创建会话",
		Type:         NodeTypeCreateConversation,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "用于创建会话",
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
		Name:         "变量赋值",
		Type:         NodeTypeVariableAssigner,
		Category:     "知识库&数据", // Mapped from cate_list
		Desc:         "用于给支持写入的变量赋值，包括应用变量、用户变量",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/Variable.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:               42,
		Name:             "更新数据",
		Type:             NodeTypeDatabaseUpdate,
		Category:         "数据库", // Mapped from cate_list
		Desc:             "修改表中已存在的数据记录，用户指定更新条件和内容来更新数据",
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
		Name:             "查询数据", // Corrected Name from JSON (was "插入数据")
		Type:             NodeTypeDatabaseQuery,
		Category:         "数据库",                             // Mapped from cate_list
		Desc:             "从表获取数据，用户可定义查询条件、选择列等，输出符合条件的数据", // Corrected Desc from JSON
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
		Name:             "删除数据",
		Type:             NodeTypeDatabaseDelete,
		Category:         "数据库",                          // Mapped from cate_list
		Desc:             "从表中删除数据记录，用户指定删除条件来删除符合条件的记录", // Corrected Desc from JSON
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
		Name:             "HTTP 请求",
		Type:             NodeTypeHTTPRequester,
		Category:         "组件",                // Mapped from cate_list
		Desc:             "用于发送API请求，从接口返回数据", // Corrected Desc from JSON
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
		Name:             "新增数据", // Corrected Name from JSON (was "查询数据")
		Type:             NodeTypeDatabaseInsert,
		Category:         "数据库",                      // Mapped from cate_list
		Desc:             "向表添加新数据记录，用户输入数据内容后插入数据库", // Corrected Desc from JSON
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
