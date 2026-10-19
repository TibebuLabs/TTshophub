@echo off
echo ========================================
echo  NileMart - Push Changes to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Configuring Git safe directory...
git config --global --add safe.directory D:/backup-t3/Desktop/nilemart-fullstack/nilemart

echo.
echo [2/5] Adding all changes...
git add .

echo.
echo [3/5] Creating commit...
git commit -m "Fix: Final apostrophe fix in bank-transfer page - All ESLint errors resolved"

echo.
echo [4/5] Checking remote...
git remote -v

echo.
echo ========================================
echo  NEXT STEPS:
echo ========================================
echo.
echo If you see a remote URL above, run:
echo   git push
echo.
echo If NO remote is shown, first add your GitHub repo:
echo   git remote add origin https://github.com/YOUR_USERNAME/nilemart-fullstack.git
echo   git branch -M main
echo   git push -u origin main
echo.
echo ========================================

pause
