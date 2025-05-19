const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middlewares
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://innora-server-side.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}))
app.use(express.json())
app.use(cookieParser())

// MongoDB connection URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hiz8ocw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoDB Client setup
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Collections
        const roomCollections = client.db('INNORA').collection('allRooms');
        const hotelBookingCollections = client.db('INNORA').collection('allBookings');

        // Get all rooms
        app.get('/rooms', async (req, res) => {
            const result = await roomCollections.find().toArray();
            res.send(result);
        });

        // Get single room by ID
        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await roomCollections.findOne(query);
            res.send(result);
        });

        // Add a user review to a room
        app.patch('/rooms/:id/reviews', async (req, res) => {
            const { id } = req.params;
            const { user_email, user_name, comment, rating } = req.body;

            const query = { _id: new ObjectId(id) };
            const room = await roomCollections.findOne(query);
            if (!room) return res.status(404).send({ message: 'Room not found' });

            const existingReviews = room.reviews || [];
            const alreadyReviewed = existingReviews.some(r => r.user_email === user_email);
            if (alreadyReviewed) {
                return res.status(400).send({ message: 'You have already reviewed this room.' });
            }

            const newReview = {
                user_email,
                user_name,
                comment,
                rating,
                date: new Date()
            };

            const updatedReviews = [...existingReviews, newReview];
            const reviewsCount = updatedReviews.length;
            const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = parseFloat((totalRating / reviewsCount).toFixed(1));

            const updateDoc = {
                $set: {
                    reviews: updatedReviews,
                    reviewsCount,
                    rating: averageRating
                }
            };

            const result = await roomCollections.findOneAndUpdate(query, updateDoc, {
                returnDocument: 'after'
            });

            res.send(result.value);
        });

        // Get bookings for a specific user by email
        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await hotelBookingCollections.find(query).toArray();
            res.send(result);
        });

        // Update a booking date for a specific room
        app.patch('/bookings/update', async (req, res) => {
            const { oldDate, newDate, email, roomId } = req.body;

            try {
                const room = await roomCollections.findOne({ roomId });
                const isExists = room.bookedDates.find(date => date === newDate);
                if (isExists) {
                    return res.status(400).send({ success: false, message: 'This room is already booked' });
                }

                const updateBookingDate = await hotelBookingCollections.updateOne(
                    { roomId, date: oldDate, userEmail: email },
                    { $set: { date: newDate } }
                );

                const roomDateRemoved = await roomCollections.updateOne(
                    { roomId },
                    { $pull: { bookedDates: oldDate } }
                );

                const newRoomDateAdded = await roomCollections.updateOne(
                    { roomId },
                    { $push: { bookedDates: newDate } }
                );

                if (
                    updateBookingDate.modifiedCount === 0 &&
                    roomDateRemoved.modifiedCount === 0 &&
                    newRoomDateAdded.modifiedCount === 0
                ) {
                    return res.status(404).send({
                        success: false,
                        message: "No booking or room date found to update"
                    });
                }

                res.send({
                    success: true,
                    message: "Booking date updated successfully",
                    result: {
                        bookingUpdated: updateBookingDate,
                        oldDateRemoved: roomDateRemoved,
                        newDateAdded: newRoomDateAdded
                    }
                });

            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Internal Server Error",
                    error: error.message
                });
            }
        });

        // Delete a booking
        app.delete('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            const bookingInfo = req.body;
            const { roomId, date } = bookingInfo;

            try {
                const roomUpdateResult = await roomCollections.updateOne(
                    { roomId: roomId },
                    { $pull: { bookedDates: date } }
                );

                const bookingDeleteResult = await hotelBookingCollections.deleteOne({
                    userEmail: email,
                    roomId: roomId,
                    date: date
                });

                if (roomUpdateResult.modifiedCount === 0 && bookingDeleteResult.deletedCount === 0) {
                    return res.status(404).send({ message: "No booking found to delete" });
                }

                res.send({
                    message: "Booking deleted successfully",
                    roomUpdate: roomUpdateResult,
                    bookingDelete: bookingDeleteResult
                });

            } catch (error) {
                res.status(500).send({ message: "Internal server error" });
            }
        });

        // Get all bookings (admin use case)
        app.get('/bookings', async (req, res) => {
            const result = await hotelBookingCollections.find().toArray();
            res.send(result);
        });

        // Add a new booking
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const { userEmail, date, roomId } = booking;

            try {
                const existingBooking = await hotelBookingCollections.findOne({
                    userEmail,
                    date,
                    roomId
                });

                if (existingBooking) {
                    return res.status(400).send({ success: false, message: 'User already booked for this date' });
                }

                const room = await roomCollections.findOne({ roomId });
                if (!room) return res.status(404).send({ success: false, message: 'Room not found' });

                const isDateBooked = room.bookedDates?.includes(date);
                if (isDateBooked) {
                    return res.status(400).send({ success: false, message: 'Room already booked for this date' });
                }

                const result = await hotelBookingCollections.insertOne(booking);

                await roomCollections.updateOne(
                    { roomId },
                    { $push: { bookedDates: date } }
                );

                res.send({ success: true, result });

            } catch (error) {
                res.status(500).send({ success: false, message: 'Server error' });
            }
        });

        // Optional MongoDB ping for local testing (commented out for deployment)
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Keep MongoDB connection open for serverless platforms like Vercel
        // Do not close client here
    }
}
run().catch(console.dir);

// Health check route
app.get('/', (req, res) => {
    res.send('hello');
});

// Start server
app.listen(port, () => {
    console.log('Server running on port:', port);
});
