package service

import "code.byted.org/flow/opencoze/backend/domain/workflow/entity"

// nodeTypeMetas holds the metadata for all available node types.
// It is initialized with built-in types and potentially extended by loading from external sources.
var nodeTypeMetas = []*entity.NodeTypeMeta{
	{
		ID:           1,
		Name:         "开始",
		Type:         1,
		Category:     "输入&输出", // Mapped from cate_list
		Desc:         "工作流的起始节点，用于设定启动工作流需要的信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           2,
		Name:         "结束",
		Type:         2,
		Category:     "输入&输出", // Mapped from cate_list
		Desc:         "工作流的最终节点，用于返回工作流运行后的结果信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           3,
		Name:         "大模型",
		Type:         3,
		Category:     "", // Mapped from cate_list
		Desc:         "调用大语言模型,使用变量和提示词生成回复",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
		IsComposite:  false,
		SupportBatch: true, // supportBatch: 2
	},
	{
		ID:           4,
		Name:         "插件",
		Type:         4,
		Category:     "", // Mapped from cate_list
		Desc:         "通过添加工具访问实时数据和执行外部操作",
		Color:        "#CA61FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Plugin-v2.jpg",
		IsComposite:  false,
		SupportBatch: true, // supportBatch: 2
	},
	{
		ID:           5,
		Name:         "代码",
		Type:         5,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "编写代码，处理输入变量来生成返回值",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Code-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           6,
		Name:         "知识库检索",
		Type:         6,
		Category:     "知识库&数据", // Mapped from cate_list
		Desc:         "在选定的知识中,根据输入变量召回最匹配的信息,并以列表形式返回",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeQuery-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           8,
		Name:         "选择器",
		Type:         8,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行“否则”分支",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Condition-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           9,
		Name:         "工作流",
		Type:         9,
		Category:     "", // Mapped from cate_list
		Desc:         "集成已发布工作流，可以执行嵌套子任务",
		Color:        "#00B83E",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Workflow-v2.jpg",
		IsComposite:  false, // Assuming false as it's not explicitly composite like Loop/Batch
		SupportBatch: true,  // supportBatch: 2
	},
	{
		ID:           11,
		Name:         "变量",
		Type:         11,
		Category:     "知识库&数据", // Mapped from cate_list
		Desc:         "变量节点已下线，读取变量可在任意节点的输入-变量值直接引用变量；写入变量请使用新的「变量赋值」节点",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Variable-v2.jpg",
		IsComposite:  false,
		SupportBatch: true, // supportBatch: 2
	},
	{
		ID:           12,
		Name:         "SQL自定义",
		Type:         12,
		Category:     "数据库", // Mapped from cate_list
		Desc:         "基于用户自定义的 SQL 完成对数据库的增删改查操作",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Database-v2.jpg",
		IsComposite:  false,
		SupportBatch: true, // supportBatch: 2
	},
	{
		ID:           13,
		Name:         "输出",
		Type:         13,
		Category:     "输入&输出", // Mapped from cate_list
		Desc:         "节点从“消息”更名为“输出”，支持中间过程的消息输出，支持流式和非流式两种方式",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Output-v2.jpg",
		IsComposite:  false,
		SupportBatch: true, // supportBatch: 2
	},
	{
		ID:           14,
		Name:         "图像流",
		Type:         14,
		Category:     "", // Not found in cate_list
		Desc:         "集成已发布图像流，可以执行嵌套子任务",
		Color:        "",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Imageflow1.png",
		IsComposite:  false, // Assuming false
		SupportBatch: true,  // supportBatch: 2
	},
	{
		ID:           15,
		Name:         "文本处理",
		Type:         15,
		Category:     "组件", // Mapped from cate_list
		Desc:         "用于处理多个字符串类型变量的格式",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-StrConcat-v2.jpg",
		IsComposite:  false,
		SupportBatch: true, // supportBatch: 2
	},
	{
		ID:           16,
		Name:         "图像生成",
		Type:         16,
		Category:     "图像处理", // Mapped from cate_list
		Desc:         "通过文字描述/添加参考图生成图片",
		Color:        "#FF4DC3",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-ImageGeneration-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           17,
		Name:         "图像参考",
		Type:         17,
		Category:     "", // Not found in cate_list
		Desc:         "为图像生成添加参考图，并设定参考条件",
		Color:        "",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon_Reference.png",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           18,
		Name:         "问答",
		Type:         18,
		Category:     "组件", // Mapped from cate_list
		Desc:         "支持中间向用户提问问题,支持预置选项提问和开放式问题提问两种方式",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Direct-Question-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           19,
		Name:         "终止循环",
		Type:         19,
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
		Type:         20,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "用于重置循环变量的值，使其下次循环使用重置后的值",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LoopSetVariable-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           21,
		Name:         "循环",
		Type:         21,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "用于通过设定循环次数和逻辑，重复执行一系列任务",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Loop-v2.jpg",
		IsComposite:  true,  // Assuming true based on functionality
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           22,
		Name:         "意图识别",
		Type:         22,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "用于用户输入的意图识别，并将其与预设意图选项进行匹配。",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Intent-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           23,
		Name:         "画板",
		Type:         23,
		Category:     "图像处理", // Mapped from cate_list
		Desc:         "自定义画板排版，支持引用添加文本和图片",
		Color:        "#FF4DC3",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon_DrawingBoard_v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           24,
		Name:         "场景变量",
		Type:         24,
		Category:     "", // Not found in cate_list
		Desc:         "用于读写场景中设置的变量",
		Color:        "",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Variable.png",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           25,
		Name:         "对话编排",
		Type:         25,
		Category:     "", // Not found in cate_list
		Desc:         "发起一轮对话，可指定发言人和发言内容",
		Color:        "",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-SceneChat.png",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           26,
		Name:         "长期记忆",
		Type:         26,
		Category:     "知识库&数据", // Mapped from cate_list
		Desc:         "用于调用长期记忆，获取用户的个性化信息，智能体必须打开长期记忆",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LTM-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           27,
		Name:         "知识库写入",
		Type:         27,
		Category:     "知识库&数据", // Mapped from cate_list
		Desc:         "写入节点可以添加 文本类型 的知识库，仅可以添加一个知识库",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeWriting-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           28,
		Name:         "批处理",
		Type:         28,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "通过设定批量运行次数和逻辑，运行批处理体内的任务",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Batch-v2.jpg",
		IsComposite:  true,  // Assuming true based on functionality
		SupportBatch: false, // supportBatch: 1 (Corrected from previous assumption)
	},
	{
		ID:           29,
		Name:         "继续循环",
		Type:         29,
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
		Type:         30,
		Category:     "输入&输出", // Mapped from cate_list
		Desc:         "支持中间过程的信息输入",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Input-v2.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           31,
		Name:         "注释",
		Type:         31,
		Category:     "",             // Not found in cate_list
		Desc:         "comment_desc", // Placeholder from JSON
		Color:        "",
		IconURL:      "comment_icon", // Placeholder from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           32,
		Name:         "变量聚合",
		Type:         32,
		Category:     "业务逻辑", // Mapped from cate_list
		Desc:         "对多个分支的输出进行聚合处理",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/VariableMerge-icon.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           34,
		Name:         "设置定时触发器",
		Type:         34,
		Category:     "触发器", // Mapped from cate_list
		Desc:         "用于配置用户的自动化定时任务，确保按时执行特定操作。",
		Color:        "#8E4EFF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-upsert_trigger.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           35,
		Name:         "删除定时触发器",
		Type:         35,
		Category:     "触发器", // Mapped from cate_list
		Desc:         "用于移除用户已配置的定时触发任务",
		Color:        "#8E4EFF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-delete_trigger.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           36,
		Name:         "查询定时触发器",
		Type:         36,
		Category:     "触发器", // Mapped from cate_list
		Desc:         "用于查询用户已配置的定时触发任务。",
		Color:        "#8E4EFF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-query_trigger.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           37,
		Name:         "查询消息列表",
		Type:         37,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "用于查询消息列表",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-List.jpeg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           38,
		Name:         "清除上下文",
		Type:         38,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "用于清空会话历史，清空后LLM看到的会话历史为空",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Delete.jpeg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           39,
		Name:         "创建会话",
		Type:         39,
		Category:     "会话管理", // Mapped from cate_list
		Desc:         "用于创建会话",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Create.jpeg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           40,
		Name:         "变量赋值",
		Type:         40,
		Category:     "知识库&数据", // Mapped from cate_list
		Desc:         "用于给支持写入的变量赋值，包括应用变量、用户变量",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/Variable.jpg",
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           42,
		Name:         "更新数据",
		Type:         42,
		Category:     "数据库", // Mapped from cate_list
		Desc:         "修改表中已存在的数据记录，用户指定更新条件和内容来更新数据",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-update.jpg", // Corrected Icon URL from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           43,
		Name:         "查询数据", // Corrected Name from JSON (was "插入数据")
		Type:         43,
		Category:     "数据库",                                                      // Mapped from cate_list
		Desc:         "从表获取数据，用户可定义查询条件、选择列等，输出符合条件的数据", // Corrected Desc from JSON
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icaon-database-select.jpg", // Corrected Icon URL from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           44,
		Name:         "删除数据",
		Type:         44,
		Category:     "数据库",                                                  // Mapped from cate_list
		Desc:         "从表中删除数据记录，用户指定删除条件来删除符合条件的记录", // Corrected Desc from JSON
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-delete.jpg", // Corrected Icon URL from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           45,
		Name:         "HTTP 请求",
		Type:         45,
		Category:     "组件",                           // Mapped from cate_list
		Desc:         "用于发送API请求，从接口返回数据", // Corrected Desc from JSON
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-HTTP.png", // Corrected Icon URL from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	{
		ID:           46,
		Name:         "新增数据", // Corrected Name from JSON (was "查询数据")
		Type:         46,
		Category:     "数据库",                                          // Mapped from cate_list
		Desc:         "向表添加新数据记录，用户输入数据内容后插入数据库", // Corrected Desc from JSON
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-insert.jpg", // Corrected Icon URL from JSON
		IsComposite:  false,
		SupportBatch: false, // supportBatch: 1
	},
	// --- End of nodes parsed from template_list ---
}

