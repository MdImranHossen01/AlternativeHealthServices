import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

const DOMAIN = 'alternativehsbd.com';

const categoriesData = [
  { name: 'Hijama & Cupping', image: '/assets/images/category/cat_hijama_therapy_1778723368173.webp' },
  { name: 'Circumcision Devices', image: '/assets/images/category/cat_circumcision_tech_1778723384579.webp' },
  { name: 'Diagnostic & Surgical Tools', image: '/assets/images/category/cat_diagnostic_tools_1778723407991.webp' },
  { name: 'Specialized Medicine', image: '/assets/images/category/cat_specialized_injections_1778723434003.webp' },
  { name: 'Holistic Supplements', image: '/assets/images/category/cat_holistic_supplements_1778723464605.webp' },
];

const productImages = [
  'Alisklamp Circumcision Device.webp',
  'Clinical LED Headlight (Surgeon).webp',
  'Digital Blood Pressure Monitor.webp',
  'Golden Hijama Lancing Pen.webp',
  'Hijama Glass Cupping Set (12pc).webp',
  'Hijama Manual Vacuum Pump.webp',
  'Medical Dressing Forceps.webp',
  'Nasal Speculum (Diagnostic).webp',
  'Precision Surgical Scissors.webp',
  'Proctocane Clinical Injection.webp',
  'Pure Cold-Pressed Black Seed Oil.webp',
  'Pure Sundarbans Forest Honey.webp',
  'Rapideklamp Advanced Device.webp',
  'Raw Apple Cider Vinegar (with Mother).webp',
  'Silver Hijama Lancing Pen.webp',
  'Specialized Piles Relief Ointment.webp',
  'Specialized Tonsilitis Treatment Kit.webp',
  'Stainless Steel Proctoscope.webp',
  'prod_alisklamp_1778723492838.webp',
  'prod_apple_cider_vinegar_1778723677528.webp',
  'prod_clinical_headlight_1778723566648.webp',
  'prod_forest_honey_1778723656041.webp',
  'prod_hijama_pen_silver_1778723613535.webp',
  'prod_hijama_set_12pc_1778723534872.webp',
  'prod_proctocane_injection_1778723594911.webp',
  'prod_proctoscope_1778723552457.webp',
  'prod_rapideklamp_1778723511703.webp',
  'prod_speculum_set_1778723637033.webp'
];

export async function GET() {
  try {
    await connectDB();

    // 1. Clear existing categories and products for this domain
    await Category.deleteMany({ domain: DOMAIN });
    await Product.deleteMany({ domain: DOMAIN });

    // 2. Create Categories
    const createdCategories = [];
    for (const cat of categoriesData) {
      const category = await Category.create({
        name: cat.name,
        image: cat.image,
        domain: DOMAIN,
        isActive: true
      });
      createdCategories.push(category);
    }

    // 3. Create 50 Products
    const products = [];
    for (let i = 1; i <= 50; i++) {
      const categoryIndex = Math.floor((i - 1) / 10);
      const category = createdCategories[categoryIndex];
      
      // Select image from the 28 available images
      const imageFile = productImages[(i - 1) % productImages.length];
      const imageUrl = `/assets/images/products/${imageFile}`;

      const basePrice = 500 + Math.floor(Math.random() * 5000);
      const isDiscounted = i % 5 === 0; // 10 products with discount (50/5 = 10)
      const salePrice = isDiscounted ? Math.floor(basePrice * 0.85) : undefined;

      const product = {
        name: `${category.name} Item ${i}`,
        slug: `${category.name.toLowerCase().replace(/ /g, '-')}-item-${i}`,
        description: `High-quality professional medical product for ${category.name}. This item is essential for clinical procedures and specialized healthcare services.`,
        price: basePrice,
        salePrice: salePrice,
        discountRate: isDiscounted ? 15 : 0,
        sku: `AHS-${category.name.substring(0, 3).toUpperCase()}-${1000 + i}`,
        stock: 50 + Math.floor(Math.random() * 100),
        categories: [category._id],
        images: [imageUrl],
        isFeatured: i <= 10, // First 10 are Featured
        isNewArrival: i > 10 && i <= 20, // Next 10 are New Arrivals
        isFlashSale: i > 20 && i <= 30, // Next 10 are Flash Sales
        isPublished: true,
        ratings: 4 + Math.random(),
        numReviews: Math.floor(Math.random() * 50),
        domain: DOMAIN,
        tags: [category.name, 'Medical', 'Healthcare'],
        attributes: [
          { key: 'Condition', value: 'New' },
          { key: 'Quality', value: 'Medical Grade' }
        ]
      };
      products.push(product);
    }

    await Product.insertMany(products);

    return NextResponse.json({
      success: true,
      message: `Seeded 5 categories and 50 products for ${DOMAIN}`,
      categoriesCount: createdCategories.length,
      productsCount: products.length
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
