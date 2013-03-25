@echo off
echo/|set /p ="Executing *.tt templates.."
SETLOCAL ENABLEDELAYEDEXPANSION
for /r %1 %%f in (*.tt) do (
 for /f "tokens=3,4 delims==, " %%a in (%%f) do (
  if %%~a==extension "%CommonProgramFiles%\Microsoft Shared\TextTemplating\10.0\texttransform.exe" -out %%~pnf%%~b -P %%~pf -P "%ProgramFiles%\Reference Assemblies\Microsoft\Framework\v4.0" %%f
 )
)
IF NOT %ERRORLEVEL% == 0 echo Exit Code = %ERRORLEVEL%
echo done.