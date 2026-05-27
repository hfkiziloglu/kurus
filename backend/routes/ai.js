const router = require("express").Router();
const requireAuth = require("../middleware/auth");
const { categorize } = require("../services/gemini");

// POST /api/ai/categorize
router.post("/categorize", requireAuth, async (req, res) => {
  try {
    const { merchant, description } = req.body;
    if (!merchant) return res.status(400).json({ error: "merchant zorunludur." });

    const result = await categorize(merchant, description || "");
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI servisi şu an kullanılamıyor." });
  }
});

module.exports = router;
