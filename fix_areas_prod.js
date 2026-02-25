
const { Client } = require('pg');

// Database connection config
const client = new Client({
    connectionString: 'postgresql://admin:admin123@for-you-admin-panel-postgres-prod:5432/admin_panel',
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Get all areas
        const areasRes = await client.query('SELECT id, "nameEn", slug, "mainImage" FROM areas');
        const allAreas = areasRes.rows;
        console.log(`Processing ${allAreas.length} areas...`);

        // 2. Get properties to count and find images
        // We only need areaId and photos.
        const propsRes = await client.query('SELECT "areaId", photos FROM properties WHERE "areaId" IS NOT NULL');
        const allProps = propsRes.rows;
        console.log(`Found ${allProps.length} properties for stats.`);

        // Aggregate stats
        const areasStats = {}; // { areaId: { count: 0, photos: [] } }

        for (const prop of allProps) {
            const areaId = prop.areaId;
            if (!areasStats[areaId]) {
                areasStats[areaId] = { count: 0, photos: [] };
            }
            areasStats[areaId].count++;

            // Collect robust photos
            let photos = [];
            try {
                if (prop.photos) {
                    if (typeof prop.photos === 'string') {
                        // Try to parse if it looks like JSON array
                        if (prop.photos.startsWith('[')) {
                            photos = JSON.parse(prop.photos);
                        } else {
                            // Assuming comma separated or single url
                            photos = [prop.photos];
                        }
                    } else if (Array.isArray(prop.photos)) {
                        photos = prop.photos;
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }

            if (photos && photos.length > 0) {
                // Only add if we don't have enough photos yet (optimization)
                if (areasStats[areaId].photos.length < 5) {
                    areasStats[areaId].photos.push(...photos);
                }
            }
        }

        // Sort areas by count
        const sortedAreaIds = Object.keys(areasStats).sort((a, b) => areasStats[b].count - areasStats[a].count);
        const top20Ids = sortedAreaIds.slice(0, 20);

        console.log(`Top 5 areas by property count:`);
        top20Ids.slice(0, 5).forEach(id => {
            const area = allAreas.find(a => a.id === id);
            console.log(`- ${area ? area.nameEn : id}: ${areasStats[id].count} props`);
        });

        // 3. Update each area
        for (const area of allAreas) {
            let updates = [];
            let values = [];
            let paramIdx = 1;

            // Handle Slug
            if (!area.slug) {
                let slug = area.nameEn.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                // Simple uniqueness check (in-memory)
                // This script assumes running once to fix current state.
                // In production code, handle DB constraint errors.
                const conflict = allAreas.find(a => a.slug === slug && a.id !== area.id);
                if (conflict) {
                    slug = `${slug}-${area.id.substring(0, 4)}`;
                }

                updates.push(`slug = $${paramIdx++}`);
                values.push(slug);
                area.slug = slug; // Update local state for uniqueness check
            }

            // Handle Stats & Image
            const isTop20 = top20Ids.includes(area.id);
            const rank = top20Ids.indexOf(area.id);

            // isFeatured: top 10
            let isFeatured = false;
            let priority = 0;

            if (isTop20 && rank < 10) {
                isFeatured = true;
                priority = 100 - rank;
            }

            updates.push(`"isFeatured" = $${paramIdx++}`);
            values.push(isFeatured);

            updates.push(`priority = $${paramIdx++}`);
            values.push(priority);

            updates.push(`"isactive" = $${paramIdx++}`);
            values.push(true); // User requested status active

            // Main Image
            // If already has mainImage, keep it? Or overwrite if empty?
            // User requested update everything, so populate if missing.
            if (!area.mainImage || area.mainImage === '') {
                const stats = areasStats[area.id];
                if (stats && stats.photos.length > 0) {
                    const image = stats.photos[0];
                    updates.push(`"mainImage" = $${paramIdx++}`);
                    values.push(image);
                }
            }

            if (updates.length > 0) {
                values.push(area.id); // Valid ID for WHERE clause
                const query = `UPDATE areas SET ${updates.join(', ')} WHERE id = $${paramIdx}`;
                await client.query(query, values);
                // console.log(`Updated area ${area.nameEn}`);
            }
        }

        console.log('Successfully updated areas.');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
