const fs = require('fs');

// Load your JSON log file
const logEntries = require('./experiment-log.json'); // Replace with your actual JSON file path

// Define the headers for the CSV
const headers = ['Type of Event', 'Seconds', 'Detail', 'Points'];

// Helper function to handle null or undefined values
function handleNull(value) {
    return value === null || value === undefined ? '' : value;
}

// Create a function to convert the JSON to CSV format
function jsonToCsv(data) {
    // Start with the headers
    const csvRows = [];
    csvRows.push(headers.join(','));

    // Process each entry in the JSON
    data.forEach(entry => {
        const eventType = entry.eventType;
        const elapsedTime = handleNull(entry.elapsedTime); // Seconds (if exists)
        const points = handleNull(entry.points); // Points column

        // Prepare the detail information including block, based on the event type
        let detail = '';
        if (eventType === 'Mode Switched') {
            detail = `Switched to ${handleNull(entry.newMode)}`;
        } else if (eventType === 'Point Loss') {
            detail = `Losses: ${handleNull(entry.losses)}, Controlled: ${handleNull(entry.controlled)}`;  // Added controlled
        } else if (eventType === 'Schedule Start') {
            detail = `Block: ${handleNull(entry.block)}, Intervals: ${handleNull(entry.intervalsGenerated)}, Interval Type: ${handleNull(entry.intervalType)}`; // Added intervalType
        } else if (eventType === 'Schedule End') {
            detail = `Block: ${handleNull(entry.block)}, Intervals: ${handleNull(entry.intervalsGenerated)}`;
        } else if (eventType === 'Experiment End') {
            detail = `Result: ${handleNull(entry.result)}`;
        }

        // Combine all the columns into a CSV row
        csvRows.push([eventType, elapsedTime, detail, points].join(','));
    });

    return csvRows.join('\n');
}

// Generate CSV from JSON
const csvData = jsonToCsv(logEntries);

// Write the CSV to a file (optional, for testing purposes)
fs.writeFileSync('experiment-log.csv', csvData);

console.log('CSV file generated successfully!');