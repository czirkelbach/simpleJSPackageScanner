# Simple JS Package Scanner

A simple script to check if packages listed in a CSV file exist in your project's `package.json` dependencies, devDependencies, peerDependencies, or optionalDependencies, and to verify their versions.
Also checks additonally a passed `package-lock.json` file.

## Features

- Checks all dependency types: `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`
- Supports CSV lines in the format: `packageName,version`
- Ignores empty lines and lines starting with `#` in the CSV file (for comments)
- Verifies both package presence and version (using [semver](https://www.npmjs.com/package/semver))
- Clear output for found, version-mismatched and missing packages
- Cross-platform support

## Use Case

Check if your project uses impacted packages as reported at [Wiz](https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack) in November 2025 with related [packages](https://github.com/wiz-sec-public/wiz-research-iocs/blob/main/reports/shai-hulud-2-packages.csv).

## CSV Format

- Each line: `packageName,version`
- Example:
  ```
  express,4.18.2
  lodash,4.17.21
  # This is a comment and will be ignored
  react,18.2.0
  typescript
  ```
- Lines starting with `#` are ignored.

## Usage

1. **Prepare your files:**
   - `packages.csv` — one package name per line, optionally with a version (comma-separated).
   - `package.json` — your project's package file.
   - `package-lock.json` — your project's package lock file (optional).

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the script:**
   ```bash
   node checkPackages.js packages.csv package.json [package-lock.json]  
   ```

## Example output

```
-----------------------
🔍 Simple JS Package Scanner Report
-----------------------
✅ Related packages:
@actbase/node-server, 1.1.19 [package.json]
-----------------------
⚠️ Version mismatches:
semver, =7.7.2 (found: 7.7.3 in package-lock.json)
@actbase/react-absolute, = 0.8.3 (found: 0.8.4 in package.json)
-----------------------
❌ Missing (unrelated) packages:
02-echo, = 0.0.7
...
-----------------------
```