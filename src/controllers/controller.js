const { _getGoogleSheetClient } = require("../spreadsheets.js");
const { BigQuery } = require("@google-cloud/bigquery");
const jwt = require("jsonwebtoken");
const {} = require("../app.js");

let brandDiscountsList = [];
let clientDiscountList = [];

async function Login(username, password) {
  const sheetId = process.env.SHEET_ID;
  const tabName = process.env.TAB_NAME_BRAND;
  const range = "A:C";
  const googleSheetClient = await _getGoogleSheetClient();

  const loginData = await getTableValues(
    googleSheetClient,
    sheetId,
    tabName,
    range
  );

  const isSecureCredentialsValid = await validateSecureCredentials(
    loginData,
    username,
    password
  );

  return isSecureCredentialsValid;
}
async function validateSecureCredentials(data, username, password) {
  const found = data.find((row) => row[0] === username && row[1] === password);
  let match = false;
  if (found) {
    const hashedPassword = found[1];
    const mall = found[2];
    const token = jwt.sign(
      { name: username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 60 * 60 }
    );
    if (hashedPassword === password) {
      match = true;
    }
    if (match) {
      return {
        brand: username,
        mall: mall,
        status: "Log In",
        token: token,
        result: true,
      };
    }
  } else {
    return {
      marca: "",
      mall: "",
      status: "Error",
      token: "",
      result: false,
    };
  }
}

async function getTableValues(googleSheetClient, sheetId, tabName, range) {
  try {
    const res = await googleSheetClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tabName}!${range}`,
    });

    if (res && res.data && res.data.values && Array.isArray(res.data.values)) {
      const data = res.data.values;
      return data;
    }
  } catch {
    return [];
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
      let discounts;
      // Filtrar todas las filas que corresponden a la marca específica
      if (filter) {
        discounts = data.filter((row) => row[0] === filter);
      } else {
        discounts = data;
      }

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

async function insertBigQuerryData(
  dataToInsert,
  client,
  brand,
  datasetId,
  tableId
) {
  try {
    const keyFileName = process.env.KEY_FILE_PATH;
    const bigquery = new BigQuery({ keyFilename: keyFileName });
    const data = dataToInsert;

    data.forEach((descuento) => {
      descuento.Fecha_Consulta = new Date().toISOString();
      descuento.Cliente = client;
      descuento.Marca = brand;
    });
    // Inserta los datos en la tabla
    if (data.length === 0) {
      return;
    }
    await bigquery.dataset(datasetId).table(tableId).insert(data);
    return `Inserted ${data.length} rows`;
  } catch (error) {
    console.error("Error al insertar datos en BigQuery:", error);
  }
}

async function getDiscountByClientDocument(client, brand, mall, token) {
  const isValidToken = await validateJWT(token);
  if (!isValidToken) {
    return {
      status: "Invalid Token",
      result: false,
    };
  }

  brandDiscountsList = await getDiscountByBrand(brand,mall,token);
  clientDiscountList = await getDiscountByClient(client, mall,token);
  discountsList = await getDiscountList(mall);

  console.log("marca",brandDiscountsList);
  console.log("cliente",clientDiscountList);
  console.log("descuentos",discountsList);
  

  /*
  const validatedFilter = filterDiscounts(
    brandDiscountsList,
    clientDiscountList,
    discountsList
  );

  const miDatasetId = process.env.BQ_DATASET;
  const miTableId = process.env.BQ_TABLEDISCOUNTLOGS;

  await insertBigQuerryData(
    validatedFilter,
    client,
    brand,
    miDatasetId,
    miTableId
  )
    .then((resultado) => {
      console.log(resultado);
    })
    .catch((error) => {
      console.error(error.message);
    });*/
  return discountsList;
}

function filterDiscounts(arr1, arr2, discountsList) {
  const result = [];

  for (const item1 of arr1) {
    for (const item2 of arr2) {
      if (item1.discount === item2.discount) {
        const discountListFiltered = discountsList.filter(
          (row) => row.object === item1.discount
        );

        const descripcion = discountListFiltered[0].discount;
        // Agregar el descuento y su descripción al resultado
        result.push({
          Descuento: item1.discount,
          Descripcion_Descuento: descripcion,
        });
      }
    }
  }

  return result;
}

async function validateJWT(token) {
  const validation = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        console.log("Error al verificar el token:", err.message);
        return false;
      } else {
        return true;
      }
    }
  );
  return validation;
}

async function getDiscountByClient(client, mall, token) {
  const isValidToken = await validateJWT(token);

  if (!isValidToken) {
    return {
      status: "Invalid Token",
      result: false,
    };
  }

  const sheetId = process.env.SHEET_ID;
  const tabName = process.env.TAB_NAME_CLIENTS;
  const range = "A:C";
  const googleSheetClient = await _getGoogleSheetClient();

  let discountsList = await getTableValues(
    googleSheetClient,
    sheetId,
    tabName,
    range
  );

  const FilterList = discountsList.filter(
    (row) => row[0] === client && row[2] === mall
  );

  return FilterList;
}

async function getDiscountByBrand(brand, mall, token) {
  const isValidToken = await validateJWT(token);

  if (!isValidToken) {
    return {
      status: "Invalid Token",
      result: false,
    };
  }

  const sheetId = process.env.SHEET_ID;
  const tabName = process.env.TAB_NAME_BRAND_BY_DISCOUNT;
  const range = "A:C";
  const googleSheetClient = await _getGoogleSheetClient();

  let discountsList = await getTableValues(
    googleSheetClient,
    sheetId,
    tabName,
    range
  );
  const FilterList = discountsList.filter(
    (row) => row[0] === brand && row[2] === mall
  );

  return FilterList;
}

async function getDiscountList(mall) {
  const sheetId = process.env.SHEET_ID;
  const tabName = process.env.TAB_NAME_DISCOUNTS;
  const range = "A:F";
  const googleSheetClient = await _getGoogleSheetClient();

  let discountsList = await getTableValues(
    googleSheetClient,
    sheetId,
    tabName,
    range
  );
  const currentDatetime = new Date().setHours(-5, 0, 0, 0);
  const currentDate = new Date(currentDatetime);

  const FilterList = discountsList.filter((row) => row[5] === mall);

  const currentDiscounts = FilterList.filter((discount) => {
    const startDate = new Date(discount[3]);
    const endDate = new Date(discount[4]);

    return currentDate >= startDate && currentDate <= endDate;
  });

  return currentDiscounts;
}

module.exports = {
  Login,
  getDiscountByBrand,
  getDiscountByClientDocument,
  getDiscountByClient,
};
