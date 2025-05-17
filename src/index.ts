import { drizzle } from 'drizzle-orm/d1';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { eq, isNull } from 'drizzle-orm';

// Define the products table
const products = sqliteTable('products', {
    item_id: integer('item_id').primaryKey(),
    title: text('title'),
    price: text('price'),
    main_image: text('main_image'),
    category: integer('category'),
    shop_name: text('shop_name'),
    qc_image_group_map: integer('qc_image_group_map'),
    item_id_base: integer('item_id_base')
});

// Define types
type Product = typeof products.$inferSelect;
type ProductWithImages = Product & { qc_images: string[] };

// Define the Env interface
export interface Env {
    DB: D1Database;
}

// Static file content
const staticFiles = {
    '/styles.css': `/* 全局样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
}

/* 导航栏样式 */
.main-nav {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
}

.nav-links {
    display: flex;
    gap: 2rem;
}

.nav-links a {
    text-decoration: none;
    color: #666;
    transition: color 0.3s;
}

.nav-links a:hover {
    color: #000;
}

/* 产品网格样式 */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    padding: 2rem;
}

.product-card {
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s;
}

.product-card:hover {
    transform: translateY(-5px);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 1rem;
}

.product-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
}

.product-price {
    color: #e44d26;
    font-weight: bold;
}

/* 产品详情页样式 */
.product-detail {
    padding: 2rem;
}

.product-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.product-gallery {
    position: relative;
}

.main-image-container {
    position: relative;
    margin-bottom: 1rem;
}

.main-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 8px;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.8);
    border: none;
    padding: 1rem;
    cursor: pointer;
    border-radius: 50%;
}

.prev-btn {
    left: 1rem;
}

.next-btn {
    right: 1rem;
}

.qc-images-container {
    position: relative;
    overflow: hidden;
}

.qc-images-scroll {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding: 1rem 0;
}

.qc-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.3s;
}

.qc-image:hover {
    opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .mobile-menu-btn {
        display: block;
    }
    
    .product-container {
        grid-template-columns: 1fr;
    }
}`,
    '/app.js': `// 获取产品列表
async function fetchProducts(category = null, page = 1) {
    const url = new URL('/api/products', window.location.origin);
    if (category) url.searchParams.set('category', category);
    url.searchParams.set('page', page);
    
    const response = await fetch(url);
    const data = await response.json();
    return data.products;
}

// 渲染产品卡片
function renderProductCard(product) {
    return \`
        <div class="product-card" onclick="window.location.href='/product/\${product.item_id}'">
            <img src="\${product.main_image}" alt="\${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">\${product.title}</h3>
                <p class="product-price">\${product.price}</p>
            </div>
        </div>
    \`;
}

// 初始化页面
async function initPage() {
    const newArrivalsGrid = document.getElementById('newArrivalsGrid');
    if (newArrivalsGrid) {
        const products = await fetchProducts();
        newArrivalsGrid.innerHTML = products.map(renderProductCard).join('');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);`,
    '/product.js': `// 获取产品详情
async function fetchProductDetails(productId) {
    const response = await fetch(\`/api/product/\${productId}\`);
    return await response.json();
}

// 更新产品图片
function updateMainImage(imageUrl) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.src = imageUrl;
    }
}

// 渲染QC图片
function renderQCImages(images) {
    const container = document.querySelector('.qc-images-scroll');
    if (container) {
        container.innerHTML = images.map(image => \`
            <img src="\${image}" alt="QC Image" class="qc-image" onclick="updateMainImage('\${image}')">
        \`).join('');
    }
}

// 更新产品信息
function updateProductInfo(product) {
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productPrice').textContent = product.price;
    document.getElementById('shopName').textContent = product.shop_name;
}

// 初始化产品页面
async function initProductPage() {
    const productId = window.location.pathname.split('/').pop();
    if (productId) {
        const product = await fetchProductDetails(productId);
        updateProductInfo(product);
        updateMainImage(product.main_image);
        renderQCImages(product.qc_images);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initProductPage);`,
    '/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fashion Guide - Your Style Destination</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <nav class="main-nav">
            <div class="logo">Fashion Guide</div>
            <div class="nav-links">
                <a href="/category/shoes">Shoes</a>
                <a href="/category/t_shirt">T-Shirts</a>
                <a href="/category/pants">Pants & Shorts</a>
                <a href="/category/hoodies">Hoodies & Sweaters</a>
                <a href="/category/jackets">Jackets</a>
                <a href="/category/accessories">Accessories</a>
                <a href="/category/others">Others</a>
            </div>
            <div class="mobile-menu-btn">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <main>
        <section class="intro">
            <h1>Welcome to Fashion Guide</h1>
            <p>Discover the latest trends and styles from top brands. We curate the best fashion items to help you express your unique style.</p>
        </section>

        <section class="new-arrivals">
            <h2>New Arrivals</h2>
            <div class="products-grid" id="newArrivalsGrid">
                <!-- Products will be loaded here dynamically -->
            </div>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Fashion Guide. All rights reserved.</p>
    </footer>

    <script src="/app.js"></script>
</body>
</html>`,
    '/product.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Details - Fashion Guide</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <header>
        <nav class="main-nav">
            <div class="logo">Fashion Guide</div>
            <div class="nav-links">
                <a href="/category/shoes">Shoes</a>
                <a href="/category/t_shirt">T-Shirts</a>
                <a href="/category/pants">Pants & Shorts</a>
                <a href="/category/hoodies">Hoodies & Sweaters</a>
                <a href="/category/jackets">Jackets</a>
                <a href="/category/accessories">Accessories</a>
                <a href="/category/others">Others</a>
            </div>
            <div class="mobile-menu-btn">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <main class="product-detail">
        <div class="product-container">
            <div class="product-gallery">
                <div class="main-image-container">
                    <button class="nav-btn prev-btn">&lt;</button>
                    <img id="mainImage" src="" alt="Product Image" class="main-image">
                    <button class="nav-btn next-btn">&gt;</button>
                </div>
                <div class="qc-images-container">
                    <button class="nav-btn prev-btn">&lt;</button>
                    <div class="qc-images-scroll">
                        <!-- QC images will be loaded here dynamically -->
                    </div>
                    <button class="nav-btn next-btn">&gt;</button>
                </div>
            </div>
            <div class="product-info">
                <h1 id="productTitle"></h1>
                <p class="price" id="productPrice"></p>
                <p class="shop-name" id="shopName"></p>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; 2024 Fashion Guide. All rights reserved.</p>
    </footer>

    <script src="/product.js"></script>
</body>
</html>`
};

