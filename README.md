# Unlighthouse CI - Automated Website Accessibility, Performance & Security Scanner

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bugnificent/unlighthouse-ci/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/e8580d81-450f-431a-adf1-9eef8a8c904b/deploy-status)](https://app.netlify.com/sites/bugnificent/deploys)

Automated website scanning using Unlighthouse and Dastardly to check accessibility, performance, and security metrics, with static report generation and Netlify deployment.

## ✨ Features

- 🔍 Comprehensive website scanning with Unlighthouse
- 📊 Static HTML report generation
- 🚀 Automatic deployment to Netlify
- ⚡ Performance metrics (Lighthouse scores)
- ♿ Accessibility auditing
- 🔐 DAST scanning with Dastardly by PortSwigger
- 🔄 CI/CD integration via GitHub Actions

## 🔧 Prerequisites

- 🟢 Node.js (v14+)
- 🌐 Netlify account
- 📁 GitHub repository

## ⚙️ Setup

1. **Install dependencies**:
   ```bash
   npm install -g @unlighthouse/cli puppeteer netlify-cli
   ```

2. **Run Unlighthouse manually (optional for testing)**:
   ```bash
   unlighthouse-ci --site yusufasik.com --debug --build-static --throttle --no-cache --samples 3
   ```

   ### 🏷️ CLI Flag Explanations
   - 🐞 `--debug`: Enables verbose logging for easier troubleshooting and visibility during development.
   - 🏗️ `--build-static`: Generates a static HTML report in the `.unlighthouse/` directory.
   - 🐢 `--throttle`: Simulates slower network/CPU to mimic real-world conditions.
   - 🧹 `--no-cache`: Forces a fresh scan by skipping cache usage.
   - 🔁 `--samples 3`: Runs 3 scans and averages the results for consistent metrics.

3. **🔌 Connect Netlify**:
   - 🆕 Create a new site on Netlify
   - 🔐 Obtain your `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`
   - 🔒 Store them in your GitHub repository under `Settings > Secrets and variables > Actions`

## 🛠️ GitHub Actions CI/CD

This project includes a preconfigured GitHub Actions workflow to run Unlighthouse and Dastardly together, and deploy the reports to Netlify automatically.

### 📂 `.github/workflows/ci-cd.yml`
```yaml
name: Unlighthouse and Dastardly

on:
  workflow_dispatch:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read
  checks: write
  id-token: write

jobs:
  demo:
    runs-on: ubuntu-latest
    env:
     SITE_URL: yusufasik.com
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Dependencies
        run: npm install -g @unlighthouse/cli puppeteer netlify-cli

      - name: Unlighthouse Scan
        run: unlighthouse-ci --site ${{ env.SITE_URL }} --debug --build-static --throttle --no-cache --samples 3

      - name: Dastardly Scan
        continue-on-error: true
        uses: PortSwigger/dastardly-github-action@main
        with:
          target-url: ${{ env.SITE_URL }}
          output-filename: dastardly-report.xml

      - name: Upload security scan results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: dastardly-reports
          path: dastardly-report.xml

      - name: Deploy
        uses: netlify/actions/cli@master
        with:
         args: deploy --dir=.unlighthouse --prod --message="New Release Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📤 Output

- 🧾 Static site with performance and accessibility reports in `.unlighthouse/`
- 🛡️ DAST results stored as artifact `dastardly-report.xml`
- 🌍 Automatically deployed to: [https://netlify.accessibility.yusufasik.com](https://netlify.accessibility.yusufasik.com)

## 📚 License

This project is licensed under the [MIT License](LICENSE).

---

🤝 Feel free to contribute or open issues for enhancements!


