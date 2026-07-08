@echo off
echo =======================================================
echo     CORRECTION DE L'ERREUR DU GROS FICHIER SUR GITHUB
echo =======================================================
echo.

echo [1/4] Reinitialisation de l'historique local (vos fichiers sont en securite)...
git reset --mixed origin/main

echo.
echo [2/4] Ajout propre des fichiers (le fichier .exe sera ignore automatiquement)...
git add .

echo.
echo [3/4] Creation d'une nouvelle sauvegarde groupee...
git commit -m "feat: integration backend, paiements, logo et TVA"

echo.
echo [4/4] Nouvel envoi vers GitHub...
git push

echo.
echo =======================================================
echo  Termine ! Verifiez que l'erreur a disparu.
echo =======================================================
pause
