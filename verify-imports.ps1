# Script to verify all import paths in App.jsx

# First, verify ContactUs.jsx exists
if (-not (Test-Path ".\client\src\pages\contact-us\ContactUs.jsx")) {
    Write-Host "Missing: ContactUs.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Contact Us\contactUs.jsx") {
        Copy-Item -Path ".\client\src\pages\Contact Us\contactUs.jsx" -Destination ".\client\src\pages\contact-us\ContactUs.jsx" -Force
        Write-Host "  ✓ Fixed: ContactUs.jsx"
    }
}

# Check for Signup.jsx
if (-not (Test-Path ".\client\src\pages\sign-up\Signup.jsx")) {
    Write-Host "Missing: Signup.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\SignUp Page\Signup.jsx") {
        Copy-Item -Path ".\client\src\pages\SignUp Page\Signup.jsx" -Destination ".\client\src\pages\sign-up\Signup.jsx" -Force
        Write-Host "  ✓ Fixed: Signup.jsx"
    }
}

# Check for Wishlist.jsx
if (-not (Test-Path ".\client\src\pages\wishlist\Wishlist.jsx")) {
    Write-Host "Missing: Wishlist.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Wishlist\Wishlist.jsx") {
        Copy-Item -Path ".\client\src\pages\Wishlist\Wishlist.jsx" -Destination ".\client\src\pages\wishlist\Wishlist.jsx" -Force
        Write-Host "  ✓ Fixed: Wishlist.jsx"
    }
}

# Check for HomePage.jsx
if (-not (Test-Path ".\client\src\pages\home\HomePage.jsx")) {
    Write-Host "Missing: HomePage.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Home Page\HomePage.jsx") {
        Copy-Item -Path ".\client\src\pages\Home Page\HomePage.jsx" -Destination ".\client\src\pages\home\HomePage.jsx" -Force
        Write-Host "  ✓ Fixed: HomePage.jsx"
    }
}

# Check for About.jsx
if (-not (Test-Path ".\client\src\pages\about\About.jsx")) {
    Write-Host "Missing: About.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\About Page\About.jsx") {
        Copy-Item -Path ".\client\src\pages\About Page\About.jsx" -Destination ".\client\src\pages\about\About.jsx" -Force
        Write-Host "  ✓ Fixed: About.jsx"
    }
}

# Check for Reviews files
if (-not (Test-Path ".\client\src\pages\reviews\Reviews.jsx")) {
    Write-Host "Missing: Reviews.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Reviews page\reviews.jsx") {
        Copy-Item -Path ".\client\src\pages\Reviews page\reviews.jsx" -Destination ".\client\src\pages\reviews\Reviews.jsx" -Force
        Write-Host "  ✓ Fixed: Reviews.jsx"
    }
}

if (-not (Test-Path ".\client\src\pages\reviews\AddReviews.jsx")) {
    Write-Host "Missing: AddReviews.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Reviews page\AddReviews.jsx") {
        Copy-Item -Path ".\client\src\pages\Reviews page\AddReviews.jsx" -Destination ".\client\src\pages\reviews\AddReviews.jsx" -Force
        Write-Host "  ✓ Fixed: AddReviews.jsx"
    }
}

if (-not (Test-Path ".\client\src\pages\reviews\ReviewList.jsx")) {
    Write-Host "Missing: ReviewList.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Reviews page\ReviewList.jsx") {
        Copy-Item -Path ".\client\src\pages\Reviews page\ReviewList.jsx" -Destination ".\client\src\pages\reviews\ReviewList.jsx" -Force
        Write-Host "  ✓ Fixed: ReviewList.jsx"
    }
}

# Check for Cart.jsx
if (-not (Test-Path ".\client\src\pages\cart\Cart.jsx")) {
    Write-Host "Missing: Cart.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\cart Page\cart.jsx") {
        Copy-Item -Path ".\client\src\pages\cart Page\cart.jsx" -Destination ".\client\src\pages\cart\Cart.jsx" -Force
        Write-Host "  ✓ Fixed: Cart.jsx"
    }
}

