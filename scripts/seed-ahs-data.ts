import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../src/models/Course';
import Service from '../src/models/Service';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DOMAIN = 'alternativehsbd.com';

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const courses = [
  {
    name: 'বেসিক চিকিৎসা প্রশিক্ষণ (৩৬৬ তম ব্যাচ)',
    slug: 'basic-medical-training-batch-366',
    description: `মাত্র ২ দিনের প্রশিক্ষণে ৩ মাসের বাস্তব অভিজ্ঞতার জ্ঞান অর্জনের সুযোগ!
    
    ভর্তি চলছে – ৩৬৬ তম ব্যাচ। আপনি কি চিকিৎসা সেবায় দক্ষ হতে চান? নিজের ক্যারিয়ার ও আয়ের নতুন সুযোগ তৈরি করতে চান? তাহলে এই বেসিক চিকিৎসা প্রশিক্ষণ আপনার জন্যই!
    
    প্রশিক্ষণে যা শিখবেন:
    - নাকের পলিপাস ও সাইনোসাইটিস চিকিৎসা
    - পাইলস / ফিস্টুলা / ফিসার চিকিৎসা
    - হিজামা কাপিং থেরাপি
    - কসমেটিক খৎনা (লাইভ)
    - টিউমার, টনসিল ও আঁচিল চিকিৎসা
    - হরমোনাল ও যৌন রোগ চিকিৎসা
    - প্র্যাকটিক্যাল রোগী দেখার কৌশল
    
    বিশেষ সুবিধাসমূহ:
    - সরকার অনুমোদিত সনদ
    - MBBS ডাক্তার দ্বারা ক্লাস
    - লাইভ প্র্যাকটিক্যাল ট্রেনিং
    - থাকার সু-ব্যবস্থা রয়েছে`,
    image: '/assets/images/service and course/basic_medical_training_banner_1778772064410.webp',
    instructor: 'Expert MBBS Doctor',
    duration: '২ দিন',
    location: 'বোর্ড বাজার, গাজীপুর',
    price: 5000, // Example price
    domain: DOMAIN,
  }
];

const services = [
  {
    name: 'ডিভাইস কসমেটিক খাতনা',
    slug: 'cosmetic-khatna',
    description: 'আধুনিক ডিভাইস ও কসমেটিক পদ্ধতিতে ব্যথামুক্ত খৎনা সেবা। দ্রুত নিরাময় ও সর্বোচ্চ সতর্কতা নিশ্চিত করা হয়।',
    image: '/assets/images/service and course/media__1778769248923.webp',
    price: 0,
    domain: DOMAIN,
  },
  {
    name: 'নাকের পলিপাস-সাইনুসাইটিস',
    slug: 'nasal-polyp-sinusitis',
    description: 'নাকের পলিপাস ও সাইনুসাইটিসের উন্নত ও কার্যকরী চিকিৎসা। আধুনিক পদ্ধতিতে সেবা প্রদান করা হয়।',
    image: '/assets/images/service and course/naturopathy_consultation_banner_1778772103614.webp',
    price: 0,
    domain: DOMAIN,
  },
  {
    name: 'মলদ্বারে পাইলস অর্শ গ্যাজ',
    slug: 'piles-fistula-treatment',
    description: 'পাইলস, অর্শ ও গ্যাজ রোগের নিরাপদ ও দীর্ঘস্থায়ী চিকিৎসা। কোনো অপারেশন ছাড়াই সুস্থ হওয়ার সুযোগ।',
    image: '/assets/images/service and course/herbal_medicine_service_banner_1778772194389.webp',
    price: 0,
    domain: DOMAIN,
  },
  {
    name: 'হিজামা কাপিং থেরাপি',
    slug: 'hijama-cupping-therapy',
    description: 'সুন্নত ভিত্তিক হিজামা বা কাপিং থেরাপি। রক্ত পরিশোধন ও শারীরিক ব্যথামুক্তিতে অত্যন্ত কার্যকরী।',
    image: '/assets/images/service and course/hijama_therapy_service_1778772084293.webp',
    price: 0,
    domain: DOMAIN,
  },
  {
    name: 'টনসিল টিউমার আঁচিল',
    slug: 'tonsil-tumor-treatment',
    description: 'টনসিল, টিউমার ও আঁচিলের কাটা-ছেঁড়া বিহীন আধুনিক চিকিৎসা।',
    image: '/assets/images/service and course/chiropractic_adjustment_service_1778772140197.webp',
    price: 0,
    domain: DOMAIN,
  },
  {
    name: 'হরমোন চর্ম যৌন থাইরয়েড',
    slug: 'hormone-skin-sexual-health',
    description: 'হরমোনাল সমস্যা, চর্ম রোগ, যৌন সমস্যা ও থাইরয়েডের বিশেষজ্ঞ পরামর্শ ও চিকিৎসা।',
    image: '/assets/images/service and course/wellness_stress_management_service_1778772244797.webp',
    price: 0,
    domain: DOMAIN,
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing data for this domain
    await Course.deleteMany({ domain: DOMAIN });
    await Service.deleteMany({ domain: DOMAIN });
    console.log('Cleared existing courses and services');

    // Insert new data
    await Course.insertMany(courses);
    await Service.insertMany(services);
    console.log('Successfully seeded courses and services!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
