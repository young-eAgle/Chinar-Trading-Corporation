# PowerShell script to rename JSX files to PascalCase

# Navigate to the pages directory
cd .\client\src\pages

# Get all .jsx files recursively
$jsxFiles = Get-ChildItem -Path . -Filter "*.jsx" -Recurse

# Process each JSX file
foreach ($file in $jsxFiles) {
    $directory = $file.DirectoryName
    $fileName = $file.Name
    $fileNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    
    # Convert first character to uppercase
    if ($fileNameWithoutExt.Length -gt 0) {
        $firstChar = $fileNameWithoutExt.Substring(0, 1).ToUpper()
        $restOfName = if ($fileNameWithoutExt.Length -gt 1) { $fileNameWithoutExt.Substring(1) } else { "" }
        $newFileName = "$firstChar$restOfName.jsx"
        
        # If the filename needs to be changed
        if ($fileName -ne $newFileName) {
            $oldPath = Join-Path -Path $directory -ChildPath $fileName
            $newPath = Join-Path -Path $directory -ChildPath $newFileName
            
            Write-Host "Renaming $fileName to $newFileName in $directory"
            
            # Use Move-Item to rename
            try {
                Move-Item -Path $oldPath -Destination $newPath -Force -ErrorAction Stop
                Write-Host "  Success" -ForegroundColor Green
            } catch {
                Write-Host "  Failed: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "JSX file renaming completed!" 