namespace go flow.dataengine.dataset

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