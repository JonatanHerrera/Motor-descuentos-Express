const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require("googleapis");

const sheetId = "1ATOy1PpPJ9ORH7ip-eWVkHqokLsQw3efyqLxdZqugTQ";
const tabName = "Marcas";
const range = "A:B";

main().then(() => {
  console.log("Completed");
});

async function main() {
  // Generating google sheet client
  const googleSheetClient = await _getGoogleSheetClient();

  // Reading Google Sheet from a specific range
}

async function _getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./src/json/Credenciales.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth });
}

async function _readGoogleSheet(googleSheetClient, sheetId, tabName, range) {
  const res = await googleSheetClient.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tabName}!${range}`,
  });


    return res.data.values;
  
  
}

async function _writeGoogleSheet(
  googleSheetClient,
  sheetId,
  tabName,
  range,
  data
) {
  await googleSheetClient.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tabName}!${range}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    resource: {
      majorDimension: "ROWS",
      values: data,
    },
  });
}

module.exports = { _readGoogleSheet, _getGoogleSheetClient };
