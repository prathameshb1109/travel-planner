<?php
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/phpmailer/phpmailer/src/Exception.php';
require 'vendor/phpmailer/phpmailer/src/PHPMailer.php';
require 'vendor/phpmailer/phpmailer/src/SMTP.php';

// Allow from a specific origin (make sure this matches your React app's URL)
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow from React app
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allow POST and OPTIONS methods
header("Access-Control-Allow-Headers: Content-Type"); // Allow Content-Type header
header("Access-Control-Allow-Credentials: true"); // Allow credentials (cookies, etc.)

// Handle OPTIONS request (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set the content type for the response
header("Content-Type: application/json");

// Get the raw POST data
$data = json_decode(file_get_contents("php://input"), true);

// Check if data is valid
if (!$data) {
    echo json_encode(["message" => "Invalid data"]);
    exit;
}

// Sanitize data
$name = htmlspecialchars($data["name"]);
$email = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
$guests = htmlspecialchars($data["guests"]);
$hours = htmlspecialchars($data["hours"]);
$hotelName = htmlspecialchars($data["hotelName"]);
$hotelAddress = htmlspecialchars($data["hotelAddress"]);
$totalPrice = htmlspecialchars($data["totalPrice"]);

// Setup PHPMailer
$mail = new PHPMailer(true);

try {
    // SMTP configuration
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Your SMTP host
    $mail->SMTPAuth = true;
    $mail->Username = 'prathameshwebdev4@gmail.com'; // Your SMTP username
    $mail->Password = 'zivmirorxsckyzrd'; // Your SMTP password
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Sender & recipient
    $mail->setFrom('info@travelplanner.com', 'Hotel Booking');
    $mail->addAddress($email); // User's email
    $mail->addAddress('prathameshvelocity5@gmail.com'); // Your admin email

    $mail->isHTML(true);
    $mail->Subject = 'Hotel Booking Confirmation';
    $mail->Body = "
        <h2>Booking Details</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Guests:</strong> $guests</p>
        <p><strong>Hours:</strong> $hours</p>
        <p><strong>Hotel Name:</strong> $hotelName</p>
        <p><strong>Address:</strong> $hotelAddress</p>
        <p><strong>Total Price:</strong> ₹$totalPrice</p>
    ";

    // Send the email
    $mail->send();
    echo json_encode(["message" => "Email sent successfully!"]);
} catch (Exception $e) {
    echo json_encode(["message" => "Email failed: {$mail->ErrorInfo}"]);
}
?>
