import React from 'react';
import { notFound } from 'next/navigation';
import { getGuestByToken, markInviteOpened, getWeddingDetails } from '@/lib/db';
import InviteCardClient from '@/components/invite/InviteCardClient';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: InvitePageProps) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  const weddingDetails = await getWeddingDetails();
  
  if (!guest) {
    return {
      title: 'Wedding Invitation',
    };
  }

  return {
    title: `Wedding Invitation — ${weddingDetails.bride_name} & ${weddingDetails.groom_name}`,
    description: `Dear ${guest.name}, you are cordially invited to celebrate our wedding.`,
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  
  // 1. Fetch guest by token
  const guest = await getGuestByToken(token);
  if (!guest) {
    return notFound();
  }

  // 2. Mark invite as opened (side-effect during SSR page load)
  await markInviteOpened(guest.id);

  // 3. Fetch current wedding configurations
  const weddingDetails = await getWeddingDetails();

  return (
    <InviteCardClient 
      guest={guest} 
      weddingDetails={weddingDetails} 
    />
  );
}
