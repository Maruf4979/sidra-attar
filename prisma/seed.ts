import { PrismaClient } from '@prisma/client';
import { products } from '../app/data/products';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || null,
        category: product.category,
        description: product.description,
        story: product.story,
        gradient: product.gradient,
        accent: product.accent,
        badge: product.badge || null,
        image: product.image || null,
        
        // Stringify complex nested arrays/objects for SQLite
        tags: JSON.stringify(product.tags || []),
        wholesalePrices: product.wholesalePrices ? JSON.stringify(product.wholesalePrices) : null,
        profile: product.profile ? JSON.stringify(product.profile) : null,
        occasions: JSON.stringify(product.occasions || []),
      },
    });
  }
  
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
