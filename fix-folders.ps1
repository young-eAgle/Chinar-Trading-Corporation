# PowerShell script to rename folders for VPS compatibility

# Navigate to pages directory
cd .\client\src\pages

# Create new directories
mkdir -p about
mkdir -p breadcrumb
mkdir -p bulk-upload
mkdir -p cart
mkdir -p checkout
mkdir -p contact-us
mkdir -p details
mkdir -p gysers
mkdir -p home-banners
mkdir -p home
mkdir -p listing
mkdir -p modal
mkdir -p multiple-data
mkdir -p orders
mkdir -p reviews
mkdir -p sign-up
mkdir -p wishlist

# Copy files from old directories to new ones
Copy-Item -Path "About Page\*" -Destination "about\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Breadcrumb\*" -Destination "breadcrumb\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "bulkUpload\*" -Destination "bulk-upload\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Cart Page\*" -Destination "cart\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "CheckOut\*" -Destination "checkout\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Contact Us\*" -Destination "contact-us\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "details page\*" -Destination "details\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Details Page\*" -Destination "details\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "gysers\*" -Destination "gysers\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Home Banners\*" -Destination "home-banners\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Home Page\*" -Destination "home\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Listing Page\*" -Destination "listing\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Modal Page\*" -Destination "modal\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "multipleData\*" -Destination "multiple-data\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Order Pages\*" -Destination "orders\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Reviews page\*" -Destination "reviews\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Reviews Page\*" -Destination "reviews\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "SignUp Page\*" -Destination "sign-up\" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Wishlist\*" -Destination "wishlist\" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Folder structure has been updated!" 