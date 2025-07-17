const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { query } = req.query;
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!unsplashAccessKey) {
        return res.status(500).json({ error: 'Unsplash Access Key is not configured.' });
    }

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${unsplashAccessKey}`);
        const data = await response.json();

        if (data.urls && data.urls.regular) {
            res.status(200).json({ imageUrl: data.urls.regular });
        } else {
            res.status(404).json({ error: 'No image found for the given query.' });
        }
    } catch (error) {
        console.error('Error fetching from Unsplash:', error);
        res.status(500).json({ error: 'Failed to fetch image from Unsplash.' });
    }
};
