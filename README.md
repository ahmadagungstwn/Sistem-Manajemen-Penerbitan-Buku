# Sistem Informasi Manajemen Penerbitan dan Inventaris Buku

Dashboard PWA untuk manajemen penerbitan dan inventaris buku menggunakan ReactJS dan IndexedDB.

## 📋 Struktur Project

### Database (IndexedDB)

- **src/db/database.ts** - Setup database menggunakan Dexie dengan semua tabel

### Contexts

- **src/contexts/AuthContext.tsx** - Context untuk autentikasi user

### Components

- **src/components/layout/Sidebar.tsx** - Sidebar navigasi
- **src/components/layout/DashboardLayout.tsx** - Layout utama dashboard
- **src/components/ui/stat-card.tsx** - Component card statistik

### Pages

- **src/pages/Login.tsx** - Halaman login
- **src/pages/Dashboard.tsx** - Dashboard utama dengan statistik
- **src/pages/Buku.tsx** - Manajemen data buku
- **src/pages/Penulis.tsx** - Manajemen data penulis
- **src/pages/Penerbit.tsx** - Manajemen data penerbit
- **src/pages/Kategori.tsx** - Manajemen data kategori
- **src/pages/Rak.tsx** - Manajemen data rak
- **src/pages/StokBuku.tsx** - Manajemen stok buku
- **src/pages/Toko.tsx** - Manajemen data toko
- **src/pages/Distribusi.tsx** - Manajemen distribusi buku
- **src/pages/ReturBuku.tsx** - Manajemen retur buku

## 🚀 Cara Menjalankan

1. Install dependencies:

```bash
npm install
```

2. Jalankan development server:

```bash
npm run dev
```

3. Buka browser di `http://localhost:8080`

4. Login dengan:
   - **Username**: teamsipib
   - **Password**: password

## 📦 Fitur Utama

- ✅ PWA (Progressive Web App) - bisa diinstall di perangkat
- ✅ IndexedDB untuk storage lokal (offline-capable)
- ✅ Authentication dengan session management
- ✅ CRUD lengkap untuk semua entitas
- ✅ Dashboard dengan statistik real-time
- ✅ Activity logging
- ✅ Search & filter pada semua tabel
- ✅ Responsive design

## 🗄️ Tabel Database

1. **penulis** - Data penulis buku
2. **penerbit** - Data penerbit
3. **kategori** - Kategori buku
4. **rak** - Lokasi penyimpanan
5. **buku** - Data buku utama
6. **stok_buku** - Inventaris stok
7. **toko** - Toko distribusi
8. **distribusi** - Catatan distribusi
9. **retur_buku** - Data retur
10. **users** - User sistem
11. **log_aktivitas** - Log aktivitas user

## 🛠️ Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Dexie.js (IndexedDB wrapper)
- React Router
- PWA (vite-plugin-pwa)

## 📱 PWA Features

Aplikasi ini sudah dikonfigurasi sebagai PWA dengan:

- Service Worker untuk offline capability
- Manifest untuk installability
- Cache strategy untuk assets

## 🔐 Security Notes

⚠️ **PENTING untuk Production:**

- Password saat ini disimpan plain text
- Implementasikan hashing (bcrypt, argon2) untuk production
- Tambahkan validasi input yang lebih ketat
- Implementasikan rate limiting untuk login

## 📝 License

MIT
