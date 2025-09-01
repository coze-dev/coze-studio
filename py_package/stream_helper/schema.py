from enum import Enum, IntEnum
from typing import Optional, Dict, Union
from pydantic import BaseModel

class StepInfo(BaseModel):
    step_number:int
    goal:str

class WebSocketItem(BaseModel):
    ws_url:str

class WebSocketInfo(BaseModel):
    items: list[WebSocketItem]


class MessageActionTypeEnum(int, Enum):
    """MessageActionType 的枚举值"""
    WebPageAuthorization = 1 # Web page authorization

class MessageActionItem(BaseModel):
    type: MessageActionTypeEnum = MessageActionTypeEnum.WebPageAuthorization
    class Config:
        use_enum_values = True

class MessageActionInfo(BaseModel):
    actions: list[MessageActionItem]

# 定义枚举类型
class FileType(str, Enum):
    DIR = "dir"
    FILE = "file"

class FileChangeType(str, Enum):
    CREATE = "create"
    DELETE = "delete"
    UPDATE = "update"

class FileChangeData(BaseModel):
    file_type: FileType = FileType.FILE
    file_path: str = ''
    file_name: str
    change_type: FileChangeType 
    uri: str
    url: str
    
    class Config:
        use_enum_values = True
        
class ErrData(BaseModel):
    data: Dict[str, str]


class FileChangeInfo(BaseModel):
    file_change_list: Optional[list[FileChangeData]] = None
    err_list: Optional[list[ErrData]] = None

class OutputModeEnum(int, Enum):
    """SSEData.output_mode 的枚举值"""
    NOT_STREAM = 0  # 非流式
    STREAM = 1      # 流式

class ReturnTypeEnum(int, Enum):
    """SSEData.return_type 的枚举值"""
    MODEL = 0          # 输出到模型
    USER_TERMINAL = 1  # 输出到终端

class ContentTypeEnum(int, Enum):
    """SSEData.content_type 的枚举值"""
    TEXT = 0          # 文本
    APPLET_WIDGET = 1 # 小程序组件
    LOADING_TIPS = 2  # 加载提示
    CARD = 3          # 卡片
    VERBOSE = 4       # 详细信息
    USAGE = 10        # 使用情况

class ContextModeEnum(int, Enum):
    """SSEData.context_mode 的枚举值"""
    NOT_IGNORE = 0  # 不忽略上下文
    IGNORE = 1      # 忽略上下文

class ReplyTypeInReplyEnum(IntEnum):
    """Type of reply (purpose/context)."""
    ANSWER = 1          # Standard answer
    SUGGEST = 2         # Suggestion (e.g., follow-up questions)
    LLM_OUTPUT = 3      # Raw LLM output (before processing)
    TOOL_OUTPUT = 4     # Output from an external tool/API
    VERBOSE = 100       # Debug/verbose logging
    PLACEHOLDER = 101   # Placeholder (e.g., loading state)
    TOOL_VERBOSE = 102  # Verbose logs from tools

class ContentTypeInReplyEnum(IntEnum):
    """Format of the content."""
    TXT = 1             # Plain text
    IMAGE = 2           # Image
    VIDEO = 4           # Video
    MUSIC = 7           # Audio
    CARD = 50           # Structured card (e.g., rich UI element)
    WIDGET = 52         # Interactive widget
    APP = 100           # Embedded application
    WEBSOCKET_INFO = 101 # Websocket metadata
    FILE_CHANGE_INFO = 102 # File system event
    ACTION_INFO = 103    # Action/command metadata

class ReplyContentType(BaseModel):
    """Combines reply type and content type for structured responses."""
    reply_type: ReplyTypeInReplyEnum = ReplyTypeInReplyEnum.TOOL_VERBOSE
    content_type: ContentTypeInReplyEnum = ContentTypeInReplyEnum.TXT

class SSEData(BaseModel):
    stream_id: str
    message_title: Optional[str] = None
    context_mode: Union[ContextModeEnum, int] = ContextModeEnum.NOT_IGNORE
    output_mode: OutputModeEnum = OutputModeEnum.STREAM  # 0=非流式, 1=流式
    return_type: Union[ReturnTypeEnum, int] = ReturnTypeEnum.USER_TERMINAL
    content_type: Union[ContentTypeEnum, int] = ContentTypeEnum.TEXT
    is_last_msg: bool = False
    is_finish: bool = False
    is_last_packet_in_msg: bool = False
    content: Optional[str] = None
    response_for_model: Optional[str] = None
    ext: Optional[Dict[str, str]] = None
    card_body: Optional[str] = None
    reply_content_type :Optional[ReplyContentType] = None
    class Config:
        use_enum_values = True  # 序列化时使用枚举的原始值