#!/usr/bin/env python3
"""
模型配置迁移脚本
用于将 YAML 格式的模型配置文件导入到数据库中
"""

import argparse
import json
import logging
import time
from pathlib import Path
from typing import Dict, Optional

import pymysql
import yaml
from pymysql.connections import Connection


class DatabaseConfig:
    """数据库配置"""
    def __init__(self, host: str = "localhost", port: int = 3306, 
                 database: str = "", username: str = "", password: str = ""):
        self.host = host
        self.port = port
        self.database = database
        self.username = username
        self.password = password


class ModelImporter:
    """模型配置导入器"""
    
    def __init__(self, db_config: DatabaseConfig):
        self.db_config = db_config
        self.connection: Optional[Connection] = None
        self.logger = self._setup_logger()
        
    def _setup_logger(self) -> logging.Logger:
        """设置日志"""
        logger = logging.getLogger('ModelImporter')
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
            
        return logger
    
    def connect_database(self) -> bool:
        """连接数据库"""
        try:
            self.connection = pymysql.connect(
                host=self.db_config.host,
                port=self.db_config.port,
                user=self.db_config.username,
                password=self.db_config.password,
                database=self.db_config.database,
                charset='utf8mb4',
                autocommit=False
            )
            self.logger.info("数据库连接成功")
            return True
        except Exception as e:
            self.logger.error(f"数据库连接失败: {e}")
            return False
    
    def close_connection(self):
        """关闭数据库连接"""
        if self.connection:
            self.connection.close()
            self.logger.info("数据库连接已关闭")
    
    def load_yaml_config(self, yaml_path: str) -> Optional[Dict]:
        """加载 YAML 配置文件"""
        try:
            with open(yaml_path, 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
                self.logger.info(f"成功加载配置文件: {yaml_path}")
                return config
        except Exception as e:
            self.logger.error(f"加载配置文件失败 {yaml_path}: {e}")
            return None
    
    def generate_id(self) -> int:
        """生成 bigint 类型的 ID"""
        # 使用时间戳和随机数生成唯一的 bigint ID
        import random
        timestamp = int(time.time() * 1000)  # 毫秒级时间戳
        random_part = random.randint(1000, 9999)  # 4位随机数
        return int(f"{timestamp}{random_part}")
    
    def get_current_timestamp(self) -> int:
        """获取当前时间戳（毫秒）"""
        return int(time.time() * 1000)
    
    def prepare_model_meta_data(self, config: Dict, model_id: int) -> Dict:
        """准备 model_meta 表数据"""
        meta = config.get('meta', {})
        
        # 处理 capability JSON
        capability = meta.get('capability', {})
        
        # 处理 conn_config JSON
        conn_config = meta.get('conn_config', {})
        
        # 处理 description JSON
        description = config.get('description', {})
        
        current_time = self.get_current_timestamp()
        
        return {
            'id': model_id,
            'model_name': conn_config.get('model', meta.get('name', '')),
            'protocol': meta.get('protocol', ''),
            'icon_uri': config.get('icon_uri', ''),
            'capability': json.dumps(capability) if capability else None,
            'conn_config': json.dumps(conn_config) if conn_config else None,
            'description': json.dumps(description) if description else None,
            'status': meta.get('status', 1),
            'created_at': current_time,
            'updated_at': current_time
        }
    
    def prepare_model_entity_data(self, config: Dict, model_id: int, meta_id: int) -> Dict:
        """准备 model_entity 表数据"""
        # 处理 default_parameters JSON
        default_params = config.get('default_parameters', [])
        
        # 处理 description JSON
        description = config.get('description', {})
        
        current_time = self.get_current_timestamp()
        
        return {
            'id': model_id,
            'meta_id': meta_id,
            'name': config.get('name', ''),
            'description': json.dumps(description) if description else None,
            'default_params': json.dumps(default_params) if default_params else None,
            'scenario': 1,  # 默认场景值
            'status': 1,    # 激活状态
            'created_at': current_time,
            'updated_at': current_time
        }
    
    def check_model_exists(self, model_name: str, model_id: Optional[int] = None) -> bool:
        """检查模型是否已存在（通过名称或ID）"""
        try:
            with self.connection.cursor() as cursor:
                if model_id:
                    sql = "SELECT COUNT(*) FROM model_entity WHERE name = %s OR id = %s"
                    cursor.execute(sql, (model_name, model_id))
                else:
                    sql = "SELECT COUNT(*) FROM model_entity WHERE name = %s"
                    cursor.execute(sql, (model_name,))
                count = cursor.fetchone()[0]
                return count > 0
        except Exception as e:
            self.logger.error(f"检查模型存在性失败: {e}")
            return False
    
    def insert_model_meta(self, data: Dict) -> bool:
        """插入 model_meta 数据"""
        try:
            with self.connection.cursor() as cursor:
                sql = """
                INSERT INTO model_meta 
                (id, model_name, protocol, icon_uri, capability, 
                 conn_config, description, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    data['id'], data['model_name'], data['protocol'],
                    data['icon_uri'], data['capability'],
                    data['conn_config'], data['description'], data['status'],
                    data['created_at'], data['updated_at']
                ))
                return True
        except Exception as e:
            self.logger.error(f"插入 model_meta 失败: {e}")
            return False
    
    def insert_model_entity(self, data: Dict) -> bool:
        """插入 model_entity 数据"""
        try:
            with self.connection.cursor() as cursor:
                sql = """
                INSERT INTO model_entity 
                (id, meta_id, name, description, default_params, scenario, 
                 status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    data['id'], data['meta_id'], data['name'],
                    data['description'], data['default_params'], data['scenario'],
                    data['status'], data['created_at'], data['updated_at']
                ))
                return True
        except Exception as e:
            self.logger.error(f"插入 model_entity 失败: {e}")
            return False
    
    def import_model_config(self, yaml_path: str, force: bool = False) -> bool:
        """导入单个模型配置"""
        # 加载配置文件
        config = self.load_yaml_config(yaml_path)
        if not config:
            return False
        
        model_name = config.get('name', '')
        if not model_name:
            self.logger.error("配置文件中缺少模型名称")
            return False
        
        # 获取 YAML 中的 ID，如果没有则生成新的
        entity_id = config.get('id')
        
        # 检查模型是否已存在
        if not force and self.check_model_exists(model_name, entity_id):
            self.logger.warning(f"模型 {model_name} (ID: {entity_id}) 已存在，跳过导入")
            return True
        if not entity_id:
            entity_id = self.generate_id()
            self.logger.warning(f"配置文件中未定义 ID，自动生成: {entity_id}")
        else:
            self.logger.info(f"使用配置文件中的 ID: {entity_id}")
        
        # meta_id 与 entity_id 保持一致
        meta_id = entity_id
        
        # 准备数据
        meta_data = self.prepare_model_meta_data(config, meta_id)
        entity_data = self.prepare_model_entity_data(config, entity_id, meta_id)
        
        # 开始事务
        try:
            self.connection.begin()
            
            # 插入数据
            if not self.insert_model_meta(meta_data):
                raise Exception("插入 model_meta 失败")
            
            if not self.insert_model_entity(entity_data):
                raise Exception("插入 model_entity 失败")
            
            # 提交事务
            self.connection.commit()
            self.logger.info(f"成功导入模型: {model_name}")
            return True
            
        except Exception as e:
            # 回滚事务
            self.connection.rollback()
            self.logger.error(f"导入模型失败 {model_name}: {e}")
            return False
    
    def import_batch_configs(self, directory: str, force: bool = False) -> int:
        """批量导入配置文件"""
        success_count = 0
        yaml_files = list(Path(directory).glob("*.yaml")) + list(Path(directory).glob("*.yml"))
        
        if not yaml_files:
            self.logger.warning(f"目录 {directory} 中未找到 YAML 文件")
            return 0
        
        for yaml_file in yaml_files:
            self.logger.info(f"开始导入: {yaml_file}")
            if self.import_model_config(str(yaml_file), force):
                success_count += 1
        
        self.logger.info(f"批量导入完成，成功: {success_count}/{len(yaml_files)}")
        return success_count


