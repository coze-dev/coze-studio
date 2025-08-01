struct DocTableSheet {
    1: i64 id;            // Number of sheet
    2: string sheet_name; // Sheet name
    3: i64 total_row;     // total number of rows
}

enum ColumnType {
    Unknown = 0
    Text   = 1                  // Text
    Number = 2                  // number
    Date   = 3                  // time
    Float   = 4                 // float
    Boolean = 5                 // bool
    Image   = 6                 // picture
}

// Table column information
struct DocTableColumn {
    1: i64      id(agw.js_conv="str", api.js_conv="true", api.body="id");            // Column ID
    2: string   column_name;   // column_name
    3: bool     is_semantic;   // Is it a semantically matched column?
    4: i64      sequence(agw.js_conv="str", api.js_conv="true", api.body="sequence");      // List the serial number originally in excel
    5: optional ColumnType column_type; // column type
    6: optional bool contains_empty_value
    7: optional string   desc;          // describe
}