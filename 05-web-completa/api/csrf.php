<?php
require_once __DIR__ . '/../includes/csrf.php';
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['token' => csrfToken()]);
