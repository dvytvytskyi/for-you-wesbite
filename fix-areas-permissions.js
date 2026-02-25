
const { S3Client, ListObjectsV2Command, PutObjectAclCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const path = require('path');

// Configure dotenv
dotenv.config();

const config = {
    bucketName: process.env.S3_BUCKET_NAME || 'foryou',
    endpoint: process.env.S3_ENDPOINT || 'https://nbg1.your-objectstorage.com',
    region: process.env.S3_REGION || 'nbg1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || 'NO4DMOF39TSO56UNYT0O',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'vmWltjsWNRcIFCUkz5HI51RQw0q21uSs9qB9cUkW',
};

const s3 = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
});

async function run() {
    console.log('Target Bucket:', config.bucketName);
    console.log('Target Prefix: areas/');

    let token;
    let count = 0;

    try {
        do {
            const listCmd = new ListObjectsV2Command({
                Bucket: config.bucketName,
                Prefix: 'areas/',
                ContinuationToken: token
            });

            const response = await s3.send(listCmd);
            token = response.NextContinuationToken;

            const files = response.Contents || [];
            if (files.length === 0) {
                console.log('No files found in batch.');
                continue;
            }

            console.log(`Processing batch of ${files.length} files...`);

            for (const file of files) {
                if (!file.Key) continue;

                try {
                    await s3.send(new PutObjectAclCommand({
                        Bucket: config.bucketName,
                        Key: file.Key,
                        ACL: 'public-read'
                    }));
                    if (count % 50 === 0) process.stdout.write('.');
                    count++;
                } catch (e) {
                    console.error(`\nError setting ACL for ${file.Key}:`, e.message);
                }
            }
            console.log('\nBatch complete.');

        } while (token);

        console.log(`\nAll done. Processed ${count} files.`);

    } catch (e) {
        console.error('Fatal error:', e);
        process.exit(1);
    }
}

run();
