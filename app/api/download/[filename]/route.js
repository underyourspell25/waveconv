import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request, { params }) {
  try {
    const filename = params.filename;
    console.log('📥 === TÉLÉCHARGEMENT DEMANDÉ ===');
    console.log('📄 Nom du fichier:', filename);
    
    // Construire le chemin vers le fichier
    const filePath = path.join(process.cwd(), 'converted', filename);
    console.log('📁 Chemin complet:', filePath);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      console.log('❌ Fichier non trouvé');
      
      // Lister tous les fichiers dans converted/ pour debug
      const convertedDir = path.join(process.cwd(), 'converted');
      if (fs.existsSync(convertedDir)) {
        const files = fs.readdirSync(convertedDir);
        console.log('📂 Fichiers disponibles:', files);
      } else {
        console.log('📂 Dossier converted/ n\'existe pas');
      }
      
      return new NextResponse('Fichier non trouvé', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // Lire le fichier
    console.log('📖 Lecture du fichier...');
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;
    
    console.log('✅ Fichier lu:', fileSize, 'bytes');
    
    // Déterminer le type MIME
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (ext === '.oga' || ext === '.ogg') {
      mimeType = 'audio/ogg';
    } else if (ext === '.mp3') {
      mimeType = 'audio/mpeg';
    } else if (ext === '.wav') {
      mimeType = 'audio/wav';
    }
    
    console.log('🎵 Type MIME:', mimeType);
    
    // Retourner le fichier avec les bons headers
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileSize.toString(),
        'Cache-Control': 'no-cache',
      },
    });
    
    console.log('✅ Fichier envoyé avec succès');
    console.log('📥 === FIN TÉLÉCHARGEMENT ===');
    
    return response;
    
  } catch (error) {
    console.error('💥 === ERREUR TÉLÉCHARGEMENT ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    return new NextResponse('Erreur lors du téléchargement: ' + error.message, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}