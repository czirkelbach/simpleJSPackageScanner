/**
 * Script to check if packages from a CSV file exist in package.json dependencies.
 * Supports both dependencies and devDependencies.
 *
 * Usage:
 *   node check-packages.js packages.csv package.json
 */

const fs = require("fs");
const path = require("path");

// Helper: Read and parse CSV into an array of package names
function readCSV(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return data
            .split(/\r?\n/) // split by line
            .map(line => line.trim())
            .filter(line => line.length > 0); // remove empty lines
    } catch (err) {
        console.error(`❌ Error reading CSV file: ${err.message}`);
        process.exit(1);
    }
}

// Helper: Read and parse package.json
function readPackageJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ Error reading package.json: ${err.message}`);
        process.exit(1);
    }
}

// Main function
function checkPackages(csvPath, packageJsonPath) {
    const csvPackages = readCSV(csvPath);
    const pkgJson = readPackageJson(packageJsonPath);

    const dependencies = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies,
        ...pkgJson.peerDependencies,
        ...pkgJson.optionalDependencies
    };

    const missing = [];
    const found = [];

    csvPackages.forEach(pkg => {
        if (dependencies.hasOwnProperty(pkg)) {
            found.push(pkg);
        } else {
            missing.push(pkg);
        }
    });

    console.log("✅ Found related packages:", found.length ? found.join(", ") : "None");
    //console.log("❌ Missing (unrelated) packages:", missing.length ? missing.join(", ") : "None");

    // Exit with non-zero code if any missing
    if (missing.length > 0) {
        process.exitCode = 1;
    }
}

// CLI argument handling
if (process.argv.length < 4) {
    console.error("Usage: node check-packages.js <packages.csv> <package.json>");
    process.exit(1);
}

const csvPath = path.resolve(process.argv[2]);
const packageJsonPath = path.resolve(process.argv[3]);

checkPackages(csvPath, packageJsonPath);