#!/usr/bin/env bash

SETUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_DIR="$(dirname "$SETUP_DIR")"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$BASE_DIR/backend"
BIN_DIR="$BASE_DIR/bin"
VENV_DIR="$BIN_DIR/.venv"

echo "Checking for Python virtual environment under $BIN_DIR"

if [ ! -d "$VENV_DIR" ]; then
    echo "No virtual environment found. Creating virtual environment"
    python3 -m venv "$VENV_DIR"

    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment - aborting startup"
        exit 1
    fi

    echo "Virtual environment created successfully!"

    echo "Installing required Python packages"
    source "$VENV_DIR/bin/activate"
    pip install --upgrade pip
    pip install pillow pdfplumber RestrictedPython

    if [ $? -ne 0 ]; then
        echo "Failed to install Python packages - aborting startup"
        deactivate
        rm -rf "$VENV_DIR"
        exit 1
    fi

    echo "Python packages installed successfully!"
    deactivate
else
    echo "Virtual environment already exists. Skipping creation."
fi

PDF_PARSER="$BACKEND_DIR/infra/impl/document/parser/builtin/parse_pdf.py"

if [ -f "$PDF_PARSER" ]; then
    cp "$PDF_PARSER" "$BIN_DIR/parse_pdf.py"
else
    echo "❌ $PDF_PARSER file not found"
    exit 1
fi


RUN_PYTHON_SCRIPT="$BACKEND_DIR/infra/impl/coderunner/script/python_script.py"

if [ -f "$RUN_PYTHON_SCRIPT" ]; then
    cp "$RUN_PYTHON_SCRIPT" "$BIN_DIR/python_script.py"
else
    echo "❌ RUN_PYTHON_SCRIPT file not found"
    exit 1
fi



