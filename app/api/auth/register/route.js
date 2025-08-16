// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit faire au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // IMPORTANT: Pour l'instant, on stocke juste en mémoire
    // En production, tu auras besoin d'une vraie base de données
    
    console.log('🔐 Nouveau compte créé (simulation):');
    console.log(`👤 Nom: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔒 Mot de passe hashé: ${hashedPassword.substring(0, 20)}...`);

    // Simulation de sauvegarde réussie
    // TODO: Remplacer par une vraie DB (Prisma, MongoDB, etc.)
    
    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: {
        id: Date.now().toString(), // ID temporaire
        email,
        name
      }
    });

  } catch (error) {
    console.error('Erreur register:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}