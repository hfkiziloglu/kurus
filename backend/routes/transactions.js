const router = require("express").Router();
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");
const { categorize } = require("../services/gemini");

// GET /api/transactions
router.get("/", requireAuth, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Transaction.find({ userId: req.user._id })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ userId: req.user._id }),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// POST /api/transactions
router.post("/", requireAuth, async (req, res) => {
  try {
    const { merchant, description, amount, category, date, note } = req.body;

    if (!merchant) return res.status(400).json({ error: "İşyeri adı zorunludur." });
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return res.status(400).json({ error: "Geçerli bir tutar giriniz." });

    let cat = category || null;
    let source = "user";
    let confidence = null;

    if (!cat) {
      try {
        const result = await categorize(merchant, description || "");
        cat = result.category;
        confidence = result.confidence;
        source = "ai";
      } catch (aiErr) {
        console.error("Gemini hatası:", aiErr.message);
        cat = "other";
      }
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      merchant,
      description: description || "",
      amount: Math.round(Number(amount) * 100), // TL → kuruş
      category: cat,
      categorySource: source,
      aiConfidence: confidence,
      date: date ? new Date(date) : new Date(),
      note: note || "",
    });

    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!tx) return res.status(404).json({ error: "İşlem bulunamadı." });
    await tx.deleteOne();
    res.json({ message: "İşlem silindi." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

module.exports = router;
