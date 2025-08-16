const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS pour permettre les requêtes depuis Framer
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Configuration des dossiers
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const CONVERTED_DIR = path.join(__dirname, 'converted');

// Créer les dossiers s'ils n'existent pas
[UPLOAD_DIR, CONVERTED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500 MB limite (augmentée)
    },
    fileFilter: (req, file, cb) => {
        // Vérifier les types MIME et extensions autorisées
        const allowedMimes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
            'audio/mp4', 'audio/x-m4a', 'audio/ogg',
            'video/mp4', 'video/quicktime', 'video/webm'
        ];
        
        const allowedExts = ['.mp3', '.wav', '.m4a', '.ogg', '.mp4', '.mov', '.webm'];
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        if (allowedMimes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error('Format de fichier non supporté. Utilisez MP3, WAV, M4A, OGG, MP4, MOV ou WEBM.'));
        }
    }
});

// Middleware pour servir les fichiers statiques avec headers de téléchargement
app.use('/converted', (req, res, next) => {
    // Forcer le téléchargement au lieu de l'ouverture dans le navigateur
    const filename = path.basename(req.path);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    next();
}, express.static(CONVERTED_DIR));

// Route pour servir le front-end
app.get('/', (req, res) => {
    const htmlContent = `<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Convertir en Voice Telegram</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 30px;
            width: 100%;
            max-width: 720px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 24px;
            text-align: center;
        }
        
        .help {
            color: #666;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: center;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        
        input[type="file"] {
            width: 100%;
            padding: 10px;
            border: 2px dashed #ddd;
            border-radius: 4px;
            background-color: #fafafa;
            cursor: pointer;
        }
        
        input[type="file"]:focus {
            outline: 2px solid #007bff;
            outline-offset: 2px;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        button:hover:not(:disabled) {
            background-color: #0056b3;
        }
        
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        #status {
            margin-top: 20px;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            border-radius: 4px;
            display: none;
        }
        
        #status.ok {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            display: block;
        }
        
        #status.err {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            display: block;
        }
        
        #status.loading {
            background-color: #cce7ff;
            color: #004085;
            border: 1px solid #b8daff;
            display: block;
        }
        
        #result {
            margin-top: 20px;
            text-align: center;
        }
        
        #result a {
            display: inline-block;
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
        }
        
        #result a:hover {
            background-color: #218838;
        }
        
        @media (max-width: 480px) {
            .card {
                padding: 20px;
            }
            
            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Convertir en "Voice" Telegram</h1>
        <p class="help">
            Formats acceptés : MP3, WAV, M4A, OGG, MP4, MOV, WEBM
        </p>
        
        <form id="form" action="/upload" method="post" enctype="multipart/form-data">
            <div class="form-group">
                <label for="file">Choisir un fichier :</label>
                <input 
                    type="file" 
                    name="file" 
                    id="file" 
                    required 
                    accept=".mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm"
                    aria-describedby="help-text"
                >
            </div>
            
            <button type="submit" id="submit-btn">Convertir</button>
        </form>
        
        <div id="status" role="status" aria-live="polite"></div>
        <div id="result"></div>
    </div>

    <script>
        const form = document.getElementById('form');
        const submitBtn = document.getElementById('submit-btn');
        const status = document.getElementById('status');
        const result = document.getElementById('result');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset previous results
            status.className = '';
            status.style.display = 'none';
            result.innerHTML = '';
            
            // Show loading state
            status.textContent = 'Conversion en cours…';
            status.className = 'loading';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Conversion...';
            
            try {
                const formData = new FormData(form);
                
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    let errorMessage = 'Erreur ' + response.status;
                    try {
                        const errorData = await response.json();
                        if (errorData.error) {
                            errorMessage = errorData.error;
                        }
                    } catch {
                        const errorText = await response.text();
                        if (errorText) {
                            errorMessage = errorText;
                        }
                    }
                    throw new Error(errorMessage);
                }
                
                const data = await response.json();
                
                if (!data.download_url) {
                    throw new Error('Réponse invalide : URL de téléchargement manquante');
                }
                
                // Show success
                status.textContent = 'Conversion réussie !';
                status.className = 'ok';
                
                // Show download link
                result.innerHTML = \`<a href="\${data.download_url}" download>Télécharger le fichier .oga</a>\`;
                
            } catch (error) {
                // Show error
                status.textContent = error.message;
                status.className = 'err';
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Convertir';
            }
        });
    </script>
</body>
</html>`;
    
    res.send(htmlContent);
});

