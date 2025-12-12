#!/bin/bash

# CodeArena Database Setup Script
# This script helps set up the database using alternative methods

echo "🔍 Checking MySQL installation..."

# Check if MySQL is installed
if command -v mysql &> /dev/null; then
    echo "✅ MySQL found!"
    echo ""
    echo "Loading schema..."
    mysql -u root -p < database/mysql_schema.sql
    echo "✅ Database setup complete!"
    exit 0
fi

echo "❌ MySQL not found in PATH"
echo ""
echo "📋 Please choose an installation method:"
echo ""
echo "Option 1: Install MySQL via Homebrew (Recommended)"
echo "  brew install mysql"
echo "  brew services start mysql"
echo "  mysql -u root -p < database/mysql_schema.sql"
echo ""
echo "Option 2: Download MySQL from official site"
echo "  Visit: https://dev.mysql.com/downloads/mysql/"
echo "  After installation, use MySQL Workbench to load database/mysql_schema.sql"
echo ""
echo "Option 3: Use Docker"
echo "  1. Install Docker Desktop for Mac"
echo "  2. Run: docker-compose up -d"
echo "  (Database will be automatically created)"
echo ""
echo "Option 4: Use a Node.js script (No MySQL client needed!)"
echo "  Run: node setup-database.js"
echo ""

read -p "Which option would you like? (1/2/3/4): " choice

case $choice in
    1)
        echo "Installing MySQL via Homebrew..."
        brew install mysql
        brew services start mysql
        echo "Please set a root password:"
        mysql_secure_installation
        echo "Now loading schema..."
        mysql -u root -p < database/mysql_schema.sql
        ;;
    2)
        echo "Opening MySQL download page..."
        open "https://dev.mysql.com/downloads/mysql/"
        echo "After installation, use MySQL Workbench to load the schema"
        ;;
    3)
        echo "Please install Docker Desktop first:"
        open "https://www.docker.com/products/docker-desktop"
        echo "Then run: docker-compose up -d"
        ;;
    4)
        echo "Using Node.js setup script..."
        node setup-database.js
        ;;
    *)
        echo "Invalid option"
        ;;
esac
