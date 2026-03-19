<?php
$session_timeout = 604800;

ini_set('session.gc_maxlifetime', $session_timeout);
session_set_cookie_params([
    'lifetime' => $session_timeout,
    'path' => '/',
    'secure' => true,   
    'httponly' => true, 
    'samesite' => 'Lax'
]);

session_start();