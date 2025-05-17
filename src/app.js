// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Infinite scroll functionality
let currentPage = 1;
let isLoading = false;
let hasMore = true;

const loadProducts = async (category = null, page = 1) => {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    const grid = document.getElementById('newArrivalsGrid');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    grid.appendChild(loadingDiv);

    try {
        const response = await fetch(`/api/products?category=${category || ''}&page=${page}`);
        const data = await response.json();
        
        if (data.products.length === 0) {
            hasMore = false;
            return;
        }

        data.products.forEach(product => {
            const productCard = createProductCard(product);
            grid.appendChild(productCard);
        });

        currentPage = page;
    } catch (error) {
        console.error('Error loading products:', error);
    } finally {
        isLoading = false;
        grid.removeChild(loadingDiv);
    }
};

const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <a href="/product/${product.item_id}">
            <img src="${product.main_image}" alt="${product.title}">
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="price">${product.price}</p>
                <p class="shop-name">${product.shop_name}</p>
            </div>
        </a>
    `;
    return card;
};

// Intersection Observer for infinite scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !isLoading) {
            const category = new URLSearchParams(window.location.search).get('category');
            loadProducts(category, currentPage + 1);
        }
    });
}, {
    rootMargin: '100px'
});

// Observe the last product card
const observeLastCard = () => {
    const cards = document.querySelectorAll('.product-card');
    if (cards.length > 0) {
        observer.observe(cards[cards.length - 1]);
    }
};

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    observeLastCard();
}); 