#!/bin/bash

# Start Xvfb
Xvfb :99 -screen 0 1920x1080x24 &

# Wait for Xvfb to start
sleep 2

# Set the environment variables
export DISPLAY=:99
export NODE_ENV='production'

# mkdir /reddit/out

# Generate a .Xauthority file
touch /root/.Xauthority
xauth generate $DISPLAY . trusted
xauth add $DISPLAY . $(xxd -l 16 -p /dev/urandom)

# Set XAUTHORITY environment variable
export XAUTHORITY=/root/.Xauthority

# Run the web service
service dbus start
cd /reddit/app && npm start