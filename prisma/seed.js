const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const facialCategory = await prisma.category.upsert({
    where: { slug: "cuidado-facial" },
    update: {},
    create: {
      name: "Cuidado Facial",
      slug: "cuidado-facial",
      description: "Productos para el cuidado de tu rostro",
    },
  });

  const makeupCategory = await prisma.category.upsert({
    where: { slug: "maquillaje" },
    update: {},
    create: {
      name: "Maquillaje",
      slug: "maquillaje",
      description: "Maquillaje de alta calidad",
    },
  });

  const bodyCategory = await prisma.category.upsert({
    where: { slug: "cuidado-corporal" },
    update: {},
    create: {
      name: "Cuidado Corporal",
      slug: "cuidado-corporal",
      description: "Productos para el cuidado de tu cuerpo",
    },
  });

  const perfumeCategory = await prisma.category.upsert({
    where: { slug: "perfumes" },
    update: {},
    create: {
      name: "Perfumes",
      slug: "perfumes",
      description: "Fragancias exclusivas",
    },
  });

  console.log("Categories created");

  // Create products
  const products = [
    {
      sku: "CF-001",
      name: "Serum Facial Vitamina C",
      slug: "serum-facial-vitamina-c",
      description: "Serum iluminador con vitamina C pura",
      longDescription: "Serum facial con 20% de vitamina C pura que ayuda a iluminar la piel, reducir manchas oscuras y proteger contra el daño de radicales libres.",
      categoryId: facialCategory.id,
      price: 450,
      costPrice: 180,
      stock: 50,
      minStock: 10,
      brand: "Glow Beauty",
      weight: "30g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "CF-002",
      name: "Crema Hidratante Anti-edad",
      slug: "crema-hidratante-anti-edad",
      description: "Crema con ácido hialurónico y retinol",
      longDescription: "Crema hidratante avanzada con ácido hialurónico y retinol encapsulado. Reduce líneas finas y arrugas.",
      categoryId: facialCategory.id,
      price: 580,
      costPrice: 250,
      stock: 35,
      minStock: 8,
      brand: "Glow Beauty",
      weight: "50g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "CF-003",
      name: "Limpiador Facial Espumoso",
      slug: "limpiador-facial-espumoso",
      description: "Limpiador suave para uso diario",
      longDescription: "Limpiador facial espumoso con pH equilibrado que elimina impurezas y maquillaje sin resecar.",
      categoryId: facialCategory.id,
      price: 280,
      costPrice: 90,
      stock: 75,
      minStock: 15,
      brand: "Pure Skin",
      weight: "150g",
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "CF-004",
      name: "Protector Solar SPF 50",
      slug: "protector-solar-spf-50",
      description: "Protector solar facial de amplio espectro",
      longDescription: "Protector solar facial ligero con SPF 50+ y protección UVA/UVB. No deja residuo blanco.",
      categoryId: facialCategory.id,
      price: 320,
      costPrice: 120,
      stock: 60,
      minStock: 12,
      brand: "Sun Shield",
      weight: "50g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "MQ-001",
      name: "Base Líquida Matte 24H",
      slug: "base-liquida-matte-24h",
      description: "Base de larga duración con acabado matte",
      longDescription: "Base líquida de alta cobertura con acabado mate natural que dura hasta 24 horas.",
      categoryId: makeupCategory.id,
      price: 380,
      costPrice: 140,
      stock: 45,
      minStock: 10,
      brand: "Perfect Finish",
      weight: "30g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "MQ-002",
      name: "Paleta de Sombras Nudes",
      slug: "paleta-sombras-nudes",
      description: "Paleta de 12 sombras tonos neutros",
      longDescription: "Paleta de sombras con 12 tonos nudes mate y satinados. Pigmentos de alta calidad.",
      categoryId: makeupCategory.id,
      price: 450,
      costPrice: 180,
      stock: 30,
      minStock: 6,
      brand: "Color Pop",
      weight: "80g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "MQ-003",
      name: "Máscara de Pestañas Volumen",
      slug: "mascara-pestanas-volumen",
      description: "Máscara con efecto volumen extremo",
      longDescription: "Máscara de pestañas con cepillo de fibra que proporciona volumen extremo sin grumos.",
      categoryId: makeupCategory.id,
      price: 290,
      costPrice: 95,
      stock: 55,
      minStock: 12,
      brand: "Lash Queen",
      weight: "20g",
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "MQ-004",
      name: "Labial Líquido Matte",
      slug: "labial-liquido-matte",
      description: "Labial líquido de larga duración",
      longDescription: "Labial líquido con acabado mate que no transfiere. Fórmula confortable.",
      categoryId: makeupCategory.id,
      price: 220,
      costPrice: 75,
      stock: 80,
      minStock: 15,
      brand: "Lip Love",
      weight: "20g",
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "CC-001",
      name: "Crema Corporal Hidratante",
      slug: "crema-corporal-hidratante",
      description: "Crema corporal con karité y almendras",
      longDescription: "Crema corporal rica en manteca de karité y aceite de almendras que hidrata profundamente.",
      categoryId: bodyCategory.id,
      price: 320,
      costPrice: 110,
      stock: 40,
      minStock: 8,
      brand: "Body Care",
      weight: "250g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "CC-002",
      name: "Exfoliante Corporal Cafeína",
      slug: "exfoliante-corporal-cafeina",
      description: "Exfoliante anticelulítico con cafeína",
      longDescription: "Exfoliante corporal con granos de café y cafeína que ayuda a reducir la apariencia de celulitis.",
      categoryId: bodyCategory.id,
      price: 280,
      costPrice: 90,
      stock: 35,
      minStock: 7,
      brand: "Body Care",
      weight: "200g",
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "CC-003",
      name: "Aceite Corporal Relajante",
      slug: "aceite-corporal-relajante",
      description: "Aceite con lavanda y camomila",
      longDescription: "Aceite corporal con aceites esenciales de lavanda y camomila para masajes relajantes.",
      categoryId: bodyCategory.id,
      price: 350,
      costPrice: 120,
      stock: 25,
      minStock: 5,
      brand: "Relax Spa",
      weight: "150g",
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "PF-001",
      name: "Perfume Floral Elegance",
      slug: "perfume-floral-elegance",
      description: "Fragancia floral con notas de jazmín",
      longDescription: "Elegante fragancia femenina con notas de bergamota, jazmín, rosa y sándalo.",
      categoryId: perfumeCategory.id,
      price: 850,
      costPrice: 350,
      stock: 20,
      minStock: 4,
      brand: "Elegance Parfums",
      weight: "100g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "PF-002",
      name: "Perfume Oriental Mystic",
      slug: "perfume-oriental-mystic",
      description: "Fragancia oriental con vainilla y ámbar",
      longDescription: "Misteriosa fragancia oriental con notas de especias, vainilla, ámbar e incienso.",
      categoryId: perfumeCategory.id,
      price: 920,
      costPrice: 380,
      stock: 18,
      minStock: 4,
      brand: "Elegance Parfums",
      weight: "100g",
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "PF-003",
      name: "Agua de Colonia Fresh",
      slug: "agua-colonia-fresh",
      description: "Colonia fresca cítrica unisex",
      longDescription: "Refrescante agua de colonia con notas cítricas de limón y naranja, con toques de menta.",
      categoryId: perfumeCategory.id,
      price: 480,
      costPrice: 180,
      stock: 50,
      minStock: 10,
      brand: "Fresh Scents",
      weight: "120g",
      isFeatured: false,
      isActive: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log(`${products.length} products created`);

  // Create coupons
  const coupons = [
    {
      code: "BIENVENIDO20",
      discountType: "PERCENTAGE",
      value: 20,
      minAmount: 500,
      maxDiscount: 200,
      usageLimit: 100,
      isActive: true,
    },
    {
      code: "VERANO2024",
      discountType: "PERCENTAGE",
      value: 15,
      minAmount: 300,
      maxDiscount: 150,
      expiryDate: new Date("2024-08-31"),
      usageLimit: 50,
      isActive: true,
    },
    {
      code: "DESCUENTO50",
      discountType: "FIXED",
      value: 50,
      minAmount: 400,
      usageLimit: 30,
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  console.log(`${coupons.length} coupons created`);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      fullName: "Administrador",
      email: "admin@cosmeticshop.com",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin user created");
  console.log("\n✅ Seeding completed!");
  console.log(`- 4 categories`);
  console.log(`- ${products.length} products`);
  console.log(`- ${coupons.length} coupons`);
  console.log(`- 1 admin user (admin/admin123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
