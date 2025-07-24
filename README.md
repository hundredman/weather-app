# 🔮 Crystal Cast: A Weather Web App

![Crystal Cast App Screenshot](screenshots/app-screenshot.png)

## 💡 Introduction

**Crystal Cast** is a weather web app built with pure HTML, CSS, and JavaScript. It features a Glassmorphism design and dynamically changing backgrounds and icons based on the weather.

## ✨ Features

- **Current & Forecast**: Real-time weather, plus 24-hour and 7-day forecasts.
- **Global Search**: Look up weather for any city worldwide.
- **Geolocation**: Automatically shows weather for your current location.
- **Dynamic Design**: Background and icons change based on the weather.
- **Search History**: Quickly access your past 4 searches.
- **Responsive**: Fully optimized for both desktop and mobile viewing.

## 🛠️ Tech Stack

- **Core**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**:
  - [Open-Meteo](https://open-meteo.com/) (Weather Data)
  - [Nominatim](https://nominatim.openstreetmap.org/) (Geocoding)
  - [Unsplash](https://unsplash.com/) (Background Images)
- **Assets**:
  - [Feather Icons](https://feathericons.com/)
  - [Google Fonts](https://fonts.google.com/)

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```

2.  **Set up API Key:**
    Get an Unsplash Access Key from the [Unsplash Developers](https://unsplash.com/developers) site. Then, create a `config.js` file in the project root and add your key like this:
    ```javascript
    // config.js
    const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
    ```

3.  **Run the App:**
    Open the `index.html` file in your web browser.

## 🚀 Deploying to GitHub Pages

This project is ready for automatic deployment to GitHub Pages.

1.  **Add API Key to Secrets**: In your GitHub repository, go to `Settings` > `Secrets and variables` > `Actions`. Create a new secret named `UNSPLASH_ACCESS_KEY` and paste your Unsplash key.
2.  **Configure Pages Source**: In `Settings` > `Pages`, set the deployment `Source` to **`GitHub Actions`**.

That's it! Now, every time you push to the `main` branch, your project will be automatically deployed.

<details>
<summary>View Deployment Workflow (`deploy.yml`)</summary>

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main # Trigger the workflow on push to the main branch

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Create config.js with API Key
      run: |
        echo "const UNSPLASH_ACCESS_KEY = '${{ secrets.UNSPLASH_ACCESS_KEY }}';" > config.js
      env:
        UNSPLASH_ACCESS_KEY: ${{ secrets.UNSPLASH_ACCESS_KEY }}

    - name: Prepare distribution
      run: |
        mkdir dist
        cp index.html dist/
        cp main.js dist/
        cp style.css dist/
        cp config.js dist/
        cp favicon.svg dist/
        cp LICENSE dist/ 2>/dev/null || true
        cp README.md dist/ 2>/dev/null || true
        cp -r screenshots dist/ 2>/dev/null || true

    - name: Setup Pages
      uses: actions/configure-pages@v4

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: './dist' # Upload the dist directory
        name: github-pages # Name the artifact

    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
      with:
        artifact_name: github-pages # Specify the artifact to deploy
```
</details>

## 🤝 Contributing

This is an open-source project. Contributions like bug reports, feature suggestions, or code improvements are welcome.

1.  Fork the repository.
2.  Create a new branch for your feature.
3.  Commit your changes.
4.  Push to your branch.
5.  Create a Pull Request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgements

*   [Open-Meteo](https://open-meteo.com/)
*   [Nominatim OpenStreetMap](https://nominatim.openstreetmap.org/)
*   [Unsplash](https://unsplash.com/)
*   [Feather Icons](https://feathericons.com/)
*   [Google Fonts](https://fonts.google.com/)
