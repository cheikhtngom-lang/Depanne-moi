@echo off
echo =======================================================
echo     LANCEMENT DU SERVEUR DE PAIEMENT DEPANNE-MOI
echo =======================================================
echo.

:: Vérifier si Node.js est installé
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe sur cet ordinateur.
    echo Veuillez telecharger et installer Node.js depuis https://nodejs.org/
    echo Puis relancez ce script.
    pause
    exit /b
)

echo [1/2] Verification et installation des dependances (Express, SQLite, etc.)...
call npm install

echo.
echo [2/2] Demarrage du serveur local...
echo Ne fermez pas cette fenetre noire pendant que vous utilisez le site !
echo.
call npm start

pause
