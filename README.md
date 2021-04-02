# pgrouCentraleNantes
projet PGROU dans le cadre de ma deuxième année à Centrale Nantes

Pour déployer l'application il faut une base de données Postgresql.

Un script de la création de cette base ainsi que l’ajout d’un utilisateur root est fourni.

Il suffit alors d’avoir installer node sur son ordinateur

Il y a un fichier env.json qui est à la racine du projet qu’il est primordial de modifier
En effet on y renseigne nos informations sur notre base de donnée : nom, utilisateur port de la base et mot de passe s'il y a.

Enfin on peut également depuis ce fichier changer le port sur lequel notre serveur écoute (par défaut port 8080)

Lorsque les variables sont réglées on peut lancer le projet. En se plaçant avec le terminal dans le dossier racine, on peut lancer la commande #npm install 
qui installera les dépendances nécessaires au bon fonctionnement de l’application.Elle n’est donc à lancer que la première fois.

Pour lancer l’application on peut alors lancer la commande #npm run prod.
Ainsi on obtient un message sur le port d’écoute et on peut s’y rendre alors.
