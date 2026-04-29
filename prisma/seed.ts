import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "cuidado-facial" },
      update: {},
      create: {
        name: "Cuidado Facial",
        slug: "cuidado-facial",
        description: "Productos para el cuidado de tu rostro",
      },
    }),
    prisma.category.upsert({
      where: { slug: "maquillaje" },
      update: {},
      create: {
        name: "Maquillaje",
        slug: "maquillaje",
        description: "Maquillaje de alta calidad",
      },
    }),
    prisma.category.upsert({
      where: { slug: "cuidado-corporal" },
      update: {},
      create: {
        name: "Cuidado Corporal",
        slug: "cuidado-corporal",
        description: "Productos para el cuidado de tu cuerpo",
      },
    }),
    prisma.category.upsert({
      where: { slug: "perfumes" },
      update: {},
      create: {
        name: "Perfumes",
        slug: "perfumes",
        description: "Fragancias exclusivas",
      },
    }),
  ]);

  const [facialCategory, makeupCategory, bodyCategory, perfumeCategory] = categories;

  // Create products
  const products: Array<{
  sku: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  categoryId: number;
  price: number;
  costPrice: number | null;
  stock: number;
  minStock: number;
  brand: string;
  weight: string;
  isFeatured: boolean;
  isActive: boolean;
}> = [
    {
      sku: "CF-001",
      name: "Serum Facial Vitamina C",
      slug: "serum-facial-vitamina-c",
      description: "Serum iluminador con vitamina C pura",
      longDescription: "Serum facial con 20% de vitamina C pura que ayuda a iluminar la piel, reducir manchas oscuras y proteger contra el daño de radicales libres. Ideal para todo tipo de piel.",
      categoryId: facialCategory.id,
      price: 450,
      costPrice: 180,
      stock: 50,
      minStock: 10,
      brand: "Glow Beauty",
      weight: 0.03,
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "CF-002",
      name: "Crema Hidratante Anti-edad",
      slug: "crema-hidratante-anti-edad",
      description: "Crema con ácido hialurónico y retinol",
      longDescription: "Crema hidratante avanzada con ácido hialurónico de bajo peso molecular y retinol encapsulado. Reduce líneas finas y arrugas mientras hidrata profundamente.",
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
      longDescription: "Limpiador facial espumoso con pH equilibrado que elimina impurezas y maquillaje sin resecar la piel. Enriquecido con extractos de té verde y camomila.",
      categoryId: facialCategory.id,
      price: 280,
      costPrice: 90,
      stock: 75,
      minStock: 15,
      brand: "Pure Skin",
      weight: 0.15,
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "CF-004",
      name: "Protector Solar SPF 50",
      slug: "protector-solar-spf-50",
      description: "Protector solar facial de amplio espectro",
      longDescription: "Protector solar facial ligero con SPF 50+ y protección UVA/UVB de amplio espectro. No deja residuo blanco y es ideal para uso diario bajo el maquillaje.",
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
      longDescription: "Base líquida de alta cobertura con acabado mate natural que dura hasta 24 horas. Controla el brillo y minimiza la apariencia de poros. Disponible en 20 tonos.",
      categoryId: makeupCategory.id,
      price: 380,
      costPrice: 140,
      stock: 45,
      minStock: 10,
      brand: "Perfect Finish",
      weight: 0.03,
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "MQ-002",
      name: "Paleta de Sombras Nudes",
      slug: "paleta-sombras-nudes",
      description: "Paleta de 12 sombras tonos neutros",
      longDescription: "Paleta de sombras con 12 tonos nudes mate y satinados. Pigmentos de alta calidad, larga duración y fácil difuminado. Ideal para looks de día y noche.",
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
      longDescription: "Máscara de pestañas con cepillo de fibra que proporciona volumen extremo sin grumos. Fórmula resistente al agua que dura todo el día.",
      categoryId: makeupCategory.id,
      price: 290,
      costPrice: 95,
      stock: 55,
      minStock: 12,
      brand: "Lash Queen",
      weight: 0.02,
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "MQ-004",
      name: "Labial Líquido Matte",
      slug: "labial-liquido-matte",
      description: "Labial líquido de larga duración",
      longDescription: "Labial líquido con acabado mate que no transfiere. Fórmula confortable que no reseca los labios. Disponible en 15 colores vibrantes.",
      categoryId: makeupCategory.id,
      price: 220,
      costPrice: 75,
      stock: 80,
      minStock: 15,
      brand: "Lip Love",
      weight: 0.02,
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "CC-001",
      name: "Crema Corporal Hidratante",
      slug: "crema-corporal-hidratante",
      description: "Crema corporal con karité y almendras",
      longDescription: "Crema corporal rica en manteca de karité y aceite de almendras que hidrata profundamente la piel. Textura cremosa que se absorbe rápidamente sin dejar sensación grasosa.",
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
      longDescription: "Exfoliante corporal con granos de café y cafeína que ayuda a reducir la apariencia de celulitis y estrías. Deja la piel suave y tonificada.",
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
      longDescription: "Aceite corporal con aceites esenciales de lavanda y camomila para masajes relajantes. Hidrata la piel y promueve la relajación y el bienestar.",
      categoryId: bodyCategory.id,
      price: 350,
      costPrice: 120,
      stock: 25,
      minStock: 5,
      brand: "Relax Spa",
      weight: 0.15,
      isFeatured: false,
      isActive: true,
    },
    {
      sku: "PF-001",
      name: "Perfume Floral Elegance",
      slug: "perfume-floral-elegance",
      description: "Fragancia floral con notas de jazmín",
      longDescription: "Elegante fragancia femenina con notas de salida de bergamota y mandarina, corazón floral de jazmín y rosa, y fondo amaderado de sándalo y almizcle.",
      categoryId: perfumeCategory.id,
      price: 850,
      costPrice: 350,
      stock: 20,
      minStock: 4,
      brand: "Elegance Parfums",
      weight: 0.1,
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "PF-002",
      name: "Perfume Oriental Mystic",
      slug: "perfume-oriental-mystic",
      description: "Fragancia oriental con vainilla y ámbar",
      longDescription: "Misteriosa fragancia oriental con notas de salida de especias y pomelo, corazón de vainilla y flor de azahar, y fondo de ámbar, incienso y madera de cedro.",
      categoryId: perfumeCategory.id,
      price: 920,
      costPrice: 380,
      stock: 18,
      minStock: 4,
      brand: "Elegance Parfums",
      weight: 0.1,
      isFeatured: true,
      isActive: true,
    },
    {
      sku: "PF-003",
      name: "Agua de Colonia Fresh",
      slug: "agua-colonia-fresh",
      description: "Colonia fresca cítrica unisex",
      longDescription: "Refrescante agua de colonia con notas cítricas de limón y naranja, con toques de menta y albahaca. Perfecta para uso diario y deportivo.",
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

  // Create admin user
  const adminPassword = await import("bcryptjs").then((bcrypt) =>
    bcrypt.hash("admin123", 10)
  );

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

  console.log("Seeding completed!");
  console.log(`- ${categories.length} categories created`);
  console.log(`- ${products.length} products created`);
  console.log(`- ${coupons.length} coupons created`);
  console.log(`- 1 admin user created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
