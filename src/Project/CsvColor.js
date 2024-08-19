import React from 'react';
import Papa from 'papaparse';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const generateRandomColor = (predefinedColors) => {
    const randomIndex = Math.floor(Math.random() * predefinedColors.length);
    const selectedColor = predefinedColors[randomIndex];
    predefinedColors.splice(randomIndex, 1);
    return selectedColor;
};

const generateExcel = (data, colorMap, flag) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    data.forEach((row, rowIndex) => {
        const excelRow = worksheet.addRow(row);

        // Skip coloring for the first two rows if flag is true
        if (flag && rowIndex < 2) return;

        excelRow.eachCell({ includeEmpty: true }, (cell) => {
            const cellValue = cell.value?.toString().trim();

            // Check if the cell contains the word "Day"
            if (cellValue && !cellValue.includes('Day')) {
                Object.keys(colorMap).forEach((term) => {
                    if (cellValue.includes(term)) {
                        // Apply fill color
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: colorMap[term] },
                        };
                        
                        // Apply border style
                        cell.border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } }, // Black
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } },
                        };
                    }
                });
            }
        });
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, 'task.xlsx');
    });
};


export function processCSVAndGenerateExcel(csvString, flag) {
    const predefinedColors = [
        'FF6347', // Tomato Red
        'FF69B4', // Hot Pink
        '1E90FF', // Dodger Blue
        '8A2BE2', // Blue Violet
        'FFD700', // Gold
        '7FFFD4', // Aquamarine
        'FF4500', // Orange Red
        '32CD32', // Lime Green
        'FF8C00', // Dark Orange
        '00CED1', // Dark Turquoise
        'ADFF2F', // Green Yellow
        'FFB6C1', // Light Pink
        '00FA9A', // Medium Spring Green
        'FF7F50', // Coral
        '6A5ACD', // Slate Blue
        'DC143C', // Crimson
        '00BFFF', // Deep Sky Blue
        'FF1493', // Deep Pink
        '7B68EE', // Medium Slate Blue
        '40E0D0', // Turquoise
        'FFA07A', // Light Salmon
        '20B2AA', // Light Sea Green
        '9370DB', // Medium Purple
        '87CEFA', // Light Sky Blue
        'FF00FF', // Magenta
        '66CDAA', // Medium Aquamarine
        '4682B4', // Steel Blue
        'C71585', // Medium Violet Red
        '32CD32', // Lime Green
        'BA55D3', // Medium Orchid
        'B22222', // Firebrick
        'FF4500', // Orange Red
        'FF6347', // Tomato
        '8B008B', // Dark Magenta
        '3CB371', // Medium Sea Green
        'FFDAB9', // Peach Puff
        'FFA500', // Orange
    ];
    
    const colorMap = {};

    const parsedData = Papa.parse(csvString, { header: false, skipEmptyLines: true }).data;

    parsedData.forEach(row => {
        row.forEach(cellValue => {
            const term = cellValue?.toString().trim();
            if (term && !colorMap[term]) {
                const color = generateRandomColor(predefinedColors);
                colorMap[term] = color;
            }
        });
    });

    generateExcel(parsedData, colorMap, flag);
}
