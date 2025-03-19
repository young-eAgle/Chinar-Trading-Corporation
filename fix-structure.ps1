# PowerShell script to fix directory and file structure for cross-platform compatibility

# Directory where the script will be executed
$baseDir = ".\client\src\pages"

# Map of old directory names to new kebab-case names
$directoryMappings = @{
    "About Page" = "about"
    "Breadcrumb" = "breadcrumb"
    "bulkUpload" = "bulk-upload"
    "Cart Page" = "cart"
    "CheckOut" = "checkout"
    "Contact Us" = "contact-us" 
    "details page" = "details"
    "gysers" = "gysers"
    "Home Banners" = "home-banners"
    "Home Page" = "home"
    "Listing Page" = "listing"
    "Modal Page" = "modal"
    "multipleData" = "multiple-data"
    "Order Pages" = "orders"
    "Reviews page" = "reviews"
    "SignUp Page" = "sign-up"
    "Wishlist" = "wishlist"
}

# Create temporary directory
New-Item -Path "$baseDir\temp" -ItemType Directory -Force | Out-Null
Write-Host "✅ Created temporary directory for migration"

# Process each directory
foreach ($oldDir in $directoryMappings.Keys) {
    $newDir = $directoryMappings[$oldDir]
    $oldPath = "$baseDir\$oldDir"
    $newPath = "$baseDir\$newDir"
    
    # Check if old directory exists
    if (Test-Path $oldPath) {
        Write-Host "Processing $oldDir → $newDir"
        
        # Create new directory
        New-Item -Path $newPath -ItemType Directory -Force | Out-Null
        
        # Copy all files from old to new
        Copy-Item -Path "$oldPath\*" -Destination "$newPath\" -Recurse -Force
        Write-Host "  ✓ Copied files from $oldDir to $newDir"
    }
}

Write-Host "✅ Directory structure updated successfully"

# Get all .jsx files and ensure component files use PascalCase
Write-Host "Standardizing component file naming..."
$jsxFiles = Get-ChildItem -Path $baseDir -Filter "*.jsx" -Recurse
foreach ($file in $jsxFiles) {
    $directory = $file.DirectoryName
    $fileName = $file.Name
    $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    
    # Convert first character to uppercase for component files
    $firstChar = $fileNameWithoutExt.Substring(0, 1).ToUpper()
    $restOfName = $fileNameWithoutExt.Substring(1)
    $newFileName = "$firstChar$restOfName.jsx"
    
    if ($fileName -ne $newFileName) {
        $newPath = Join-Path -Path $directory -ChildPath $newFileName
        Write-Host "  Renaming $fileName to $newFileName"
        Move-Item -Path $file.FullName -Destination $newPath -Force
    }
}

Write-Host "✅ Component files renamed to follow PascalCase convention"
Write-Host "✅ All modifications completed successfully!" 