#!/bin/bash

# Windows Endpoint Management Dashboard - Build & Deploy Script
# This script builds and deploys the dashboard for production use

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_NAME="endpoint-management-dashboard"
BUILD_DIR="out"
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

print_status "Starting build process for $PROJECT_NAME..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the dashboard directory?"
    exit 1
fi

# Check for required environment variables
if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    print_warning "No environment file found. Creating .env.local from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_status "Please edit .env.local with your configuration"
    else
        print_error "No .env.example found. Please create environment configuration."
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
if command -v npm &> /dev/null; then
    npm ci --silent
elif command -v yarn &> /dev/null; then
    yarn install --silent
else
    print_error "Neither npm nor yarn found. Please install Node.js package manager."
    exit 1
fi

# Run linting
print_status "Running linter..."
npm run lint || {
    print_warning "Linting issues found. Continuing with build..."
}

# Run type checking
print_status "Running type checking..."
npm run type-check || {
    print_error "TypeScript type checking failed. Please fix type errors."
    exit 1
}

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next $BUILD_DIR

# Build the application
print_status "Building application..."
if [ "$1" = "static" ]; then
    print_status "Building static export..."
    npm run build
    npm run export
else
    print_status "Building for server deployment..."
    npm run build
fi

# Check if build was successful
if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Create deployment package
if [ "$1" = "package" ]; then
    print_status "Creating deployment package..."
    
    # Create backup directory if it doesn't exist
    mkdir -p $BACKUP_DIR
    
    # Package the build
    PACKAGE_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"
    
    if [ "$1" = "static" ]; then
        tar -czf "$BACKUP_DIR/$PACKAGE_NAME" $BUILD_DIR
        print_success "Static deployment package created: $BACKUP_DIR/$PACKAGE_NAME"
    else
        tar -czf "$BACKUP_DIR/$PACKAGE_NAME" .next package.json package-lock.json next.config.js public
        print_success "Server deployment package created: $BACKUP_DIR/$PACKAGE_NAME"
    fi
fi

# Optional: Deploy to server
if [ "$2" = "deploy" ]; then
    if [ -z "$DEPLOY_SERVER" ] || [ -z "$DEPLOY_PATH" ]; then
        print_error "DEPLOY_SERVER and DEPLOY_PATH environment variables must be set for deployment"
        exit 1
    fi
    
    print_status "Deploying to server: $DEPLOY_SERVER"
    
    # Upload files
    if [ "$1" = "static" ]; then
        rsync -avz --delete $BUILD_DIR/ "$DEPLOY_SERVER:$DEPLOY_PATH/"
    else
        rsync -avz --delete .next package.json next.config.js public/ "$DEPLOY_SERVER:$DEPLOY_PATH/"
    fi
    
    # Restart application (if needed)
    if [ ! -z "$DEPLOY_RESTART_COMMAND" ]; then
        ssh "$DEPLOY_SERVER" "$DEPLOY_RESTART_COMMAND"
    fi
    
    print_success "Deployment completed!"
fi

# Generate build report
print_status "Generating build report..."
cat > "build-report-$TIMESTAMP.txt" << EOF
Build Report - $PROJECT_NAME
Generated: $(date)
Build Type: ${1:-server}
Node Version: $(node --version)
NPM Version: $(npm --version)

Build Status: SUCCESS
Build Time: $TIMESTAMP

Files Generated:
$(if [ "$1" = "static" ]; then find $BUILD_DIR -type f | wc -l; else find .next -type f | wc -l; fi) files

Build Size:
$(if [ "$1" = "static" ]; then du -sh $BUILD_DIR; else du -sh .next; fi)

Environment:
$(if [ -f ".env.local" ]; then echo "Environment file: .env.local"; fi)
$(if [ -f ".env.production" ]; then echo "Environment file: .env.production"; fi)

Next Steps:
1. Test the build locally: npm start
2. Deploy to staging environment
3. Run integration tests
4. Deploy to production

EOF

print_success "Build report saved: build-report-$TIMESTAMP.txt"

# Final status
echo ""
print_success "Dashboard build process completed successfully!"
echo ""
print_status "To test the build locally:"
if [ "$1" = "static" ]; then
    print_status "  npx serve $BUILD_DIR"
else
    print_status "  npm start"
fi
echo ""
print_status "Build artifacts:"
if [ "$1" = "static" ]; then
    print_status "  Static files: $BUILD_DIR/"
else
    print_status "  Next.js build: .next/"
fi

if [ "$1" = "package" ]; then
    print_status "  Deployment package: $BACKUP_DIR/$PACKAGE_NAME"
fi

echo ""
print_status "Access the dashboard at: http://localhost:3000"
print_status "Default login: admin / ChangeMe123!"

exit 0
