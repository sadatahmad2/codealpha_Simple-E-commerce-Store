#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo " Starting NOVA MART E-Commerce Server... "
echo "=========================================="

# Detect proper Python executable
if [ -f "./venv/bin/python" ]; then
    PYTHON_CMD="./venv/bin/python"
elif [ -f "/Library/Developer/CommandLineTools/usr/bin/python3" ]; then
    PYTHON_CMD="/Library/Developer/CommandLineTools/usr/bin/python3"
else
    PYTHON_CMD="python3"
fi

echo "Using Python: $PYTHON_CMD"
echo ""
echo "🚀 Server URL:         http://127.0.0.1:8000/"
echo "⚙️ Admin Panel:        http://127.0.0.1:8000/admin/ (admin / admin123)"
echo "Press Ctrl+C to stop the server."
echo ""

exec $PYTHON_CMD manage.py runserver 127.0.0.1:8000
