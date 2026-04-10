const fs = require('fs');

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            let val = values[index].trim();
            // Try to parse numbers
            if (!isNaN(val) && val !== '') {
                obj[header] = parseFloat(val);
            } else {
                obj[header] = val;
            }
        });
        return obj;
    });
    return data;
}

function calculateCorrelation(data, key1, key2) {
    const n = data.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    
    for (const item of data) {
        let v1 = item[key1];
        let v2 = item[key2];
        
        // Encode categorical
        if (typeof v1 === 'string') {
            if (v1 === 'Yes' || v1 === 'Male' || v1 === 'Single' || v1 === 'southeast') v1 = 1; else v1 = 0;
        }
        if (typeof v2 === 'string') {
            if (v2 === 'Yes' || v2 === 'Male' || v2 === 'Single' || v2 === 'southeast') v2 = 1; else v2 = 0;
        }

        sum1 += v1;
        sum2 += v2;
        sum1Sq += v1 * v1;
        sum2Sq += v2 * v2;
        pSum += v1 * v2;
    }
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) * (sum2Sq - Math.pow(sum2, 2) / n));
    
    return den === 0 ? 0 : num / den;
}

const content = fs.readFileSync('Medical_Insurance.csv', 'utf8');
const data = parseCSV(content);

const features = ['Age', 'Sex', 'Income', 'Exercise', 'Status', 'Children', 'Smoker', 'Region'];
console.log('--- Correlation with Medical Cost ---');
features.forEach(feat => {
    const corr = calculateCorrelation(data, feat, 'Medical Cost');
    console.log(`${feat}: ${corr.toFixed(4)}`);
});

// Simple Linear Regression (y = mx + b) for the most correlated feature
// Based on previous run, Smoker had ~0.787
const mostCorrelated = 'Smoker';
console.log(`\n--- Linear Regression (Simple) for ${mostCorrelated} ---`);

let xSum = 0, ySum = 0, xxSum = 0, xySum = 0, count = 0;
data.forEach(item => {
    let x = item[mostCorrelated] === 'Yes' ? 1 : 0;
    let y = item['Medical Cost'];
    xSum += x;
    ySum += y;
    xxSum += x * x;
    xySum += x * y;
    count++;
});

const m = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
const b = (ySum - m * xSum) / count;

console.log(`Formula: Medical Cost = ${m.toFixed(2)} * ${mostCorrelated}(Yes=1) + ${b.toFixed(2)}`);

// Calculate R-squared
let ssRes = 0, ssTot = 0;
const yAvg = ySum / count;
data.forEach(item => {
    let x = item[mostCorrelated] === 'Yes' ? 1 : 0;
    let y = item['Medical Cost'];
    const yPred = m * x + b;
    ssRes += Math.pow(y - yPred, 2);
    ssTot += Math.pow(y - yAvg, 2);
});
const r2 = 1 - (ssRes / ssTot);
console.log(`R-squared: ${r2.toFixed(4)}`);
