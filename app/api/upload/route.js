import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configuration Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

        // Initialiser FFmpeg WebAssembly
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { fetchFile } = await import('@ffmpeg/util');
        
        const ffmpeg = new FFmpeg();
        
        console.log('⚡ Initialisation FFmpeg WebAssembly...');
        await ffmpeg.load();
        console.log('✅ FFmpeg WebAssembly chargé');

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const inputBuffer = new Uint8Array(bytes);
        
        // Générer noms de fichiers
        const uniqueName = `${uuidv4()}-${Date.now()}${fileExt}`;
        const outputFileName = `${path.parse(uniqueName).name}.oga`;
        
        console.log('🔄 Début conversion vers .oga...');

        // Écrire le fichier d'entrée dans FFmpeg
        await ffmpeg.writeFile(`input${fileExt}`, inputBuffer);

        // Exécuter la conversion
        await ffmpeg.exec([
            '-i', `input${fileExt}`,
            '-c:a', 'libopus',
            '-b:a', '64k',
            '-ac', '1',
            '-ar', '16000',
            '-compression_level', '10',
            '-frame_duration', '60',
            '-application', 'voip',
            'output.oga'
        ]);

        console.log('✅ Conversion terminée');

        // Lire le fichier de sortie
        const outputData = await ffmpeg.readFile('output.oga');
        const outputBuffer = new Uint8Array(outputData);

        console.log('☁️ Upload vers Supabase Storage...');

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(`converted/${outputFileName}`, outputBuffer, {
                contentType: 'audio/ogg',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ Erreur upload Supabase:', uploadError);
            throw new Error(`Erreur upload: ${uploadError.message}`);
        }

        console.log('✅ Fichier uploadé sur Supabase:', uploadData.path);

        // Générer URL publique
        const { data: publicUrlData } = supabase.storage
            .from('audio-files')
            .getPublicUrl(uploadData.path);

        const downloadUrl = publicUrlData.publicUrl;
        console.log('🔗 URL publique:', downloadUrl);

        // Retourner la réponse JSON
        const response = {
            success: true,
            download_url: downloadUrl,
            message: 'Conversion réussie',
            originalName: file.name,
            outputName: outputFileName,
            supabasePath: uploadData.path
        };

        console.log('🎉 Réponse à envoyer:', response);
        console.log('🚀 === FIN CONVERSION API ===');

        return NextResponse.json(response);

    } catch (error) {
        console.error('💥 === ERREUR CONVERSION ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);

        let errorMessage = 'Erreur lors de la conversion du fichier';
        
        if (error.message.includes('Invalid data found')) {
            errorMessage = 'Format de fichier invalide ou corrompu';
        } else if (error.message.includes('FFmpeg')) {
            errorMessage = `Erreur de conversion: ${error.message}`;
        } else if (error.message.includes('upload')) {
            errorMessage = `Erreur de sauvegarde: ${error.message}`;
        } else if (error.message.includes('load')) {
            errorMessage = 'Erreur d\'initialisation du convertisseur';
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