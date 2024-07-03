<?php
session_start();
require_once '../mainconfig.php';
include_once '../layouts/header.php';

// Fungsi untuk mengunggah gambar ke Telegra.ph
function uploadImageToTelegraph($imagePath) {
    $url = 'https://telegra.ph/upload';
    $cFile = curl_file_create($imagePath);

    $post = array('file' => $cFile);
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    $response = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($response, true);
    if (isset($result[0]['src'])) {
        return 'https://telegra.ph' . $result[0]['src'];
    }

    return null;
}

// Fungsi untuk memperhalus gambar menggunakan API
function enhanceImage($imageUrl) {
    $apiUrl = 'https://aemt.me/remini?url=' . urlencode($imageUrl) . '&resolusi=4';

    $response = file_get_contents($apiUrl);
    return json_decode($response, true);
}

$result = null;
$errorMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['imageFile'])) {
    $imageFile = $_FILES['imageFile'];

    // Mengunggah gambar ke Telegra.ph
    $uploadedImageUrl = uploadImageToTelegraph($imageFile['tmp_name']);

    if ($uploadedImageUrl) {
        $result = enhanceImage($uploadedImageUrl);
        if (!$result['status']) {
            $errorMessage = 'Gagal memperhalus gambar.';
        }
    } else {
        $errorMessage = 'Gagal mengunggah gambar.';
    }
}
?>

<section id="dashboard-ecommerce">
    <div class="row match-height">
        <div class="col-md-10 offset-md-1 col-12">
            <div class="card">
                <div class="card-body">
                    <h4 class="m-t-0 text-uppercase header-title">Unggah dan Perhalus Gambar</h4>
                    <form method="POST" enctype="multipart/form-data" class="form form-vertical">
                        <div class="form-group">
                            <label for="imageFile">Unggah Gambar:</label>
                            <input type="file" id="imageFile" name="imageFile" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Unggah</button>
                    </form>

                    <?php if ($result && $result['status']): ?>
                        <h5 class="mt-4">Hasil Unggahan:</h5>
                        <p><strong>URL Gambar Asli:</strong> <a href="<?php echo htmlspecialchars($uploadedImageUrl); ?>" target="_blank"><?php echo htmlspecialchars($uploadedImageUrl); ?></a></p>
                        <p><strong>URL Gambar Diperhalus:</strong> <a href="<?php echo htmlspecialchars($result['url']); ?>" target="_blank"><?php echo htmlspecialchars($result['url']); ?></a></p>
                        <img src="<?php echo htmlspecialchars($result['url']); ?>" alt="Gambar Diperhalus" class="img-fluid mt-3">
                        <a href="<?php echo htmlspecialchars($result['url']); ?>" class="btn btn-success mt-2" download>Unduh Gambar</a>
                    <?php elseif ($_SERVER['REQUEST_METHOD'] === 'POST'): ?>
                        <p class="mt-4 text-danger"><?php echo htmlspecialchars($errorMessage); ?></p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<?php include_once '../layouts/footer.php'; ?>
