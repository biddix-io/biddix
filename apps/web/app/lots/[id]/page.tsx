import { Metadata } from 'next';
import { supabase } from '../../../lib/supabase';
import { LiveAuction } from '../../../components/LiveAuction';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: lot } = await supabase
    .from('lots')
    .select('title, auction_id')
    .eq('id', params.id)
    .single();

  return {
    title: lot ? `${lot.title} | Biddix Live Auction` : 'Live Auction Lot | Biddix',
    description: `Place your bid now for ${lot?.title || 'this item'} on Biddix. Real-time bidding platform.`,
    openGraph: {
      title: lot?.title,
      description: `Join the live auction for ${lot?.title}`,
      type: 'website',
    },
  };
}

export default function LotPage({ params }: Props) {
  // In a real app, you'd get the current user ID from auth
  const userId = '7c9e66ab-0e86-4444-9640-5e3e2646b96e';

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <LiveAuction lotId={params.id} userId={userId} />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Offer',
            'name': 'Auction Lot',
            'availability': 'https://schema.org/InStock',
          }),
        }}
      />
    </div>
  );
}
