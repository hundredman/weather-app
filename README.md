# Crystal Cast - 현대적인 글래스모피즘 날씨 앱

![Crystal Cast App Screenshot - Placeholder for actual screenshot](https://via.placeholder.com/800x450?text=Crystal+Cast+App+Screenshot)

## 🌟 프로젝트 소개

**Crystal Cast**는 순수 HTML, CSS, JavaScript만을 사용하여 구현된 현대적이고 시각적으로 매력적인 날씨 웹 애플리케이션입니다. 글래스모피즘(Glassmorphism) 디자인 트렌드를 적용하여 반투명하고 깊이감 있는 사용자 인터페이스를 제공하며, 날씨에 따라 동적으로 변화하는 배경 이미지와 깔끔한 아이콘으로 사용자 경험을 극대화합니다.

## ✨ 주요 기능

*   **현재 날씨 정보:** 사용자의 현재 위치 또는 검색한 위치의 실시간 온도, 날씨 설명, 아이콘을 표시합니다.
*   **시간대별 예보:** 다음 24시간 동안의 시간별 온도, 날씨 아이콘, 강수 확률을 막대 그래프와 함께 제공합니다.
*   **주간 예보:** 다가오는 요일별 최고/최저 기온과 날씨 아이콘을 한눈에 볼 수 있도록 표시합니다.
*   **위치 검색:** 도시 이름을 입력하여 전 세계 어느 곳이든 날씨를 검색할 수 있습니다.
*   **현재 위치 자동 감지:** 검색어를 입력하지 않으면 브라우저의 Geolocation API를 사용하여 현재 위치의 날씨를 자동으로 불러옵니다.
*   **동적 배경 이미지:** 현재 날씨 상태(맑음, 비, 눈 등)에 따라 Unsplash API를 통해 관련성 높은 고품질 배경 이미지가 부드럽게 전환됩니다.
*   **검색 입력 초기화:** 검색 입력란에 텍스트가 있을 때 'X' 버튼이 나타나며, 클릭 시 입력 내용을 지우고 현재 위치 날씨를 다시 불러옵니다.
*   **반응형 디자인:** 데스크톱, 태블릿, 모바일 등 다양한 화면 크기에서 최적화된 레이아웃을 제공합니다.
*   **로딩 스피너:** 날씨 데이터를 불러오는 동안 시각적인 로딩 스피너를 표시하여 사용자에게 피드백을 제공합니다.
*   **최적화된 이미지 로딩:** Unsplash 이미지 캐싱 및 프리로딩을 통해 로딩 속도를 향상시켰습니다.

## 🛠️ 사용된 기술 스택

*   **HTML5:** 웹 페이지의 구조를 정의합니다.
*   **CSS3:** 글래스모피즘 디자인, 반응형 레이아웃, 애니메이션 등 시각적 스타일을 담당합니다.
*   **JavaScript (ES6+):** 날씨 데이터 가져오기, DOM 조작, 사용자 인터랙션 처리 등 애플리케이션의 동적인 기능을 구현합니다.
*   **Feather Icons:** 깔끔하고 미니멀한 SVG 아이콘을 제공합니다.
*   **Open-Meteo API:** 정확하고 상세한 날씨 예보 데이터를 제공합니다.
*   **Nominatim OpenStreetMap API:** 지오코딩(Geocoding)을 통해 위치 이름을 위도/경도로 변환합니다.
*   **Unsplash API:** 날씨 조건에 맞는 고품질 배경 이미지를 동적으로 제공합니다.

## 🚀 시작하기

이 프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요.

### **사전 준비**

1.  **웹 브라우저:** 최신 버전의 웹 브라우저 (Chrome, Firefox, Edge 등)
2.  **Unsplash Access Key:** Unsplash 개발자 계정을 생성하고 [Unsplash API](https://unsplash.com/developers)에서 Access Key를 발급받아야 합니다.

### **설치 및 실행**

1.  **저장소 클론:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```
    (위 `YOUR_USERNAME`과 `YOUR_REPOSITORY_NAME`을 실제 GitHub 사용자명과 저장소 이름으로 변경하세요.)

2.  **API 키 설정:**
    프로젝트 루트 디렉토리에 `config.js` 파일을 생성하고 발급받은 Unsplash Access Key를 다음과 같이 추가합니다.
    ```javascript
    // config.js
    const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY_HERE';
    ```
    **주의:** `YOUR_UNSPLASH_ACCESS_KEY_HERE`를 실제 발급받은 키로 교체하세요.

3.  **로컬에서 실행:**
    `index.html` 파일을 웹 브라우저에서 직접 열면 애플리케이션이 실행됩니다.

## 🔑 API 키 보안 (GitHub Pages 배포 시)

이 프로젝트는 클라이언트 측 JavaScript에서 Unsplash API 키를 사용합니다. GitHub Pages와 같은 정적 호스팅 환경에서 API 키를 안전하게 관리하는 방법은 다음과 같습니다.

1.  **Unsplash API 키 도메인 제한 설정 (필수):**
    *   Unsplash 개발자 대시보드에서 발급받은 Access Key의 사용 도메인을 `https://<당신의-GitHub-사용자명>.github.io` 또는 당신의 커스텀 도메인으로 제한하세요. 이는 키가 노출되더라도 다른 웹사이트에서 무단으로 사용되는 것을 방지합니다.

2.  **GitHub Secrets에 API 키 저장:**
    *   GitHub 저장소의 `Settings` > `Secrets and variables` > `Actions`로 이동하여 `UNSPLASH_ACCESS_KEY`라는 이름으로 당신의 Unsplash Access Key를 저장합니다.

3.  **`.gitignore`에 `config.js` 추가:**
    *   `config.js` 파일이 Git 저장소에 직접 커밋되지 않도록 `.gitignore` 파일에 `config.js`를 추가합니다.
    ```
    # .gitignore
    config.js
    ```

4.  **GitHub Actions 워크플로우를 통한 배포:**
    *   프로젝트 루트에 `.github/workflows/deploy.yml` 파일을 생성하고 다음 내용을 추가합니다. 이 워크플로우는 `main` 브랜치에 푸시될 때마다 실행되어, GitHub Secrets에서 API 키를 가져와 `config.js` 파일을 동적으로 생성한 후 GitHub Pages로 배포합니다.

    ```yaml
    # .github/workflows/deploy.yml
    name: Deploy to GitHub Pages

    on:
      push:
        branches:
          - main # main 브랜치에 푸시될 때마다 워크플로우 실행

    jobs:
      build-and-deploy:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code
          uses: actions/checkout@v4

        - name: Create config.js with API Key
          run: |
            echo "const UNSPLASH_ACCESS_KEY = '${{ secrets.UNSPLASH_ACCESS_KEY }}';" > config.js
          env:
            UNSPLASH_ACCESS_KEY: ${{ secrets.UNSPLASH_ACCESS_KEY }}

        - name: Setup Pages
          uses: actions/configure-pages@v4

        - name: Upload artifact
          uses: actions/upload-pages-artifact@v3
          with:
            path: './' # 프로젝트의 모든 파일을 아티팩트로 업로드

        - name: Deploy to GitHub Pages
          id: deployment
          uses: actions/deploy-pages@v4
    ```

5.  **GitHub Pages 설정:**
    *   GitHub 저장소의 `Settings` > `Pages`로 이동하여, `Source`를 `Deploy from a branch`로 설정하고, `Branch`를 `gh-pages` (또는 `main` 브랜치에서 직접 배포하는 경우 `main`)로 설정합니다.
    *   워크플로우가 성공적으로 실행되면, GitHub Pages URL을 통해 앱에 접속할 수 있습니다.

## 🤝 기여하기

이 프로젝트는 오픈 소스이며, 여러분의 기여를 환영합니다! 버그 보고, 기능 제안 또는 코드 개선에 참여하고 싶다면 다음 단계를 따르세요.

1.  저장소를 포크(Fork)합니다.
2.  새로운 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`).
3.  변경 사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`).
4.  브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`).
5.  풀 리퀘스트(Pull Request)를 생성합니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사드립니다

*   [Open-Meteo](https://open-meteo.com/) - 날씨 데이터 제공
*   [Nominatim OpenStreetMap](https://nominatim.openstreetmap.org/) - 지오코딩 서비스 제공
*   [Unsplash](https://unsplash.com/) - 아름다운 배경 이미지 제공
*   [Feather Icons](https://feathericons.com/) - 깔끔한 아이콘 제공
*   [Google Fonts](https://fonts.google.com/) - Poppins 폰트 제공
