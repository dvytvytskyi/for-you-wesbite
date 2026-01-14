const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
    cloud_name: 'dgv0rxd60',
    api_key: '239741542881456',
    api_secret: 'wIGbNnjrxBErm8F2-r2iewuRcMY'
});

const files = [
    'public/new logo.png',
    'public/new logo blue.png',
    'public/golf.jpg'
];

(async function () {
    for (const file of files) {
        if (fs.existsSync(file)) {
            console.log(`Uploading ${file}...`);
            try {
                const result = await cloudinary.uploader.upload(file, {
                    public_id: path.basename(file, path.extname(file)).replace(/ /g, '_').toLowerCase(),
                    resource_type: 'image',
                    unique_filename: false,
                    overwrite: true
                });
                console.log(`UPLOADED: ${file} -> ${result.secure_url}`);
            } catch (e) {
                console.error(`FAILED: ${file}`);
                console.error(e);
            }
        } else {
            console.log(`Skipping ${file} (not found)`);
        }
    }
})();