def create_config_template():
    """创建配置文件模板"""
    template = {
        'database': {
            'host': '10.10.10.224',
            'port': 3306,
            'database': 'opencoze',
            'username': 'coze',
            'password': 'coze123'
        }
    }
    
    config_path = 'importer_config.yaml'
    with open(config_path, 'w', encoding='utf-8') as f:
        yaml.dump(template, f, default_flow_style=False, allow_unicode=True)
    
    print(f"配置文件模板已创建: {config_path}")


def main():
    parser = argparse.ArgumentParser(description='模型配置迁移脚本')
    parser.add_argument('--config', type=str, help='单个 YAML 配置文件路径')
    parser.add_argument('--batch', type=str, help='批量导入目录路径')
    parser.add_argument('--db-config', type=str, default='importer_config.yaml',
                       help='数据库配置文件路径')
    parser.add_argument('--force', action='store_true', help='强制导入（覆盖已存在的模型）')
    parser.add_argument('--create-template', action='store_true', help='创建配置文件模板')
    
    args = parser.parse_args()
    
    if args.create_template:
        create_config_template()
        return
    
    if not args.config and not args.batch:
        parser.print_help()
        return
    
    # 加载数据库配置
    try:
        with open(args.db_config, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
            db_info = config['database']
            db_config = DatabaseConfig(
                host=db_info['host'],
                port=db_info['port'],
                database=db_info['database'],
                username=db_info['username'],
                password=db_info['password']
            )
    except Exception as e:
        print(f"加载数据库配置失败: {e}")
        print("请先运行 --create-template 创建配置文件模板")
        return
    
    # 创建导入器
    importer = ModelImporter(db_config)
    
    # 连接数据库
    if not importer.connect_database():
        return
    
    try:
        if args.config:
            # 单个文件导入
            importer.import_model_config(args.config, args.force)
        elif args.batch:
            # 批量导入
            importer.import_batch_configs(args.batch, args.force)
    finally:
        importer.close_connection()


if __name__ == "__main__":
    main()