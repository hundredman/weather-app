# 🔮 Crystal Cast: A Weather Web App

![Crystal Cast App Screenshot](screenshots/app-screenshot.png)

## 💡 Introduction

**Crystal Cast** is a weather web app built with pure HTML, CSS, and JavaScript. It features a Glassmorphism design and dynamically changing backgrounds and icons based on the weather.

## ✨ Features

*   **Current Weather**: Real-time temperature, description, and icon for your current location or a searched city.
*   **Hourly Forecast**: 24-hour forecast with temperature, weather icons, and a precipitation probability chart.
*   **Weekly Forecast**: Weekly overview with max/min temperatures and weather icons.
*   **Location Search**: Search for weather in any city worldwide.
*   **Geolocation**: Automatically displays weather for your current location if no city is searched.
*   **Dynamic Background**: Background image from Unsplash changes according to the weather.
*   **Reset Search**: A clear button ('X') in the search bar to reset the search and show the current location's weather.
*   **Responsive Design**: Optimized for various screen sizes.
*   **Loading Spinner**: Indicates when data is being fetched.
*   **Fast Image Loading**: Optimized background image loading for a better user experience.

## 🛠️ Tech Stack

*   **HTML5**: For the structure of the web page.
*   **CSS3**: For styling, responsiveness, and animations.
*   **JavaScript (ES6+)**: For dynamic functionality.
*   **Feather Icons**: For clean and simple SVG icons.
*   **Open-Meteo API**: For weather data.
*   **Nominatim OpenStreetMap API**: For geocoding location names.
*   **Unsplash API**: For background images.
*   **Google Fonts**: For the Poppins font.

## 🚀 Getting Started

Follow these steps to run this project on your local machine.

### **Prerequisites**

1.  A modern web browser.
2.  An Unsplash Access Key from the [Unsplash Developers](https://unsplash.com/developers) site.

### **Installation and Setup**

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```
    (Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.)

2.  **Set up the API Key**:
    Create a `config.js` file in the project root and add your Unsplash Access Key as follows:
    ```javascript
    // config.js
    const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
    ```
    **Important:** Replace `'YOUR_UNSPLASH_ACCESS_KEY'` with your actual key.

3.  **Run the app**:
    Simply open the `index.html` file in your web browser.

## 🔑 Securing Your API Key (for GitHub Pages Deployment)

This project uses an Unsplash API key. Here’s how to keep it secure when deploying to services like GitHub Pages.

1.  **Store the key in GitHub Secrets:**
    *   In your GitHub repository, go to `Settings` > `Secrets and variables` > `Actions` and save your Unsplash Access Key with the name `UNSPLASH_ACCESS_KEY`.

2.  **Add `config.js` to `.gitignore`:**
    *   Ensure `config.js` is not committed to your repository by adding it to `.gitignore`.
    ```
    # .gitignore
    config.js
    ```

3.  **Set up automatic deployment with GitHub Actions:**
    *   Create or update the `.github/workflows/deploy.yml` file with the following content. This workflow will create the `config.js` file using your secret key and deploy the project to GitHub Pages whenever you push to the `main` branch.

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

4.  **Configure GitHub Pages:**
    *   In your repository `Settings` > `Pages`, set the `Source` to **`GitHub Actions`**.

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
