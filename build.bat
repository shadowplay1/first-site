@echo off

echo Hello, %USERNAME%!
echo Starting the build of the website...
echo.

node build.js

title Here we go!

echo.
echo ----------------------
echo Build finished.
echo ----------------------
echo All build files are
echo in a 'dist' directory.
echo ----------------------
echo Enjoy!
echo ----------------------
echo Press any key to 
echo terminate the process.
echo ----------------------
echo.

pause