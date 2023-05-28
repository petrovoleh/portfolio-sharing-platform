const fs = require('fs');
const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const MongoClient = require('mongodb').MongoClient;

// Connection URL and database name
const url = 'mongodb://localhost:27017';
const dbName = 'portfolioDB';

// Create a new MongoClient
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB server
client.connect(async function (err) {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }

  console.log('Connected to MongoDB');

  // Get the database instance
  const db = client.db(dbName);

  // Get the collection (table) you want to retrieve data from
  const collection = db.collection('messages');

  try {
    // Find all documents in the collection
    const messages = await collection.find({}).toArray();

    // Generate HTML table rows using the messages data
    const tableRows = messages
      .map(
        (message) => `<tr>
        <td>${message.chat_id}</td>
        <td>${message.user_id}</td>
        <td>${message.text}</td>
        <td>${message.time}</td>
      </tr>`
      )
      .join('\n');

    // Generate the complete HTML table
    const htmlTable = `<table>
      <thead>
        <tr>
          <th>Chat ID</th>
          <th>User ID</th>
          <th>Text</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>`;

    // Save the HTML table to a file
    const htmlFilePath = 'messages.html';
    fs.writeFileSync(htmlFilePath, htmlTable);

    console.log('HTML file generated successfully');

    // Generate PDF from HTML using Puppeteer
    const pdfFilePath = 'messages.pdf';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the page content to the HTML table
    await page.setContent(htmlTable, { waitUntil: 'networkidle0' });

    // Generate PDF from the HTML content
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      printBackground: true,
    });

    console.log('PDF file generated successfully');

    // Close the Puppeteer browser
    await browser.close();

    // Delete the temporary HTML file
    fs.unlinkSync(htmlFilePath);

 
    // Close the MongoDB connection
    client.close();
  } catch (err) {
    console.error('Error generating PDF:', err);
    client.close();
  }
});
