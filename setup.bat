@echo off

REM Pull the latest changes from the Git repository
git pull

REM Install the required dependencies
npx yarn

REM Run backend setup
npx yarn run setup-backend

REM Run frontend setup
npx yarn run setup-frontend

REM Start the application
npx yarn run start
