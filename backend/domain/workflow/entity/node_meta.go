package entity

type NodeTypeMeta struct {
	ID           int64    `json:"id"`
	Name         string   `json:"name"`
	Type         NodeType `json:"type"`
	Category     string   `json:"category"`
	Color        string   `json:"color"`
	Desc         string   `json:"desc"`
	IconURL      string   `json:"icon_url"`
	IsComposite  bool     `json:"is_composite"`
	SupportBatch bool     `json:"support_batch"`
}

type PluginNodeMeta struct {
	PluginID int64    `json:"plugin_id"`
	NodeType NodeType `json:"node_type"`
	Category string   `json:"category"`
	ApiID    int64    `json:"api_id"`
	ApiName  string   `json:"api_name"`
	Name     string   `json:"name"`
	Desc     string   `json:"desc"`
	IconURL  string   `json:"icon_url"`
}

type PluginCategoryMeta struct {
	PluginCategoryMeta int64    `json:"plugin_category_meta"`
	NodeType           NodeType `json:"node_type"`
	Category           string   `json:"category"`
	Name               string   `json:"name"`
	OnlyOfficial       bool     `json:"only_official"`
	IconURL            string   `json:"icon_url"`
}
