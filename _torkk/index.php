<?php
session_start();
$cars = [
    ['name' => 'Tesla Model 3', 'type' => 'electric', 'price' => 'PKR 15,000,000', 'details_url' => 'tesla-model-3.php', 'description' => 'The Tesla Model 3 is an electric four-door sedan developed by Tesla. It features advanced autopilot, long range, and a minimalist design.'],
    ['name' => 'Tesla Model Y', 'type' => 'electric', 'price' => 'PKR 30,000,000', 'details_url' => 'tesla-model-y.php', 'description' => 'The Tesla Model Y is an electric compact crossover SUV built by Tesla. It offers spacious interior, high safety ratings, and all-electric performance.'],
    ['name' => 'BMW X5', 'type' => 'used', 'price' => 'PKR 9,600,000', 'details_url' => 'bmw-x5.php', 'description' => 'The BMW X5 is a luxury SUV known for its powerful engines, advanced technology, and sporty driving dynamics. This used model offers great value.'],
    ['name' => 'Audi A4', 'type' => 'new', 'price' => 'PKR 15,000,000', 'details_url' => 'audi-a4.php', 'description' => 'The Audi A4 is a luxury compact executive car with a sleek design, premium interior, and advanced infotainment system.'],
    ['name' => 'Toyota Camry', 'type' => 'used', 'price' => 'PKR 16,000,000', 'details_url' => 'toyota-camry.php', 'description' => 'The Toyota Camry is a reliable midsize sedan known for its fuel efficiency, comfort, and long-lasting performance.'],
    ['name' => 'Honda Civic', 'type' => 'used', 'price' => 'PKR 8,000,000', 'details_url' => 'honda-civic.php', 'description' => 'The Honda Civic is a compact car offering excellent fuel economy, sporty handling, and a spacious cabin for its class.'],
    ['name' => 'Jeep Wrangler', 'type' => 'used', 'price' => 'PKR 23,000,000', 'details_url' => 'jeep-wrangler.php', 'description' => 'The Jeep Wrangler is an iconic off-road SUV with removable doors, rugged design, and exceptional off-road capabilities.'],
    ['name' => 'Nissan Altima', 'type' => 'new', 'price' => 'PKR 15,000,000', 'details_url' => 'nissan-altima.php', 'description' => 'The Nissan Altima is a stylish midsize sedan with a smooth ride, advanced technology, and competitive pricing.'],
    ['name' => 'Bentley SuperSports', 'type' => 'used', 'price' => 'PKR 300,000,000', 'details_url' => 'supersports.php', 'description' => 'Bentley Super Sports is the pinnacle of performance luxury, engineered for those who demand extreme power without compromising elegance.
With a thunderous W12 engine, handcrafted interior, and uncompromising attention to detail, it delivers breathtaking speed wrapped in timeless British craftsmanship.
Every curve, every stitch, and every roar reflects exclusivity, dominance, and refinement at the highest level of automotive excellence.'],
    ['name' => 'Ford Mustang', 'type' => 'new', 'price' => 'PKR 80,000,000', 'details_url' => 'ford-mustang.php', 'description' => 'The Ford Mustang is an American muscle car icon with thrilling performance, aggressive styling, and a legendary heritage.'],
];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="The leading cars purchase and selling site on the internet">
<title>Torkk</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="icon" href="favicon.png" type="image/png">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
html, body { height: 100%; }
body { font-family: 'Open Sans', sans-serif; display: flex; flex-direction: column; }
.brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.wheel svg { animation: spin 2s linear infinite; }
.card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 30px rgba(0,0,0,0.15); }
.btn { transition: transform 0.15s ease; }
.btn:active { transform: scale(0.95); }
.nav-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9999px; background: rgba(255,255,255,0.18); color: white; font-weight: 600; transition: all 0.25s ease; }
.nav-btn:hover { background: white; color: #b91c1c; transform: translateY(-2px); }

main { flex: 1; }
</style>
</head>
<body class="bg-gray-50">

<header class="bg-gradient-to-r from-red-700 to-red-500 px-10 pt-4 pb-16 text-black">
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
    <nav class="flex flex-wrap gap-2 sm:gap-4">
        <button onclick="filterCars('all')" class="nav-btn">All</button>
        <button onclick="filterCars('new')" class="nav-btn">New</button>
        <button onclick="filterCars('used')" class="nav-btn">Used</button>
        <button onclick="filterCars('electric')" class="nav-btn">Electric</button>
        <button onclick="filterCars('vans')" class="nav-btn">Vans</button>
        <a href="sale.php" class="nav-btn">For Sale</a>
        <a href="reviews.php" class="nav-btn">Reviews</a>
    </nav>

    <?php if (isset($_SESSION['user_id'])): ?>
        <a href="logout.php"
           class="btn bg-cyan-400 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-2">
            logout
        </a>
    <?php else: ?>
        <a href="login.php"
           class="btn bg-amber-400 px-5 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-2">
            login
        </a>
    <?php endif; ?>
</div>

<div class="flex items-center gap-2 text-6xl brand mb-4">
    <span>T</span>
    <div class="wheel w-12 h-12">
        <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="white" stroke-width="5" fill="none"/>
            <circle cx="50" cy="50" r="10" fill="white"/>
            <line x1="50" y1="10" x2="50" y2="50" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="90" y2="50" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="50" y2="90" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="10" y2="50" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="80" y2="20" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="20" y2="20" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="20" y2="80" stroke="white" stroke-width="3"/>
            <line x1="50" y1="50" x2="80" y2="80" stroke="white" stroke-width="3"/>
        </svg>
    </div>
    <span>RKK</span>
</div>

<p class="max-w-xl">Find, compare, and buy cars — simple, fast, trusted.</p>

<div class="mt-8 max-w-3xl">
    <div class="relative">
        <input id="searchInput" type="text" placeholder="Search car model..."
               class="w-full border px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 pr-12">
        <button onclick="searchCars()" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-700 text-white p-2 rounded-full hover:bg-red-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
        </button>
    </div>
</div>
</header>

<main class="max-w-6xl mx-auto px-10 py-14 grid md:grid-cols-3 gap-8" id="carGrid"></main>

<footer class="bg-gray-900 text-gray-400 text-center py-6">
    © 2026 Torkk. All rights reserved.
</footer>

<script>
const cars = <?php echo json_encode($cars); ?>;
const grid = document.getElementById("carGrid");
const searchInput = document.getElementById("searchInput");

// Render cars
function renderCars(list) {
    grid.innerHTML = "";
    list.forEach(car => {
        grid.innerHTML += `
            <div class="bg-white p-6 rounded-xl shadow card">
                <h3 class="font-bold text-lg">${car.name}</h3>
                <p class="text-gray-600 capitalize">${car.type}</p>
                <p class="text-red-700 font-bold mt-3">${car.price}</p>
                <a href="${car.details_url}" class="block mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-center">
                    View Details
                </a>
            </div>
        `;
    });
}

// Live search as you type
searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return renderCars(cars);
    renderCars(cars.filter(c => c.name.toLowerCase().includes(q)));
});

// Filter cars by type
function filterCars(type) {
    if (type === "all") return renderCars(cars);
    renderCars(cars.filter(c => c.type === type));
}

// Initial render
renderCars(cars);
</script>
</body>
</html>
