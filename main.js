const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile, spawn } = require('child_process');
const os = require('os');

// Função para obter o diretório base da aplicação de forma robusta
function getAppDirectory() {
  // Em desenvolvimento e execução normal, usa __dirname
  // Em aplicação empacotada (electron-builder, electron-packager), pode ser diferente
  let appDir = __dirname;
  
  // Verificar se estamos em uma aplicação empacotada
  if (process.resourcesPath) {
    // Se existe resourcesPath, estamos empacotados
    // Mas ainda queremos usar o diretório onde está o executável principal
    appDir = path.dirname(process.execPath);
    
    // Verificar se existe package.json no diretório atual (não empacotado)
    if (fs.existsSync(path.join(__dirname, 'package.json'))) {
      appDir = __dirname;
    }
  }
  
  console.log(`📁 Diretório base detectado: ${appDir}`);
  console.log(`📁 __dirname: ${__dirname}`);
  console.log(`📁 process.execPath: ${process.execPath}`);
  console.log(`📁 process.resourcesPath: ${process.resourcesPath || 'N/A'}`);
  
  return appDir;
}

// Diretório base da aplicação
const APP_BASE_DIR = getAppDirectory();

// Configura diretório de logs e função de log
const LOG_DIR = path.join(APP_BASE_DIR, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (error) {
    console.error('Não foi possível criar diretório de logs:', error.message);
  }
}

const APP_LOG_FILE = path.join(LOG_DIR, 'app_runtime.log');

function logToFile(message, data) {
  const timestamp = new Date().toISOString();
  let line = `[${timestamp}] ${message}`;
  if (data) {
    try {
      line += ` | ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
    } catch (error) {
      line += ` | (erro ao serializar dados: ${error.message})`;
    }
  }
  line += '\n';

  try {
    fs.appendFileSync(APP_LOG_FILE, line, 'utf8');
  } catch (err) {
    console.error('Falha ao escrever log de app:', err.message);
  }

  console.log(message, data ? data : '');
}

logToFile('Aplicação inicializando...', {
  appBaseDir: APP_BASE_DIR,
  electronVersion: process.versions.electron,
  chromeVersion: process.versions.chrome,
  nodeVersion: process.versions.node,
  platform: process.platform,
  arch: process.arch,
  cwd: process.cwd(),
});

process.on('uncaughtException', (error) => {
  logToFile('uncaughtException capturada', {
    message: error.message,
    stack: error.stack,
  });
});

process.on('unhandledRejection', (reason) => {
  logToFile('unhandledRejection capturada', {
    reason: reason && reason.message ? reason.message : String(reason),
    stack: reason && reason.stack ? reason.stack : null,
  });
});

// Detecta caminho do FFmpeg
function getFfmpegPath() {
  // Locais comuns no Windows
  const commonPaths = [
    'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',  // Chocolatey (mais comum)
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
    'C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe',
    path.join(process.env.ProgramFiles, 'ffmpeg\\bin\\ffmpeg.exe'),
    path.join(process.env['ProgramFiles(x86)'], 'ffmpeg\\bin\\ffmpeg.exe'),
  ];

  console.log('🔍 Procurando FFmpeg...');

  // Primeiro, tenta encontrar no diretório local (se compilado)
  const localDir = path.join(APP_BASE_DIR, 'ffmpeg-8.0', 'bin');
  const localExe = path.join(localDir, 'ffmpeg.exe');
  console.log(`  ├─ Verificando local: ${localExe}`);
  if (fs.existsSync(localExe)) {
    console.log(`✅ FFmpeg encontrado localmente: ${localExe}`);
    return localExe;
  }

  // Depois, procura nos caminhos comuns
  for (const p of commonPaths) {
    console.log(`  ├─ Verificando: ${p}`);
    if (fs.existsSync(p)) {
      console.log(`✅ FFmpeg encontrado em: ${p}`);
      return p;
    }
  }

  // Por último, tenta usar do PATH do sistema
  console.log('  └─ Tentando usar PATH do sistema...');
  console.log('⚠️ FFmpeg não encontrado localmente, tentando usar do PATH do sistema');
  return 'ffmpeg';
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(APP_BASE_DIR, 'preload.js'),
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(APP_BASE_DIR, 'renderer', 'index.html'));

  win.webContents.on('render-process-gone', (event, details) => {
    logToFile('render-process-gone', {
      reason: details && details.reason,
      exitCode: details && details.exitCode,
    });
  });

  win.webContents.on('unresponsive', () => {
    logToFile('Janela ficou sem resposta', null);
  });

  win.on('closed', () => {
    logToFile('Janela principal fechada.', null);
  });
}

app.whenReady().then(() => {
  createWindow();

  // Log inicial para debug
  logToFile('Aplicação pronta.', {
    appBaseDir: APP_BASE_DIR,
    pathEnv: process.env.PATH,
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  logToFile('Todos os windows fechados. Encerrando?', { platform: process.platform });
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', (event) => {
  logToFile('Evento before-quit acionado.', { reason: event ? 'manual' : 'unknown' });
});

app.on('quit', (event, exitCode) => {
  logToFile('Aplicação encerrada.', { exitCode });
});

// Recebe blob do renderer e salva como .mp3 (WebM renomeado)
ipcMain.handle('save-audio', async (event, { blobBuffer, filename, subjectType }) => {
  return new Promise((resolve, reject) => {
    const recordingsDir = path.join(APP_BASE_DIR, 'recordings');
    
    // Cria diretório principal se não existir
    if (!fs.existsSync(recordingsDir)) {
      fs.mkdirSync(recordingsDir, { recursive: true });
    }

    // Cria subdiretório para o tipo de assunto se especificado
    let targetDir = recordingsDir;
    if (subjectType) {
      targetDir = path.join(recordingsDir, subjectType);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Pasta criada: ${targetDir}`);
      }
    }

    // Define caminho final
    // Se for .webm, mantém; se for .webm, converte para .mp3
    const outputFilename = filename.replace('.webm', '.mp3');
    const outputPath = path.join(targetDir, outputFilename);

    try {
      // Salva arquivo (WebM renomeado para .mp3 ou com nome original)
      fs.writeFileSync(outputPath, Buffer.from(blobBuffer));
      
      console.log(`✅ Arquivo salvo: ${outputPath}`);
      
      resolve({
        success: true,
        path: outputPath,
        message: `Áudio salvo como ${outputFilename}!`,
        filename: outputFilename
      });
    } catch (error) {
      console.error('Erro ao salvar áudio:', error);
      reject(new Error(`Falha ao salvar: ${error.message}`));
    }
  });
});

