<?php
session_start();
require_once('dbconnect.php');

$now = date('Y-m-d H:i:s');

$stmt = $pdo->prepare('update english_words set status = :status, last_study = :now where id = :id and user_id = :user_id');
$stmt->bindParam(':status', $_POST["status"], PDO::PARAM_INT);
$stmt->bindParam(':now', $now, PDO::PARAM_STR);
$stmt->bindParam(':id', $_POST["id"], PDO::PARAM_INT);
$stmt->bindParam(':user_id', $_SESSION["id"], PDO::PARAM_INT);
$stmt->execute();
exit();