export default {
    async fetch(request: Request, env: Env) {
        const db = drizzle(env.DB);
        const url = new URL(request.url);
        const path = url.pathname;

        // Serve static files
        if (path in staticFiles) {
            const contentType = path.endsWith('.css') ? 'text/css' :
                              path.endsWith('.js') ? 'application/javascript' :
                              'text/html';
            return new Response(staticFiles[path as keyof typeof staticFiles], {
                headers: { 'Content-Type': contentType }
            });
        }

        // API routes
        if (path.startsWith('/api/products')) {
            const category = url.searchParams.get('category');
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = 20;
            const offset = (page - 1) * limit;

            try {
                let productList: Product[];
                productList = await db.select()
                .from(products)
                .limit(limit)
                .offset(offset)
                .all();
                return Response.json({ products: productList });
            } catch (error) {
                console.error('Database error:', error);
                return new Response('Internal Server Error', { status: 500 });
            }
        }

        if (path.startsWith('/api/product/')) {
            const productId = path.split('/').pop();
            if (!productId) {
                return new Response('Invalid product ID', { status: 400 });
            }

            try {
                const product = await db.select()
                    .from(products)
                    .where(eq(products.item_id, parseInt(productId)))
                    .get();

                if (!product) {
                    return new Response('Product not found', { status: 404 });
                }

                // Get QC images for the product
                let qcImages: Product[] = [];
                if (product.qc_image_group_map !== null) {
                    qcImages = await db.select()
                        .from(products)
                        .where(eq(products.qc_image_group_map, product.qc_image_group_map))
                        .all();
                }

                const productWithImages: ProductWithImages = {
                    ...product,
                    qc_images: qcImages.map(p => p.main_image || '')
                };

                return Response.json(productWithImages);
            } catch (error) {
                console.error('Database error:', error);
                return new Response('Internal Server Error', { status: 500 });
            }
        }

        // Serve HTML pages
        if (path === '/') {
            return new Response(staticFiles['/index.html'], {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        if (path.startsWith('/product/')) {
            return new Response(staticFiles['/product.html'], {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        return new Response('Not found', { status: 404 });
    },
};