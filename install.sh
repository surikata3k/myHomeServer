echo "######## Create folders ########"
sh 01_createFolders.sh

echo "######## Install docker ########"
sh 02_docker.sh

echo "######## Run containers ########"
sh 03_runContainers.sh

echo "######## Set dashboard ########"
sh 04_dashboard.sh
