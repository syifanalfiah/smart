# Proyek: Student Activity Analyzer - Smart Activity

**Smart Activity** adalah aplikasi web berbasis React yang dirancang untuk membantu mahasiswa mengelola, mencatat, dan menganalisis kegiatan harian mereka. Aplikasi ini berfungsi sebagai asisten pribadi yang tidak hanya mencatat jadwal, tetapi juga memberikan peringatan dini terhadap potensi jadwal yang **bertabrakan (overlap)** atau **tidak efisien** (padat tanpa istirahat yang cukup), mencegah kelelahan (burnout) akademik.

## Masalah yang Diselesaikan (Problem Statement)

Banyak mahasiswa sering merasa tidak efisien dalam mengelola waktu mereka, yang menyebabkan:
1. **Keterlambatan dan Missed Deadlines:** Karena tidak ada visualisasi waktu yang jelas.
2. **Burnout:** Akibat memaksakan kegiatan berjam-jam tanpa jeda atau istirahat.
3. **Konflik Jadwal:** Seringkali menjadwalkan dua kegiatan yang tumpang tindih (kuliah, rapat, dan tugas) tanpa disadari.

## Solusi yang Dibuat (Solution Overview)

Smart Activity menyediakan solusi digital berupa *dashboard* interaktif yang memungkinkan mahasiswa:
1. **Pencatatan Kegiatan Harian:** Mencatat semua kegiatan (Kuliah, Organisasi, Personal, dll.) beserta waktu mulai dan selesai.
2. **Analisis Efisiensi Waktu (Mindblowing Feature):**
    * **Deteksi Tabrakan (Overlap):** Secara cerdas mendeteksi dan memperingatkan jika ada dua kegiatan yang tumpang tindih.
    * **Peringatan Break:** Memberikan peringatan jika total aktivitas melebihi **5 jam non-stop** tanpa jeda minimal 30 menit, serta jika total aktivitas harian melebihi 12 jam.
3. **Visualisasi:** Menampilkan data kegiatan dalam format yang bersih, responsif, dan didukung animasi untuk pengalaman pengguna yang menyenangkan.

## Tech Stack & Fitur Utama

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | UI yang responsif, minimalis, dan animasi halus. |
| **Styling** | Tailwind CSS | Desain modern, rata kanan-kiri yang rapi. |
| **Routing & State** | React Router, Context API | Navigasi antar halaman dan manajemen *state* pengguna. |
| **Backend** | Node.js / Express.js | RESTful API Service. |
| **Database** | MongoDB (Mongoose) | Penyimpanan data kegiatan dan pengguna. |
| **Authentication** | JWT (JSON Web Token) | Sistem Login dan Register yang aman. |
| **Security** | Bcrypt | Enkripsi password pengguna. |

### Fitur Wajib

1.  **Authentication Aman:** Register dan Login pengguna menggunakan JWT. Password di-hash menggunakan **Bcrypt**. Token disimpan di `localStorage`.
2.  **CRUD Data Kegiatan Mahasiswa:** Entitas utama adalah **Activity** (Kegiatan). Pengguna dapat **C**reate, **R**ead (tampil List), **U**pdate, dan **D**elete kegiatan harian mereka.
3.  **Upload File/Gambar:** Fitur untuk mengunggah gambar/file terkait kegiatan (misalnya, *screenshot* materi kuliah atau dokumen rapat). Data akan disimpan di sisi *backend* dan ditampilkan di *dashboard*.
4.  **Desain Frontend:** Minimal 3 halaman utama (`/login`, `/dashboard`, `/activity/create` atau `/activity/:id/edit`). Desain **Responsif** (Mobile & Desktop).

## Cara Menjalankan Project (Setup Instructions)

Pastikan Anda memiliki Node.js (v18+) dan MongoDB terinstal.

### 1. Kloning Repositori

```bash
git clone [URL_REPO_ANDA]
cd [NAMA_FOLDER_PROYEK]
````

### 2\. Setup Backend

1.  Masuk ke folder `backend`:
    ```bash
    cd backend
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Buat file `.env` (berada di dalam folder `backend/`) dan isi variabel lingkungan:
    ```
    PORT=5000
    MONGO_URI=[GANTI_DENGAN_LINK_KONEKSI_MONGO_DB_ANDA]
    JWT_SECRET=[GANTI_DENGAN_STRING_RAHASIA_KOMPLEKS]
    ```
4.  Jalankan server:
    ```bash
     npm run dev
    ```

### 3\. Setup Frontend

1.  Pindah ke folder `frontend`:
    ```bash
    cd ../frontend
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Buat file `.env` (berada di dalam folder `frontend/`) dan isi variabel lingkungan:
    ```
    VITE_BACKEND_URL=http://localhost:5000/api
    ```
4.  Jalankan aplikasi React:
    ```bash
    npm run dev
    ```

Aplikasi frontend akan berjalan di `http://localhost:3000` dan backend berjalan di `http://localhost:5000`.

```markdown
### Tampilan Antarmuka

#### Halaman Dashboard & Analisis
![Screenshot Dashboard](screenshots/dashboard.png)

#### Halaman Form Tambah Kegiatan
![Screenshot Form](screenshots/form_kegiatan.png)