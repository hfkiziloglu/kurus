# Geliştirici Notları

Projeyle ilgili ekip içi notlar. Projeye uzun süre sonra baktığımızda ya da başka biri incelediğinde işe yarasın diye yazdık.

---

## Ortam Değişkenleri

### Backend (`backend/.env`)

```
MONGO_URI=       # MongoDB Atlas bağlantı adresi (Furkan'dan al)
JWT_SECRET=      # Rastgele bir string, değiştirme
GEMINI_API_KEY=  # Google AI Studio'dan alındı
PORT=5000
CLIENT_URL=http://localhost:5173
```

Deploy için CLIENT_URL'i Vercel adresiyle değiştirmek gerekiyor.

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

Deploy sonrası Render'daki backend adresiyle güncellenmeli.

---

## API Endpoint'leri

Tüm endpointler `/api` önekiyle başlıyor.

**Auth**
- `POST /auth/register` — kayıt (name, email, password)
- `POST /auth/login` — giriş, JWT döner
- `POST /auth/logout` — logout (frontend token'ı siliyor zaten)
- `GET /auth/me` — giriş yapmış kullanıcı bilgisi

**İşlemler**
- `GET /transactions` — liste, sayfalama: `?page=1&limit=20`
- `POST /transactions` — yeni işlem ekle (AI kategorize ediyor)
- `DELETE /transactions/:id` — sil

**Dashboard**
- `GET /stats/dashboard` — KPI'lar + 30 günlük trend + kategori dağılımı + son 5 işlem

**AI**
- `POST /ai/categorize` — merchant + description gönder, kategori + güven yüzdesi döner

Auth gerektiren endpointler: `/transactions`, `/stats`, `/ai`. Header'da `Authorization: Bearer <token>` olmak zorunda.

---

## Gemini Entegrasyonu

`backend/services/gemini.js` — Gemini SDK'sını sarmalayan tek fonksiyon var, `categorize(merchant, description)`.

7 kategori arasından birini seçiyor: Yeme & İçme, Market & Alışveriş, Ulaşım, Eğlence, Sağlık, Faturalar & Abonelikler, Diğer. JSON olarak kategori ve güven yüzdesi (0-100) döndürüyor.

Güven yüzdesi düşükse (< 60) kullanıcıya "AI emin olamadı" chip'i gösteriliyor.

---

## Veri Modelleri

**User:** name, email, passwordHash, role (user/admin), timestamps

**Transaction:** userId, merchant, description, amount (kuruş cinsinden — 100₺ = 10000), category, categorySource (ai/user), aiConfidence, date, note

Amount'u kuruşta sakladık çünkü floating point sorunlardan kaçınmak istedik. Frontend'de gösterirken 100'e bölüyoruz.

---

## Tasarım Sistemi

Renk değişkenleri `frontend/src/index.css`'te. Ana değişkenler:

- `--ink-0` (#0a0908): arka plan
- `--paper` (#ece6d6): ana metin rengi (krem)
- `--acid` (#B8FF5C): vurgu rengi (yeşil)
- `--ai` (#C9A0FF): AI özelliklerine özgü mor
- `--coral` (#FF6B35): hata / negatif

Tipografi: başlıklarda Instrument Serif (italik), gövde metninde Inter Tight, sayı ve etiketlerde JetBrains Mono.

---

## Deploy Notları

Frontend → Vercel, Backend → Render, Veritabanı → MongoDB Atlas free tier

Render'da ücretsiz plan 15 dakika uyku moduna giriyor. İlk istek yavaş gelir, normal bu.

`frontend/package.json`'da build scripti zaten var (`vite build`). Vercel otomatik algılıyor.

Backend için Render'da `npm start` komutu kullanılıyor (`node server.js`).

---

## Yapılmadı Bırakılanlar

Aşağıdakileri eklemek istedik ama zamanımız yetmedi ya da ödev için gerekli değildi:

- **Bütçe sayfası** — sidebar'da linki var ama içerik henüz "yakında" yazıyor
- **AI sohbet asistanı** — aynı şekilde, link çalışıyor ama sayfa boş
- **Şifre sıfırlama** — eposta gönderimi gerektirir, şimdilik yok
- **Dil seçeneği (TR/EN)** — tasarımda vardı, uygulamada sadece Türkçe
- **Refresh token** — 7 günlük access token kullandık, yeterli

---

## Sık Karşılaşılan Sorunlar

**MongoDB bağlantı hatası:** `querySrv ETIMEOUT` alıyorsanız Atlas'ta IP whitelist ayarını kontrol edin. `0.0.0.0/0` eklerseniz her IP'den erişilir (geliştirme için tamam).

**Gemini 429 hatası:** API kotası dolmuş demek. Birkaç dakika bekleyince geçiyor.

**CORS hatası:** Backend `.env`'deki `CLIENT_URL`'in frontend adresiyle tam eşleştiğinden emin olun (sonda `/` olmadan).