// Route pour l'upload et la conversion
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        // Vérifier si un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({
                error: 'Aucun fichier fourni'
            });
        }

        const inputPath = req.file.path;
        const outputFileName = `${path.parse(req.file.filename).name}.oga`;
        const outputPath = path.join(CONVERTED_DIR, outputFileName);

        console.log(`Début de conversion: ${req.file.originalname} -> ${outputFileName}`);

        // Conversion avec FFmpeg vers format OGA (Opus) - optimisée pour gros fichiers
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('oga')
                .audioCodec('libopus')
                .audioBitrate('64k')
                .audioChannels(1) // Mono pour réduire la taille
                .audioFrequency(16000) // Fréquence optimisée pour la voix
                .outputOptions([
                    '-compression_level 10', // Compression maximale
                    '-frame_duration 60',     // Optimisation Opus
                    '-application voip'       // Mode voix optimisé
                ])
                .on('start', (commandLine) => {
                    console.log('Commande FFmpeg:', commandLine);
                })
                .on('progress', (progress) => {
                    const percent = Math.round(progress.percent || 0);
                    console.log(`Progression: ${percent}% - Temps: ${progress.timemark || 'N/A'}`);
                })
                .on('end', () => {
                    console.log('Conversion terminée avec succès');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Erreur FFmpeg:', err);
                    reject(err);
                })
                .save(outputPath);
        });

        // Supprimer le fichier original pour économiser l'espace
        fs.unlink(inputPath, (err) => {
            if (err) {
                console.warn('Impossible de supprimer le fichier original:', err);
            } else {
                console.log('Fichier original supprimé:', inputPath);
            }
        });

        // Retourner l'URL de téléchargement
        const downloadUrl = `/converted/${outputFileName}`;
        
        res.json({
            download_url: downloadUrl,
            message: 'Conversion réussie',
            originalName: req.file.originalname,
            outputName: outputFileName
        });

    } catch (error) {
        console.error('Erreur lors de la conversion:', error);
        
        // Nettoyer en cas d'erreur
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
        }

        // Déterminer le message d'erreur approprié
        let errorMessage = 'Erreur lors de la conversion du fichier';
        
        if (error.message.includes('Invalid data found')) {
            errorMessage = 'Format de fichier invalide ou corrompu';
        } else if (error.message.includes('No such file')) {
            errorMessage = 'Fichier non trouvé';
        } else if (error.message.includes('Permission denied')) {
            errorMessage = 'Erreur de permissions sur le serveur';
        }

        res.status(500).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Gestionnaire d'erreur pour multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Fichier trop volumineux. Limite : 500 MB'
            });
        }
        return res.status(400).json({
            error: 'Erreur lors de l\'upload: ' + error.message
        });
    }
    
    if (error.message.includes('Format de fichier')) {
        return res.status(400).json({
            error: error.message
        });
    }
    
    res.status(500).json({
        error: 'Erreur interne du serveur'
    });
});

// Route 404 pour toutes les autres requêtes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route non trouvée'
    });
});

// Fonction de nettoyage automatique des anciens fichiers (optionnel)
function cleanupOldFiles() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
    const now = Date.now();
    
    [UPLOAD_DIR, CONVERTED_DIR].forEach(dir => {
        fs.readdir(dir, (err, files) => {
            if (err) return;
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlink(filePath, (err) => {
                            if (!err) {
                                console.log(`Fichier ancien supprimé: ${file}`);
                            }
                        });
                    }
                });
            });
        });
    });
}

// Nettoyage automatique toutes les 6 heures
setInterval(cleanupOldFiles, 6 * 60 * 60 * 1000);

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📁 Dossier uploads: ${UPLOAD_DIR}`);
    console.log(`📁 Dossier converted: ${CONVERTED_DIR}`);
    console.log(`🌐 Ouvrez votre navigateur sur: http://localhost:${PORT}`);
    
    // Vérifier que FFmpeg est installé
    ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
            console.error('⚠️ Attention: FFmpeg semble ne pas être installé ou accessible');
            console.error('Installez FFmpeg: https://ffmpeg.org/download.html');
        } else {
            console.log('✅ FFmpeg détecté et prêt');
        }
    });
});