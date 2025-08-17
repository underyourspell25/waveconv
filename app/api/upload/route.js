import { NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configuration Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
    console.log('🚀 === DÉBUT CONVERSION API ===');
    
    let tempInputPath = null;
    let tempOutputPath = null;
    
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

        // Utiliser le dossier temporaire du système
        const tempDir = os.tmpdir();
        console.log('📁 Dossier temporaire:', tempDir);

        // Sauvegarder le fichier dans /tmp (disponible sur Vercel)
        console.log('💾 Sauvegarde du fichier...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueName = `${uuidv4()}-${Date.now()}${fileExt}`;
        tempInputPath = path.join(tempDir, uniqueName);
        
        fs.writeFileSync(tempInputPath, buffer);
        console.log('✅ Fichier sauvegardé:', tempInputPath);

        // Préparer la conversion
        const outputFileName = `${path.parse(uniqueName).name}.oga`;
        tempOutputPath = path.join(tempDir, outputFileName);
        
        console.log('🔄 Début conversion vers:', tempOutputPath);

        // Conversion avec FFmpeg
        await new Promise((resolve, reject) => {
            const conversion = ffmpeg(tempInputPath)
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

            // Sauvegarder vers le fichier de sortie temporaire
            conversion.save(tempOutputPath);
        });

        // Vérifier que le fichier de sortie existe
        if (!fs.existsSync(tempOutputPath)) {
            console.log('❌ Fichier de sortie non créé');
            throw new Error('Le fichier converti n\'a pas été créé');
        }

        console.log('✅ Fichier converti créé:', tempOutputPath);

        // Upload vers Supabase Storage
        console.log('☁️ Upload vers Supabase Storage...');
        const convertedBuffer = fs.readFileSync(tempOutputPath);
        
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
        } else if (error.message.includes('No such file')) {
            errorMessage = 'Fichier non trouvé';
        } else if (error.message.includes('Permission denied')) {
            errorMessage = 'Erreur de permissions sur le serveur';
        } else if (error.message.includes('FFmpeg')) {
            errorMessage = `Erreur de conversion: ${error.message}`;
        } else if (error.message.includes('upload')) {
            errorMessage = `Erreur de sauvegarde: ${error.message}`;
        }

        const errorResponse = {
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };

        console.log('❌ Réponse d\'erreur:', errorResponse);

        return NextResponse.json(errorResponse, { status: 500 });

    } finally {
        // Nettoyer les fichiers temporaires
        try {
            if (tempInputPath && fs.existsSync(tempInputPath)) {
                fs.unlinkSync(tempInputPath);
                console.log('🗑️ Fichier input temporaire supprimé');
            }
            if (tempOutputPath && fs.existsSync(tempOutputPath)) {
                fs.unlinkSync(tempOutputPath);
                console.log('🗑️ Fichier output temporaire supprimé');
            }
        } catch (cleanupError) {
            console.warn('⚠️ Erreur nettoyage:', cleanupError.message);
        }
    }
}