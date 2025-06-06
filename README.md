# ⛵ Unlighthouse CI | 🛡️ Dastardly - Automated Website Accessibility, Performance & Security Scanner

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bugnificent/unlighthouse-ci/unlighthouse.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/e8580d81-450f-431a-adf1-9eef8a8c904b/deploy-status)](https://app.netlify.com/sites/bugnificent/deploys)

Automated website scanning using Unlighthouse and Dastardly to check accessibility, performance, and security metrics, with static report generation and Netlify deployment. Jenkins support for Lighthouse accessibility audits is also included.
## ✨ Features

- 🔍 Comprehensive website scanning with Unlighthouse
- 📊 Static HTML report generation
- 🚀 Automatic deployment to Netlify
- ⚡ Performance metrics (Lighthouse scores)
- ♿ Accessibility auditing
- 🔐 DAST scanning with Dastardly by PortSwigger
- 🧪 Lighthouse auditing via Jenkins
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
   - ![LeeroyGIF](https://github.com/user-attachments/assets/6c4c6ddb-d1a7-4d43-a05c-be8d4e97119e)

### And of course, Jenkins. (optional for advanced reporting)

## 🛠️ GitHub Actions CI/CD

This project includes a preconfigured GitHub Actions workflow to run Unlighthouse and Dastardly together, and deploy the reports to Netlify automatically.

## Unlighthouse Configuration (`unlighthouse.config.ts`) Explanation

## 👀 Overview
This configuration file customizes how Unlighthouse (a Lighthouse scanner) interacts with your website during analysis.

## Configuration Breakdown
```typescript

import { defineConfig } from '@unlighthouse/core'

export default defineConfig({
  site: 'https://yusufasik.com',
  scanner: {
    // Increase max routes if needed
    maxRoutes: 50,
  },
  puppeteerPageSetup: async (page) => {
    // Enable console logging from browser context
    page.on('console', msg => console.log('[Browser]', msg.text()));

    console.log('[Node] Starting page analysis...');
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1440, height: 900 });

    // Start network idle monitoring
    await page.evaluate(() => {
      window.__unlighthouseScrollState = {
        networkRequests: 0,
        networkIdle: false
      };
      PerformanceObserver.setResourceTimingBufferSize(500);
    });

    // Initial screenshot for debugging (disable in production)
    await page.screenshot({ path: 'unlighthouse-scroll-start.png' });

    // Main scroll handler with enhanced waiting
    await page.evaluate(async () => {
      console.log('[Browser] Starting scroll simulation');
      
      const scrollConfig = {
        distance: 100,       // pixels per scroll
        delay: 200,          // base delay after scroll (ms)
        maxWait: 3000,       // maximum wait time for network idle (ms)
        threshold: 0.1       // height threshold to consider page fully scrolled
      };

      let totalHeight = 0;
      const scrollHeight = document.body.scrollHeight;
      let lastPosition = 0;
      let unchangedCount = 0;

      while (totalHeight < scrollHeight * (1 - scrollConfig.threshold)) {
        const beforeScroll = window.scrollY;
        window.scrollBy(0, scrollConfig.distance);
        totalHeight += scrollConfig.distance;
        
        // Adaptive waiting - longer if page is still loading
        await new Promise(resolve => {
          const checkStability = async () => {
            const currentPosition = window.scrollY;
            const isStable = (currentPosition === lastPosition);
            
            lastPosition = currentPosition;
            
            if (isStable) {
              unchangedCount++;
              if (unchangedCount > 2) {
                console.log(`[Browser] Detected stable position at ${currentPosition}px`);
                return resolve();
              }
            } else {
              unchangedCount = 0;
            }

            // Base delay + extra time if network is busy
            const delay = scrollConfig.delay + 
              (window.__unlighthouseScrollState?.networkIdle ? 0 : 100);
            
            setTimeout(checkStability, delay);
          };
          
          checkStability();
        });
      }
      
      console.log(`[Browser] Reached scroll end (${totalHeight}px)`);
    });

    // Final screenshot (disable in production)
    await page.screenshot({ path: 'unlighthouse-scroll-end.png' });
    
    console.log('[Node] Page analysis completed');
  },
})
```

### 📂 `.github/workflows/unlighthouse.yml`
```yaml
name: Unlighthouse CI Report

on:
  workflow_dispatch:

jobs:
  UnlighthouseCI:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Dependencies
        run: npm install -g @unlighthouse/cli puppeteer netlify-cli

      - name: Unlighthouse assertions and client
        run: unlighthouse-ci --site yusufasik.com --debug --build-static --throttle --no-cache --samples 3

      - name: Deploy
        uses: netlify/actions/cli@master
        with:
         args: deploy --dir=.unlighthouse --prod --message="New Release Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 📂 `.github/workflows/dastardly.yml`
```yaml
name: Dastardly Report

on:
  workflow_dispatch:
  pull_request:
    branches:
      - main

permissions:
  contents: read
  checks: write
  id-token: write

jobs:
  dastardly:
    name: Dastardly Scan
    runs-on: ubuntu-latest
    env:
      SITE_URL: https://yusufasik.com
    steps:
      - uses: actions/checkout@v4
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
```

## 🤖 Jenkins Integration (Optional)

If you are using Jenkins, the following pipeline allows you to generate, publish, and archive Lighthouse accessibility reports:

### 📂 `Jenkinsfile`
```groovy
pipeline {
     agent any

     environment {
       BUILD_NUM ="${BUILD_NUMBER}"
       SITE = 'yusufasik.com'
     }

     stages {

           stage('Generate Lighthouse Accessibility Report') {
              steps {
              // Generate Lighthouse Report
               sh 'npx lighthouse ${env.SITE} --output=html --output-path=lighthouse-accessibility-report-${BUILD_NUMBER}.html --chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"'
              }
         }

           stage('Publish Lighthouse Accessibility Report') {
                steps {
                        publishHTML(target: [
                          allowMissing: false,
                          alwaysLinkToLastBuild: true,
                          keepAll: true,
                          reportDir: '.',
                          reportFiles: 'lighthouse-accessibility-report-${BUILD_NUMBER}.html',
                          reportName: 'Accessibility Report Build #${BUILD_NUMBER}'
                        ])
                }
         }

           stage('Archive Reports') {
            steps {
                // Lighthouse copy for zip
                sh 'zip -r lighthouse-report-${BUILD_NUMBER}.zip lighthouse-accessibility-report-${BUILD_NUMBER}.html'

                archiveArtifacts artifacts: 'lighthouse-report-${BUILD_NUMBER}.zip', allowEmptyArchive: false, onlyIfSuccessful: true
            }
        }
    }
       post {
         always {

             emailext (
                 to: 'contact@yusufasik.com',
                 subject: "Jenkins Build ${currentBuild.currentResult}: Job ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                 body: '${DEFAULT_CONTENT}',
                 attachLog: true,
                 attachmentsPattern: 'lighthouse-report-${BUILD_NUMBER}.zip'
             )
         }
     }
}
```

## 📤 Output

- 🧾 Static site with performance and accessibility reports in `.unlighthouse/`
- 🧪 DAST results stored as `dastardly-report.xml`
- 🗂️ Lighthouse accessibility reports published via Jenkins HTML Publisher plugin and sended via email extension.
- 🌍 Automatically deployed to: [https://netlify.accessibility.yusufasik.com](https://netlify.accessibility.yusufasik.com)

## 📚 License

This project is licensed under the [MIT License](LICENSE).

---

🤝 Feel free to contribute or open issues for enhancements!
