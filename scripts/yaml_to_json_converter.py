#!/usr/bin/env python3
"""
YAML to JSON Converter
将 YAML 格式的模型配置文件转换为 JSON 格式

用法:
python yaml_to_json_converter.py input.yaml [output.json]
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("错误: 需要安装 PyYAML 库")
    print("请运行: pip install PyYAML")
    sys.exit(1)


def yaml_to_json(yaml_file_path, json_file_path=None):
    """
    将 YAML 文件转换为 JSON 文件
    
    Args:
        yaml_file_path (str): YAML 文件路径
        json_file_path (str, optional): JSON 文件输出路径，如果不指定则自动生成
    
    Returns:
        bool: 转换是否成功
    """
    try:
        # 检查输入文件是否存在
        if not os.path.exists(yaml_file_path):
            print(f"错误: 文件 '{yaml_file_path}' 不存在")
            return False
        
        # 如果没有指定输出路径，自动生成
        if json_file_path is None:
            yaml_path = Path(yaml_file_path)
            json_file_path = yaml_path.with_suffix('.json')
        
        # 读取 YAML 文件
        print(f"正在读取 YAML 文件: {yaml_file_path}")
        with open(yaml_file_path, 'r', encoding='utf-8') as yaml_file:
            data = yaml.safe_load(yaml_file)
        
        # 写入 JSON 文件
        print(f"正在写入 JSON 文件: {json_file_path}")
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=2)
        
        print(f"✅ 转换成功！")
        print(f"输入文件: {yaml_file_path}")
        print(f"输出文件: {json_file_path}")
        
        return True
        
    except yaml.YAMLError as e:
        print(f"❌ YAML 解析错误: {e}")
        return False
    except json.JSONEncodeError as e:
        print(f"❌ JSON 编码错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 转换失败: {e}")
        return False


def batch_convert(directory_path, pattern="*.yaml"):
    """
    批量转换目录中的 YAML 文件
    
    Args:
        directory_path (str): 目录路径
        pattern (str): 文件匹配模式
    """
    directory = Path(directory_path)
    
    if not directory.exists():
        print(f"错误: 目录 '{directory_path}' 不存在")
        return
    
    yaml_files = list(directory.glob(pattern))
    if not yaml_files:
        print(f"在目录 '{directory_path}' 中没有找到匹配 '{pattern}' 的文件")
        return
    
    print(f"找到 {len(yaml_files)} 个 YAML 文件，开始批量转换...")
    
    success_count = 0
    for yaml_file in yaml_files:
        print(f"\n处理文件: {yaml_file.name}")
        if yaml_to_json(str(yaml_file)):
            success_count += 1
    
    print(f"\n📊 批量转换完成！")
    print(f"成功转换: {success_count}/{len(yaml_files)} 个文件")


def main():
    parser = argparse.ArgumentParser(
        description="将 YAML 格式的模型配置文件转换为 JSON 格式",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  # 转换单个文件
  python yaml_to_json_converter.py model.yaml
  
  # 指定输出文件名
  python yaml_to_json_converter.py model.yaml output.json
  
  # 批量转换目录中的所有 YAML 文件
  python yaml_to_json_converter.py --batch /path/to/directory
  
  # 批量转换特定模式的文件
  python yaml_to_json_converter.py --batch /path/to/directory --pattern "model_*.yaml"
        """
    )
    
    parser.add_argument('input', 
                       help='输入的 YAML 文件路径或目录路径（用于批量转换）')
    parser.add_argument('output', nargs='?', 
                       help='输出的 JSON 文件路径（可选，默认与输入文件同名）')
    parser.add_argument('--batch', action='store_true',
                       help='批量转换模式，将输入参数视为目录路径')
    parser.add_argument('--pattern', default='*.yaml',
                       help='批量转换时的文件匹配模式（默认: *.yaml）')
    parser.add_argument('--version', action='version', version='%(prog)s 1.0')
    
    args = parser.parse_args()
    
    if args.batch:
        # 批量转换模式
        batch_convert(args.input, args.pattern)
    else:
        # 单文件转换模式
        success = yaml_to_json(args.input, args.output)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
