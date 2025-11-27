#!/bin/bash

echo "================================================"
echo "   Manzana Mordida - Start Services Script"
echo "================================================"
echo ""

# Check if MongoDB is running
echo "🔍 Checking MongoDB..."
if nc -z localhost 27017 2>/dev/null; then
    echo "✓ MongoDB is running on port 27017"
else
    echo "✗ MongoDB is NOT running on port 27017"
    echo ""
    echo "Please start MongoDB first:"
    echo "  docker run -d --name mongodb -p 27017:27017 \\"
    echo "    -e MONGO_INITDB_ROOT_USERNAME=Manzana \\"
    echo "    -e MONGO_INITDB_ROOT_PASSWORD=Mordida445 \\"
    echo "    mongo:latest"
    echo ""
    exit 1
fi

echo ""
echo "🐳 Starting all microservices with Docker Compose..."
echo ""

docker-compose up --build

