const { google } = require('googleapis');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    const requestBody = JSON.parse(event.body);

    // Load the service account key JSON file
    const serviceAccountKey = require('./credentials.json'); // Replace with your service account key file

    try {
        // Authenticate with Google Sheets using the service account credentials
        const auth = await authorize(serviceAccountKey);

        const os = requestBody.os.toLowerCase();

        // Check if OS is unique
        const isUnique = await checkUniqueOS(auth, os);

        if (!isUnique) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Operating system is not unique.' }),
            };
        }

        // Add data to Google Sheets
        await appendToSheet(auth, [requestBody.name, requestBody.enrollment, os]);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server error.' }),
        };
    }
};

// Google Sheets API functions (Move these functions to submit.js)
async function authorize(serviceAccountKey) {
    const jwtClient = new google.auth.JWT(
        serviceAccountKey.client_email,
        null,
        serviceAccountKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    try {
        await jwtClient.authorize();
        return jwtClient;
    } catch (err) {
        console.error('Error authorizing with service account:', err);
        throw err;
    }
}

async function checkUniqueOS(auth, os) {
    // Replace with your Google Sheets document ID and sheet name
    const spreadsheetId = '1Go2YQHRPmf8cni6kINGj_QNc1HXT0VcVYp3Cg5x8Sp4'; // Update with your Spreadsheet ID
    const sheetName = 'Sheet1';

    // Load the sheet
    const sheetsAPI = google.sheets({ version: 'v4', auth });
    const sheet = await sheetsAPI.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
    });

    // Check if the OS already exists in the sheet
    const data = sheet.data.values;
    if (data) {
        return !data.some(row => row[2] === os);
    } else {
        return true;
    }
}

async function appendToSheet(auth, data) {
    // Replace with your Google Sheets document ID and sheet name
    const spreadsheetId = '1Go2YQHRPmf8cni6kINGj_QNc1HXT0VcVYp3Cg5x8Sp4'; // Update with your Spreadsheet ID
    const sheetName = 'Sheet1';

    // Load the sheet
    const sheetsAPI = google.sheets({ version: 'v4', auth });
    await sheetsAPI.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [data],
        },
    });
}
