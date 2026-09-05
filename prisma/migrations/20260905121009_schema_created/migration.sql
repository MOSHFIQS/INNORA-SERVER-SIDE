-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('DELUXE', 'SUITE', 'STANDARD', 'EXECUTIVE', 'PRESIDENTIAL', 'FAMILY');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'CLEANING');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'BOOKING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_UPDATED', 'ROOM_CREATED', 'ROOM_UPDATED', 'ROOM_DELETED', 'REVIEW_CREATED', 'ADMIN_ACTION', 'PROFILE_CHANGE', 'ROLE_CHANGE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "innora_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatarUrl" TEXT,
    "bio" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "lastDevice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "innora_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_rooms" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "type" "RoomType" NOT NULL DEFAULT 'DELUXE',
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "bedType" TEXT NOT NULL DEFAULT 'King',
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "roomSizeSqFt" INTEGER NOT NULL DEFAULT 350,
    "view" TEXT NOT NULL DEFAULT 'City',
    "features" TEXT[],
    "safetyFeatures" TEXT[],
    "images" JSONB NOT NULL,
    "bookedDates" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "innora_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_bookings" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userPhone" TEXT,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "checkInDate" TIMESTAMP(3),
    "checkOutDate" TIMESTAMP(3),
    "totalNights" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "guests" INTEGER NOT NULL DEFAULT 1,
    "specialRequests" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PAID',
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "innora_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "innora_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_inquiries" (
    "id" TEXT NOT NULL,
    "inquiryNumber" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "innora_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innora_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT,
    "action" "AuditAction" NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "device" TEXT,
    "userAgent" TEXT,
    "beforeValue" JSONB,
    "afterValue" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "innora_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_site_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'INNORA Luxury Hotel & Suites',
    "tagline" TEXT DEFAULT 'Experience Timeless Luxury and Unmatched Hospitality',
    "logoUrl" TEXT,
    "phone" TEXT DEFAULT '+1 (800) 555-4666',
    "email" TEXT DEFAULT 'concierge@innora.com',
    "address" TEXT DEFAULT '777 Ocean View Boulevard, Coastal Haven',
    "checkInTime" TEXT DEFAULT '14:00',
    "checkOutTime" TEXT DEFAULT '11:00',
    "cancellationPolicy" TEXT DEFAULT 'Free cancellation up to 24 hours prior to check-in.',
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innora_site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_banner_slides" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "badgeText" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "secondaryButtonText" TEXT,
    "secondaryButtonLink" TEXT,
    "image" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innora_banner_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "innora_hotel_services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Wellness',
    "price" DOUBLE PRECISION DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innora_hotel_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "innora_users_email_key" ON "innora_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "innora_users_phone_key" ON "innora_users"("phone");

-- CreateIndex
CREATE INDEX "innora_users_role_idx" ON "innora_users"("role");

-- CreateIndex
CREATE INDEX "innora_users_status_idx" ON "innora_users"("status");

-- CreateIndex
CREATE INDEX "innora_users_deletedAt_idx" ON "innora_users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "innora_rooms_roomId_key" ON "innora_rooms"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "innora_rooms_slug_key" ON "innora_rooms"("slug");

-- CreateIndex
CREATE INDEX "innora_rooms_type_idx" ON "innora_rooms"("type");

-- CreateIndex
CREATE INDEX "innora_rooms_status_idx" ON "innora_rooms"("status");

-- CreateIndex
CREATE INDEX "innora_rooms_isAvailable_idx" ON "innora_rooms"("isAvailable");

-- CreateIndex
CREATE INDEX "innora_rooms_isFeatured_idx" ON "innora_rooms"("isFeatured");

-- CreateIndex
CREATE INDEX "innora_rooms_deletedAt_idx" ON "innora_rooms"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "innora_bookings_bookingNumber_key" ON "innora_bookings"("bookingNumber");

-- CreateIndex
CREATE INDEX "innora_bookings_userId_idx" ON "innora_bookings"("userId");

-- CreateIndex
CREATE INDEX "innora_bookings_roomId_idx" ON "innora_bookings"("roomId");

-- CreateIndex
CREATE INDEX "innora_bookings_userEmail_idx" ON "innora_bookings"("userEmail");

-- CreateIndex
CREATE INDEX "innora_bookings_status_idx" ON "innora_bookings"("status");

-- CreateIndex
CREATE INDEX "innora_bookings_date_idx" ON "innora_bookings"("date");

-- CreateIndex
CREATE INDEX "innora_bookings_deletedAt_idx" ON "innora_bookings"("deletedAt");

-- CreateIndex
CREATE INDEX "innora_reviews_userId_idx" ON "innora_reviews"("userId");

-- CreateIndex
CREATE INDEX "innora_reviews_roomId_idx" ON "innora_reviews"("roomId");

-- CreateIndex
CREATE INDEX "innora_reviews_rating_idx" ON "innora_reviews"("rating");

-- CreateIndex
CREATE INDEX "innora_reviews_status_idx" ON "innora_reviews"("status");

-- CreateIndex
CREATE INDEX "innora_reviews_deletedAt_idx" ON "innora_reviews"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "innora_inquiries_inquiryNumber_key" ON "innora_inquiries"("inquiryNumber");

-- CreateIndex
CREATE INDEX "innora_inquiries_userId_idx" ON "innora_inquiries"("userId");

-- CreateIndex
CREATE INDEX "innora_inquiries_email_idx" ON "innora_inquiries"("email");

-- CreateIndex
CREATE INDEX "innora_inquiries_status_idx" ON "innora_inquiries"("status");

-- CreateIndex
CREATE INDEX "innora_inquiries_deletedAt_idx" ON "innora_inquiries"("deletedAt");

-- CreateIndex
CREATE INDEX "innora_notifications_userId_idx" ON "innora_notifications"("userId");

-- CreateIndex
CREATE INDEX "innora_notifications_isRead_idx" ON "innora_notifications"("isRead");

-- CreateIndex
CREATE INDEX "innora_notifications_type_idx" ON "innora_notifications"("type");

-- CreateIndex
CREATE INDEX "innora_audit_logs_userId_idx" ON "innora_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "innora_audit_logs_action_idx" ON "innora_audit_logs"("action");

-- CreateIndex
CREATE INDEX "innora_audit_logs_entity_entityId_idx" ON "innora_audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "innora_audit_logs_createdAt_idx" ON "innora_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "innora_banner_slides_isActive_idx" ON "innora_banner_slides"("isActive");

-- CreateIndex
CREATE INDEX "innora_banner_slides_order_idx" ON "innora_banner_slides"("order");

-- CreateIndex
CREATE INDEX "innora_hotel_services_isActive_idx" ON "innora_hotel_services"("isActive");

-- AddForeignKey
ALTER TABLE "innora_bookings" ADD CONSTRAINT "innora_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "innora_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innora_bookings" ADD CONSTRAINT "innora_bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "innora_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innora_reviews" ADD CONSTRAINT "innora_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "innora_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innora_reviews" ADD CONSTRAINT "innora_reviews_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "innora_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innora_inquiries" ADD CONSTRAINT "innora_inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "innora_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innora_notifications" ADD CONSTRAINT "innora_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "innora_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "innora_audit_logs" ADD CONSTRAINT "innora_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "innora_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
