document.addEventListener('DOMContentLoaded', async () => {
    const productId = window.location.pathname.split('/').pop();
    const mainImage = document.getElementById('mainImage');
    const productTitle = document.getElementById('productTitle');
    const productPrice = document.getElementById('productPrice');
    const shopName = document.getElementById('shopName');
    const qcImagesScroll = document.querySelector('.qc-images-scroll');

    try {
        const response = await fetch(`/api/product/${productId}`);
        const product = await response.json();

        // Set product details
        mainImage.src = product.main_image;
        productTitle.textContent = product.title;
        productPrice.textContent = product.price;
        shopName.textContent = product.shop_name;

        // Load QC images
        if (product.qc_images && product.qc_images.length > 0) {
            product.qc_images.forEach(image => {
                const img = document.createElement('img');
                img.src = image;
                img.className = 'qc-image';
                img.addEventListener('click', () => {
                    mainImage.src = image;
                });
                qcImagesScroll.appendChild(img);
            });
        }

        // Image navigation
        const prevBtns = document.querySelectorAll('.prev-btn');
        const nextBtns = document.querySelectorAll('.next-btn');

        prevBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const container = btn.closest('.main-image-container, .qc-images-container');
                if (container.classList.contains('main-image-container')) {
                    const currentIndex = product.qc_images.indexOf(mainImage.src);
                    const newIndex = (currentIndex - 1 + product.qc_images.length) % product.qc_images.length;
                    mainImage.src = product.qc_images[newIndex];
                } else {
                    qcImagesScroll.scrollBy({ left: -200, behavior: 'smooth' });
                }
            });
        });

        nextBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const container = btn.closest('.main-image-container, .qc-images-container');
                if (container.classList.contains('main-image-container')) {
                    const currentIndex = product.qc_images.indexOf(mainImage.src);
                    const newIndex = (currentIndex + 1) % product.qc_images.length;
                    mainImage.src = product.qc_images[newIndex];
                } else {
                    qcImagesScroll.scrollBy({ left: 200, behavior: 'smooth' });
                }
            });
        });

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        mainImage.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });

        mainImage.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left
                const currentIndex = product.qc_images.indexOf(mainImage.src);
                const newIndex = (currentIndex + 1) % product.qc_images.length;
                mainImage.src = product.qc_images[newIndex];
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right
                const currentIndex = product.qc_images.indexOf(mainImage.src);
                const newIndex = (currentIndex - 1 + product.qc_images.length) % product.qc_images.length;
                mainImage.src = product.qc_images[newIndex];
            }
        };

    } catch (error) {
        console.error('Error loading product details:', error);
    }
}); 