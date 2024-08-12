const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" }); // dotenv use to load the env variable to the node environment variables
const app = require("./app");
const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(con => {
    console.log('Database has been connected successfully.');
}).catch(err => console.log('Data connection error is', err));

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on ${port} port`);
});

// process.on('unhandledRejection', (err)=>{
//   console.log(err.name, err.message)
//   server.close(()=>{
//     process.exit(1);
//   })
// })