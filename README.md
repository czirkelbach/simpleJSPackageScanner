# Simple JS Package Scanner

A Node.js script to check if packages listed in a CSV file exist in your project's `package.json` dependencies or devDependencies.

## Features

- Checks both `dependencies` and `devDependencies` in `package.json`
- Handles empty lines in the CSV file
- Exits with status code 1 if any packages are missing (useful for CI/CD)
- Clear output for found and missing packages
- Cross-platform support

## Use Case
Check if project uses impacted packages by 
as reported at [Wiz](https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack) in November 2025 with related [packages](https://github.com/wiz-sec-public/wiz-research-iocs/blob/main/reports/shai-hulud-2-packages.csv)

## Usage

21. **Prepare your files:**
   - `packages.csv` — one package name per line, e.g.:
     ```
     express
     lodash
     typescript
     ```
   - `package.json` — your project's package file.

2. **Run the script:**
   ```bash
   node checkPackages.js packages.csv package.json