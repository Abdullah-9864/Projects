<?php
session_start();
include 'db.php';

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm = $_POST['confirm'];

    if (strlen($password) < 6) {
        $message = "Password must be at least 6 characters.";
    } elseif ($password !== $confirm) {
        $message = "Passwords do not match.";
    } else {

        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $message = "Email is already registered.";
        } else {

            // Insert new user (plain password as requested)
            $stmt = $conn->prepare("INSERT INTO users (email, password) VALUES (?, ?)");
            $stmt->bind_param("ss", $email, $password);

            if ($stmt->execute()) {

                // ✅ AUTO LOGIN AFTER SIGNUP
                $_SESSION['user_id'] = $stmt->insert_id;
                $_SESSION['email'] = $email;

                // Redirect to homepage
                header("Location: index.php");
                exit;

            } else {
                $message = "Error: " . $stmt->error;
            }
        }
        $stmt->close();
    }
}

$conn->close();
?>





<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Signup - Torkk</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
.torkk-font {
    font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 2px;
}
</style>
</head>
<body class="bg-gray-50 min-h-screen">

<header class="px-6 pt-4">
    <a href="index.php" class="torkk-font text-5xl flex gap-0 font-bold">
  <span class="bg-gradient-to-r from-red-900 to-red-800 bg-clip-text text-transparent">T</span>
  <span class="bg-gradient-to-r from-red-300 to-cyan-200 bg-clip-text text-transparent">O</span>
  <span class="bg-gradient-to-r from-red-500 to-amber-400 bg-clip-text text-transparent">R</span>
  <span class="bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">K</span>
  <span class="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">K</span>
</a>
</header>

<div class="flex justify-center mt-12">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 class="text-2xl font-bold text-center mb-6">Sign Up</h2>

        <?php if($message): ?>
        <div class="mb-4 p-3 rounded text-sm text-center <?= strpos($message, 'successful') !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' ?>">
            <?= htmlspecialchars($message) ?>
        </div>
        <?php endif; ?>

        <form method="POST" class="space-y-4">
            <input type="email" name="email" placeholder="Email" 
                   class="w-full border px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500" 
                   value="<?= isset($_POST['email']) ? htmlspecialchars($_POST['email']) : '' ?>" required>
            <input type="password" name="password" placeholder="Password (min 6 chars)" 
                   class="w-full border px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500" required>
            <input type="password" name="confirm" placeholder="Confirm Password" 
                   class="w-full border px-4 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500" required>
            <button type="submit" 
                    class="w-full bg-red-700 text-white py-2.5 rounded hover:bg-red-800 transition-colors">
                Sign Up
            </button>
        </form>

        <p class="text-center text-sm text-gray-600 mt-6">
            Have an account? 
            <a href="login.php" class="text-red-600 font-medium hover:underline">Login</a>
        </p>
    </div>
</div>
</body>
</html>