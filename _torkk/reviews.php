<?php
session_start();

// Optional: fetch user info if logged in
$isLoggedIn = isset($_SESSION['user_id']);
$userEmail  = $isLoggedIn ? $_SESSION['email'] : '';
$userRole   = $isLoggedIn ? $_SESSION['role'] : '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Car Reviews | Torkk</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
body { font-family: 'Open Sans', sans-serif; }
.brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
</style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">

<header class="bg-gradient-to-r from-red-700 to-red-500 px-10 pt-4 pb-12 text-black min-h-[35vh] flex flex-col">
    
    <div class="flex justify-between items-center mb-8">
        <!-- Logo in center for mobile, left for desktop -->
        <a href="index.php" class="flex items-center gap-2 text-4xl brand">
           <span>TORKK</span>
        </a>

        <!-- Dynamic Login/Logout button -->
        <?php if($isLoggedIn): ?>
            <a href="logout.php" class="bg-red-900 px-4 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300">
                Logout
            </a>
        <?php else: ?>
            <a href="login.php" class="bg-red-900 px-4 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300">
                Login
            </a>
        <?php endif; ?>
    </div>

    <h1 class="tracking-wide text-4xl text-gray-50 mt-auto brand">
        Car Reviews
    </h1>
    <h1 class="tracking-wide text-yellow-400">★★★★☆</h1>

    <!-- Show user info if logged in -->
    <?php if($isLoggedIn): ?>
        <p class="mt-2 text-sm text-gray-200">
            Logged in as: <?= htmlspecialchars($userEmail) ?> (<?= htmlspecialchars($userRole) ?>)
        </p>
    <?php endif; ?>
</header>

<section class="max-w-6xl mx-auto px-10 py-14 flex-grow">
    <h2 class="text-2xl font-bold mb-6">Read and Write Reviews</h2>
    <p class="mb-4">This is where you can read and write reviews for cars.</p>

    <!-- Optional: show admin-only section -->
    <?php if($isLoggedIn && $userRole === 'admin'): ?>
        <div class="mt-6 p-4 bg-red-100 text-red-800 rounded">
            Admin Options: You can moderate reviews or manage cars.
        </div>
    <?php endif; ?>
</section>

<footer class="bg-gray-900 text-gray-400 text-center py-6">
    © 2025 Torkk. All rights reserved.
</footer>

</body>
</html>

<!-- 
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Car Reviews | Torkk</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>
body { font-family: 'Open Sans', sans-serif; }
.brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
</style>
</head>
<body class="bg-gray-50 min-h-screen flex flex-col">
<header class="bg-gradient-to-r from-red-700 to-red-500 px-10 pt-4 pb-12 text-black min-h-[35vh] flex flex-col">
    
    <div class="flex justify-between items-center mb-8">
        <a href="index.php" class="flex items-center gap-2 text-4xl brand">
           <span>TORKK</span>
        </a>

        <a href="login.php" class="bg-red-900 px-5 py-2 rounded-full hover:bg-white hover:scale-105 transition-all duration-300">
            login
        </a>
    </div>

    <h1 class="tracking-wide text-4xl text-gray-500 mt-auto brand">
        Car Reviews

    </h1>
    <h1 class="tracking-wide text-yellow-500">★★★★☆</h1>

</header>

<section class="max-w-6xl mx-auto px-10 py-14 flex-grow">
    <h2 class="text-2xl font-bold mb-6">Read and Write Reviews</h2>
    <p class="mb-4">This is where you can read and write reviews for cars.</p>
    
</section>
<footer class="bg-gray-900 text-gray-400 text-center py-6">
    © 2025 Torkk. All rights reserved.
</footer>
</body>
</html> -->
