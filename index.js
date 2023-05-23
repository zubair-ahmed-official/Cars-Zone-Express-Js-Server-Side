const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const jwt = require('jsonwebtoken')
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

//toyDb
//YBWp52TkBgJF0Ks4
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.5i6b38m.mongodb.net/?retryWrites=true&w=majority`;

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
        const toyCollection = client.db("toyDB").collection("toys");
        const categoryCollection = client.db("toyDB").collection("subCategories");
        const reviewCollection = client.db("toyDB").collection("reviews");

        // Send a ping to confirm a successful connection
        app.get('/toys', async (req, res) => {
            console.log(req.query)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            if (req.query?.sub_category) {
                query = { sub_category: req.query.sub_category }
            }
            if (req.query?.name) {
                query = { name: req.query.name }
            }
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 20;
            const skip = page * limit;

            const sortField = req.query.sortField || price;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

            const result = await toyCollection.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).toArray();
            res.send(result);
        })

        app.get('/reviews', async(req, res) =>
        {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })

        app.get('/sub_categories', async (req, res) => {
            console.log(req.query)
            let query = {};

            if (req.query?.sub_category) {
                query = { sub_category: req.query.sub_category }
            }
            const result = await categoryCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/totalCars', async (req, res) => {
            const result = await toyCollection.estimatedDocumentCount();
            res.send({ totalCars: result });
        })

        app.post('/toys', async (req, res) => {
            const toys = req.body;
            console.log('toys', toys)
            const result = await toyCollection.insertOne(toys);
            res.send(result);
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })

        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCars = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const toy =
            {
                $set:
                {
                    name: updatedCars.name,
                    seller_name: updatedCars.seller_name,
                    seller_email: updatedCars.seller_email,
                    sub_category: updatedCars.sub_category,
                    available: updatedCars.available,
                    rating: updatedCars.rating,
                    details: updatedCars.details,
                    price: updatedCars.price,
                    url: updatedCars.url,
                    posted_by: updatedCars.posted_by,
                    email: updatedCars.email
                }
            }
            const result = await toyCollection.updateOne(filter, toy, options)
            res.send(result)
        })

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("The mongodb sever is running");
})

app.listen(port, (req, res) => {
    console.log(`The port number is ${port}`);
})