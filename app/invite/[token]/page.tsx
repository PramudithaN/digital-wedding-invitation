import React from 'react';
import { notFound } from 'next/navigation';
import { getGuestByToken, markInviteOpened, getWeddingDetails } from '@/lib/db';
import InviteCardClient from '@/components/invite/InviteCardClient';

export const dynamic = 'force-dynamic';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: InvitePageProps) {
  const { token } = await params;
  const isGeneral = token === 'general';
  
  let guest;
  if (isGeneral) {
    guest = {
      id: 'general',
      name: 'general',
      invite_token: 'general'
    };
  } else {
    guest = await getGuestByToken(token);
  }
  
  const weddingDetails = await getWeddingDetails();
  
  if (!guest) {
    return {
      title: 'Wedding Invitation',
    };
  }

  return {
    title: `Wedding Invitation - ${weddingDetails.bride_name} & ${weddingDetails.groom_name}`,
    description: isGeneral 
      ? 'You are cordially invited to celebrate our wedding.'
      : `Dear ${guest.name}, you are cordially invited to celebrate our wedding.`,
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const isGeneral = token === 'general';
  
  // 1. Fetch guest by token
  let guest;
  if (isGeneral) {
    guest = {
      id: 'general',
      name: 'general',
      invite_token: 'general',
      phone: '',
      email: '',
      notes: 'General public invitation link'
    };
  } else {
    guest = await getGuestByToken(token);
  }

  if (!guest) {
    return notFound();
  }

  // 2. Mark invite as opened (only for personalized guests)
  if (!isGeneral) {
    await markInviteOpened(guest.id);
  }

  // 3. Fetch current wedding configurations
  const weddingDetails = await getWeddingDetails();

  return (
    <InviteCardClient 
      guest={guest} 
      weddingDetails={weddingDetails} 
    />
  );
}
