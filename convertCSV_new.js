// ConvertCSV JavaScript functionality
console.log('ConvertCSV_new.js loaded successfully!');

// File upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFile');
    const filePathInput = document.getElementById('filePath');
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // Display the file path (note: for security reasons, browsers don't show full path)
            filePathInput.value = file.name;
            console.log('Selected file:', file.name);
        } else {
            filePathInput.value = '';
        }
    });
});

// Clear selection function
function clearSelection() {
    const fileInput = document.getElementById('csvFile');
    const filePathInput = document.getElementById('filePath');
    
    fileInput.value = '';
    filePathInput.value = '';
    console.log('Selection cleared');
}

// Remove leading zero function
function removeLeadingZero(input) {
    if (input.value.startsWith('0') && input.value.length > 1) {
        input.value = input.value.substring(1);
    }
}

// Move to next input function
function moveToNextInput(input, event) {
    if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const inputs = document.querySelectorAll('.inspect-one-container input, .inspect-two-container input, .inspect-three-container input, .inspect-four-container input');
        const currentIndex = Array.from(inputs).indexOf(input);
        const nextInput = inputs[currentIndex + 1];
        
        if (nextInput) {
            nextInput.focus();
            nextInput.select();
        }
    }
}

// Generate print table function
function generatePrintTable() {
    console.log('generatePrintTable function called');
    
    // Check if CSV data is available
    if (!window.csvHeaders || !window.csvData) {
        alert('Please upload and process a CSV file first!');
        return;
    }
    
    // Get the mapping from the input fields
    const mapping = getColumnMapping();
    
    // Generate the table HTML
    const tableHTML = createTableFromCSV(mapping);
    
    // Display the table in the print container
    const printContainer = document.querySelector('.print-container');
    printContainer.innerHTML = '<div style="padding: 20px;"><h2 style="margin-bottom: 20px; color: #333;">Generated Table</h2>' + tableHTML + '</div>';
    
    console.log('Print table generated successfully');
}

// Get column mapping from input fields
function getColumnMapping() {
    const inputs = document.querySelectorAll('.inspect-one-container input, .inspect-two-container input, .inspect-three-container input, .inspect-four-container input');
    const mapping = {};
    
    inputs.forEach((input, index) => {
        const value = parseInt(input.value);
        if (value > 0 && value <= 9) {
            // Support multiple CSV columns mapped to the same table column
            if (!mapping[value]) {
                mapping[value] = [];
            }
            mapping[value].push(index);
        }
    });
    
    console.log('Column mapping:', mapping);
    console.log('CSV headers:', window.csvHeaders);
    console.log('CSV data sample:', window.csvData ? window.csvData.slice(0, 3) : 'No data');
    
    return mapping;
}

