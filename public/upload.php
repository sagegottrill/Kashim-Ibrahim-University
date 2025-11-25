<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');

// Configuration
$uploadDir = 'uploads/';
$allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
$maxSize = 10 * 1024 * 1024; // 10MB

// Create upload directory if it doesn't exist
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileTmpName = $file['tmp_name'];
        $fileSize = $file['size'];
        $fileError = $file['error'];
        $fileType = $file['type'];

        // Check for errors
        if ($fileError === 0) {
            // Check file size
            if ($fileSize <= $maxSize) {
                // Check file type
                // Note: Checking MIME type is not 100% secure but good enough for this context. 
                // For better security, check file extension as well.
                $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                $allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];

                if (in_array($fileExt, $allowedExts)) {
                    // Generate unique name to prevent overwriting
                    // Format: TIMESTAMP_RANDOM_CLEANNAME
                    $cleanName = preg_replace('/[^a-zA-Z0-9._-]/', '', basename($fileName));
                    $newFileName = time() . '_' . uniqid() . '_' . $cleanName;
                    $destination = $uploadDir . $newFileName;

                    if (move_uploaded_file($fileTmpName, $destination)) {
                        // Success
                        // Return the full URL to the file. 
                        // Assuming the script is at root/upload.php and uploads are at root/uploads/
                        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
                        $host = $_SERVER['HTTP_HOST'];
                        // Adjust path if script is in a subdirectory
                        $path = dirname($_SERVER['REQUEST_URI']);
                        if ($path == '/' || $path == '\\') $path = '';
                        
                        $fileUrl = "$protocol://$host$path/$destination";

                        echo json_encode([
                            'success' => true,
                            'message' => 'File uploaded successfully',
                            'url' => $fileUrl,
                            'path' => $destination // For internal use if needed
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file.']);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid file type. Only PDF, JPG, and PNG are allowed.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'File is too large. Max limit is 10MB.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Error uploading file. Code: ' . $fileError]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No file received.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
}
?>
