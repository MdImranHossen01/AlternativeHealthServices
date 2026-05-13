import mongoose from 'mongoose';
import connectToDatabase from './src/lib/db';
import Product from './src/models/Product';

async function checkProduct() {
  await connectToDatabase();
  const product = await Product.findOne({ name: /Craceful new balance White sneakers/i });
  console.log(JSON.stringify(product, null, 2));
  process.exit(0);
}

checkProduct();
