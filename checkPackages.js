/**
 * Script to check if packages from an passed CSV list (package name, version) exist in package.json dependencies.
 * Supports dependencies, devDependencies, peerDependecies and optionalDependencies.
 *
 * Usage:
 *   node check-packages.js packages.csv package.json [package-lock.json]
 */

const fs = require("fs");
const path = require("path");
const semver = require("semver");

// Helper: Read and parse CSV into an array of {name, version}
function readCSV(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        const packages = data
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith("#")) // Ignore lines starting with #
            .map(line => {
                const [name, version] = line.split(",");
                return { name: name.trim(), version: version ? version.trim() : null };
            });
        return packages;
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

// Helper: Read and parse package-lock.json (lockfile v3 support)
function readPackageLockJson(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        const lockJson = JSON.parse(data);
        const deps = {};
        if (lockJson.packages) {
            Object.entries(lockJson.packages).forEach(([pkgPath, info]) => {
                // Only consider direct dependencies (node_modules/*)
                if (pkgPath.startsWith("node_modules/") && info.version) {
                    const name = pkgPath.replace("node_modules/", "");
                    deps[name] = info.version;
                }
            });
        }
        return deps;
    } catch (err) {
        console.error(`❌ Error reading package-lock.json: ${err.message}`);
        process.exit(1);
    }
}

// Main function
function checkPackages(csvPath, packageJsonPath, packageLockPath) {
    const csvPackages = readCSV(csvPath);
    const pkgJson = readPackageJson(packageJsonPath);

    const dependencies = {
        ...pkgJson.dependencies,
        ...pkgJson.devDependencies,
        ...pkgJson.peerDependencies,
        ...pkgJson.optionalDependencies
    };

    // If lock file is provided, use its versions for comparison
    let lockDependencies = null;
    if (packageLockPath) {
        lockDependencies = readPackageLockJson(packageLockPath);
    }

    const results = [];

    csvPackages.forEach(({ name, version }) => {
        let foundVersion = dependencies[name];
        let source = null;
        if (lockDependencies && lockDependencies[name]) {
            foundVersion = lockDependencies[name];
            source = "package-lock.json";
        } else if (foundVersion) {
            source = "package.json";
        }
        if (foundVersion) {
            if (version) {
                if (!semver.satisfies(semver.minVersion(foundVersion), version)) {
                    results.push({ status: "mismatch", name, expected: version, found: foundVersion, source });
                } else {
                    results.push({ status: "found", name, version: foundVersion, source });
                }
            } else {
                results.push({ status: "found", name, version: foundVersion, source });
            }
        } else {
            results.push({ status: "missing", name, version });
        }
    });

    console.log("-----------------------");
    console.log("🔍 Simple JS Package Scanner Report");
    console.log("-----------------------");

    // Found
    console.log("✅ Related packages:");
    const found = results.filter(r => r.status === "found");
    if (found.length) {
        found.forEach(r => console.log(`${r.name}${r.version ? `, ${r.version}` : ""} [${r.source}]`));
    } else {
        console.log("None");
    }
    console.log("-----------------------");

    // Mismatches
    console.log("⚠️ Version mismatches:");
    const mismatches = results.filter(r => r.status === "mismatch");
    if (mismatches.length) {
        mismatches.forEach(r => console.log(`${r.name}, ${r.expected} (found: ${r.found} in ${r.source})`));
    } else {
        console.log("None");
    }
    console.log("-----------------------");

    // Missing
    console.log("❌ Missing (unrelated) packages:");
    const missing = results.filter(r => r.status === "missing");
    if (missing.length) {
        missing.forEach(r => console.log(`${r.name}${r.version ? `, ${r.version}` : ""}`));
    } else {
        console.log("None");
    }
    console.log("-----------------------");
}

// CLI argument handling
if (process.argv.length < 4) {
    console.error("Usage: node check-packages.js <packages.csv> <package.json> [package-lock.json]");
    process.exit(1);
}

const csvPath = path.resolve(process.argv[2]);
const packageJsonPath = path.resolve(process.argv[3]);
const packageLockPath = process.argv[4] ? path.resolve(process.argv[4]) : null;

checkPackages(csvPath, packageJsonPath, packageLockPath);