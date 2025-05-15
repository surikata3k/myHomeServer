#!/bin/bash

HTML_FILE="./html/index.html"

# Get all non-local IPs and let user choose one
IP_ADDRESSES=($(hostname -I))
if [ ${#IP_ADDRESSES[@]} -gt 1 ]; then
  echo "Multiple IP addresses found:"
  for i in "${!IP_ADDRESSES[@]}"; do
    echo "$i) ${IP_ADDRESSES[$i]}"
  done
  read -p "Choose the IP address to use [0-${#IP_ADDRESSES[@]}]: " index
  SERVER_IP="${IP_ADDRESSES[$index]}"
else
  SERVER_IP="${IP_ADDRESSES[0]}"
fi

echo "Using IP address: $SERVER_IP"

# Start HTML file
cat <<EOF > $HTML_FILE
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Home Server Dashboard</title>
  <style>
    body { font-family: sans-serif; background: #f0f2f5; padding: 2rem; }
    h1 { text-align: center; }
    .container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .card {
      background: white;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .card a {
      display: block;
      color: #0366d6;
      font-weight: bold;
      margin-top: 0.5rem;
      text-decoration: none;
    }
    .card a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Docker Dashboard</h1>
  <div class="container">
EOF

# Generate service cards
docker ps --format '{{.Names}} {{.Ports}}' | while read -r name ports; do
  port=$(echo "$ports" | grep -oP '\d+(?=->)' | head -n 1)
  if [ -n "$port" ]; then
    cat <<EOF >> $HTML_FILE
    <div class="card">
      <div>$name</div>
      <a href="http://$SERVER_IP:$port" target="_blank">http://$SERVER_IP:$port</a>
    </div>
EOF
  fi
done

# Close HTML
cat <<EOF >> $HTML_FILE
  </div>
</body>
</html>
EOF
