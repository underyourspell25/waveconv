import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
    try {
        const filename = params.filename;
        console.log('📥 === TÉLÉCHARGEMENT DEMANDÉ ===');
        console.log('📄 Nom du fichier:', filename);
        
        // Construire le chemin Supabase
        const supabasePath = `converted/${filename}`;
        console.log('☁️ Chemin Supabase:', supabasePath);

        // Télécharger le fichier depuis Supabase Storage
        const { data, error } = await supabase.storage
            .from('audio-files')
            .download(supabasePath);

        if (error) {
            console.error('❌ Erreur téléchargement Supabase:', error);
            
            // Lister les fichiers disponibles pour debug
            const { data: files, error: listError } = await supabase.storage
                .from('audio-files')
                .list('converted');
                
            if (!listError && files) {
                console.log('📂 Fichiers disponibles:', files.map(f => f.name));
            }
            
            return new NextResponse('Fichier non trouvé sur Supabase', { 
                status: 404,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
        }

        console.log('✅ Fichier récupéré depuis Supabase');

        // Convertir en buffer
        const buffer = await data.arrayBuffer();
        const fileSize = buffer.byteLength;
        
        console.log('📖 Fichier lu:', fileSize, 'bytes');
        
        // Déterminer le type MIME pour forcer le téléchargement
        const ext = filename.toLowerCase().split('.').pop();
        
        // Force le téléchargement avec application/octet-stream
        const mimeType = 'application/octet-stream';
        
        console.log('💾 Type MIME (forcé téléchargement):', mimeType);
        
        // Retourner le fichier avec headers de téléchargement forcé
        const response = new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType, // Force le téléchargement
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': fileSize.toString(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
        });
        
        console.log('✅ Fichier envoyé avec succès (téléchargement forcé)');
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