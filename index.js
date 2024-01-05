const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this line
const routerUsers = require('./src/routers/r_users');
const { envPORT } = require('./src/helpers/env');
const prefix = require('./src/config/prefix');
const app = express();

app.use(cors()); // Add this line

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", 'GET, POST, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.get(`${prefix}`, function (req, res) {
  res.json({ msg: 'Welcome to my API for POS system' });
});
app.use(`${prefix}`, routerUsers);
app.use(`${prefix}/imgprofile`, express.static('./public/profile'));
app.use(`${prefix}/imgproducts`, express.static('./public/products'));
app.listen(envPORT || 5005, () => {
  console.log(`Server is running on http://localhost:${envPORT || 5005}`);
});
