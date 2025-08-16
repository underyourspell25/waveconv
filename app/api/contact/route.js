import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation basique
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Validation longueur
    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Un des champs dépasse la limite de caractères' },
        { status: 400 }
      );
    }

    console.log('📧 Envoi du message de contact...');
    console.log(`👤 De: ${name} (${email})`);
    console.log(`📋 Sujet: ${subject}`);

    // Template email HTML
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau message de contact - WaveConv</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 2rem; text-align: center;">
      <div style="margin-bottom: 1rem;">
        <img 
          src="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png"
          alt="WaveConv"
          style="width: 50px; height: 50px; border-radius: 12px; display: inline-block;"
        />
      </div>
      <h1 style="color: white; margin: 0; font-size: 1.5rem; font-weight: 700;">
        💬 Nouveau message de contact
      </h1>
      <p style="color: rgba(255,255,255,0.8); margin: 0.5rem 0 0 0;">
        WaveConv Contact Form
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 2rem;">
      
      <!-- Contact Info -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid #8b5cf6;">
        <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>👤</span> Informations de contact
        </h3>
        
        <div style="display: grid; gap: 0.75rem;">
          <div style="display: flex; align-items: start; gap: 1rem;">
            <strong style="color: #6b7280; min-width: 60px;">Nom:</strong>
            <span style="color: #1f2937; font-weight: 500;">${name}</span>
          </div>
          <div style="display: flex; align-items: start; gap: 1rem;">
            <strong style="color: #6b7280; min-width: 60px;">Email:</strong>
            <a href="mailto:${email}" style="color: #8b5cf6; text-decoration: none; font-weight: 500; background: #ede9fe; padding: 0.25rem 0.5rem; border-radius: 6px;">
              ${email}
            </a>
          </div>
          <div style="display: flex; align-items: start; gap: 1rem;">
            <strong style="color: #6b7280; min-width: 60px;">Sujet:</strong>
            <span style="color: #1f2937; font-weight: 500;">${subject}</span>
          </div>
        </div>
      </div>

      <!-- Message -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #8b5cf6;">
        <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>💭</span> Message
        </h3>
        <div style="background-color: white; border-radius: 8px; padding: 1.25rem; border: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin-top: 2rem;">
        <a href="mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}" 
           style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
          📧 Répondre à ${name}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 1.5rem; text-align: center;">
      <p style="margin: 0; color: #d1d5db; font-size: 0.9rem;">
        Envoyé depuis <strong style="color: #8b5cf6;">waveconv.com</strong>
      </p>
      <p style="margin: 0.5rem 0 0 0; color: #9ca3af; font-size: 0.8rem;">
        🕒 ${new Date().toLocaleString('fr-FR', {
          timeZone: 'Europe/Paris',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Envoi de l'email principal
    const emailResult = await resend.emails.send({
      from: 'WaveConv Contact <contact@waveconv.com>', // TON DOMAINE !
      to: ['contact@waveconv.com'], // Où tu veux recevoir les messages
      replyTo: email, // Pour répondre directement
      subject: `[WaveConv] ${subject}`,
      html: emailHTML,
      text: `
🎯 NOUVEAU MESSAGE WAVECONV

👤 CONTACT:
Nom: ${name}
Email: ${email}
Sujet: ${subject}

💭 MESSAGE:
${message}

---
📅 ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
🌐 https://waveconv.com
      `
    });

    console.log('✅ Email principal envoyé:', emailResult.data?.id);

    // Email de confirmation pour l'utilisateur
    try {
      await resend.emails.send({
        from: 'WaveConv <contact@waveconv.com>',
        to: [email],
        subject: 'Merci pour votre message - WaveConv',
        html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; text-align: center;">
  <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 2rem; border-radius: 12px 12px 0 0;">
    <img src="https://res.cloudinary.com/dtwkc40qa/image/upload/v1755344329/w_1_copie_p0px1u.png" 
         alt="WaveConv" style="width: 50px; height: 50px; border-radius: 8px; margin-bottom: 1rem;">
    <h2 style="color: white; margin: 0;">✅ Message reçu !</h2>
  </div>
  
  <div style="background: #f8fafc; padding: 2rem; border-radius: 0 0 12px 12px;">
    <p style="color: #1f2937; font-size: 1.1rem; margin-bottom: 1rem;">
      Bonjour <strong>${name}</strong> 👋
    </p>
    <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1.5rem;">
      Merci pour votre message concernant "<em>${subject}</em>". 
      Nous avons bien reçu votre demande et vous répondrons rapidement.
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 1rem; border-left: 4px solid #8b5cf6; margin-bottom: 1.5rem;">
      <p style="margin: 0; color: #374151; font-size: 0.9rem;">
        <strong>Votre message:</strong><br>
        "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"
      </p>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
      <p style="color: #8b5cf6; margin: 0; font-weight: 600;">L'équipe WaveConv 🎵</p>
      <p style="color: #9ca3af; margin: 0.5rem 0 0 0; font-size: 0.8rem;">
        <a href="https://waveconv.com" style="color: #8b5cf6; text-decoration: none;">waveconv.com</a>
      </p>
    </div>
  </div>
</div>
        `
      });
      console.log('📬 Confirmation envoyée à l\'utilisateur');
    } catch (confirmError) {
      console.log('⚠️ Confirmation non envoyée:', confirmError.message);
    }

    return NextResponse.json({
      message: 'Message envoyé avec succès !',
      emailId: emailResult.data?.id
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    
    if (error.message?.includes('Domain not found') || error.message?.includes('domain')) {
      return NextResponse.json(
        { error: 'Configuration du domaine email en cours. Réessayez dans quelques minutes.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}