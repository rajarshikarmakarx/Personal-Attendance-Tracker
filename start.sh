#!/usr/bin/env bash

# ==============================================================================
# Presently - Personal Attendance Tracker Startup Script
# ==============================================================================

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

# Colors for terminal output
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_GOLD='\033[38;2;227;183;106m'
C_GREEN='\033[38;2;91;191;138m'
C_RED='\033[38;2;217;95;106m'
C_MUTED='\033[38;2;138;147;171m'

echo -e "${C_GOLD}${C_BOLD}"
echo "  ╔═══════════════════════════════════════════════════════╗"
echo "  ║                   PRESENTLY TRACKER                   ║"
echo "  ║        FastAPI Backend  +  React / Vite Frontend      ║"
echo "  ╚═══════════════════════════════════════════════════════╝"
echo -e "${C_RESET}"

# 1. Virtual Environment / Python check
if [ -d "${BACKEND_DIR}/.venv" ]; then
    echo -e "${C_MUTED}→ Activating virtualenv in backend/.venv...${C_RESET}"
    source "${BACKEND_DIR}/.venv/bin/activate"
elif [ -d "${ROOT_DIR}/.venv" ]; then
    echo -e "${C_MUTED}→ Activating virtualenv in .venv...${C_RESET}"
    source "${ROOT_DIR}/.venv/bin/activate"
elif [ -d "${BACKEND_DIR}/venv" ]; then
    echo -e "${C_MUTED}→ Activating virtualenv in backend/venv...${C_RESET}"
    source "${BACKEND_DIR}/venv/bin/activate"
fi

# Determine python / uvicorn command
PYTHON_CMD="python3"
if command -v python &>/dev/null; then
    PYTHON_CMD="python"
fi

UVICORN_CMD=""
if command -v uvicorn &>/dev/null; then
    UVICORN_CMD="uvicorn"
elif $PYTHON_CMD -m uvicorn --version &>/dev/null; then
    UVICORN_CMD="$PYTHON_CMD -m uvicorn"
else
    echo -e "${C_RED}Error: uvicorn not found. Please run 'pip install -r backend/requirements.txt'.${C_RESET}"
    exit 1
fi

# 2. Frontend Node dependencies check
if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
    echo -e "${C_MUTED}→ node_modules not found. Installing frontend dependencies...${C_RESET}"
    (cd "${FRONTEND_DIR}" && npm install)
fi

# 3. Clean shutdown handler
cleanup() {
    echo -e "\n${C_GOLD}Shutting down Presently services...${C_RESET}"
    if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo -e "${C_GREEN}Services stopped cleanly. Goodbye!${C_RESET}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 4. Start Backend (FastAPI / Uvicorn on :8000)
echo -e "${C_GREEN}● Starting Backend on http://localhost:8000${C_RESET} (Docs: http://localhost:8000/docs)"
(
    cd "${BACKEND_DIR}"
    exec $UVICORN_CMD app.main:app --reload --port 8000
) &
BACKEND_PID=$!

# 5. Start Frontend (Vite Dev Server on :5173)
echo -e "${C_GREEN}● Starting Frontend on http://localhost:5173${C_RESET}"
(
    cd "${FRONTEND_DIR}"
    exec npm run dev
) &
FRONTEND_PID=$!

echo -e "\n${C_MUTED}Both services are running in watch mode. Press ${C_BOLD}Ctrl+C${C_RESET}${C_MUTED} to stop all servers.${C_RESET}\n"

# Wait for background processes
wait
