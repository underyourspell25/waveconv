// app/api/auth/check-email/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Pour l'instant, on dit que tous les emails n'existent pas
    // (force la création de compte via Google ou mot de passe)
    // Tu peux modifier cette logique plus tard avec une vraie DB
    
    // Emails "existants" pour test (optionnel)
    const existingEmails = [
      'test@example.com',
      'demo@waveconv.com'
    ];

    const exists = existingEmails.includes(email.toLowerCase());

    return NextResponse.json({ exists });

  } catch (error) {
    console.error('Erreur check-email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}