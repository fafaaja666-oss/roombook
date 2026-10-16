# RoomBook

Aplikasi pemesanan ruangan berbasis Next.js (App Router) yang menyimpan seluruh data di
`localStorage` sehingga dapat dijalankan tanpa backend.

## Fitur

- Autentikasi dengan peran **Pengguna** dan **Administrator**.
- Pengguna:
  - Melihat daftar & detail ruangan (pencarian + filter ketersediaan).
  - Melihat jadwal ruangan per jam (slot berwarna: tersedia, disetujui, menunggu).
  - Mengajukan reservasi dengan validasi bentrok jadwal, kapasitas, dan tanggal.
  - Melihat dan membatalkan reservasi pribadi beserta status/alasan penolakan.
- Administrator:
  - Dashboard ringkasan reservasi.
  - CRUD ruangan dan penandaan status pemeliharaan.
  - Menyetujui/menolak pengajuan reservasi (dengan alasan) dan membatalkan reservasi.
  - Melihat jadwal seluruh ruangan.

## Akun Demo

| Peran         | Email                  | Password |
| ------------- | ---------------------- | -------- |
| Pengguna      | `user@roombook.test`   | `user123`|
| Administrator | `admin@roombook.test`  | `admin123`|

## Menjalankan

```bash
npm install
npm run dev      # pengembangan di http://localhost:3000
npm run build    # build produksi
npm start        # menjalankan hasil build
npm run lint     # pemeriksaan lint
```

## Struktur Singkat

```
src/
  app/            # route App Router (login, dashboard, ruangan, jadwal, booking, admin)
  components/     # komponen UI, ruangan, reservasi, jadwal, dan admin
  hooks/          # useAuth, useData, useToday
  lib/storage.ts  # lapisan penyimpanan localStorage dengan pub/sub
  constants/      # data demo & konstanta
  types/          # tipe domain
  utils/          # helper tanggal, waktu, dan status
```

## Catatan Teknis

Proyek mengaktifkan `cacheComponents` (Partial Prerendering). Oleh karena itu pembacaan waktu
nyata (`new Date()`, `Date.now()`) pada Client Component dilakukan lewat hook `useToday`
(`useSyncExternalStore`) agar tidak dievaluasi saat prerender, dan data demo bertanggal dinamis
dibuat melalui `createDemoReservations()` yang hanya dipanggil di sisi klien.
