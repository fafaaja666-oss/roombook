import MyReservations from '@/components/reservations/MyReservations';

export const metadata = { title: 'Reservasi Saya' };

export default function ReservasiSayaPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
          Akun Anda
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold text-ink">Reservasi Saya</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Pantau status reservasi Anda — dari pengajuan, konfirmasi, hingga check-in dan check-out.
        </p>
      </header>

      <div className="mt-8">
        <MyReservations />
      </div>
    </div>
  );
}
