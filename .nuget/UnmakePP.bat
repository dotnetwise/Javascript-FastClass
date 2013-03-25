@echo off

@%~dp0\fart -q -r *.pp,*.config,*.transform $rootnamespace$ rootnamespace >NUL 2>NUL
@%~dp0\fart -q -r *.pp,*.config,*.transform $assemblyname$ assemblyname >NUL 2>NUL 

for /r "%CD%\content" %%x in (*.cs.pp) do ren "%%x" "%%~nx"
for /r "%CD%\content" %%x in (*.js.pp) do ren "%%x" "%%~nx"
for /r "%CD%\content" %%x in (*.config.transform) do ren "%%x" "%%~nx"

