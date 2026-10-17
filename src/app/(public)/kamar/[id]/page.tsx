import RoomDetailView from '@/components/rooms/RoomDetailView';

export default async function RoomDetailPage({ params }: PageProps<'/kamar/[id]'>) {
  const { id } = await params;
  return <RoomDetailView roomId={id} />;
}
