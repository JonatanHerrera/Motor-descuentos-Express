var express = require("express"); //llamamos a Express
var app = express();
const { Login, getDiscountByBrand, getActiveBrand ,getDiscountByClientDocument,getDiscountByClient} = require("./controllers/controller.js");
const { get } = require("express/lib/request.js");

// Ruta para obtener marcas
app.use(express.json());
app.post("/login", async (req, res) => {  
  const { marca, password } = req.body;
  const result = await Login(marca, password);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});


app.post("/discountsByBrand", async (req, res) => {  
  const { brand} = req.body;
  const result = await getDiscountByBrand(marca);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});
app.post("/discountsByClientDocument", async (req, res) => {  
  const {client} = req.body;
  const {brand} = req.body;
  const result = await getDiscountByClientDocument(client,brand);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});

app.post("/discountsByClient", async (req, res) => {  
  const {client} = req.body;  
  const result = await getDiscountByClient(client);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});
// Ruta para obtener usuarios

app.get("/getActiveBrand", getActiveBrand);
//routes/
app.use(require("./routes/google.routes"));

module.exports = app;
