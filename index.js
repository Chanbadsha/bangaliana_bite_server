require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//  Middleware
app.use(cors());
app.use(express.json());

// Basic Code
app.get("/", (req, res) => {
  res.send("Bangaliana Bites Server Is Running");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// MongoDb Code

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.t47d6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //   Database name
    const userCollection = client.db("BangalianaBite").collection("users");
    const cartCollection = client.db("BangalianaBite").collection("carts");

    // User Related APIs
    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = { email: user.email };
      const existingUser = await userCollection.findOne(email);
      if (existingUser) {
        res.status(409).send({ message: "User is already exist" });
        return;
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Carts related APIs
    app.post("/carts", async (req, res) => {
      const cart = req.body;
      // Check if the product already exists in the user's cart
      const userInfo = {
        customerEmail: cart.customerEmail,
        productId: cart.productId,
      };
      const existingCartItem = await cartCollection.findOne(userInfo);

      if (existingCartItem) {
        res
          .status(401)
          .send({ message: "This item already added to the cart" });
        return;
      }
      const result = await cartCollection.insertOne(cart);
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