// Mescla dois arquivos de áudio em um só
ipcMain.handle('merge-audio', async (event, { file1, file2, outputName, deleteTemporary = false, subjectType }) => {
  return new Promise((resolve, reject) => {
    const recordingsDir = path.join(APP_BASE_DIR, 'recordings');
    
    // Define diretório de trabalho baseado no tipo de assunto
    let workingDir = recordingsDir;
    if (subjectType) {
      workingDir = path.join(recordingsDir, subjectType);
      if (!fs.existsSync(workingDir)) {
        fs.mkdirSync(workingDir, { recursive: true });
        console.log(`📁 Pasta criada: ${workingDir}`);
      }
    }
    
    const inputFile1 = path.join(workingDir, file1);
    const inputFile2 = path.join(workingDir, file2);
    const outputFile = path.join(workingDir, outputName.replace('.webm', '.mp3'));

    // Verifica se os arquivos existem
    if (!fs.existsSync(inputFile1)) {
      return reject(new Error(`Arquivo não encontrado: ${file1}`));
    }
    if (!fs.existsSync(inputFile2)) {
      return reject(new Error(`Arquivo não encontrado: ${file2}`));
    }

    const ffmpegPath = getFfmpegPath();
    console.log(`🎬 Usando FFmpeg: ${ffmpegPath}`);

    // Cria um filtro para mesclar SEM alterar ganho
    // amerge: mescla os dois streams de áudio em estéreo
    // c0 = entrada 1 canal L, c1 = entrada 1 canal R
    // c2 = entrada 2 canal L, c3 = entrada 2 canal R
    const ffmpegArgs = [
      '-i', inputFile1,      // Entrada 1 (microfone)
      '-i', inputFile2,      // Entrada 2 (sistema)
      '-filter_complex',
      '[0:a][1:a]amerge=inputs=2[a]',
      '-map', '[a]',         // Mapeia o áudio mesclado (sem alterações)
      '-c:a', 'libmp3lame',  // Codec MP3
      '-q:a', '4',           // Qualidade (4 = ~192kbps)
      '-y',                  // Sobrescreve arquivo se existir
      outputFile
    ];

    console.log(`📝 Executando: ${ffmpegPath} ${ffmpegArgs.join(' ')}`);

    // Executa FFmpeg
    const ffmpeg = spawn(ffmpegPath, ffmpegArgs);
    let stdout = '';
    let stderr = '';

    ffmpeg.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      // FFmpeg usa stderr para progresso
      if (data.toString().includes('error') || data.toString().includes('Error')) {
        console.error('FFmpeg stderr:', data.toString());
      }
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ FFmpeg falhou com código ${code}`);
        console.error('Stderr:', stderr);
        return reject(new Error(`FFmpeg falhou: ${stderr || 'Código ' + code}`));
      }

      if (fs.existsSync(outputFile)) {
        console.log(`✅ Áudio mesclado: ${outputFile}`);
        
        // Deleta arquivos temporários se solicitado
        if (deleteTemporary) {
          try {
            if (fs.existsSync(inputFile1)) {
              fs.unlinkSync(inputFile1);
              console.log(`🗑️  Arquivo temporário deletado: ${file1}`);
            }
            if (fs.existsSync(inputFile2)) {
              fs.unlinkSync(inputFile2);
              console.log(`🗑️  Arquivo temporário deletado: ${file2}`);
            }
          } catch (error) {
            console.error(`⚠️  Erro ao deletar arquivo temporário: ${error.message}`);
          }
        }
        
        resolve({
          success: true,
          path: outputFile,
          filename: path.basename(outputFile),
          message: `Áudio mesclado com sucesso!`
        });
      } else {
        reject(new Error('Arquivo de saída não foi criado'));
      }
    });

    ffmpeg.on('error', (error) => {
      console.error('❌ Erro ao executar FFmpeg:', error);
      reject(new Error(`Erro ao executar FFmpeg: ${error.message}`));
    });
  });
});

// Lista arquivos de gravação
ipcMain.handle('list-recordings', async (event) => {
  return new Promise((resolve, reject) => {
    const recordingsDir = path.join(APP_BASE_DIR, 'recordings');
    
    if (!fs.existsSync(recordingsDir)) {
      return resolve([]);
    }

    try {
      let allFiles = [];
      
      // Lista arquivos na pasta principal
      const mainFiles = fs.readdirSync(recordingsDir)
        .filter(f => f.endsWith('.mp3'))
        .map(f => ({ name: f, value: f, folder: 'principal' }));
      
      allFiles = allFiles.concat(mainFiles);
      
      // Lista arquivos nas subpastas (reunioes, treinamentos, tickets)
      const subjectTypes = ['reunioes', 'treinamentos', 'tickets'];
      
      for (const subjectType of subjectTypes) {
        const subjectDir = path.join(recordingsDir, subjectType);
        if (fs.existsSync(subjectDir)) {
          const subjectFiles = fs.readdirSync(subjectDir)
            .filter(f => f.endsWith('.mp3'))
            .map(f => ({ 
              name: `${subjectType}/${f}`, 
              value: `${subjectType}/${f}`, 
              folder: subjectType 
            }));
          
          allFiles = allFiles.concat(subjectFiles);
        }
      }
      
      // Ordena por nome
      allFiles.sort((a, b) => b.name.localeCompare(a.name));
      
      console.log(`📁 ${allFiles.length} arquivo(s) encontrado(s) em todas as pastas`);
      resolve(allFiles);
    } catch (error) {
      reject(new Error(`Erro ao listar gravações: ${error.message}`));
    }
  });
});

