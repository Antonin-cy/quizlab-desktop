# QuizLab Windows — installateur et mises à jour (v1.1.0)

Ce dossier est un **projet complet prêt à compiler** en installateur Windows. Le fichier `.exe` n'est pas inclus : sa compilation se fait gratuitement avec GitHub Actions (Windows) ou sur un PC Windows avec Node.js.

## Ce qui est inclus
- Application Electron avec icône QuizLab (`assets/quizlab.ico`).
- Installateur NSIS : raccourcis Bureau/menu Démarrer, assistant d'installation, désinstallation.
- Sauvegarde locale dans le dossier utilisateur (`quizlab-data.json`), indépendant des versions installées.
- Mises à jour via `electron-updater` depuis les **GitHub Releases** (fichiers `latest.yml`, `.exe` et `.blockmap`). Vérification au démarrage, bouton manuel, téléchargement puis redémarrage demandé.
- Lecteur de quiz à distance : `lecteur-public/index.html` à publier séparément sur Cloudflare Pages.

## 1 — Première compilation gratuite sans rien installer sur ton PC
1. Crée un compte GitHub et un dépôt **public** nommé `quizlab-desktop` (ne mets aucun secret dans le dépôt). Le dépôt public est nécessaire pour que les utilisateurs récupèrent les mises à jour sans clé privée.
2. Dans `package.json`, remplace `CHANGE_ME_GITHUB_OWNER` par ton **nom d'utilisateur GitHub**. Garde `repo` égal au nom exact de ton dépôt (ou modifie-le si nécessaire).
3. Envoie **tout le contenu de ce dossier** dans la racine du dépôt, en conservant `.github/workflows/windows.yml` et les dossiers.
4. Ouvre GitHub > onglet **Actions** > `Installer Windows QuizLab` > **Run workflow**. Attends la fin du workflow.
5. Dans la page du workflow terminé, télécharge l'artifact `QuizLab-Windows-Setup`. Il contient `QuizLab-Setup-1.1.0-x64.exe`. Décompresse l'artifact et lance l'installateur sur Windows.
6. Windows SmartScreen peut avertir que l'application est **non signée**. Vérifie que l'installateur provient bien de ton propre workflow GitHub. Une signature de code commerciale n'est pas fournie.

## 2 — Activer les mises à jour automatiques
Pour que la recherche de mises à jour fonctionne, publie une **Release GitHub** avec les fichiers générés. La méthode la plus simple est de déclencher le workflow avec un tag `v1.1.0` :
1. Dans GitHub > Settings > Actions > General > Workflow permissions, autorise `Read and write permissions` si nécessaire pour que le workflow puisse publier une Release.
2. Crée le tag `v1.1.0` sur la branche contenant `package.json` à version `1.1.0` (GitHub > Releases > Draft a new release > Choose a tag > Create new tag).
3. Le workflow déclenché par ce tag construit l'installateur et `electron-builder` publie la Release et ses métadonnées (`latest.yml`, `.blockmap`). **Ne publie pas la Release manuellement avant la fin du workflow.**
4. Vérifie dans GitHub > Releases que la Release **publiée** contient bien le `.exe`, le fichier `latest.yml` et éventuellement `.blockmap`.
5. Pour chaque version suivante, augmente `version` dans `package.json` (ex. `1.1.1`), publie les changements, puis crée le tag correspondant (`v1.1.1`). L'application installée vérifie les versions disponibles au démarrage et via son bouton.

**Important :** Les mises à jour ne peuvent pas fonctionner tant que `CHANGE_ME_GITHUB_OWNER` n'a pas été remplacé et qu'aucune Release avec `latest.yml` n'est publiée. L'auto-update de l'installateur NSIS n'est pas conçu pour une version portable.

## 3 — Compiler directement sur Windows (facultatif)
Installe Node.js LTS, ouvre PowerShell dans ce dossier et lance :
```
npm install
npm run build:windows
```
Le `.exe` est créé dans `dist/`. Pour les mises à jour, privilégie la publication de versions via GitHub Actions.

## 4 — Conservation des quiz
Les quiz restent dans le répertoire `userData` d'Electron, dans `quizlab-data.json`, même quand le programme est mis à jour. Exporte régulièrement tes quiz en JSON. Évite de supprimer les données utilisateur pendant la désinstallation.

## 5 — Partage des quiz à distance
Publie le dossier `lecteur-public` gratuitement sur Cloudflare Pages (Direct Upload). Dans QuizLab, bouton Partager > renseigne l'URL publique. Les réponses sont contenues dans les liens, donc ce système ne convient pas aux examens secrets.

## Limites et sécurité
- La compilation et l'installation graphique n'ont pas été exécutées dans cet environnement Linux ; la compilation Windows est prévue par GitHub Actions.
- L'installateur n'est pas signé numériquement : avertissement SmartScreen possible.
- GitHub Releases doit rester accessible publiquement pour les mises à jour automatiques sans authentification.
- Le code du dépôt public est visible par tous : n'y mets jamais de clé API ni de données personnelles.
- La génération IA depuis PDF n'est pas incluse dans cette version.
