<?php
$cars = [
    ['name' => 'Tesla Model 3', 'type' => 'electric', 'price' => '$42,000', 'details_url' => 'tesla-model-3.php', 'description' => 'The Tesla Model 3 is an electric four-door sedan developed by Tesla. It features advanced autopilot, long range, and a minimalist design.'],
    ['name' => 'Tesla Model Y', 'type' => 'electric', 'price' => '$48,000', 'details_url' => 'tesla-model-y.php', 'description' => 'The Tesla Model Y is an electric compact crossover SUV built by Tesla. It offers spacious interior, high safety ratings, and all-electric performance.'],
    ['name' => 'BMW X5', 'type' => 'used', 'price' => '$58,000', 'details_url' => 'bmw-x5.php', 'description' => 'The BMW X5 is a luxury SUV known for its powerful engines, advanced technology, and sporty driving dynamics. This used model offers great value.'],
    ['name' => 'Audi A4', 'type' => 'new', 'price' => '$39,500', 'details_url' => 'audi-a4.php', 'description' => 'The Audi A4 is a luxury compact executive car with a sleek design, premium interior, and advanced infotainment system.'],
    ['name' => 'Mercedes C-Class', 'type' => 'new', 'price' => '$44,000', 'details_url' => 'mercedes-c-class.php', 'description' => 'The Mercedes-Benz C-Class is a line of compact executive cars with elegant styling, comfortable ride, and cutting-edge safety features.'],
    ['name' => 'Ford Transit', 'type' => 'vans', 'price' => '$33,000', 'details_url' => 'ford-transit.php', 'description' => 'The Ford Transit is a range of light commercial vehicles designed for versatility, reliability, and efficient cargo transportation.'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cars For Sale | Torkk</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
body { font-family: 'Open Sans', sans-serif; }
.brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
.card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
.card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 30px rgba(0,0,0,0.15); }
</style>
</head>
<body class="bg-gray-50">
<header class="bg-gradient-to-r from-red-700 to-red-600 px-10 pt-4 pb-16 text-black h-[25vh]
 flex flex-col">
    <div class="flex justify-between items-center mb-8">
        <a href="index.php" class="flex items-center gap-2 text-4xl brand">
            <span>TORKK</span>
        </a>
        <a href="login.php" class="btn bg-red-900 px-5 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300">
            login
        </a>
    </div>
    <h1 class="text-4xl text-gray-500 mt-auto brand blue-background">Cars For Sale</h1>
</header>
<section class="max-w-6xl mx-auto px-10 py-14 grid md:grid-cols-3 gap-8">
    <?php foreach ($cars as $car): ?>
        <div class="bg-white p-6 rounded-xl shadow card">
            <h3 class="font-bold text-lg"><?php echo $car['name']; ?></h3>
            <p class="text-gray-600 capitalize"><?php echo $car['type']; ?></p>
            <p class="text-red-700 font-bold mt-3"><?php echo $car['price']; ?></p>
            <a href="<?php echo $car['details_url']; ?>" class="block mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-center">
                View Details
            </a>
        </div>
    <?php endforeach; ?>
</section>
<footer class="bg-gray-900 text-gray-400 text-center py-6">
    © 2025 Torkk. All rights reserved.
</footer>
</body>
</html>
