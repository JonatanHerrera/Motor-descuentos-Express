const {
  _readGoogleSheet,
  _getGoogleSheetClient,
} = require("../spreadsheets.js");

let brandDiscountsList = [];
let clientDiscountList = [];
let activeBrand = "";

const bcrypt = require("bcrypt");

async function validateSecureCredentials(
  googleSheetClient,
  sheetId,
  tabName,
  range,
  marca,
  password
) {
  const res = await googleSheetClient.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!${range}`,
  });

  if (res && res.data && res.data.values && Array.isArray(res.data.values)) {
    const data = res.data.values;

    // Buscar la marca en los datos obtenidos
    const found = data.find((row) => row[0] === marca);

    if (found) {
      // Obtener el hash de la contraseña almacenada
      const hashedPassword = found[1]; // Suponiendo que la contraseña está en la segunda columna
      const token = found[2];

      // Comparar la contraseña proporcionada con el hash almacenado de manera segura
      const match = await bcrypt.compare(password, hashedPassword);
      if (match) {
        return token;
      }
    } else {
      return ""; // La marca no fue encontrada
    }
  } else {
    console.log("No se encontraron datos válidos en la hoja de Google Sheets");
    return false;
  }
}

async function Login(marca, password) {
  // Lógica para obtener las marcas desde tu base de datos u origen de datos
  // Por ejemplo:
  // const marcas = ...; // Obtener marcas desde alguna fuente de datos
  const sheetId = "1ATOy1PpPJ9ORH7ip-eWVkHqokLsQw3efyqLxdZqugTQ";
  const tabName = "Marcas";
  const range = "A:C";
  const googleSheetClient = await _getGoogleSheetClient();

  const isSecureCredentialsValid = await validateSecureCredentials(
    googleSheetClient,
    sheetId,
    tabName,
    range,
    marca,
    password
  );

  if (isSecureCredentialsValid) {
    activeBrand = marca;
    return {
      marca: activeBrand,
      status: "Log In",
      token: isSecureCredentialsValid,
      result: true,
    };
  } else {
    activeBrand = "";
    return {
      marca: activeBrand,
      status: "Error",
      token: "",
      result: false,
    };
    // Realizar acciones cuando las credenciales son inválidas
  }
}

async function getDiscounts(
  googleSheetClient,
  sheetId,
  tabName,
  range,
  filter
) {
  try {
    const res = await googleSheetClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tabName}!${range}`,
    });

    if (res && res.data && res.data.values && Array.isArray(res.data.values)) {
      const data = res.data.values;

      // Filtrar todas las filas que corresponden a la marca específica
      const discounts = data.filter((row) => row[0] === filter);
      if (discounts.length > 0) {
        // Estructurar los datos para devolver los descuentos encontrados
        const discountsData = discounts.map((discount) => {
          return {
            object: discount[0], // Suponiendo que la columna 1 es la marca
            discount: discount[1], // Suponiendo que la columna 2 es el descuento
            // Puedes agregar más propiedades según las columnas de tu hoja de Google Sheets
          };
        });

        return discountsData;
      } else {
        return []; // No se encontraron descuentos para la marca especificada
      }
    } else {
      return null; // La estructura de los datos es incorrecta o no se encontraron datos
    }
  } catch (error) {
    console.error("Error al obtener los descuentos:", error);
    return null; // Error al obtener los datos
  }
}

async function getDiscountByClientDocument(client, brand, token) {
  const sheetId = "1ATOy1PpPJ9ORH7ip-eWVkHqokLsQw3efyqLxdZqugTQ";
  const range = "A:B";
  const googleSheetClient = await _getGoogleSheetClient();
  const decodedData = Buffer.from(token, "base64").toString("utf-8");
  if (decodedData !== "Descuentos:Descuentos123") {
    return ["Invalid Token"];
  }
  brandDiscountsList = await getDiscountByBrand(brand);
  clientDiscountList = await getDiscountByClient(client);
  const validatedFilter = filterDiscounts(
    brandDiscountsList,
    clientDiscountList
  );
  return validatedFilter;
}

function filterDiscounts(arr1, arr2) {
  const result = [];

  for (const item1 of arr1) {
    for (const item2 of arr2) {
      if (item1.discount === item2.discount) {
        result.push(item1.discount);
      }
    }
  }

  return result;
}

async function getDiscountByClient(client) {
  // Lógica para obtener los usuarios desde tu base de datos u origen de datos
  // Por ejemplo:
  // const usuarios = ...; // Obtener usuarios desde alguna fuente de datos
  const sheetId = "1ATOy1PpPJ9ORH7ip-eWVkHqokLsQw3efyqLxdZqugTQ";
  const tabName = "Clientes";
  const range = "A:B";
  const googleSheetClient = await _getGoogleSheetClient();

  let discountsList = await getDiscounts(
    googleSheetClient,
    sheetId,
    tabName,
    range,
    client
  );

  return discountsList;
}

async function getDiscountByBrand(brand) {
  // Lógica para obtener los usuarios desde tu base de datos u origen de datos
  // Por ejemplo:
  // const usuarios = ...; // Obtener usuarios desde alguna fuente de datos
  const sheetId = "1ATOy1PpPJ9ORH7ip-eWVkHqokLsQw3efyqLxdZqugTQ";
  const tabName = "MarcasXDescuento";
  const range = "A:B";
  const googleSheetClient = await _getGoogleSheetClient();

  let discountsList = await getDiscounts(
    googleSheetClient,
    sheetId,
    tabName,
    range,
    brand
  );

  return discountsList;
}

function getActiveBrand(req, res) {
  res.json(activeBrand);
}

module.exports = {
  Login,
  getDiscountByBrand,
  getActiveBrand,
  getDiscountByClientDocument,
  getDiscountByClient,
};
