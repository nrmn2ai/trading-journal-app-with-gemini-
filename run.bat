@echo off
echo Starting Trading Journal Pro...
echo.

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment. Make sure Python is installed.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Run the app
echo.
echo Launching Trading Journal Pro...
echo.

python main.py

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo App exited with error. Press any key to exit...
    pause
)