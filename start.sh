#!/bin/bash

#pnpm start

URL="https://www.example.com"

if which node >/dev/null; then
  npm install -g yarn
  yarn install
  yarn build
  start http://localhost:3000
  yarn start
else
  if [[ "$OSTYPE" =~ ^darwin ]]; then
    echo "MacOS"
  fi

  if [[ "$OSTYPE" =~ ^linux ]]; then
    echo "Linux"
  fi
  if [[ "$OSTYPE" =~ ^windows ]]; then
    echo "Windows"
  fi
fi
