@echo off
SET scriptPath=%~dp0schedule.bat

echo Scheduling Daily Task...
schtasks /create /tn "Vidyascape Daily Leaderboard" /tr "\"%scriptPath%\" 86400" /sc daily /st 00:00:00 /f

echo Scheduling Weekly Task...
schtasks /create /tn "Vidyascape Weekly Leaderboard" /tr "\"%scriptPath%\" 604800" /sc weekly /st 00:00:00 /f

echo Scheduling Monthly Task...
schtasks /create /tn "Vidyascape Monthly Leaderboard" /tr "\"%scriptPath%\" 2592000" /sc monthly /st 00:00:00 /f

echo All tasks scheduled. Press any key to exit.
pause >nul
