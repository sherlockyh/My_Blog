import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSiteStore } from '../store/site';

export default function PublicLayout() {
  const load = useSiteStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="public-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
