#!/usr/bin/env python3
# Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
# Licensed under the 【火山方舟】原型应用软件自用许可协议
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at 
#     https://www.volcengine.com/docs/82379/1433703
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Translation management script for vefaas-browser-use

Usage:
    python scripts/update_translations.py compile    # Compile .po files to .mo files
    python scripts/update_translations.py test       # Test translations
"""

import sys
import subprocess
from pathlib import Path

def get_project_root():
    """Get the project root directory"""
    return Path(__file__).parent.parent

def compile_translations():
    """Compile all .po files to .mo files"""
    project_root = get_project_root()
    locales_dir = project_root / "my_browser_use" / "locales"
    
    if not locales_dir.exists():
        print(f"Locales directory not found: {locales_dir}")
        return False
    
    success = True
    for lang_dir in locales_dir.iterdir():
        if lang_dir.is_dir() and lang_dir.name != "__pycache__":
            po_file = lang_dir / "LC_MESSAGES" / "vefaas_browser_use.po"
            mo_file = lang_dir / "LC_MESSAGES" / "vefaas_browser_use.mo"
            
            if po_file.exists():
                print(f"Compiling {lang_dir.name}...")
                try:
                    subprocess.run([
                        "msgfmt", "-o", str(mo_file), str(po_file)
                    ], check=True)
                    print(f"  ✓ Compiled {lang_dir.name}")
                except subprocess.CalledProcessError as e:
                    print(f"  ✗ Failed to compile {lang_dir.name}: {e}")
                    success = False
            else:
                print(f"  ⚠ No .po file found for {lang_dir.name}")
    
    return success

def test_translations():
    """Test the translation system"""
    sys.path.insert(0, str(get_project_root()))
    
    try:
        from browser_agent.browser_use_custom.i18n import _, set_language, get_available_languages
        
        print("Testing translation system...")
        print(f"Available languages: {get_available_languages()}")
        
        # Test a few key messages
        test_messages = [
            "Task auto-stopped after 1 minute in paused state",
            "Pause agent",
            "🔍 Searched for \"{query}\" in Baidu",
            "Starting new step...",
            "Taken action #{number}: {action}",
            "Agent creation failed: {error}",
            "Pause execution due to CAPTCHA verification.",
            "Unknown - The task has not yet begun as the current page is blank.",
            "Success - Successfully navigated to Google's homepage.",
            "CAPTCHA verification required. Human intervention is needed to proceed."
        ]
        
        for lang in get_available_languages():
            print(f"\n--- Testing {lang} ---")
            set_language(lang)
            for msg in test_messages:
                translated = _(msg)
                print(f"  {msg[:50]}... -> {translated[:50]}...")
        
        print("\n✓ Translation test completed")
        return True
        
    except Exception as e:
        print(f"✗ Translation test failed: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "compile":
        success = compile_translations()
        sys.exit(0 if success else 1)
    elif command == "test":
        success = test_translations()
        sys.exit(0 if success else 1)
    else:
        print(f"Unknown command: {command}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main() 