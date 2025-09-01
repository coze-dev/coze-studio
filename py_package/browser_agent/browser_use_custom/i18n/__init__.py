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

import gettext
import os
import copy
from typing import Optional

# Default language
_current_language = 'zh-CN'
_translator = None

def get_locales_dir():
    """Get the locales directory path"""
    return os.path.join(os.path.dirname(__file__), 'locales')

def set_language(language: str = 'zh-CN'):
    """Set the current language for translations"""
    global _current_language, _translator
    _current_language = language
    
    locales_dir = get_locales_dir()
    
    try:
        # Try to load the translation
        translation = gettext.translation(
            'vefaas_browser_use', 
            localedir=locales_dir, 
            languages=[language],
            fallback=True
        )
        _translator = translation
    except Exception:
        # Fallback to NullTranslations if translation not found
        _translator = gettext.NullTranslations()

def get_language():
    """Get the current language"""
    return _current_language

def _(message: str) -> str:
    """Translate a message"""
    if _translator is None:
        set_language(_current_language)
    return _translator.gettext(message)

def get_available_languages():
    """Get list of available languages"""
    locales_dir = get_locales_dir()
    if not os.path.exists(locales_dir):
        return ['zh-CN']
    
    languages = []
    for item in os.listdir(locales_dir):
        lang_dir = os.path.join(locales_dir, item)
        if os.path.isdir(lang_dir):
            mo_file = os.path.join(lang_dir, 'LC_MESSAGES', 'vefaas_browser_use.mo')
            if os.path.exists(mo_file):
                languages.append(item)
    
    return languages if languages else ['zh-CN']

def translate_planning_step_data(conversation_update: dict) -> dict:
    """Translate planning step data fields using pattern matching"""
    import re
    translated_update = copy.deepcopy(conversation_update)
    
    # Translate evaluation field
    if 'evaluation' in translated_update:
        evaluation = translated_update['evaluation']
        # Basic status translations
        if evaluation == "Unknown":
            translated_update['evaluation'] = _("Unknown")
        elif evaluation == "Failed":
            translated_update['evaluation'] = _("Failed")
        elif evaluation == "Success":
            translated_update['evaluation'] = _("Success")
        # Specific pattern translations
        elif evaluation == "Unknown - The task has just started, and no actions have been taken yet.":
            translated_update['evaluation'] = _("Unknown - The task has just started, and no actions have been taken yet.")
        elif evaluation == "Unknown - The task has not yet begun as the current page is blank.":
            translated_update['evaluation'] = _("Unknown - The task has not yet begun as the current page is blank.")
        elif evaluation == "Success - Successfully navigated to Google's homepage.":
            translated_update['evaluation'] = _("Success - Successfully navigated to Google's homepage.")
        elif evaluation == "Failed - The search was blocked by Google's CAPTCHA verification.":
            translated_update['evaluation'] = _("Failed - The search was blocked by Google's CAPTCHA verification.")
        # General pattern matching for CAPTCHA-related failures
        elif "CAPTCHA" in evaluation and evaluation.startswith("Failed"):
            translated_update['evaluation'] = _("Failed - The search was blocked by a CAPTCHA verification page.")
        # Partial translation for status prefixes
        elif evaluation.startswith("Success - "):
            translated_update['evaluation'] = evaluation.replace("Success", _("Success"), 1)
        elif evaluation.startswith("Failed - "):
            translated_update['evaluation'] = evaluation.replace("Failed", _("Failed"), 1)
        elif evaluation.startswith("Unknown - "):
            translated_update['evaluation'] = evaluation.replace("Unknown", _("Unknown"), 1)
    
    # Translate goal field with pattern matching
    if 'goal' in translated_update:
        goal = translated_update['goal']
        if goal == "Pause execution due to CAPTCHA verification.":
            translated_update['goal'] = _("Pause execution due to CAPTCHA verification.")
        # Add more general goal patterns as needed
    
    # Translate actions if they contain pause reasons
    if 'actions' in translated_update:
        for action in translated_update['actions']:
            if 'pause' in action and 'reason' in action['pause']:
                reason = action['pause']['reason']
                if reason == "CAPTCHA verification required. Human intervention is needed to proceed.":
                    action['pause']['reason'] = _("CAPTCHA verification required. Human intervention is needed to proceed.")
                elif "CAPTCHA" in reason and "verification required" in reason:
                    # General CAPTCHA verification pattern
                    action['pause']['reason'] = _("CAPTCHA verification required. Human intervention is needed to proceed.")
    
    return translated_update

# Initialize with default language
set_language('zh-CN') 