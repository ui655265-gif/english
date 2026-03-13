<?php
session_start();
require_once('dbconnect.php');

$stmt = $pdo->prepare('delete from english_words where id = :id and user_id = :user_id');
$stmt->bindParam(':id', $_POST['id'], PDO::PARAM_INT);
$stmt->bindParam(':user_id', $_SESSION['id'], PDO::PARAM_INT);
$stmt->execute();
exit();