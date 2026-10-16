<?php
/**
 * Models listing API endpoint
 * Returns JSON list of .glb model files from the modelos/ folder
 */

header('Content-Type: application/json');
header('Cache-Control: max-age=300');

$modelosDir = __DIR__ . '/../modelos/';
$maxFileSize = 10 * 1024 * 1024; // 10MB

// Check if directory exists
if (!is_dir($modelosDir)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'modelos/ folder not found'
    ]);
    exit;
}

// Check if directory is readable
if (!is_readable($modelosDir)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Unable to read modelos/ folder'
    ]);
    exit;
}

// Scan for .glb files
$models = [];
$files = scandir($modelosDir);

if ($files === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Unable to scan modelos/ folder'
    ]);
    exit;
}

foreach ($files as $file) {
    // Skip hidden files and directories
    if (strpos($file, '.') === 0) {
        continue;
    }

    $filePath = $modelosDir . $file;

    // Only include files
    if (!is_file($filePath)) {
        continue;
    }

    // Check extension (case-insensitive)
    $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if ($extension !== 'glb') {
        continue;
    }

    // Check file size
    $fileSize = filesize($filePath);
    if ($fileSize === false || $fileSize > $maxFileSize) {
        continue;
    }

    // Generate display name (filename without extension)
    $displayName = pathinfo($file, PATHINFO_FILENAME);

    // Format file size
    $fileSizeFormatted = formatFileSize($fileSize);

    $models[] = [
        'filename' => $file,
        'displayName' => $displayName,
        'fileSize' => $fileSize,
        'fileSizeFormatted' => $fileSizeFormatted
    ];
}

// Sort alphabetically by filename
usort($models, function($a, $b) {
    return strcmp($a['filename'], $b['filename']);
});

// Return response
echo json_encode([
    'success' => true,
    'models' => $models,
    'count' => count($models)
]);

/**
 * Format file size to human-readable string
 */
function formatFileSize($bytes) {
    if ($bytes >= 1048576) {
        return round($bytes / 1048576, 1) . ' MB';
    } elseif ($bytes >= 1024) {
        return round($bytes / 1024, 1) . ' KB';
    } else {
        return $bytes . ' B';
    }
}
