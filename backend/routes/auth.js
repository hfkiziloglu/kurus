const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Ad, e-posta ve şifre zorunludur." });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "Geçersiz e-posta adresi." });

    if (password.length < 8)
      return res.status(400).json({ error: "Şifre en az 8 karakter olmalıdır." });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Bu e-posta zaten kayıtlı." });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "E-posta ve şifre zorunludur." });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "E-posta veya şifre hatalı." });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "E-posta veya şifre hatalı." });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// POST /api/auth/logout  (client sadece token'ı atar, sunucu ack döner)
router.post("/logout", (req, res) => {
  res.json({ message: "Çıkış başarılı." });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role });
});

module.exports = router;
