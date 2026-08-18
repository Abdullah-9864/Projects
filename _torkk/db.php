<?php
$host = 'ftpupload.net'; // e.g., sqlXXX.infinityfree.com
$user = 'if0_38938406';
$pass = 'Ab5599ab';
$dbname = 'if0_38938406_torkk';
$port = 3307;


$conn = new mysqli($host, $user, $pass, $dbname, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>