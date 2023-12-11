if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var express = require("express");
const cors = require("cors");
var app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const {
  Login,
  getDiscountByBrand,
  getDiscountByClientDocument,
  getDiscountByClient,
} = require("./controllers/controller.js");
const { get } = require("express/lib/request.js");

app.use(express.json());

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
  const { username, password } = req.body;
  const result = await Login(username, password);

  res.json(result);
});

app.post("/discountsByBrand", async (req, res) => {
  const { brand, mall  } = req.body;
  const token = req.headers["token"];
  const result = await getDiscountByBrand(brand, mall ,token);

  res.json(result);
});
app.post("/discountsByClientDocument", async (req, res) => {
  const { client, brand , mall } = req.body;
  const token = req.headers["token"];
  const result = await getDiscountByClientDocument(client, brand,mall,token);

  res.json(result);
});

app.post("/discountsByClient", async (req, res) => {
  const { client, mall } = req.body;
  const token = req.headers["token"];
  const result = await getDiscountByClient(client, mall, token);

  res.json(result);
});

module.exports = app;
