

for DIR in compose/*/; 
do 
    if [ -d "$DIR" ]; then
        for FILE in "$DIR"*.yaml "$DIR"*.yml; 
        do 
            if [ -f "$FILE" ]; then
                docker compose -f "$FILE" up -d;
            fi
        done
    fi
done