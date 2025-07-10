Nama: Muhammad Fardan Wicaksana
Sekolah: SMK Telkom Purwokerto

# 🧠 MindMate – Mental Health Website
Website yang dirancang untuk membantu pengguna memantau kondisi kesehatan mental secara mandiri dan berkelanjutan.

## 🎯 Target Pengguna
Aplikasi ini ditujukan untuk individu usia 15–30 tahun seperti:
- Pelajar
- Mahasiswa
- Pekerja pemula

### Kebutuhan utama pengguna:
- Melacak suasana hati harian
- Menulis jurnal reflektif
- Mendapat rekomendasi aktivitas positif

---

## 🔗 Live Website
https://mindmate-pwa.vercel.app

## 🎨 Figma Design
https://www.figma.com/design/Tau4gBUUCKmZqDGbExeA94/MindMate?node-id=0-1&p=f&t=srnXpbXZJLYEU5ra-0

---

## 🌟 Fitur Utama

| Route | Halaman | Jenis | Deskripsi |
|-------|---------|-------|-----------|
| `/` | Landing Page | Umum | Pengenalan aplikasi, CTA, fitur utama, dan testimoni |
| `/login` | Login | Umum | Halaman masuk akun pengguna |
| `/register` | Register | Umum | Pendaftaran pengguna baru |
| `/forgot-password` | Forgot Password | Umum | Reset password pengguna melalui email |

---

### 🧩 Halaman Fitur (Logika & Navigasi)

| Route | Nama Halaman | Fungsi |
|-------|---------------|--------|
| `/dashboard` | Dashboard | Ringkasan mood hari ini, rekomendasi aktivitas, dan statistik mini |
| `/mood-tracker` | Mood Tracker | Halaman pusat untuk input dan riwayat suasana hati |
| `/daily-journal` | Daily Journal | Menampilkan daftar semua jurnal pribadi pengguna |
| `/personal-stats` | Personal Stats | Statistik grafik mood harian, mingguan, bulanan (AmCharts 5) |
| `/activity-suggestions` | Activity Suggestions | Saran aktivitas positif (meditasi, journaling, olahraga, dsb) |

---

### ⚙️ Implementasi Fitur

| Route | Nama Halaman | Fungsi |
|-------|---------------|--------|
| `/mood` | Input Mood | Input mood pengguna menggunakan skala warna/emoji |
| `/journal` | Journal List | List entri jurnal pengguna |
| `/journal/create` | Tambah Journal | Form penulisan jurnal baru |
| `/calendar` | Mood Calendar | Kalender visual dengan warna berdasarkan mood/jurnal |
| `/statistics` | Statistik Grafik | Grafik perubahan mood menggunakan AmCharts |

---

### 👤 Manajemen Akun

| Route | Halaman | Fungsi |
|-------|---------|--------|
| `/profile` | Profil Pengguna | Informasi dasar pengguna (nama, email, gender) |
| `/profile/edit` | Edit Profil | Ubah nama, email, preferensi (tema, notifikasi, dll) |
| `/profile/change-password` | Ganti Password | Form untuk mengganti kata sandi |

---

### 💬 Dukungan & Layanan

| Route | Halaman | Fungsi |
|-------|---------|--------|
| `/help` | Help Center | FAQ, panduan penggunaan aplikasi |
| `/contact-psychologist` | Kontak Psikolog | Form untuk menghubungi psikolog atau admin |
| `/community` | Komunitas | Halaman interaksi dengan pengguna lain |
| `/privacy` | Kebijakan Privasi | Penjelasan tentang privasi data pengguna |

---

## 📅 Daily Progress
1. **Day 1** – Setup proyek SolidJS + Tailwind + Routing, landing page
2. **Day 2** – Integrasi Firebase Auth, halaman login/register, dashboard & mood tracker
3. **Day 3** – Fitur jurnal, statistik AmCharts, serta desain mobile responsive

---

© 2025 MindMate
