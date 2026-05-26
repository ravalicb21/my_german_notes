#!/bin/bash

echo "🚀 Starting My German Notes Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd client && npm install && cd ..
fi

# Initialize database if it doesn't exist
if [ ! -f "database/german_notes.db" ]; then
    echo -e "${YELLOW}Initializing database...${NC}"
    npm run init-db
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}To start the application:${NC}"
echo -e "${BLUE}1. Backend: npm run dev${NC}"
echo -e "${BLUE}2. Frontend: cd client && npm start${NC}"
echo ""
echo -e "${GREEN}The app will be available at:${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend API: http://localhost:5000${NC}"