// pluginNodeMetas holds metadata for specific plugin API nodes.
var pluginNodeMetas = []*entity.PluginNodeMeta{
	{
		PluginID: 7438919188246413347, // From plugin_id
		NodeType: 4,                   // From node_type (converted string "4" to int)
		Category: "图像处理",          // Mapped from cate_list using plugin_api_id_list
		ApiID:    7438919188246429731, // From api_id (converted string to int64)
		ApiName:  "cutout",
		Name:     "抠图",
		Desc:     "保留图片前景主体，输出透明背景(.png)",
		IconURL:  "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-plugin-cutout-v2.jpg",
	},
	{
		PluginID: 7439197952104710144, // From plugin_id
		NodeType: 4,                   // From node_type (converted string "4" to int)
		Category: "图像处理",          // Mapped from cate_list using plugin_api_id_list
		ApiID:    7439197952104726528, // From api_id (converted string to int64)
		ApiName:  "sd_better_prompt",
		Name:     "提示词优化",
		Desc:     "智能优化图像提示词",
		IconURL:  "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-plugin-better_prompt-v2.jpg",
	},
	{
		PluginID: 7438835880728526898, // From plugin_id
		NodeType: 4,                   // From node_type (converted string "4" to int)
		Category: "图像处理",          // Mapped from cate_list using plugin_api_id_list
		ApiID:    7438835880728543282, // From api_id (converted string to int64)
		ApiName:  "image_quality_improve",
		Name:     "画质提升",
		Desc:     "提升图像清晰度",
		IconURL:  "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-plugin-quality_improve-v2.jpg",
	},
}

// pluginCategoryMetas holds metadata for plugin category nodes.
var pluginCategoryMetas = []*entity.PluginCategoryMeta{
	{
		PluginCategoryMeta: 7327137275714748453, // From plugin_category_id (converted string to int64)
		NodeType:           4,                   // From node_type (converted string "4" to int)
		Category:           "图像处理",          // Mapped from cate_list using plugin_category_id_list
		Name:               "更多图像插件",
		OnlyOfficial:       true,
		IconURL:            "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-plugin_category-image-v2.jpg",
	},
}
