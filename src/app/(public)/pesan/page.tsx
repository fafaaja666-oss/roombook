import BookingForm from '@/components/booking/BookingForm';

export const metadata = { title: 'Pesan Kamar' };

export default async function PesanPage({ searchParams }: PageProps<'/pesan'>) {
  const params = await searchParams;
  const room = typeof params.room === 'string' ? params.room : '';
  const checkIn = typeof params.checkIn === 'string' ? params.checkIn : '';
  const checkOut = typeof params.checkOut === 'string' ? params.checkOut : '';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">
          Reservasi
        </p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold text-ink">Pesan Kamar</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Lengkapi detail menginap dan data tamu. Anda dapat memilih kamar lain yang tersedia pada
          tanggal yang dipilih.
        </p>
      </header>

      <div className="mt-8">
        <BookingForm
          initialRoomId={room}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
        />
      </div>
    </div>
  );
}
