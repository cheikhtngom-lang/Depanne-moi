@echo off
echo =======================================================
echo     MISE A JOUR DU PROJET DEPANNE-MOI SUR GITHUB
echo =======================================================
echo.

echo [1/3] Ajout des fichiers modifies...
git add .

echo.
echo [2/3] Creation du commit (sauvegarde locale)...
git commit -m "deploy: integration backend vercel et supabase"

echo.
echo [3/3] Envoi des modifications vers GitHub...
git pull --rebase
git push

echo.
echo =======================================================
echo  Termine ! Verifiez les eventuels messages d'erreur ci-dessus.
echo =======================================================
pause
