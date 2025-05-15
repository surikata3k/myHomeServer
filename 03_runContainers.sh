

for FILE in compose/*; 
do 
    docker compose -f $FILE up -d;
done