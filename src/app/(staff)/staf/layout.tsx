import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

export const instant = false;

export default function StaffLayout({ children }: LayoutProps<'/staf'>) {
  return (
    <ProtectedRoute requireStaff>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
