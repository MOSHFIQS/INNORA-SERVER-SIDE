import { PrismaPg } from '@prisma/adapter-pg';
import {
     AuditAction,
     BookingStatus,
     PaymentStatus,
     PrismaClient,
     ReviewStatus,
     RoomStatus,
     RoomType,
     UserRole,
     UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
     console.log('🏨 Seeding INNORA Hotel Management System data...');

     // 1. Create Default Site Settings
     console.log('📝 Upserting Site Settings...');
     await prisma.siteSetting.deleteMany();
     await prisma.siteSetting.create({
          data: {
               siteName: 'INNORA Luxury Hotel & Suites',
               tagline: 'Experience Timeless Luxury and Unmatched Hospitality',
               logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
               phone: '+1 (800) 555-4666',
               email: 'concierge@innora.com',
               address: '777 Ocean View Boulevard, Coastal Haven',
               checkInTime: '14:00',
               checkOutTime: '11:00',
               cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
               facebookUrl: 'https://facebook.com/innora-hotel',
               twitterUrl: 'https://twitter.com/innora-hotel',
               instagramUrl: 'https://instagram.com/innora-hotel',
          },
     });

     // 2. Create Users
     console.log('👤 Seeding Users & Admins...');
     const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
     const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);
     const staffPasswordHash = await bcrypt.hash('Staff@123456', 10);

     const superAdmin = await prisma.user.upsert({
          where: { email: 'superadmin@innora.com' },
          update: { password: adminPasswordHash, role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE },
          create: {
               email: 'superadmin@innora.com',
               password: adminPasswordHash,
               firstName: 'Alexander',
               lastName: 'Wright',
               fullName: 'Alexander Wright',
               role: UserRole.SUPER_ADMIN,
               status: UserStatus.ACTIVE,
               phone: '+1 (800) 555-0001',
               bio: 'General Director of INNORA Grand Resort & Hotel Group.',
               city: 'Coastal Haven',
               country: 'United States',
               avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          },
     });

     const admin = await prisma.user.upsert({
          where: { email: 'admin@innora.com' },
          update: { password: adminPasswordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
          create: {
               email: 'admin@innora.com',
               password: adminPasswordHash,
               firstName: 'Victoria',
               lastName: 'Sterling',
               fullName: 'Victoria Sterling',
               role: UserRole.ADMIN,
               status: UserStatus.ACTIVE,
               phone: '+1 (800) 555-0002',
               bio: 'Head of Operations and Guest Hospitality at INNORA.',
               city: 'Coastal Haven',
               country: 'United States',
               avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
          },
     });

     const staff = await prisma.user.upsert({
          where: { email: 'staff@innora.com' },
          update: { password: staffPasswordHash, role: UserRole.STAFF, status: UserStatus.ACTIVE },
          create: {
               email: 'staff@innora.com',
               password: staffPasswordHash,
               firstName: 'Marcus',
               lastName: 'Vance',
               fullName: 'Marcus Vance',
               role: UserRole.STAFF,
               status: UserStatus.ACTIVE,
               phone: '+1 (800) 555-0003',
               bio: 'Front Desk Concierge Supervisor.',
               city: 'Coastal Haven',
               country: 'United States',
               avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
          },
     });

     const customer = await prisma.user.upsert({
          where: { email: 'customer@innora.com' },
          update: { password: customerPasswordHash, role: UserRole.CUSTOMER, status: UserStatus.ACTIVE },
          create: {
               email: 'customer@innora.com',
               password: customerPasswordHash,
               firstName: 'Sarah',
               lastName: 'Jenkins',
               fullName: 'Sarah Jenkins',
               role: UserRole.CUSTOMER,
               status: UserStatus.ACTIVE,
               phone: '+1 (555) 234-5678',
               bio: 'Luxury travel enthusiast and frequent guest.',
               city: 'New York',
               country: 'United States',
               avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
          },
     });

     // 3. Create Rooms
     console.log('🛏️ Seeding Luxury Rooms...');
     const roomsData = [
          {
               roomId: '101',
               roomNumber: '101',
               floor: 1,
               title: 'Deluxe Oceanfront Suite',
               slug: 'deluxe-oceanfront-suite-101',
               description: 'Experience refined elegance in our Deluxe Oceanfront Suite. Featuring floor-to-ceiling glass doors opening directly onto a private terrace with breath-taking views of the azure coast, a plush King-size bed with Egyptian cotton linens, and a spa-inspired marble bathroom with rainfall shower and Jacuzzi tub.',
               shortDescription: 'Panoramic ocean views with private terrace, King bed & marble bath.',
               type: RoomType.DELUXE,
               status: RoomStatus.AVAILABLE,
               isAvailable: true,
               bedType: 'King',
               pricePerNight: 280.0,
               currency: 'USD',
               maxGuests: 2,
               roomSizeSqFt: 450,
               view: 'Ocean',
               features: ['WiFi', 'Smart TV', 'Coffee Maker', 'Jacuzzi', 'Room Service', 'Air Conditioning', 'Mini Bar'],
               safetyFeatures: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box', 'Keycard Access'],
               images: {
                    main: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
                    gallery: [
                         'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
                         'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
                    ],
               },
               bookedDates: ['2026-09-15', '2026-09-16'],
               rating: 4.9,
               reviewsCount: 18,
               isFeatured: true,
          },
          {
               roomId: '201',
               roomNumber: '201',
               floor: 2,
               title: 'Royal Presidential Suite',
               slug: 'royal-presidential-suite-201',
               description: 'The pinnacle of luxury at INNORA. The Royal Presidential Suite boasts 850 sq ft of sumptuously designed living space, a private heated plunge pool, dedicated butler service, an opulent master bedroom, and state-of-the-art entertainment systems.',
               shortDescription: 'Our flagship 850 sq ft suite with private plunge pool & 24/7 butler.',
               type: RoomType.PRESIDENTIAL,
               status: RoomStatus.AVAILABLE,
               isAvailable: true,
               bedType: 'King',
               pricePerNight: 550.0,
               currency: 'USD',
               maxGuests: 4,
               roomSizeSqFt: 850,
               view: 'Panoramic Ocean & City',
               features: ['WiFi', 'Smart TV', 'Coffee Maker', 'Jacuzzi', 'Room Service', 'Private Plunge Pool', 'Butler Service', 'Dining Area'],
               safetyFeatures: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box', 'Security Camera at Entrance', 'Keycard Access'],
               images: {
                    main: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&auto=format&fit=crop&q=80',
                    gallery: [
                         'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
                         'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
                    ],
               },
               bookedDates: ['2026-09-20'],
               rating: 5.0,
               reviewsCount: 24,
               isFeatured: true,
          },
          {
               roomId: '301',
               roomNumber: '301',
               floor: 3,
               title: 'Executive Garden View Room',
               slug: 'executive-garden-view-room-301',
               description: 'Surrounded by tranquil botanical landscapes, our Executive Garden View Room offers a peaceful sanctuary. Includes an ergonomic workspace, espresso machine, walk-in closet, and premium soundproofing for ultimate relaxation.',
               shortDescription: 'Peaceful garden vistas with plush Queen bed & ergonomic workstation.',
               type: RoomType.EXECUTIVE,
               status: RoomStatus.AVAILABLE,
               isAvailable: true,
               bedType: 'Queen',
               pricePerNight: 190.0,
               currency: 'USD',
               maxGuests: 2,
               roomSizeSqFt: 380,
               view: 'Botanical Garden',
               features: ['WiFi', 'Smart TV', 'Coffee Maker', 'Room Service', 'Ergonomic Desk', 'Balcony'],
               safetyFeatures: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box'],
               images: {
                    main: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop&q=80',
                    gallery: [
                         'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
                    ],
               },
               bookedDates: [],
               rating: 4.8,
               reviewsCount: 12,
               isFeatured: true,
          },
          {
               roomId: '401',
               roomNumber: '401',
               floor: 4,
               title: 'Family Luxury Haven Suite',
               slug: 'family-luxury-haven-suite-401',
               description: 'Designed specifically for families seeking unmatched comfort. Features dual interconnected bedrooms (1 King and 2 Double beds), a spacious lounge area, custom children amenities, and double vanity bathrooms.',
               shortDescription: 'Spacious dual-bedroom sanctuary for family comfort and leisure.',
               type: RoomType.FAMILY,
               status: RoomStatus.AVAILABLE,
               isAvailable: true,
               bedType: 'Double',
               pricePerNight: 320.0,
               currency: 'USD',
               maxGuests: 5,
               roomSizeSqFt: 620,
               view: 'Garden & Pool',
               features: ['WiFi', 'Smart TV', 'Coffee Maker', 'Room Service', 'Kids Corner', 'Bathtub', 'Dual Vanities'],
               safetyFeatures: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box', 'Childproof Locks'],
               images: {
                    main: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop&q=80',
                    gallery: [
                         'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
                    ],
               },
               bookedDates: ['2026-09-12'],
               rating: 4.7,
               reviewsCount: 15,
               isFeatured: true,
          },
          {
               roomId: '501',
               roomNumber: '501',
               floor: 5,
               title: 'Penthouse Skyline Suite',
               slug: 'penthouse-skyline-suite-501',
               description: 'Perched on the top floor with 360-degree views of the coastline and sparkling city skyline. Includes private elevator access, a wraparound sun deck, custom cocktail bar, and bespoke acoustic system.',
               shortDescription: 'Top floor suite with wraparound sun deck and private cocktail lounge.',
               type: RoomType.SUITE,
               status: RoomStatus.AVAILABLE,
               isAvailable: true,
               bedType: 'King',
               pricePerNight: 460.0,
               currency: 'USD',
               maxGuests: 3,
               roomSizeSqFt: 720,
               view: 'Ocean & Skyline',
               features: ['WiFi', 'Smart TV', 'Coffee Maker', 'Jacuzzi', 'Room Service', 'Private Sun Deck', 'Cocktail Bar'],
               safetyFeatures: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box', 'Private Elevator Key'],
               images: {
                    main: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop&q=80',
                    gallery: [
                         'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
                    ],
               },
               bookedDates: [],
               rating: 4.9,
               reviewsCount: 21,
               isFeatured: true,
          },
          {
               roomId: '102',
               roomNumber: '102',
               floor: 1,
               title: 'Classic Luxury Standard Room',
               slug: 'classic-luxury-standard-room-102',
               description: 'An inviting, cozy space crafted with natural wood finishes, plush bedding, high-speed fiber internet, and signature INNORA organic bath amenities.',
               shortDescription: 'Refined standard room with signature comforts and garden views.',
               type: RoomType.STANDARD,
               status: RoomStatus.AVAILABLE,
               isAvailable: true,
               bedType: 'Double',
               pricePerNight: 140.0,
               currency: 'USD',
               maxGuests: 2,
               roomSizeSqFt: 300,
               view: 'Courtyard',
               features: ['WiFi', 'Smart TV', 'Coffee Maker', 'Room Service', 'Mini Fridge'],
               safetyFeatures: ['Smoke Detector', 'Fire Extinguisher', 'Safe Box'],
               images: {
                    main: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop&q=80',
                    gallery: [
                         'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
                    ],
               },
               bookedDates: [],
               rating: 4.6,
               reviewsCount: 8,
               isFeatured: false,
          },
     ];

     for (const r of roomsData) {
          await prisma.room.upsert({
               where: { roomId: r.roomId },
               update: r as any,
               create: r as any,
          });
     }

     const firstRoom = await prisma.room.findUnique({ where: { roomId: '101' } });
     const secondRoom = await prisma.room.findUnique({ where: { roomId: '201' } });

     // 4. Create Sample Bookings
     console.log('📅 Seeding Sample Bookings...');
     if (firstRoom) {
          await prisma.booking.upsert({
               where: { bookingNumber: 'INN-2026-8801' },
               update: {},
               create: {
                    bookingNumber: 'INN-2026-8801',
                    userId: customer.id,
                    roomId: firstRoom.id,
                    userEmail: customer.email,
                    userName: customer.fullName,
                    userPhone: customer.phone,
                    title: firstRoom.title,
                    image: (firstRoom.images as any).main,
                    date: '2026-09-15',
                    totalNights: 1,
                    price: firstRoom.pricePerNight,
                    totalAmount: firstRoom.pricePerNight,
                    currency: firstRoom.currency,
                    guests: 2,
                    specialRequests: 'Anniversary celebration, champagne setup requested.',
                    status: BookingStatus.CONFIRMED,
                    paymentStatus: PaymentStatus.PAID,
               },
          });
     }

     if (secondRoom) {
          await prisma.booking.upsert({
               where: { bookingNumber: 'INN-2026-8802' },
               update: {},
               create: {
                    bookingNumber: 'INN-2026-8802',
                    userId: customer.id,
                    roomId: secondRoom.id,
                    userEmail: customer.email,
                    userName: customer.fullName,
                    userPhone: customer.phone,
                    title: secondRoom.title,
                    image: (secondRoom.images as any).main,
                    date: '2026-09-20',
                    totalNights: 1,
                    price: secondRoom.pricePerNight,
                    totalAmount: secondRoom.pricePerNight,
                    currency: secondRoom.currency,
                    guests: 2,
                    specialRequests: 'Late check-in around 8 PM.',
                    status: BookingStatus.CONFIRMED,
                    paymentStatus: PaymentStatus.PAID,
               },
          });
     }

     // 5. Create Sample Reviews
     console.log('⭐ Seeding Reviews...');
     if (firstRoom) {
          await prisma.review.create({
               data: {
                    userId: customer.id,
                    roomId: firstRoom.id,
                    userEmail: customer.email,
                    userName: customer.fullName,
                    rating: 5,
                    comment: 'Absolutely spectacular stay! The ocean breeze, immaculate room service, and stunning balcony views made this a memorable vacation.',
                    status: ReviewStatus.APPROVED,
               },
          });
     }

     // 6. Create Banner Slides
     console.log('🖼️ Seeding Banner Slides...');
     await prisma.bannerSlide.deleteMany();
     await prisma.bannerSlide.createMany({
          data: [
               {
                    title: 'Welcome to INNORA Sanctuary',
                    subtitle: 'Where Luxury Meets Serenity',
                    description: 'Indulge in coastal elegance, Michelin-starred cuisine, and world-class spa retreats.',
                    badgeText: '5-Star Luxury Resort',
                    buttonText: 'Explore Rooms',
                    buttonLink: '/rooms',
                    secondaryButtonText: 'Book Your Stay',
                    secondaryButtonLink: '/rooms',
                    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&auto=format&fit=crop&q=80',
                    order: 1,
                    isActive: true,
               },
               {
                    title: 'Presidential Suites & Oceanfront Living',
                    subtitle: 'Unrivaled Comfort & Breathtaking Panoramas',
                    description: 'Wake up to the sound of waves and private heated plunge pools with 24/7 butler service.',
                    badgeText: 'Exclusive Living',
                    buttonText: 'View Suites',
                    buttonLink: '/rooms',
                    secondaryButtonText: 'Contact Concierge',
                    secondaryButtonLink: '/contact',
                    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&auto=format&fit=crop&q=80',
                    order: 2,
                    isActive: true,
               },
          ],
     });

     // 7. Create Hotel Services
     console.log('🛎️ Seeding Hotel Services...');
     await prisma.hotelService.deleteMany();
     await prisma.hotelService.createMany({
          data: [
               {
                    title: 'Serenity Wellness Spa',
                    description: 'Holistic massage therapies, steam saunas, and organic hydrotherapy.',
                    icon: 'Sparkles',
                    category: 'Wellness',
                    price: 120,
                    isActive: true,
               },
               {
                    title: 'Aura Fine Dining & Rooftop Bar',
                    description: 'Contemporary culinary masterpieces paired with rare vintage wines.',
                    icon: 'Utensils',
                    category: 'Dining',
                    price: 80,
                    isActive: true,
               },
               {
                    title: 'Private Airport Chauffeur',
                    description: 'Complimentary luxury sedan transfers for suite reservations.',
                    icon: 'Car',
                    category: 'Transport',
                    price: 50,
                    isActive: true,
               },
               {
                    title: 'Grand Ballroom & Conference Hub',
                    description: 'High-tech corporate facilities and magnificent wedding banquet spaces.',
                    icon: 'Building2',
                    category: 'Business',
                    price: 500,
                    isActive: true,
               },
          ],
     });

     console.log('✅ INNORA Hotel Management System data seeded successfully!');
}

main()
     .catch((e) => {
          console.error('❌ Error during seed:', e);
          process.exit(1);
     })
     .finally(async () => {
          await prisma.$disconnect();
          await pool.end();
     });
