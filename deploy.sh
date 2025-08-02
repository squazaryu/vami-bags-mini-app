#!/bin/bash

echo "🚀 Starting deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create gh-pages branch if it doesn't exist
    echo "🌿 Creating gh-pages branch..."
    git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
    
    # Remove all files except build
    echo "🧹 Cleaning gh-pages branch..."
    git rm -rf . 2>/dev/null || true
    
    # Copy build files
    echo "📁 Copying build files..."
    cp -r build/* .
    
    # Add and commit
    echo "💾 Committing changes..."
    git add .
    git commit -m "Deploy to GitHub Pages" 2>/dev/null || true
    
    # Push to gh-pages
    echo "🚀 Pushing to gh-pages..."
    git push origin gh-pages --force
    
    # Return to main branch
    git checkout main
    
    echo "✅ Deployment complete!"
    echo "🌐 Your app should be available at: https://squazaryu.github.io/vami-bags-mini-app/"
else
    echo "❌ Build failed!"
    exit 1
fi 