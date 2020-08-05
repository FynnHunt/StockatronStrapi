sudo docker stop stockatron-strapi
git pull
sudo docker build -t stockatron-strapi .
sudo docker run -d -it --rm -p 1337:1337 --name stockatron-strapi -v $(pwd)/sqlitedata:/sqlitedata stockatron-strapi
