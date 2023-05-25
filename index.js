const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzwsigq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("toyCarsDB");
    const toyCollection = db.collection("toys");

    const indexKeys = { toyName: 1 };
    const indexOptions = { name: "toyName" };

    // const result = await toyCollection.createIndex(indexKeys, indexOptions);

    app.get("/searchByToy/:text", async (req, res) => {
      const SearchText = req.params.text;
      const result = await toyCollection
        .find({
          $or: [
            {
              toyName: { $regex: SearchText, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const body = req.body;
      //  body.createdAt = new Date();
      if (!body) {
        return res.status(404).send({ message: "body data not Found" });
      }
      // console.log(body);
      const result = await toyCollection.insertOne(body);
      // console.log(result);
      res.send(result);
    });

    // All Toys
    app.get("/allToys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/allToy/:text", async (req, res) => {
      if (
        req.params.text == "sportsCar" ||
        req.params.text == "truck" ||
        req.params.text == "regularCar"
      ) {
        const result = await toyCollection
          .find({ subcategory: req.params.text })
          .toArray();
        return res.send(result);
      }
      const result = await toyCollection.find({}).toArray();
      return res.send(result);
    });

    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          _id: 1,
          pictureUrl: 1,
          toyName: 1,
          name: 1,
          postedBy: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          description: 1,
        },
      };
      const result = await toyCollection.findOne(query, options);
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      const sortValue = req.query.sort;

      let sortOption = {};
      if (sortValue === "asc") {
        sortOption = { price: 1 };
      } else if (sortValue === "desc") {
        sortOption = { price: -1 };
      }

      const result = await toyCollection
        .find({ postedBy: req.params.email })
        .sort(sortOption)
        .toArray();

      res.send(result);
    });

    app.get("/updateToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result);
    });

    app.put("/updateToys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateToys = req.body;
      const toys = {
        $set: {
          ...updateToys,
        },
      };
      const result = await toyCollection.updateOne(filter, toys);
      res.send(result);
    });

    app.delete("/deleteToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.log);
app.get("/", (req, res) => {
  res.send("Toy Cars LTD is Running");
});
app.listen(port, () => {
  console.log(`Toy Cars LTD Sever is Running On Port ${port}`);
});
