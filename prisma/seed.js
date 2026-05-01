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

  // Create variant types (Tamaño, Color)
  const sizeVariantType = await prisma.variantType.upsert({
    where: { slug: "tamano" },
    update: {},
    create: {
      name: "Tamaño",
      slug: "tamano",
    },
  });

  const colorVariantType = await prisma.variantType.upsert({
    where: { slug: "color" },
    update: {},
    create: {
      name: "Color",
      slug: "color",
    },
  });

  console.log("Variant types created (Tamaño, Color)");

  // Delete existing variant values to avoid duplicates, then create new ones
  await prisma.variantValue.deleteMany({});
  
  // Create variant values for Tamaño
  const size30ml = await prisma.variantValue.create({
    data: {
      variantTypeId: sizeVariantType.id,
      value: "30ml",
    },
  });
  
  const size50ml = await prisma.variantValue.create({
    data: {
      variantTypeId: sizeVariantType.id,
      value: "50ml",
    },
  });
  
  const size100ml = await prisma.variantValue.create({
    data: {
      variantTypeId: sizeVariantType.id,
      value: "100ml",
    },
  });

  // Create variant values for Color
  const colorNatural = await prisma.variantValue.create({
    data: {
      variantTypeId: colorVariantType.id,
      value: "Natural",
      hexColor: "#F5DEB3",
    },
  });
  
  const colorBeige = await prisma.variantValue.create({
    data: {
      variantTypeId: colorVariantType.id,
      value: "Beige",
      hexColor: "#E8D4C4",
    },
  });
  
  const colorRosa = await prisma.variantValue.create({
    data: {
      variantTypeId: colorVariantType.id,
      value: "Rosa",
      hexColor: "#FFB6C1",
    },
  });
  
  const colorDorado = await prisma.variantValue.create({
    data: {
      variantTypeId: colorVariantType.id,
      value: "Dorado",
      hexColor: "#FFD700",
    },
  });

  console.log("Variant values created (30ml, 50ml, 100ml, Natural, Beige, Rosa, Dorado)");

  // Create product with variants - Serum Vitamina C
  const serumWithVariants = await prisma.product.upsert({
    where: { sku: "CF-001-VAR" },
    update: {},
    create: {
      sku: "CF-001-VAR",
      name: "Serum Vitamina C - Edición Variantes",
      slug: "serum-vitamina-c-variantes",
      description: "Serum iluminador disponible en diferentes presentaciones",
      longDescription: "Serum facial con vitamina C pura. Disponible en 30ml, 50ml y 100ml.",
      categoryId: facialCategory.id,
      price: 450,
      costPrice: 180,
      stock: 100, // Total stock across variants
      minStock: 20,
      brand: "Glow Beauty",
      isFeatured: true,
      isActive: true,
      mainImage: "https://placehold.co/600x800/F5DEB3/7a5646?text=Serum+Vitamina+C",
    },
  });

  // Create variants for the serum (using upsert to avoid duplicates)
  const serumVariant30 = await prisma.productVariant.upsert({
    where: { sku: "CF-001-VAR-30" },
    update: { stock: 40, price: 450 },
    create: {
      productId: serumWithVariants.id,
      sku: "CF-001-VAR-30",
      price: 450,
      stock: 40,
      values: { connect: [{ id: size30ml.id }] },
    },
  });

  const serumVariant50 = await prisma.productVariant.upsert({
    where: { sku: "CF-001-VAR-50" },
    update: { stock: 35, price: 680 },
    create: {
      productId: serumWithVariants.id,
      sku: "CF-001-VAR-50",
      price: 680,
      stock: 35,
      values: { connect: [{ id: size50ml.id }] },
    },
  });

  const serumVariant100 = await prisma.productVariant.upsert({
    where: { sku: "CF-001-VAR-100" },
    update: { stock: 25, price: 950 },
    create: {
      productId: serumWithVariants.id,
      sku: "CF-001-VAR-100",
      price: 950,
      stock: 25,
      values: { connect: [{ id: size100ml.id }] },
    },
  });

  console.log("Serum variants created (30ml, 50ml, 100ml)");

  // Create product with color variants - Base Líquida
  const foundationWithColors = await prisma.product.upsert({
    where: { sku: "MQ-001-VAR" },
    update: {},
    create: {
      sku: "MQ-001-VAR",
      name: "Base Líquida Matte - Con Variantes de Color",
      slug: "base-liquida-matte-colores",
      description: "Base de larga duración en 4 tonos",
      longDescription: "Base líquida de alta cobertura disponible en Natural, Beige, Rosa y Dorado.",
      categoryId: makeupCategory.id,
      price: 380,
      costPrice: 140,
      stock: 80,
      minStock: 15,
      brand: "Perfect Finish",
      isFeatured: true,
      isActive: true,
      mainImage: "https://placehold.co/600x800/E8D4C4/7a5646?text=Base+Matte",
    },
  });

  // Create color variants (using upsert to avoid duplicates)
  const naturalVariant = await prisma.productVariant.upsert({
    where: { sku: "MQ-001-VAR-NAT" },
    update: { stock: 25, price: 380 },
    create: {
      productId: foundationWithColors.id,
      sku: "MQ-001-VAR-NAT",
      price: 380,
      stock: 25,
      values: { connect: [{ id: colorNatural.id }] },
    },
  });

  const beigeVariant = await prisma.productVariant.upsert({
    where: { sku: "MQ-001-VAR-BEIGE" },
    update: { stock: 20, price: 380 },
    create: {
      productId: foundationWithColors.id,
      sku: "MQ-001-VAR-BEIGE",
      price: 380,
      stock: 20,
      values: { connect: [{ id: colorBeige.id }] },
    },
  });

  const rosaVariant = await prisma.productVariant.upsert({
    where: { sku: "MQ-001-VAR-ROSA" },
    update: { stock: 20, price: 380 },
    create: {
      productId: foundationWithColors.id,
      sku: "MQ-001-VAR-ROSA",
      price: 380,
      stock: 20,
      values: { connect: [{ id: colorRosa.id }] },
    },
  });

  const doradoVariant = await prisma.productVariant.upsert({
    where: { sku: "MQ-001-VAR-DOR" },
    update: { stock: 15, price: 400 },
    create: {
      productId: foundationWithColors.id,
      sku: "MQ-001-VAR-DOR",
      price: 400,
      stock: 15,
      values: { connect: [{ id: colorDorado.id }] },
    },
  });

  console.log("Foundation color variants created");

  // Create low stock products to trigger notifications
  const lowStockProducts = await prisma.product.createMany({
    data: [
      {
        sku: "TEST-LOW-1",
        name: "Producto Stock Bajo 1",
        slug: "producto-stock-bajo-1",
        description: "Producto con stock bajo para probar notificaciones",
        categoryId: facialCategory.id,
        price: 100,
        stock: 2, // Low stock
        minStock: 5,
        isActive: true,
      },
      {
        sku: "TEST-LOW-2",
        name: "Producto Stock Bajo 2",
        slug: "producto-stock-bajo-2",
        description: "Otro producto con stock bajo",
        categoryId: makeupCategory.id,
        price: 150,
        stock: 3,
        minStock: 5,
        isActive: true,
      },
      {
        sku: "TEST-LOW-3",
        name: "Producto Stock Bajo 3",
        slug: "producto-stock-bajo-3",
        description: "Tercer producto con stock crítico",
        categoryId: bodyCategory.id,
        price: 200,
        stock: 1,
        minStock: 5,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Low stock products created (to test notifications)");

  // Create test orders to trigger notifications
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Create a customer first
  const customerPassword = await bcrypt.hash("test123", 10);
  const testCustomer = await prisma.customer.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password: customerPassword,
      fullName: "Cliente de Prueba",
      phone: "5551234567",
      isVerified: true,
    },
  });

  // Create pending orders from yesterday (urgent - >24h)
  const timestamp = Date.now();
  const urgentOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-${twoDaysAgo.toISOString().slice(0, 10).replace(/-/g, "")}-${timestamp}-U`,
      customerId: testCustomer.id,
      customerName: "Cliente Urgente",
      customerEmail: "urgente@test.com",
      customerPhone: "5551111111",
      totalAmount: 850,
      status: "PENDING",
      paymentMethod: "TRANSFER",
      items: {
        create: [
          {
            productId: serumWithVariants.id,
            productName: serumWithVariants.name,
            productSku: serumWithVariants.sku,
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
          {
            productId: foundationWithColors.id,
            productName: foundationWithColors.name,
            productSku: foundationWithColors.sku,
            quantity: 1,
            unitPrice: 380,
            subtotal: 380,
          },
        ],
      },
      createdAt: twoDaysAgo,
    },
  });

  // Create pending orders from today (new orders)
  const todayOrder1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${timestamp}-1`,
      customerId: testCustomer.id,
      customerName: "Cliente Nuevo 1",
      customerEmail: "nuevo1@test.com",
      customerPhone: "5552222222",
      totalAmount: 450,
      status: "PENDING",
      paymentMethod: "CASH",
      items: {
        create: [
          {
            productId: serumWithVariants.id,
            productName: serumWithVariants.name,
            productSku: serumWithVariants.sku,
            quantity: 1,
            unitPrice: 450,
            subtotal: 450,
          },
        ],
      },
    },
  });

  const todayOrder2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${timestamp}-2`,
      customerId: testCustomer.id,
      customerName: "Cliente Nuevo 2",
      customerEmail: "nuevo2@test.com",
      customerPhone: "5553333333",
      totalAmount: 680,
      status: "CONFIRMED",
      paymentMethod: "TRANSFER",
      items: {
        create: [
          {
            productId: serumWithVariants.id,
            productName: serumWithVariants.name,
            productSku: serumWithVariants.sku,
            quantity: 1,
            unitPrice: 680,
            subtotal: 680,
          },
        ],
      },
    },
  });

  console.log("Test orders created (1 urgent >24h, 2 from today)");

  console.log("\n✅ Seeding completed!");
  console.log(`- 4 categories`);
  console.log(`- ${products.length} + 7 test products created`);
  console.log(`- 2 products with variants (Serum, Foundation)`);
  console.log(`- 3 low stock products (to test notifications)`);
  console.log(`- ${coupons.length} coupons`);
  console.log(`- 2 users (admin/admin123, test@test123)`);
  console.log(`- 3 test orders (1 urgent, 2 pending)`);
  console.log("\n📊 Test the notifications bell in admin panel!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
