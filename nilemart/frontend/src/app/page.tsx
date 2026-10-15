import Shop from '@/components/Shop';
export default function Home({ searchParams }: { searchParams: { q?: string; category?: string } }) {
  return <Shop q={searchParams.q || ''} category={searchParams.category || ''} />;
}
