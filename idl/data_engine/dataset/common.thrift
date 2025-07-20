namespace go flow.dataengine.dataset

// 类型
enum FormatType {
    Text  = 0  // 文本
    Table = 1  // 表格
    Image = 2  // 图片
    Database = 3 // 数据库
}

struct ChunkStrategy {
    1: string separator   // 分隔符，如句号
    2: i64    max_tokens  // 分片的最大token数
    3: bool   remove_extra_spaces  // 替换掉连续的空格、换行符和制表符
    4: bool   remove_urls_emails   // 是否去除url和email
    5: ChunkType chunk_type        // 如果为0, 则不使用以上字段的配置
    7: optional CaptionType caption_type    // 图片类型，图片描述文字的标注方式
    8: optional i64    overlap;      //分段重叠度
    9: optional i64    max_level;    //最大层级数（按层级分段时生效）
    10: optional bool   save_title;   //切片保留层级标题（按层级分段时生效）
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
    Auto = 0 // 智能标注
    Manual = 1 // 人工标注
}

enum DocumentStatus {
    Processing = 0 // 上传中
    Enable     = 1 // 生效
    Disable    = 2 // 失效
    Deleted    = 3 // 删除
    Resegment  = 4 // 重新分片中，调用方不感知该状态
    Refreshing = 5 // 刷新中（刷新成功后会删除）
    Failed     = 9 // 失败
}

enum DocumentSource {
    Document = 0 // 本地文件上传
    Custom   = 2 // 自定义类型
}


struct ParsingStrategy{
    1: optional ParsingType    parsing_type;     //解析类型
    2: optional bool           image_extraction; //是否开启图片元素提取（精准解析时生效）
    3: optional bool           table_extraction; //是否开启表格元素提取（精准解析时生效）
    4: optional bool           image_ocr; //是否开启图片OCR（精准解析时生效）
}

enum ParsingType{
    FastParsing = 0        //快速解析
    AccurateParsing = 1    //精准解析
}

struct IndexStrategy{
    1: optional bool    vector_indexing;        //是否开启向量索引（默认为true）
    2: optional bool    keyword_indexing;       //是否开启关键词索引（默认为true）
    3: optional bool    hierarchical_indexing;  //是否开启分层索引
    4: optional string  model;                  //向量模型
}

struct FilterStrategy{
    1: optional list<i32>    filter_page;          //过滤页数
}

// 排序字段
enum OrderField {
    CreateTime = 1
    UpdateTime = 2
}

// 排序规则
enum OrderType {
    Desc = 1
    Asc  = 2
}

struct SinkStrategy {
    1: bool check_index // 是否检查索引成功
}
enum ReviewStatus {
    Processing = 0 // 处理中
    Enable   = 1 // 已完成
    Failed   = 2 // 失败
    ForceStop   = 3 // 失败
}