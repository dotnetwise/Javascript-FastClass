@echo off
for /r "%CD%\content" %%x in (*.cs) do ren "%%x" "%%~nx%%~xx".pp
for /r "%CD%\content" %%x in (*.js) do ren "%%x" "%%~nx%%~xx".pp
for /r "%CD%\content" %%x in (*.config) do ren "%%x" "%%~nx%%~xx".transform

@%~dp0\fart -q -r *.pp,*.config,*.transform rootnamespace $rootnamespace$ >NUL 2>NUL
@%~dp0\fart -q -r *.pp,*.config,*.transform assemblyname $assemblyname$ >NUL 2>NUL

