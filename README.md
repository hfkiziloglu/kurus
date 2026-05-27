# Kuruş — Kişisel Harcama Takip Uygulaması

YMH354 Web Tasarım ve Programlama dersi final projesi. Kullanıcıların günlük harcamalarını kayıt altına alabildiği, yapay zekanın harcamaları otomatik olarak kategorilere ayırdığı ve dashboard üzerinden harcama trendlerini görebildiği bir web uygulaması.

## Ekip

- **Furkan Kızıloğlu** — Backend, API, veritabanı
- **Yusuf Eker** — Frontend tasarım, dashboard, landing sayfası
- **Muhammed Özdemir** — İşlemler sayfası, giriş/kayıt sayfaları, bileşenler

## Özellikler

- Kayıt ol, giriş yap, çıkış yap (JWT ile)
- Harcama ekle / sil — yapay zeka otomatik kategori atar
- Dashboard: toplam harcama, grafik, kategori dağılımı
- Mobil uyumlu

## Kullanılan Teknolojiler

**Frontend:** React 18 (Vite), React Router, TanStack Query, Zustand, Axios

**Backend:** Node.js, Express, MongoDB (Mongoose), JSON Web Token, bcrypt

**AI:** Google Gemini API (`gemini-2.5-flash`) — sadece sunucu tarafında

## Kurulum

### Gereksinimler

- Node.js 18+
- MongoDB Atlas hesabı (ya da yerel MongoDB)
- Google Gemini API anahtarı

### Backend

```bash
cd backend
npm install
```

`.env` dosyası oluşturun (`backend/.env`):

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=istediginiz_bir_secret
GEMINI_API_KEY=...
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

Sunucu `http://localhost:5000` adresinde çalışmaya başlar.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

## Proje Yapısı

```
kurus/
├── backend/
│   ├── models/          # User, Transaction (Mongoose)
│   ├── routes/          # auth, transactions, stats, ai
│   ├── middleware/       # JWT doğrulama
│   ├── services/        # Gemini API entegrasyonu
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Sidebar, Charts, Toast vb.
        ├── pages/       # Landing, Login, Register, Dashboard, Transactions
        ├── api.js       # Axios instance
        ├── store.js     # Zustand (auth, toast)
        └── main.jsx     # Router
```

## Ödev Gereksinimleri Karşılama

- [x] React kullanıldı
- [x] Kayıt + Giriş + Çıkış (JWT)
- [x] Form validasyonu (email formatı, şifre min 8 karakter, şifre eşleşme)
- [x] AI özelliği — Gemini API ile otomatik kategori atama (sunucu tarafından çağrılıyor)
- [x] Dinamik dashboard — `/api/stats/dashboard` endpoint'inden veri geliyor
- [x] REST API, MongoDB, 10'dan fazla endpoint
- [x] AI sunucu tarafında çağrılıyor (API anahtarı frontend'e açılmıyor)
