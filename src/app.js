var express = require("express"); //llamamos a Express
var app = express();
const { Login, getDiscountByBrand } = require("./controllers/controller.js");
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
  const { marca} = req.body;
  const result = await getDiscountByBrand(marca);
  // Envías la respuesta de vuelta al cliente (Postman)
  res.json(result);
});
// Ruta para obtener usuarios
app.get("/getDiscountByBrand", getDiscountByBrand);

//routes/
app.use(require("./routes/google.routes"));

module.exports = app;
