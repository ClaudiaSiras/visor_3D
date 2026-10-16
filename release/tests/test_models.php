<?php
/**
 * Basic tests for the models API endpoint
 */

require_once __DIR__ . '/../api/models.php';

// Test 1: Check if endpoint returns valid JSON
echo "Test 1: Valid JSON response\n";
$response = file_get_contents('http://localhost/api/models.php');
$data = json_decode($response, true);
assert($data !== null, 'Response should be valid JSON');
assert(isset($data['success']), 'Response should have success field');
echo "  PASS\n";

// Test 2: Check if models array exists
echo "Test 2: Models array exists\n";
assert(isset($data['models']), 'Response should have models array');
assert(is_array($data['models']), 'Models should be an array');
echo "  PASS\n";

// Test 3: Check if count matches
echo "Test 3: Count matches models array\n";
assert(isset($data['count']), 'Response should have count field');
assert($data['count'] === count($data['models']), 'Count should match models array length');
echo "  PASS\n";

// Test 4: Check model structure
echo "Test 4: Model structure is correct\n";
if (count($data['models']) > 0) {
    $model = $data['models'][0];
    assert(isset($model['filename']), 'Model should have filename');
    assert(isset($model['displayName']), 'Model should have displayName');
    assert(isset($model['fileSize']), 'Model should have fileSize');
    assert(isset($model['fileSizeFormatted']), 'Model should have fileSizeFormatted');
}
echo "  PASS\n";

echo "\nAll tests passed!\n";
