# Unlighthouse CI - Automated Website Accessibility & Performance Scanner

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/bugnificent/unlighthouse-ci/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/e8580d81-450f-431a-adf1-9eef8a8c904b/deploy-status)](https://app.netlify.com/sites/bugnificent/deploys)

Automated website scanning using Unlighthouse to check accessibility and performance metrics, with static report generation and Netlify deployment.

## Features

- 🔍 Comprehensive website scanning with Unlighthouse
- 📊 Static HTML report generation
- 🚀 Automatic deployment to Netlify
- ⚡ Performance metrics (Lighthouse scores)
- ♿ Accessibility auditing
- 🔄 CI/CD integration via GitHub Actions

## Prerequisites

- Node.js (v14+)
- Netlify account
- GitHub repository

## Setup

1. **Install dependencies**:
   ```bash
   npm install -g @unlighthouse/cli puppeteer netlify-cli
   ```
   
