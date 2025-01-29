require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { LanguageServiceClient } = require("@google-cloud/language");
const serviceAccountKey = require("./service-account-key.json");

const app = express();
const languageClient = new LanguageServiceClient({
  credentials: serviceAccountKey,
});

app.use(cors());
app.use(bodyParser.json());

// Sentiment Analysis API Endpoint
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  if (text.length > 500) {
    return res.status(400).json({ error: "Text input is too long" });
  }

  try {
    const document = {
      content: text,
      type: "PLAIN_TEXT",
    };

    const [result] = await languageClient.analyzeSentiment({ document });

    const sentiment = result.documentSentiment;

    let sentimentLabel = "Neutral";
    if (sentiment.score > 0.25) {
      sentimentLabel = "Positive";
    } else if (sentiment.score < -0.25) {
      sentimentLabel = "Negative";
    }

    res.json({
      sentiment: sentimentLabel,
      score: sentiment.score.toFixed(2),
      magnitude: sentiment.magnitude.toFixed(2),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Sentiment analysis failed" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
