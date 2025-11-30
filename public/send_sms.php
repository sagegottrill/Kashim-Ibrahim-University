<?php
// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration
// TODO: Replace with your actual API Token from BulkSMS Nigeria
$apiToken = 'cJpwIHCY0GwGlAz98xxvWShTVXGovVEHes2CwAm6dFzIOs99JClYhJ4QW38s';
$defaultSenderId = 'KIUTH'; // Max 11 characters

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
    exit;
}

// Validate input
if (empty($input['to']) || empty($input['body'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields: to, body']);
    exit;
}

$to = $input['to'];
$body = $input['body'];
$from = isset($input['from']) ? $input['from'] : $defaultSenderId;

// Prepare data for BulkSMS Nigeria API
$data = [
    'from' => $from,
    'to' => $to,
    'body' => $body,
    'api_token' => $apiToken, // Passing token in body as per one of the auth methods
    'gateway' => 'direct-corporate' // Recommended gateway
];

// Initialize cURL
$ch = curl_init('https://www.bulksmsnigeria.com/api/v2/sms');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'cURL Error: ' . $curlError]);
    exit;
}

// Return the API response
http_response_code($httpCode);
echo $response;
?>