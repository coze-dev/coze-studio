struct DocTableSheet {
    1: i64 id;            // sheet 的编号
    2: string sheet_name; // sheet 名
    3: i64 total_row;     // 总行数
}

enum ColumnType {
    Unknown = 0
    Text   = 1                  // 文本
    Number = 2                  // 数字
    Date   = 3                  // 时间
    Float   = 4                 // float
    Boolean = 5                 // bool
    Image   = 6                 // 图片
}

// 表格的列信息
struct DocTableColumn {
    1: i64      id(agw.js_conv="str", api.js_conv="true", api.body="id");            // 列 id
    2: string   column_name;   // 列名
    3: bool     is_semantic;   // 是否为语义匹配列
    4: i64      sequence(agw.js_conv="str", api.js_conv="true", api.body="sequence");      // 列原本在 excel 的序号
    5: optional ColumnType column_type; // 列类型
    6: optional bool contains_empty_value
    7: optional string   desc;          // 描述
}