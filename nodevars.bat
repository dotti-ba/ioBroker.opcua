@echo off

rem Ensure this Node.js and npm are first in the PATH
set "PATH=%~dp0\..\env\npm;%~dp0;%PATH%"

setlocal enabledelayedexpansion
pushd "%~dp0"

rem Figure out the Node.js version.
set print_version=.\node.exe -p -e "process.versions.node + ' (' + process.arch + ')'"
for /F "usebackq delims=" %%v in (`%print_version%`) do set version=%%v

rem Print message.
  echo.
  echo **********************************************************
  echo ***               Welcome to ioBroker.                 ***
  echo ***                                                    ***
  echo ***   Type 'iobroker help' for list of instructions.   ***
  echo ***                For more help see                   ***
  echo ***     https://github.com/ioBroker/ioBroker.docs      ***
  echo **********************************************************
  echo.
if exist npm.cmd (
  echo Your environment has been set up for using Node.js !version! and npm.
  echo.
) else (
  echo Your environment has been set up for using Node.js !version!.
  echo.
)

popd
endlocal

rem Set marker
set "iob_node_marker=true"

rem Change directory to iobroker root
cd /d "%~dp0\.."

cd C:\ioBroker\KlausTestHpSpectre\node_modules\ioBroker.opcua
