const router = require("express").Router();
const Transaction = require("../models/Transaction");
const requireAuth = require("../middleware/auth");

// GET /api/stats/dashboard
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tüm sorgular paralel çalışır
    const [monthTxs, dailyAgg, catAgg, recentTxs] = await Promise.all([
      // Bu ayın tüm işlemleri (KPI için)
      Transaction.find({ userId, date: { $gte: startOfMonth } }).lean(),

      // Son 30 gün günlük toplam
      Transaction.aggregate([
        { $match: { userId, date: { $gte: thirtyDaysAgo } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        }},
        { $sort: { _id: 1 } },
      ]),

      // Bu ay kategori dağılımı
      Transaction.aggregate([
        { $match: { userId, date: { $gte: startOfMonth } } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),

      // Son 5 işlem
      Transaction.find({ userId }).sort({ date: -1 }).limit(5).lean(),
    ]);

    const totalSpent = monthTxs.reduce((s, t) => s + t.amount, 0);
    const txCount    = monthTxs.length;
    const avgTx      = txCount ? Math.round(totalSpent / txCount) : 0;
    const topCat     = catAgg[0]?._id || "other";

    // Günlük trend: son 30 gün için boşları sıfır ile doldur
    const dailyMap = {};
    dailyAgg.forEach(d => { dailyMap[d._id] = d.total; });
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyTrend.push({ date: key, amount: (dailyMap[key] || 0) / 100 }); // kuruş → TL
    }

    // Kategori yüzdeleri
    const catTotal = catAgg.reduce((s, c) => s + c.total, 0) || 1;
    const categoryBreakdown = catAgg.map(c => ({
      category: c._id,
      total: c.total / 100, // TL
      pct: Math.round((c.total / catTotal) * 100),
    }));

    res.json({
      kpi: {
        totalSpent: totalSpent / 100,
        txCount,
        avgTx: avgTx / 100,
        topCategory: topCat,
      },
      dailyTrend,
      categoryBreakdown,
      recentTransactions: recentTxs.map(t => ({
        ...t,
        amount: t.amount / 100,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

module.exports = router;
