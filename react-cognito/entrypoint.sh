#!/bin/sh
set -e

echo "Injecting runtime environment variables into React app"

# Step 1: Create a runtime environment configuration script
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_SERVER_URL: "$REACT_APP_SERVER_URL"
};
EOF

# Step 2: Inject the script reference into the built `index.html`
# Locate the closing </head> tag in the index.html and insert the env-config.js reference before it
sed -i '/<\/head>/i <script src="/env-config.js"></script>' /usr/share/nginx/html/index.html

# Step 3: Start Nginx
exec nginx -g 'daemon off;'
