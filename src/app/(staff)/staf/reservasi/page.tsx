import ReservationManager from '@/components/staff/ReservationManager';

export default async function StaffReservationsPage({ searchParams }: PageProps<'/staf/reservasi'>) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  return <ReservationManager initialQuery={q} />;
}
