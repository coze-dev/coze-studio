namespace go data.knowledge

// type
enum FormatType {
    Text  = 0  // Text
    Table = 1  // table
    Image = 2  // image
    Database = 3 // database
}

struct ChunkStrategy {
    1: string separator   // A separator, such as a period
    2: i64    max_tokens  // Maximum number of tokens for sharding
    3: bool   remove_extra_spaces  // Replace consecutive spaces, newlines, and tabs
    4: bool   remove_urls_emails   // Remove URL and email
    5: ChunkType chunk_type        // If 0, the configuration of the above fields is not used
    7: optional CaptionType caption_type    // Image type, image description text annotation method
    8: optional i64    overlap;      //segmented overlap
    9: optional i64    max_level;    //Maximum number of levels (effective when segmented by level)
    10: optional bool   save_title;   //Slice preserves level headers (effective when segmented by level)
}

enum ChunkType{
    DefaultChunk = 0
    CustomChunk = 1
    LevelChunk = 2
}

enum ContentSchema{
    DefaultSchema = 0
    LinkReaderSchema = 1
}

enum CaptionType {
    Auto = 0 // intelligent annotation
    Manual = 1 // manual annotation
}

enum DocumentStatus {
    Processing = 0 // Uploading
    Enable     = 1 // take effect
    Disable    = 2 // failure
    Deleted    = 3 // delete
    Resegment  = 4 // In rescaling, the caller is not aware of the state
    Refreshing = 5 // Refreshing (will be deleted after successful refresh)
    Failed     = 9 // fail
}

enum DocumentSource {
    Document = 0 // local file upload
    Custom   = 2 // custom type
}


struct ParsingStrategy{
    1: optional ParsingType    parsing_type;     //parse type
    2: optional bool           image_extraction; //Whether to enable image element extraction (effective when accurately parsing)
    3: optional bool           table_extraction; //Whether to enable table element extraction (effective when accurately parsing)
    4: optional bool           image_ocr; //Whether to turn on picture OCR (effective when accurate analysis)
}

enum ParsingType{
    FastParsing = 0        //fast parse
    AccurateParsing = 1    //accurate analysis
}

struct IndexStrategy{
    1: optional bool    vector_indexing;        //Whether to enable vector indexing (default is true)
    2: optional bool    keyword_indexing;       //Whether to enable keyword indexing (default is true)
    3: optional bool    hierarchical_indexing;  //Whether to enable hierarchical indexing
    4: optional string  model;                  //vector model
}

struct FilterStrategy{
    1: optional list<i32>    filter_page;          //filter pages
}

// sort field
enum OrderField {
    CreateTime = 1
    UpdateTime = 2
}

// OrderType
enum OrderType {
    Desc = 1
    Asc  = 2
}

struct SinkStrategy {
    1: bool check_index // Check whether the index was successful
}
enum ReviewStatus {
    Processing = 0 // Processing
    Enable   = 1 // Completed.
    Failed   = 2 // fail
    ForceStop   = 3 // fail
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

enum ColumnType {
    Unknown = 0
    Text   = 1                  // Text
    Number = 2                  // number
    Date   = 3                  // time
    Float   = 4                 // float
    Boolean = 5                 // bool
    Image   = 6                 // picture
}

struct PhotoInfo { // Picture Knowledge Base One picture corresponds to one document
    1:  string             name  // image name
    2:  i64                document_id(agw.js_conv='str', api.js_conv='true') // Document ID
    3:  string             url             // image link
    4:  string             caption         // picture description information
    5:  i32                create_time     // create_time
    6:  i32                update_time     // update time
    7:  i64                creator_id (agw.js_conv="str", api.js_conv='true', agw.key="creator_id", api.body="creator_id")      // creator_id
    8:  string             type            // Image suffix jpg, png, etc
    9: i32                size            // image size
    10: DocumentStatus status       // status
    11: DocumentSource source_type     // source
}

struct DocumentProgress {
    1: i64               document_id(agw.js_conv="str", api.js_conv='true')
    2: i32                  progress // Knowledge Base Progress Percentage
    3: DocumentStatus status
    4: optional string     status_descript  // A detailed description of the status; if the slice fails, a failure message is returned
    5: string document_name
    6: optional i64     remaining_time // Remaining time in seconds
    7: optional i64     size
    8: optional string  type
    9: optional string  url
}

enum DatasetStatus {
    DatasetProcessing = 0
    DatasetReady      = 1
    DatasetDeleted    = 2  // soft delete
    DatasetForbid     = 3  // Do not enable
    DatasetFailed      = 9
}


struct Dataset {
    1:  i64 dataset_id(agw.js_conv="str", api.js_conv="true")
    2:  string        name                 // Dataset name
    3:  list<string>  file_list            // file list
    4:  i64        all_file_size (agw.js_conv="str", api.js_conv="true") // All file sizes
    5:  i32           bot_used_count       // Bot count
    6:  DatasetStatus status
    7:  list<string>  processing_file_list // List of file names in process, compatible with old logic
    8:  i32           update_time          // Update time, second timestamp
    9:  string        icon_url
    10: string        description
    11: string        icon_uri
    12: bool          can_edit             // Can it be edited?
    13: i32           create_time          // create_time, second timestamp
    14: i64        creator_id  (agw.js_conv="str", api.js_conv="true")         // creator ID
    15: i64        space_id   (agw.js_conv="str", api.js_conv="true")          // Space ID
    18: list<string>  failed_file_list (agw.js_conv="str") // Processing failed files

    19: FormatType  format_type
    20: i32                slice_count        // number of segments
    21: i32                hit_count          // hit count
    22: i32                doc_count          // number of documents
    23: ChunkStrategy  chunk_strategy  // slicing rule

    24: list<string>     processing_file_id_list  // List of file IDs in process
    25: string        project_id          //project ID
}
