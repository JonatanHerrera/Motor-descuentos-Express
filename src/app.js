var express = require("express"); //llamamos a Express
const cors = require('cors');
var app = express();


const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));



const {
  Login,
  getDiscountByBrand,
  getActiveBrand,
  getDiscountByClientDocument,
  getDiscountByClient,
} = require("./controllers/controller.js");
const { get } = require("express/lib/request.js");

// Ruta para obtener marcas
app.use(express.json());

// middlewre

app.use((req, res, next) => {
  if (!req.get("Authorization")) {
    var err = new Error("Not Authenticated");
    res.status(401).set("WWW-Authenticate", "Basic");
    next(err);
  } else {
    var credentials = Buffer.from(
      req.get("Authorization").split(" ")[1],
      "base64"
    )
      .toString()
      .split(":");
    var username = credentials[0];
    var password = credentials[1];

    if (!(username === "Descuentos" && password === "Descuentos123")) {
      var err = new Error("Not Authenticated");
      res.status(401).set("WWW-Authenticate", "Basic");
      next(err);
    }
    res.status(200);
    next();
  }
});

app.post("/login", async (req, res) => {
  const { marca, password } = req.body;
  const result = await Login(marca, password);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});

app.post("/discountsByBrand", async (req, res) => {
  const { brand } = req.body;
  const result = await getDiscountByBrand(brand);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});
app.post("/discountsByClientDocument", async (req, res) => {
  const { client, brand,  token } = req.body; 
  
  const result = await getDiscountByClientDocument(client,brand,token);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});

app.post("/discountsByClient", async (req, res) => {
  const { client } = req.body;
  const result = await getDiscountByClient(client);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});
// Ruta para obtener usuarios

app.get("/getActiveBrand", getActiveBrand);
//routes/
app.use(require("./routes/google.routes"));
module.exports = app;