// Create table from CSV data
function createTableFromCSV(mapping) {
    const headers = ['Name', 'Songtitle', 'Writer', 'Writer IPI', 'Writer Split', 'Publisher', 'Publisher IPI', 'Publisher Split', 'Notes'];
    
    // Parse CSV data if not already done
    if (!window.csvData) {
        parseCSVData();
    }
    
    console.log('Creating table with mapping:', mapping);
    console.log('CSV data length:', window.csvData ? window.csvData.length : 0);
    
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">';
    tableHTML += '<thead><tr style="background-color: #f8f9fa;">';
    
    for (let i = 0; i < headers.length; i++) {
        tableHTML += '<th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">' + headers[i] + '</th>';
    }
    
    tableHTML += '</tr></thead><tbody>';
    
    // Process each row of CSV data
    for (let rowIndex = 0; rowIndex < window.csvData.length; rowIndex++) {
        const row = window.csvData[rowIndex];
        if (rowIndex === 0) continue; // Skip header row
        
        console.log('Processing row ' + rowIndex + ':');
        
        // Collect all data for each table column
        const tableData = {
            'Name': [],
            'Songtitle': [],
            'Writer': [],
            'Writer IPI': [],
            'Writer Split': [],
            'Publisher': [],
            'Publisher IPI': [],
            'Publisher Split': [],
            'Notes': []
        };
        
        console.log('Current mappings:', mapping);
        console.log('Mapping details:');
        for (let key in mapping) {
            console.log('  Table column ' + key + ' -> CSV column ' + mapping[key]);
        }
        
        console.log('=== CSV DATA DEBUG ===');
        console.log('Row length: ' + row.length);
        console.log('Sample CSV row data (first 30 columns):');
        for (let i = 0; i < Math.min(30, row.length); i++) {
            console.log('  CSV column ' + i + ': "' + row[i] + '"');
        }
        console.log('=== END CSV DATA DEBUG ===');
        
        // Process each table header and collect all mapped data
        for (let index = 0; index < headers.length; index++) {
            const header = headers[index];
            const tableColumnIndex = index + 1;
            console.log('Processing ' + header + ' (table column ' + tableColumnIndex + '):');
            
            // Find all CSV columns that are mapped to this table column
            const foundMappings = [];
            const mappingKeys = Object.keys(mapping);
            
            console.log('  Looking for mappings to table column ' + tableColumnIndex);
            console.log('  All mapping keys: [' + mappingKeys.join(', ') + ']');
            
            for (let j = 0; j < mappingKeys.length; j++) {
                const mappedValue = mappingKeys[j];
                console.log('  Checking mapping key: ' + mappedValue + ' (parsed as: ' + parseInt(mappedValue) + ')');
                
                if (parseInt(mappedValue) === tableColumnIndex) {
                    const csvColumnIndices = mapping[mappedValue];
                    console.log('  ✓ Found mapping: ' + mappedValue + ' -> CSV columns [' + csvColumnIndices.join(', ') + ']');
                    
                    // Process each CSV column mapped to this table column
                    for (let csvIndex = 0; csvIndex < csvColumnIndices.length; csvIndex++) {
                        const csvColumnIndex = csvColumnIndices[csvIndex];
                        foundMappings.push(csvColumnIndex);
                        console.log('    Processing CSV column ' + csvColumnIndex + ':');
                        
                        if (row[csvColumnIndex] !== undefined && row[csvColumnIndex].trim() !== '') {
                            const data = row[csvColumnIndex].trim();
                            console.log('    ✓ CSV column ' + csvColumnIndex + ' has data: "' + data + '"');
                            
                            // Split by semicolon if it contains multiple values
                            const splitData = data.split(';');
                            console.log('    ✓ Split data: [' + splitData.join(', ') + ']');
                            
                            for (let k = 0; k < splitData.length; k++) {
                                const item = splitData[k].trim();
                                if (item !== '') {
                                    tableData[header].push(item);
                                    console.log('    ✓ Added item: "' + item + '" to ' + header + ' array');
                                }
                            }
                            console.log('    ✓ CSV column ' + csvColumnIndex + ': "' + data + '" → split into [' + splitData.join(', ') + ']');
                            console.log('    ✓ Current ' + header + ' array: [' + tableData[header].join(', ') + ']');
                        } else {
                            console.log('    ✗ CSV column ' + csvColumnIndex + ': empty or undefined - SKIPPING');
                        }
                    }
                } else {
                    console.log('  ✗ Mapping key ' + mappedValue + ' does not match table column ' + tableColumnIndex);
                }
            }
            
            if (foundMappings.length === 0) {
                console.log('  ✗ No CSV columns mapped to ' + header);
            } else {
                console.log('  📊 ' + header + ' final array: [' + tableData[header].join(', ') + '] (' + tableData[header].length + ' items)');
                console.log('  📊 ' + header + ' array contents:');
                for (let m = 0; m < tableData[header].length; m++) {
                    console.log('    [' + m + ']: "' + tableData[header][m] + '"');
                }
            }
        }
        
        console.log('=== FINAL TABLE DATA SUMMARY ===');
        const tableDataKeys = Object.keys(tableData);
        for (let i = 0; i < tableDataKeys.length; i++) {
            const header = tableDataKeys[i];
            console.log(header + ': [' + tableData[header].join(', ') + '] (' + tableData[header].length + ' items)');
        }
        console.log('================================');
        
        // Check if we have any columns with multiple items
        let hasMultipleItems = false;
        for (let i = 0; i < tableDataKeys.length; i++) {
            const header = tableDataKeys[i];
            if (tableData[header].length > 1) {
                console.log('MULTIPLE ITEMS FOUND in ' + header + ': ' + tableData[header].length + ' items');
                hasMultipleItems = true;
            }
        }
        
        if (!hasMultipleItems) {
            console.log('No columns have multiple items - will create single row');
        }
        
        // Calculate max rows needed based on the column with the most data
        const rowCounts = [];
        const tableDataValues = Object.values(tableData);
        for (let i = 0; i < tableDataValues.length; i++) {
            rowCounts.push(tableDataValues[i].length);
        }
        
        let maxRows = 1;
        for (let i = 0; i < rowCounts.length; i++) {
            if (rowCounts[i] > maxRows) {
                maxRows = rowCounts[i];
            }
        }
        
        console.log('Row counts per column:');
        for (let i = 0; i < tableDataKeys.length; i++) {
            console.log(tableDataKeys[i] + ': ' + rowCounts[i]);
        }
        console.log('Creating ' + maxRows + ' rows for this song');
        
        // Only create multiple rows if we actually have multiple data items
        console.log('=== ROW CREATION DEBUG ===');
        console.log('maxRows calculated: ' + maxRows);
        console.log('hasMultipleItems flag: ' + hasMultipleItems);
        
        if (maxRows > 1) {
            console.log('✓ Multiple data items detected - creating ' + maxRows + ' rows');
            
            for (let i = 0; i < maxRows; i++) {
                console.log('=== CREATING ROW ' + (i + 1) + ' OF ' + maxRows + ' ===');
                tableHTML += '<tr>';
                
                // Generate each column using the collected data
                for (let j = 0; j < headers.length; j++) {
                    const header = headers[j];
                    const data = tableData[header][i] || '';
                    console.log('  Row ' + (i + 1) + ' - ' + header + ': "' + data + '"');
                    
                    // Name and Songtitle only show in first row
                    if ((header === 'Name' || header === 'Songtitle') && i > 0) {
                        console.log('  Row ' + (i + 1) + ' - ' + header + ': BLANK (not first row)');
                        tableHTML += '<td style="border: 1px solid #dee2e6; padding: 8px;"></td>';
                    } else {
                        console.log('  Row ' + (i + 1) + ' - ' + header + ': "' + data + '" (adding to HTML)');
                        tableHTML += '<td style="border: 1px solid #dee2e6; padding: 8px;">' + data + '</td>';
                    }
                }
                
                console.log('=== FINISHED ROW ' + (i + 1) + ' ===');
                tableHTML += '</tr>';
            }
            console.log('✓ Created ' + maxRows + ' rows successfully');
        } else {
            // Single row case
            console.log('✗ Single data item - creating 1 row (this might be the problem!)');
            console.log('maxRows is ' + maxRows + ' but we expected more');
            console.log('Let me check the data arrays again:');
            
            for (let i = 0; i < tableDataKeys.length; i++) {
                const header = tableDataKeys[i];
                console.log('  ' + header + ' array length: ' + tableData[header].length);
                if (tableData[header].length > 1) {
                    console.log('  WARNING: ' + header + ' has ' + tableData[header].length + ' items but maxRows is only ' + maxRows);
                }
            }
            
            tableHTML += '<tr>';
            
            for (let j = 0; j < headers.length; j++) {
                const header = headers[j];
                const data = tableData[header][0] || '';
                console.log('  ' + header + ': "' + data + '"');
                tableHTML += '<td style="border: 1px solid #dee2e6; padding: 8px;">' + data + '</td>';
            }
            
            tableHTML += '</tr>';
        }
        console.log('=== END ROW CREATION DEBUG ===');
    }
    
    tableHTML += '</tbody></table>';
    
    return tableHTML;
}

