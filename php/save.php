<?php
session_start();
require_once('dbconnect.php');

if (empty($_POST['words']) || empty($_POST['meanings'])) {
  exit();
}

if (mb_strlen($_POST['words']) > 100 || mb_strlen($_POST['meanings']) > 100) {
  exit();
}

$now = date('Y-m-d H:i:s');

$words = $_POST['words'];
if (stripos($words, ' ') === false) {
  $type = 0;
} else {
  $type = 1;
}

$stmt = $pdo->prepare('insert into english_words (user_id, words, meanings, type, date, last_study) values (:user_id, :words, :meanings, :type, :date, :last_study)');
$stmt->bindParam(':user_id', $_SESSION['id'], PDO::PARAM_INT);
$stmt->bindParam(':words', $words, PDO::PARAM_STR);
$stmt->bindParam(':meanings', $_POST['meanings'], PDO::PARAM_STR);
$stmt->bindParam(':type', $type, PDO::PARAM_INT);
$stmt->bindParam(':date', $now, PDO::PARAM_STR);
$stmt->bindParam(':last_study', $now, PDO::PARAM_STR);
$stmt->execute();
exit();