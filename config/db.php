<?php

$db = null;

if (file_exists(__DIR__ . '/db.local.php')) {
    $db = require(__DIR__ . '/db.local.php');
}

return $db;