const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
    ],
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())






const uri = "mongodb+srv://INNORA:xHa8wfocjKAuLCO1@cluster0.hiz8ocw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const roomCollections = client.db('INNORA').collection('allRooms')
        const hotelBookingCollections = client.db('INNORA').collection('allBookings')


        app.get('/rooms', async (req, res) => {
            const result = await roomCollections.find().toArray()
            res.send(result)
        })

        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id
            const qurey = { _id: new ObjectId(id) }
            const result = await roomCollections.findOne(qurey)
            res.send(result)
        })





        // user's reviews
        app.patch('/rooms/:id/reviews', async (req, res) => {
            const { id } = req.params;
            const { user_email, user_name, comment, rating } = req.body;

            const query = { _id: new ObjectId(id) };

            const room = await roomCollections.findOne(query);
            if (!room) return res.status(404).send({ message: 'Room not found' });

            const existingReviews = room.reviews || [];

            // ✅ Check if this email has already submitted a review
            const alreadyReviewed = existingReviews.some(r => r.user_email === user_email);
            if (alreadyReviewed) {
                return res.status(400).send({ message: 'You have already reviewed this room.' });
            }

            // ✅ Create new review
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


        // users bookings
        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email
            console.log(email)
            const query = { userEmail: email }
            console.log(query)
            const result = await hotelBookingCollections.find(query).toArray()
            res.send(result)
        })







        app.patch('/bookings/update', async (req, res) => {
            const { oldDate, newDate, email, roomId } = req.body;
            console.log(oldDate, newDate, email, roomId);

            try {
                // 1. Update the booking date in hotelBookingCollections
                const updateBookingDate = await hotelBookingCollections.updateOne(
                    { roomId, date: oldDate, userEmail: email }, // also match email for safety
                    { $set: { date: newDate } }
                );

                // 2. Remove the old date from roomCollections bookedDates array
                const roomDateRemoved = await roomCollections.updateOne(
                    { roomId },
                    { $pull: { bookedDates: oldDate } }
                );

                // 3. Add the new date to roomCollections bookedDates array
                const newRoomDateAdded = await roomCollections.updateOne(
                    { roomId },
                    { $push: { bookedDates: newDate } }
                );

                // Check if any update happened
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

                // Success response
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
                console.error("Error updating booking date:", error);
                res.status(500).send({
                    success: false,
                    message: "Internal Server Error",
                    error: error.message
                });
            }
        });




        app.delete('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            const { roomId, date, } = req.body;

            try {
                console.log("Room ID:", roomId, "Date to delete:", date);

                // 1. Remove the date from bookedDates array in roomCollections
                const roomUpdateResult = await roomCollections.updateOne(
                    { roomId: roomId },
                    { $pull: { bookedDates: date } }
                );

                // 2. Remove the booking from hotelBookingCollections
                const bookingDeleteResult = await hotelBookingCollections.deleteOne({
                    userEmail: email,
                    roomId: roomId,
                    date: date
                });

                // Final check: if neither was successful
                if (roomUpdateResult.modifiedCount === 0 && bookingDeleteResult.deletedCount === 0) {
                    return res.status(404).send({ message: "No booking found to delete" });
                }

                res.send({
                    message: "Booking deleted successfully",
                    roomUpdate: roomUpdateResult,
                    bookingDelete: bookingDeleteResult
                });

            } catch (error) {
                console.error("Error deleting booking:", error);
                res.status(500).send({ message: "Internal server error" });
            }
        });



        app.get('/bookings', async (req, res) => {
            const result = await hotelBookingCollections.find().toArray()
            res.send(result)
        })


        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const { userEmail, date, roomId } = booking;

            try {
                // Step 1: Check for existing booking by this user on the same date
                const existingBooking = await hotelBookingCollections.findOne({
                    userEmail,
                    date,
                    roomId
                });

                if (existingBooking) {
                    return res.status(400).send({ success: false, message: 'User already booked for this date' });
                }

                // Step 2: Check if room is already booked for that date
                const room = await roomCollections.findOne({ roomId });
                if (!room) return res.status(404).send({ success: false, message: 'Room not found' });

                const isDateBooked = room.bookedDates?.includes(date);
                if (isDateBooked) {
                    return res.status(400).send({ success: false, message: 'Room already booked for this date' });
                }

                // Step 3: Insert booking
                const result = await hotelBookingCollections.insertOne(booking);

                // Step 4: Update room's bookedDates
                await roomCollections.updateOne(
                    { roomId },
                    { $push: { bookedDates: date } }
                );

                res.send({ success: true, result });

            } catch (error) {
                console.error(error);
                res.status(500).send({ success: false, message: 'Server error' });
            }
        });























        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

























app.get('/', (req, res) => {
    res.send('hello')
})










app.listen(port, () => {
    console.log('server running on port : ', port)
})