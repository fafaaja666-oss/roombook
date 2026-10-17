import PublicNav from '@/components/layout/PublicNav';
import Footer from '@/components/layout/Footer';

export const instant = false;

export default function PublicLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
