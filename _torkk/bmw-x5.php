<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>BMW X5 Details | Torkk</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
body { font-family: 'Open Sans', sans-serif; }
.brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
</style>
</head>
<body class="bg-gray-50">
<header class="bg-gradient-to-r from-red-700 to-red-500 px-10 pt-4 pb-16 text-black">
<div class="flex justify-between items-center mb-8">
    <a href="index.php" class="flex items-center gap-2 text-white text-4xl brand">
        <span>TORKK</span>
    </a>
   <?php if (isset($_SESSION['user_id'])): ?>
        <a href="logout.php" class="bg-amber-400 px-5 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300">
            Logout
        </a>
    <?php else: ?>
        <a href="login.php" class="bg-cyan-400 px-5 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300">
            Login
        </a>
    <?php endif; ?>
</div>
</header>
<main class="max-w-4xl mx-auto px-10 py-14">
<div class="bg-white p-8 rounded-xl shadow">
    <h2 class="text-3xl font-bold mb-4">BMW X5</h2>
    <img src="images/2008 BMW X5.jpg" alt="BMW X5" class="w-full h-64 object-cover rounded mb-4">
    <p class="text-gray-600 capitalize mb-2">Type: used</p>
    <p class="text-red-700 font-bold text-xl mb-4">Price: PKR 9,600,000</p>
    <p class="text-gray-700">The BMW X5 is a luxury SUV known for its powerful engines, advanced technology, and sporty driving dynamics. This used model offers great value.</p>
    <ul>
  <li>Type: gasoline</li>
  <li>KMs Driven: 70,000</li>
  <li>Inspected: yes</li>
  <li>Engine: 4000 CC</li>
  <li>Average: 8 to 9</li>
</ul>


    <div class="mt-6 space-y-4">
    <div class="bg-gray-100 p-4 rounded">
        <p class="font-semibold text-gray-800">Seller Contact</p>
        <p class="text-gray-700">
            Phone: <span class="font-medium">+92 300 1234567</span>
        </p>
        <p class="text-gray-700">
            Email: <span class="font-medium">seller.bmw@gmail.com</span>
        </p>
        <p class="text-sm text-gray-500 mt-1">
            Location: Lahore, Pakistan
        </p>
    </div>
    <div class="flex gap-4">
        <a href="tel:+923001234567"
           class="bg-cyan-400 text-white px-6 py-3 rounded hover:bg-blue-700">
            Call Seller
        </a>

        <a href="mailto:seller.bmw@gmail.com"
           class="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700">
            Email Seller
        </a>

        <a href="index.php"
           class="bg-gray-800 text-white px-6 py-3 rounded hover:bg-gray-900">
            Back to Listings
        </a>
    </div>
</div>


</div>
</main>
<footer class="bg-gray-900 text-gray-400 text-center py-6">
    © 2026 Torkk. All rights reserved.
</footer>
</body>
</html>