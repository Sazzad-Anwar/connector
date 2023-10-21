#!/bin/bash

# Define the custom host and port
HOST="localhost"
PORT=2255

# Function to check if the port is in use
is_port_in_use() {
	local port="$1"
	nc -z -w 1 127.0.0.1 "$port" &>/dev/null
	return $?
}

# Function to stop a process by port
stop_process_by_port() {
	local port="$1"
	local pid
	pid=$(lsof -t -i :"$port")
	if [ -n "$pid" ]; then
		echo "Stopping the existing process on port $port (PID: $pid)..."
		kill "$pid"
	fi
}

# Step 1: Check if the port is in use
if is_port_in_use "$PORT"; then
	echo "Port $PORT is already in use."

	# Step 1A: Stop the existing process on the port
	stop_process_by_port "$PORT"
fi

# Step 1: Download the zip file
curl -LOk https://github.com/Sazzad-Anwar/connector/archive/refs/heads/main.zip

# Check if the directory already exists and remove it
if [ -d "connector-main" ]; then
	rm -rf "connector-main"
fi

# Step 2: Unzip the file
if [ -f main.zip ]; then
	unzip main.zip
	rm main.zip
	cd connector-main || exit 1
else
	echo "Failed to download the zip file."
	exit 1
fi

# Function to install Node.js using package managers
install_node() {
	# Step 3: Check if Node.js is installed
	if ! command -v node &>/dev/null; then
		echo "Node.js is not installed."

		if [[ "$(uname)" == "Darwin" ]]; then
			# macOS
			brew install node
			echo "Node.js is installed"
		elif [[ "$(uname -a)" == *"Microsoft"* ]]; then
			# Check if winget is available and install Node.js using winget
			if command -v winget &>/dev/null; then
				echo "Installing Node.js using winget..."
				winget install Node.js
			# Check if scoop is available and install Node.js using scoop
			elif command -v scoop &>/dev/null; then
				echo "Installing Node.js using scoop..."
				scoop install nodejs
			# Check if chocolatey is available and install Node.js using chocolatey
			elif command -v choco &>/dev/null; then
				echo "Installing Node.js using chocolatey..."
				choco install nodejs
			else
				echo "None of the supported package managers (winget, scoop, chocolatey) are available."
				echo "Please install Node.js manually."
			fi
		else
			# Linux
			sudo apt-get update
			sudo apt-get install -y nodejs
			echo "Node.js is installed"
		fi
	fi
}

# Call the function to install Node.js
install_node

# Step 5: Install Yarn
if ! command -v yarn &>/dev/null; then
	npm install -g yarn
fi

# Step 6: Install project dependencies
yarn install

# Step 7: Build the project
yarn build

# Step 8: Delete specified directories
rm -r app components config hooks lib public store styles types

# Step 9: Delete specified files
rm .editorconfig .eslintignore .eslintrc .prettierignore components.json postcss.config.js prettier.config.js tailwind.config.js

# Step 10: Run the app in the background with a custom host and port
yarn start -p "$PORT" -H "$HOST" &
APP_PID=$ # Store the PID of the background process

# Step 11: Open the application in a web browser (Linux)
if [[ "$(uname)" == "Linux" ]]; then
	xdg-open "http://$HOST:$PORT" # Adjust the URL and port if needed
# Step 11: Open the application in a web browser (macOS)
elif [[ "$(uname)" == "Darwin" ]]; then
	open "http://$HOST:$PORT" # Adjust the URL and port if needed
# Step 11: Add the custom host to the hosts file (Windows)
else
	# Windows
	start "" "http://localhost:2255"
fi

# To stop the background process, use the following command:
# kill "$APP_PID"
