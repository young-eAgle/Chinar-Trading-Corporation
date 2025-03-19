const handleCategoryClick = (category) => {
  try {
    // Close dropdown
    setIsOpen(false);
    
    // Construct URL with category parameter
    const url = `/listing?category=${encodeURIComponent(category)}`;
    
    // Navigate to listing page with selected category
    navigate(url);
    
    // Trigger analytics event
    analyticsService.trackCategoryClick(category);
    
    // Store selected category in session storage for persistence
    sessionStorage.setItem('selectedCategory', category);
    
    console.log(`Navigating to category: ${category}`);
  } catch (error) {
    console.error('Error navigating to category:', error);
  }
};

const handleSubCategoryClick = (category, subcategory) => {
  try {
    // Close dropdown
    setIsOpen(false);
    
    // Construct URL with both category and subcategory parameters
    const url = `/listing?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`;
    
    // Navigate to listing page with selected category and subcategory
    navigate(url);
    
    // Trigger analytics event
    analyticsService.trackSubcategoryClick(category, subcategory);
    
    // Store selected values in session storage for persistence
    sessionStorage.setItem('selectedCategory', category);
    sessionStorage.setItem('selectedSubCategory', subcategory);
    
    console.log(`Navigating to category: ${category}, subcategory: ${subcategory}`);
  } catch (error) {
    console.error('Error navigating to subcategory:', error);
  }
}; 