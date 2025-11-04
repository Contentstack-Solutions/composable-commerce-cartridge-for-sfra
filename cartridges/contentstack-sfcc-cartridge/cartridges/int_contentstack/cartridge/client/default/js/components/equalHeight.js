function equalizeCategoryTileHeights() {
    const items = document.querySelectorAll(
        '.home-main-categories .category-tile-custom'
    );
    let maxHeight = 0;

    // Reset heights first
    items.forEach((item) => {
        item.style.height = 'auto';
    });

    // Find tallest
    items.forEach((item) => {
        maxHeight = Math.max(maxHeight, item.offsetHeight);
    });

    // Apply tallest to all
    items.forEach((item) => {
        item.style.height = maxHeight + 'px';
    });
}

// Run on load and resize
window.addEventListener('load', equalizeCategoryTileHeights);
window.addEventListener('resize', equalizeCategoryTileHeights);