# Check for cart context
if (-not (Test-Path ".\client\src\pages\cart\CartContext.jsx")) {
    Write-Host "Missing: CartContext.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\cart Page\cartContext.jsx") {
        Copy-Item -Path ".\client\src\pages\cart Page\cartContext.jsx" -Destination ".\client\src\pages\cart\CartContext.jsx" -Force
        Write-Host "  ✓ Fixed: CartContext.jsx"
    }
}

# Check for Detail.jsx
if (-not (Test-Path ".\client\src\pages\details\Detail.jsx")) {
    Write-Host "Missing: Detail.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\details page\detail.jsx") {
        Copy-Item -Path ".\client\src\pages\details page\detail.jsx" -Destination ".\client\src\pages\details\Detail.jsx" -Force
        Write-Host "  ✓ Fixed: Detail.jsx"
    }
}

# Check for BulkUpload files
if (-not (Test-Path ".\client\src\pages\bulk-upload\UploadProduct.jsx")) {
    Write-Host "Missing: UploadProduct.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\bulkUpload\uploadProduct.jsx") {
        Copy-Item -Path ".\client\src\pages\bulkUpload\uploadProduct.jsx" -Destination ".\client\src\pages\bulk-upload\UploadProduct.jsx" -Force
        Write-Host "  ✓ Fixed: UploadProduct.jsx"
    }
}

if (-not (Test-Path ".\client\src\pages\bulk-upload\MultipleUpload.jsx")) {
    Write-Host "Missing: MultipleUpload.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\bulkUpload\multipleUplaod.jsx") {
        Copy-Item -Path ".\client\src\pages\bulkUpload\multipleUplaod.jsx" -Destination ".\client\src\pages\bulk-upload\MultipleUpload.jsx" -Force
        Write-Host "  ✓ Fixed: MultipleUpload.jsx"
    }
}

# Check for Checkout.jsx
if (-not (Test-Path ".\client\src\pages\checkout\Checkout.jsx")) {
    Write-Host "Missing: Checkout.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\CheckOut\checkout.jsx") {
        Copy-Item -Path ".\client\src\pages\CheckOut\checkout.jsx" -Destination ".\client\src\pages\checkout\Checkout.jsx" -Force
        Write-Host "  ✓ Fixed: Checkout.jsx"
    }
}

# Check for Order files
if (-not (Test-Path ".\client\src\pages\orders\AdminOrder.jsx")) {
    Write-Host "Missing: AdminOrder.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Order Pages\AdminOrder.jsx") {
        Copy-Item -Path ".\client\src\pages\Order Pages\AdminOrder.jsx" -Destination ".\client\src\pages\orders\AdminOrder.jsx" -Force
        Write-Host "  ✓ Fixed: AdminOrder.jsx"
    }
}

if (-not (Test-Path ".\client\src\pages\orders\MyOrders.jsx")) {
    Write-Host "Missing: MyOrders.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Order Pages\MyOrders.jsx") {
        Copy-Item -Path ".\client\src\pages\Order Pages\MyOrders.jsx" -Destination ".\client\src\pages\orders\MyOrders.jsx" -Force
        Write-Host "  ✓ Fixed: MyOrders.jsx"
    }
}

if (-not (Test-Path ".\client\src\pages\orders\OrderSuccess.jsx")) {
    Write-Host "Missing: OrderSuccess.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Order Pages\OrderSuccess.jsx") {
        Copy-Item -Path ".\client\src\pages\Order Pages\OrderSuccess.jsx" -Destination ".\client\src\pages\orders\OrderSuccess.jsx" -Force
        Write-Host "  ✓ Fixed: OrderSuccess.jsx"
    }
}

if (-not (Test-Path ".\client\src\pages\orders\OrderTracking.jsx")) {
    Write-Host "Missing: OrderTracking.jsx"
    # Copy and rename if original exists
    if (Test-Path ".\client\src\pages\Order Pages\OrderTracking.jsx") {
        Copy-Item -Path ".\client\src\pages\Order Pages\OrderTracking.jsx" -Destination ".\client\src\pages\orders\OrderTracking.jsx" -Force
        Write-Host "  ✓ Fixed: OrderTracking.jsx"
    }
}

Write-Host "Import verification complete!" 