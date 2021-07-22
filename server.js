const admin = require('firebase-admin');
const serviceAccount = require('./tutorial-47d32-firebase-adminsdk-4kuzo-dff1b09ca6.json'); // auth key... don't share this with anyone
admin.initializeApp({ // authentification with the key above
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore(); 

const express = require("express");
const app = express();
const hostname = "127.0.0.1";
const port = 3000;

const cors = require("cors") // middleware
app.use(cors())

app.use((req, res, next) => {
    console.log("TIME:", Date.now());
    next(); // middleware finished
   });

app.use(express.json()) // gets json data and converts to object
const reviewsRouter = require("./routes/reviews") // Inside a folder called "routes", there is a js file called "reviews" that we are importing here

app.use("/reviews" , reviewsRouter) // Any endpoint that begins with /reviews will be handled by the reviews.js file

app.get("/", (req, res) => { // Landing page that displays all restaurants
    db 
   .collection("Restaurants") // specify the collection to be queried
   .get() // get request
   .then((querySnapshot) => { // an object
        return querySnapshot.docs.map(item => {
        console.log(item.data()) // similar to .json()
        let data = item.data()
         data["id"] = item.id
         console.log(item.id)
        return data;
        })             
    })
    .then((items) => {
        res.send(items)
    }) 
    });



const server = app.listen(3000, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
      });
