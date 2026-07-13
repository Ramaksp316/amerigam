@echo off
echo ==========================================
echo Starting 3Amerigam Social Media App
echo ==========================================
echo.

echo [1/3] Pushing database schema...
call node_modules\.bin\prisma.cmd db push

echo.
echo [2/3] Generating Prisma Client...
call node_modules\.bin\prisma.cmd generate

echo.
echo [3/3] Starting Next.js Development Server...
call node_modules\.bin\next.cmd dev -p 3001

pause
