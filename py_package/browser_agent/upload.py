from datetime import datetime
from typing import List
from abc import ABC, abstractmethod
from pydantic import BaseModel
class FileItem(BaseModel):
    file_name: str
    file_type: str
    file_size: int
    file_uri: str
    file_url: str
    upload_type: str
    create_time: int
    update_time: int

class UploadService(BaseModel,ABC):
    headers:dict[str,str] = {}
    async def upload_file(self,file_content:str,file_name:str,base64_content:str=''):
        pass
    async def list_file(self)->List[FileItem]:
        pass
    
async def filter_file_by_time(file_list:List[FileItem],start_time:int)->List[FileItem]:
    return [file for file in file_list if (start_time <= file.create_time or start_time <= file.update_time) ]