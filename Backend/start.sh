#!/bin/bash

# Instalar tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Conectar a tu red Tailscale
tailscale up --authkey=$TAILSCALE_AUTHKEY --accept-routes --hostname=render-backend

# Esperar que la conexión se establezca
sleep 3

# Iniciar la app
node server.js