import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configuration des dossiers
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const CONVERTED_DIR = path.join(process.cwd(), 'converted');

// Créer les dossiers s'ils n'existent pas
[UPLOAD_DIR, CONVERTED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('📁 Dossier créé:', dir);
    }
});

export async function POST(request) {
    console.log('🚀 === DÉBUT CONVERSION API ===');
    
    try {
        // Vérifier que la requête contient bien un fichier
        const contentType = request.headers.get('content-type');
        console.log('📋 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.log('❌ Pas de multipart/form-data');
            return NextResponse.json({ 
                error: 'Format de requête invalide' 
            }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        
        console.log('📄 Fichier reçu:', file ? file.name : 'AUCUN');
        console.log('📊 Taille:', file ? file.size : 'N/A');
        
        if (!file || file.size === 0) {
            console.log('❌ Aucun fichier fourni ou fichier vide');
            return NextResponse.json({ 
                error: 'Aucun fichier fourni ou fichier vide' 
            }, { status: 400 });
        }

        // Vérifier le type de fichier
        const allowedTypes = ['.mov', '.mp4', '.mp3', '.wav', '.m4a', '.ogg', '.webm'];
        const fileExt = path.extname(file.name).toLowerCase();
        
        console.log('🔍 Extension détectée:', fileExt);
        
        if (!allowedTypes.includes(fileExt)) {
            console.log('❌ Type de fichier non supporté:', fileExt);
            return NextResponse.json({ 
                error: `Type de fichier non supporté: ${fileExt}. Utilisez: ${allowedTypes.join(', ')}` 
            }, { status: 400 });
        }

        // Sauvegarder le fichier
        console.log('💾 Sauvegarde du fichier...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${uuidv4()}-${Date.now()}${fileExt}`;
        const inputPath = path.join(UPLOAD_DIR, uniqueName);
        
        fs.writeFileSync(inputPath, buffer);
        console.log('✅ Fichier sauvegardé:', inputPath);

        // Préparer la conversion
        const outputFileName = `${path.parse(uniqueName).name}.oga`;
        const outputPath = path.join(CONVERTED_DIR, outputFileName);
        
        console.log('🔄 Début conversion vers:', outputPath);

        // Conversion avec FFmpeg
        await new Promise((resolve, reject) => {
            const conversion = ffmpeg(inputPath)
                .toFormat('oga')
                .audioCodec('libopus')
                .audioBitrate('64k')
                .audioChannels(1)
                .audioFrequency(16000)
                .outputOptions([
                    '-compression_level 10',
                    '-frame_duration 60',
                    '-application voip'
                ])
                .on('start', (commandLine) => {
                    console.log('🎬 Commande FFmpeg:', commandLine);
                })
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    if (percent > 0) {
                        console.log(`📊 Progression: ${percent}%`);
                    }
                })
                .on('end', () => {
                    console.log('✅ Conversion terminée avec succès');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('❌ Erreur FFmpeg:', err.message);
                    reject(new Error(`Erreur de conversion: ${err.message}`));
                });

            // Sauvegarder vers le fichier de sortie
            conversion.save(outputPath);
        });

        // Vérifier que le fichier de sortie existe
        if (!fs.existsSync(outputPath)) {
            console.log('❌ Fichier de sortie non créé');
            throw new Error('Le fichier converti n\'a pas été créé');
        }

        console.log('✅ Fichier converti créé:', outputPath);

        // Supprimer le fichier original
        try {
            fs.unlinkSync(inputPath);
            console.log('🗑️ Fichier original supprimé');
        } catch (err) {
            console.warn('⚠️ Impossible de supprimer le fichier original:', err.message);
        }

        // Retourner la réponse JSON
        const response = {
            success: true,
            download_url: `/api/download/${outputFileName}`,
            message: 'Conversion réussie',
            originalName: file.name,
            outputName: outputFileName
        };

        console.log('🎉 Réponse à envoyer:', response);
        console.log('🚀 === FIN CONVERSION API ===');

        return NextResponse.json(response);

    } catch (error) {
        console.error('💥 === ERREUR CONVERSION ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        // Nettoyer en cas d'erreur
        // (le fichier d'entrée sera nettoyé automatiquement)

        let errorMessage = 'Erreur lors de la conversion du fichier';
        
        if (error.message.includes('Invalid data found')) {
            errorMessage = 'Format de fichier invalide ou corrompu';
        } else if (error.message.includes('No such file')) {
            errorMessage = 'Fichier non trouvé';
        } else if (error.message.includes('Permission denied')) {
            errorMessage = 'Erreur de permissions sur le serveur';
        } else if (error.message.includes('FFmpeg')) {
            errorMessage = `Erreur de conversion: ${error.message}`;
        }

        const errorResponse = {
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };

        console.log('❌ Réponse d\'erreur:', errorResponse);

        return NextResponse.json(errorResponse, { status: 500 });
    }
}