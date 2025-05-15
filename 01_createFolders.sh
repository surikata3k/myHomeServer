sudo addgroup firulai
sudo usermod -aG firulai $USER

sudo mkdir /server
sudo mkdir /server/shared
sudo mkdir /server/downloads
sudo mkdir /server/multimedia

sudo chown $USER:firulai /server
sudo chown $USER:firulai /server/shared
sudo chown $USER:firulai /server/downloads
sudo chown $USER:firulai /server/multimedia

chmod -R 760 /server
chmod -R 760 /server/shared
chmod -R 760 /server/downloads
chmod -R 760 /server/multimedia


