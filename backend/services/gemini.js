const { GoogleGenerativeAI } = require("@google/generative-ai");

const CATEGORIES = ["food", "transport", "shopping", "bills", "entertain", "health", "other"];
const CAT_TR = {
  food: "Market & Yemek",
  transport: "Ulaşım",
  shopping: "Alışveriş",
  bills: "Faturalar",
  entertain: "Eğlence",
  health: "Sağlık",
  other: "Diğer",
};

async function categorize(merchant, description) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Sen bir kişisel finans asistanısın. Aşağıdaki harcamayı verilen 7 kategoriden birine ata.

Kategoriler: ${CATEGORIES.join(", ")}

Harcama:
- İşyeri/Merchant: ${merchant}
- Açıklama: ${description || "(yok)"}

Sadece JSON formatında yanıt ver, başka hiçbir şey yazma:
{"category": "<kategori_id>", "confidence": <0.0-1.0 arası sayı>}

Örnekler:
- Migros → {"category": "food", "confidence": 0.97}
- Taksi → {"category": "transport", "confidence": 0.95}
- Netflix → {"category": "bills", "confidence": 0.98}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // JSON bloğu içinden çıkar
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini geçersiz yanıt döndürdü.");

  const parsed = JSON.parse(jsonMatch[0]);
  const category = CATEGORIES.includes(parsed.category) ? parsed.category : "other";
  const confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5));

  return { category, confidence };
}

module.exports = { categorize };
