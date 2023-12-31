const { GoogleSpreadsheet } = require("google-spreadsheet");
const { google } = require("googleapis");


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
    keyFile: process.env.KEY_FILE_PATH,
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

module.exports = { _readGoogleSheet, _getGoogleSheetClient };
