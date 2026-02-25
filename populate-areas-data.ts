
import { AppDataSource } from '../config/database';
import { Area } from '../entities/Area';
import { Property } from '../entities/Property';

async function run() {
    try {
        await AppDataSource.initialize();
        console.log('Database initialized');

        const areaRepo = AppDataSource.getRepository(Area);
        const propRepo = AppDataSource.getRepository(Property);

        // 1. Get all areas to generate slugs
        const allAreas = await areaRepo.find();
        console.log(`Generating slugs for ${allAreas.length} areas...`);

        for (const area of allAreas) {
            if (!area.slug) {
                area.slug = area.nameEn
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');

                // Ensure uniqueness by adding short ID if needed
                const existing = allAreas.find(a => a.slug === area.slug && a.id !== area.id);
                if (existing) {
                    area.slug = `${area.slug}-${area.id.substring(0, 4)}`;
                }
            }
        }
        await areaRepo.save(allAreas);
        console.log('Slugs generated.');

        // 2. Get top 20 areas by property count
        const topAreasData = await areaRepo.createQueryBuilder('area')
            .leftJoin(Property, 'property', 'property.areaId = area.id')
            .select(['area.id as id', 'area.nameEn as name'])
            .addSelect('COUNT(property.id)', 'count')
            .groupBy('area.id, area.nameEn')
            .orderBy('COUNT(property.id)', 'DESC')
            .limit(20)
            .getRawMany();

        console.log(`Processing top ${topAreasData.length} areas for images...`);

        for (let i = 0; i < topAreasData.length; i++) {
            const areaData = topAreasData[i];
            const area = await areaRepo.findOneBy({ id: areaData.id });
            if (!area) continue;

            // Find a property with photos in this area
            const propertyWithPhoto = await propRepo.createQueryBuilder('p')
                .where('p.areaId = :areaId', { areaId: area.id })
                .andWhere("p.photos IS NOT NULL AND p.photos != '[]'")
                .select('p.photos')
                .getOne();

            if (propertyWithPhoto && propertyWithPhoto.photos && propertyWithPhoto.photos.length > 0) {
                area.mainImage = propertyWithPhoto.photos[0];
                console.log(`Set mainImage for ${area.nameEn}: ${area.mainImage.substring(0, 50)}...`);
            }

            if (i < 10) {
                area.isFeatured = true;
                area.priority = 100 - i;
            }

            area.isActive = true;
            await areaRepo.save(area);
        }

        console.log('Successfully updated featured areas and slugs.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