// Parse CSV data and store it globally
function parseCSVData() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (!file) {
        console.error('No file selected');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const csvContent = event.target.result;
        const lines = csvContent.split('\n');
        
        // Parse CSV data
        window.csvData = lines.map(line => {
            // Simple CSV parsing - split by comma and handle quoted fields
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
            
            result.push(current);
            return result;
        });
        
        console.log('CSV data parsed:', window.csvData);
    };
    
    reader.readAsText(file);
}

// Modify uploadAndInspect to also parse CSV data
function uploadAndInspect() {
    console.log('uploadAndInspect function called');
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    console.log('File input found:', fileInput);
    console.log('Selected file:', file);
    
    if (!file) {
        alert('Please select a CSV file first!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const csvContent = event.target.result;
        const lines = csvContent.split('\n');
        
        if (lines.length > 0) {
            // Get the first row (header row)
            const headerRow = lines[0];
            // Split by comma and filter out empty cells
            const headers = headerRow.split(',').filter(cell => cell.trim() !== '');
            
            // Store the headers as a variable
            window.csvHeaders = headers;
            
            // Parse and store CSV data
            window.csvData = lines.map(line => {
                // Simple CSV parsing - split by comma and handle quoted fields
                const result = [];
                let current = '';
                let inQuotes = false;
                
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                
                result.push(current);
                return result;
            });
            
            console.log('Parsed CSV data:', window.csvData);
            
            // Display headers across four containers
            const inspectOneContainer = document.querySelector('.inspect-one-container');
            const inspectTwoContainer = document.querySelector('.inspect-two-container');
            const inspectThreeContainer = document.querySelector('.inspect-three-container');
            const inspectFourContainer = document.querySelector('.inspect-four-container');
            
            // Calculate headers per container
            const headersPerContainer = Math.ceil(headers.length / 4);
            
            // First container
            const firstGroup = headers.slice(0, headersPerContainer);
            inspectOneContainer.innerHTML = '<ul style="list-style-type: none; padding: 0; font-size: 12px;">' + firstGroup.map((header, index) => '<li style="padding: 5px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;"><span>' + header.trim() + '</span><input type="number" min="0" max="9" value="0" style="width: 50px; padding: 2px; font-size: 11px;" oninput="removeLeadingZero(this)" onkeydown="moveToNextInput(this, event)"></li>').join('') + '</ul>';
            
            // Second container
            const secondGroup = headers.slice(headersPerContainer, headersPerContainer * 2);
            inspectTwoContainer.innerHTML = '<ul style="list-style-type: none; padding: 0; font-size: 12px;">' + secondGroup.map((header, index) => '<li style="padding: 5px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;"><span>' + header.trim() + '</span><input type="number" min="0" max="9" value="0" style="width: 50px; padding: 2px; font-size: 11px;" oninput="removeLeadingZero(this)" onkeydown="moveToNextInput(this, event)"></li>').join('') + '</ul>';
            
            // Third container
            const thirdGroup = headers.slice(headersPerContainer * 2, headersPerContainer * 3);
            inspectThreeContainer.innerHTML = '<ul style="list-style-type: none; padding: 0; font-size: 12px;">' + thirdGroup.map((header, index) => '<li style="padding: 5px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;"><span>' + header.trim() + '</span><input type="number" min="0" max="9" value="0" style="width: 50px; padding: 2px; font-size: 11px;" oninput="removeLeadingZero(this)" onkeydown="moveToNextInput(this, event)"></li>').join('') + '</ul>';
            
            // Fourth container
            const fourthGroup = headers.slice(headersPerContainer * 3, headersPerContainer * 4);
            let fourthContainerContent = '<ul style="list-style-type: none; padding: 0; font-size: 12px;">' + fourthGroup.map((header, index) => '<li style="padding: 5px 0; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;"><span>' + header.trim() + '</span><input type="number" min="0" max="9" value="0" style="width: 50px; padding: 2px; font-size: 11px;" oninput="removeLeadingZero(this)" onkeydown="moveToNextInput(this, event)"></li>').join('') + '</ul>';
            
            // Add "+more" if there are more headers than can fit in 4 containers
            const totalDisplayed = headersPerContainer * 4;
            if (headers.length > totalDisplayed) {
                fourthContainerContent += '<p style="color: #6c757d; font-style: italic; margin-top: 10px;">+' + (headers.length - totalDisplayed) + ' more headers</p>';
            }
            
            inspectFourContainer.innerHTML = fourthContainerContent;
            
            console.log('CSV Headers:', headers);
            console.log('CSV Data parsed:', window.csvData);
        }
    };
    
    reader.readAsText(file);
}

// Test function to debug mapping
function testMapping() {
    console.log('=== TESTING MAPPING ===');
    const inputs = document.querySelectorAll('.inspect-one-container input, .inspect-two-container input, .inspect-three-container input, .inspect-four-container input');
    console.log('Total inputs found:', inputs.length);
    
    inputs.forEach((input, index) => {
        const value = parseInt(input.value);
        console.log('Input ' + index + ': value = ' + value);
    });
    
    const mapping = getColumnMapping();
    console.log('Final mapping:', mapping);
    
    // Check what mappings are missing
    const requiredMappings = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const missingMappings = [];
    for (let i = 0; i < requiredMappings.length; i++) {
        if (!mapping[requiredMappings[i]]) {
            missingMappings.push(requiredMappings[i]);
        }
    }
    console.log('Missing mappings:', missingMappings);
    
    if (window.csvData && window.csvData.length > 1) {
        console.log('First data row:', window.csvData[1]);
        console.log('Headers:', window.csvHeaders);
        
        // Show what's in the first few columns that might contain data
        console.log('Sample data from first row:');
        for (let i = 0; i < Math.min(10, window.csvData[1].length); i++) {
            console.log('Column ' + i + ': "' + window.csvData[1][i] + '"');
        }
        
        // Show all columns with data
        console.log('All columns with data:');
        for (let i = 0; i < window.csvData[1].length; i++) {
            const value = window.csvData[1][i];
            if (value && value.trim() !== '') {
                console.log('Column ' + i + ': "' + value + '"');
            }
        }
    }
} 