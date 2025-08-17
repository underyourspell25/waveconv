import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configuration Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    console.log('🚀 === DÉBUT CONVERSION API (Cloudinary) ===');
    
    try {
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

        // Convertir en buffer pour Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Générer un nom unique
        const uniqueName = `${uuidv4()}-${Date.now()}`;
        
        console.log('☁️ Upload et conversion via Cloudinary...');

        // Upload et conversion avec Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(dataURI, {
                resource_type: 'video', // Pour les fichiers audio/vidéo
                public_id: uniqueName,
                format: 'ogg', // Format de sortie (OGG au lieu de OGA)
                audio_codec: 'opus',
                bit_rate: '64k',
                audio_frequency: 16000,
                flags: 'mono'
            }, (error, result) => {
                if (error) {
                    console.error('❌ Erreur Cloudinary:', error);
                    reject(error);
                } else {
                    console.log('✅ Conversion Cloudinary réussie');
                    resolve(result);
                }
            });
        });

        console.log('🔗 URL Cloudinary:', uploadResult.secure_url);

        // Télécharger le fichier converti depuis Cloudinary
        console.log('⬇️ Téléchargement du fichier converti...');
        const convertedResponse = await fetch(uploadResult.secure_url);
        
        if (!convertedResponse.ok) {
            throw new Error('Erreur lors du téléchargement du fichier converti');
        }
        
        const convertedBuffer = await convertedResponse.arrayBuffer();
        const outputFileName = `${uniqueName}.ogg`;

        console.log('☁️ Upload vers Supabase Storage...');

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('audio-files')
            .upload(`converted/${outputFileName}`, convertedBuffer, {
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
        console.log('🔗 URL publique Supabase:', downloadUrl);

        // Nettoyer Cloudinary (optionnel)
        try {
            await cloudinary.uploader.destroy(uniqueName, { resource_type: 'video' });
            console.log('🗑️ Fichier Cloudinary nettoyé');
        } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage Cloudinary:', cleanupError.message);
        }

        // Retourner la réponse JSON
        const response = {
            success: true,
            download_url: downloadUrl,
            message: 'Conversion réussie via Cloudinary',
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
        
        if (error.message.includes('Invalid signature')) {
            errorMessage = 'Erreur de configuration Cloudinary';
        } else if (error.message.includes('upload')) {
            errorMessage = 'Erreur lors de l\'upload du fichier';
        } else if (error.message.includes('format')) {
            errorMessage = 'Format de fichier non supporté';
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