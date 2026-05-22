

const Review = require("../models/reviews");
const axios = require("axios");
const Home= require("../models/home");

// 🤖 Hugging Face Sentiment
async function getSentiment(text) {
    try {
        const url = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment";
        const response = await axios.post(url,
            { inputs: text },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type" : "application/json",

                },
            }
        );
        const result = response.data[0];
        let sentiment = "neutral";
        if (result[0].label === "LABEL_2") sentiment = "positive";
        if (result[0].label === "LABEL_0") sentiment = "negative";
        return sentiment;
    } catch (err) {
        console.log("API error status",err.response?.status);
        console.log("API error data",err.response?.data);
        return "neutral";
    }
}

// ✅ Create Review
// reviewController.js mein
exports.createReview = async (req, res) => {
  try {
      const { rating, comment, homeId } = req.body;
      console.log("homeid:",homeId);
      console.log("homeid:",comment);
      const finalComment = Array.isArray(comment) ? comment.join(' '):comment;
// Sentiment detect karne ke liye aapka function
console.log("finalComment",finalComment);

      const sentiment = await getSentiment(finalComment); 
      console.log("sentiment ",sentiment );
      const newReview = new Review({
          rating: rating,
          comment: finalComment,
          home: homeId,
          sentiment: sentiment,
          // ⭐ Sabse IMPORTANT line: Login user ki ID yahan se jayegi
          user: req.session.user._id 
      });
      await newReview.save();
     // 2. Us specific Home ke saare reviews fetch karein
        const allReviews = await Review.find({ home: homeId });
        
        // 3. Average Rating calculate karein
        const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageRating = (totalRating / allReviews.length).toFixed(1); // Single decimal (e.g., 4.2)

        // 4. Ab Home table mein 'avgRating' field ko update karein
        await Home.findByIdAndUpdate(homeId, { 
            rating : averageRating 
        });




      res.redirect("/bookings");
  } catch (err) {
      console.log("Error creating review:", err);
  }
};