const micSelect = document.getElementById('micSelect');
const systemSelect = document.getElementById('systemSelect');
const recordMode = document.getElementById('recordMode');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const recordStatus = document.getElementById('recordStatus');
const filenameInput = document.getElementById('filenameInput');
const micIndicator = document.getElementById('micIndicator');
const systemIndicator = document.getElementById('systemIndicator');
const subjectType = document.getElementById('subjectType');
const descriptionInput = document.getElementById('descriptionInput');
const filenamePreview = document.getElementById('filenamePreview');

// Estado da gravação
let audioContext;
let mediaRecorderMic;
let mediaRecorderSystem;
let chunksMic = [];
let chunksSystem = [];
let micStream;
let systemStream;

function showStatus(message, type = 'info') {
  recordStatus.textContent = message;
  recordStatus.className = `status show ${type}`;
  setTimeout(() => {
    recordStatus.classList.remove('show');
  }, 5000);
}

function updateFilenamePreview() {
  const type = subjectType.value;
  const description = descriptionInput.value.trim();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let preview = `${type}_${today}`;
  if (description) {
    preview += `_${description}`;
  } else {
    preview += '_[descrição]';
  }
  preview += '.mp3';
  
  filenamePreview.textContent = preview;
}

function generateFilename() {
  const type = subjectType.value;
  const description = descriptionInput.value.trim();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let filename = `${type}_${today}`;
  if (description) {
    filename += `_${description}`;
  }
  
  return filename;
}

async function loadDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const mics = devices.filter(d => d.kind === 'audioinput');

  console.log('=== Dispositivos de Entrada ===');
  mics.forEach(d => console.log(`[Entrada] ${d.label || '(sem rótulo)'} - ${d.deviceId}`));

  micSelect.innerHTML = '';
  systemSelect.innerHTML = '';

  const micPlaceholder = document.createElement('option');
  micPlaceholder.value = '';
  micPlaceholder.textContent = 'Selecione o dispositivo de entrada';
  micSelect.appendChild(micPlaceholder);

  const systemPlaceholder = document.createElement('option');
  systemPlaceholder.value = '';
  systemPlaceholder.textContent = 'Selecione o dispositivo para gravação de sistema/aplicações';
  systemSelect.appendChild(systemPlaceholder);

  // Lista TODOS os dispositivos SEM FILTROS - deixa o usuário escolher
  let defaultMicSelected = false;
  let defaultSystemSelected = false;

  mics.forEach((device, index) => {
    const label = device.label || `Dispositivo ${index + 1}`;

    // Adiciona em ambos os selects
    const micOpt = document.createElement('option');
    micOpt.value = device.deviceId;
    micOpt.textContent = label;
    micSelect.appendChild(micOpt);

    const systemOpt = document.createElement('option');
    systemOpt.value = device.deviceId;
    systemOpt.textContent = label;
    systemSelect.appendChild(systemOpt);

    // Seleciona primeiro dispositivo como padrão em ambos
    if (!defaultMicSelected) {
      micSelect.value = device.deviceId;
      defaultMicSelected = true;
    }
    if (!defaultSystemSelected) {
      systemSelect.value = device.deviceId;
      defaultSystemSelected = true;
    }
  });

  console.log(`✅ ${mics.length} dispositivos de áudio carregados`);

  if (micIndicator) {
    micIndicator.textContent = `${mics.length} entradas detectadas`;
  }
  if (systemIndicator) {
    systemIndicator.textContent = hasVBCable ? 'VB-Cable encontrado ✅' : 'VB-Cable não detectado';
  }
}

function buildAudioConstraints(deviceId) {
  if (!deviceId) {
    return true;
  }
  if (deviceId === 'default') {
    return { deviceId: 'default' };
  }
  return { deviceId: { exact: deviceId } };
}

async function startRecording() {
  try {
    startBtn.disabled = true;
    stopBtn.disabled = false;

    const mode = recordMode.value;
    const micDeviceId = micSelect.value;
    const systemDeviceId = systemSelect.value;

    console.log(`\n🎙️ Iniciando gravação - Modo: ${mode}`);

    // Validação
    if (mode === 'mic-only' && !micDeviceId) {
      throw new Error('Selecione uma entrada para o microfone.');
    }
    if (mode === 'system-only' && !systemDeviceId) {
      throw new Error('Selecione uma entrada para o sistema.');
    }
    if (mode === 'both' && (!micDeviceId || !systemDeviceId)) {
      throw new Error('Selecione entradas para microfone e sistema.');
    }

    // Pega stream de microfone
    if (mode === 'mic-only' || mode === 'both') {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: buildAudioConstraints(micDeviceId)
        });
        console.log('✅ Entrada de microfone capturada');
      } catch (error) {
        console.error('Erro ao capturar microfone:', error);
        showStatus('❌ Não foi possível capturar a entrada do microfone.', 'error');
        throw error;
      }
    }

    // Pega stream de áudio do sistema
    if (mode === 'system-only' || mode === 'both') {
      try {
        systemStream = await navigator.mediaDevices.getUserMedia({
          audio: buildAudioConstraints(systemDeviceId)
        });
        console.log('✅ Entrada de sistema capturada');
      } catch (error) {
        console.error('Erro ao capturar sistema:', error);
        showStatus('❌ Não foi possível capturar a entrada do sistema.', 'error');
        throw error;
      }
    }

    // Inicia gravação(ões)
    chunksMic = [];
    chunksSystem = [];

    if (mode === 'mic-only') {
      mediaRecorderMic = new MediaRecorder(micStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderMic.ondataavailable = e => chunksMic.push(e.data);
      mediaRecorderMic.start();
      console.log('✅ Gravação de microfone iniciada');
    } else if (mode === 'system-only') {
      mediaRecorderSystem = new MediaRecorder(systemStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderSystem.ondataavailable = e => chunksSystem.push(e.data);
      mediaRecorderSystem.start();
      console.log('✅ Gravação de sistema iniciada');
    } else if (mode === 'both') {
      mediaRecorderMic = new MediaRecorder(micStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderMic.ondataavailable = e => chunksMic.push(e.data);
      mediaRecorderMic.start();

      mediaRecorderSystem = new MediaRecorder(systemStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderSystem.ondataavailable = e => chunksSystem.push(e.data);
      mediaRecorderSystem.start();

      console.log('✅ Gravação de microfone e sistema iniciadas');
    }

    showStatus('🎤 Gravando...', 'info');

  } catch (error) {
    console.error('❌ Erro ao iniciar gravação:', error);
    showStatus(`❌ ${error.message}`, 'error');
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

async function stopRecording() {
  stopBtn.disabled = true;
  startBtn.disabled = false;

  const mode = recordMode.value;

  // Para todos os streams
  if (micStream) {
    micStream.getTracks().forEach(t => t.stop());
    micStream = null;
  }
  if (systemStream) {
    systemStream.getTracks().forEach(t => t.stop());
    systemStream = null;
  }

  // Para os recorders
  if (mediaRecorderMic) mediaRecorderMic.stop();
  if (mediaRecorderSystem) mediaRecorderSystem.stop();

  // Aguarda finalização
  await Promise.all([
    new Promise(resolve => {
      if (!mediaRecorderMic) resolve();
      else mediaRecorderMic.onstop = resolve;
    }),
    new Promise(resolve => {
      if (!mediaRecorderSystem) resolve();
      else mediaRecorderSystem.onstop = resolve;
    })
  ]);

  // Gera nome base usando o novo formato
  const baseName = generateFilename();
  const selectedType = subjectType.value;

  try {
    const hasMic = chunksMic.length > 0;
    const hasSystem = chunksSystem.length > 0;

    if (!hasMic && !hasSystem) {
      throw new Error('Nenhum áudio foi capturado.');
    }

    // Caso 1: Apenas entrada (microfone)
    if (hasMic && !hasSystem) {
      const blobMic = new Blob(chunksMic, { type: 'audio/webm' });
      const arrayBufferMic = await blobMic.arrayBuffer();
      const filename = `${baseName}_ENTRADA.mp3`;
      
      await window.electronAPI.saveAudio({
        blobBuffer: arrayBufferMic,
        filename: filename,
        subjectType: selectedType
      });
      
      showStatus(`✅ Gravação concluída!\n📁 ${selectedType}/${baseName}_ENTRADA.mp3`, 'success');
      console.log(`✅ Arquivo salvo: ${selectedType}/${baseName}_ENTRADA.mp3`);
    }

    // Caso 2: Apenas saída (sistema)
    else if (!hasMic && hasSystem) {
      const blobSystem = new Blob(chunksSystem, { type: 'audio/webm' });
      const arrayBufferSystem = await blobSystem.arrayBuffer();
      const filename = `${baseName}_SAIDA.mp3`;
      
      await window.electronAPI.saveAudio({
        blobBuffer: arrayBufferSystem,
        filename: filename,
        subjectType: selectedType
      });
      
      showStatus(`✅ Gravação concluída!\n📁 ${selectedType}/${baseName}_SAIDA.mp3`, 'success');
      console.log(`✅ Arquivo salvo: ${selectedType}/${baseName}_SAIDA.mp3`);
    }

    // Caso 3: Ambas (entrada e saída) - MERGE
    else if (hasMic && hasSystem) {
      showStatus('⏳ Processando áudio... Aguarde...', 'info');

      // Gera nomes temporários para entrada e saída (já com .mp3)
      const tempInputName = `${baseName}_TEMP_ENTRADA.mp3`;
      const tempOutputName = `${baseName}_TEMP_SAIDA.mp3`;

      // Salva arquivos temporários
      const blobMic = new Blob(chunksMic, { type: 'audio/webm' });
      const arrayBufferMic = await blobMic.arrayBuffer();
      await window.electronAPI.saveAudio({
        blobBuffer: arrayBufferMic,
        filename: tempInputName,
        subjectType: selectedType
      });
      console.log(`✅ Arquivo temporário entrada salvo`);

      const blobSystem = new Blob(chunksSystem, { type: 'audio/webm' });
      const arrayBufferSystem = await blobSystem.arrayBuffer();
      await window.electronAPI.saveAudio({
        blobBuffer: arrayBufferSystem,
        filename: tempOutputName,
        subjectType: selectedType
      });
      console.log(`✅ Arquivo temporário saída salvo`);

      // Mescla os arquivos temporários automaticamente
      const mergeResult = await window.electronAPI.mergeAudio({
        file1: tempInputName,
        file2: tempOutputName,
        outputName: `${baseName}.mp3`,
        deleteTemporary: true,  // Flag para deletar temporários
        subjectType: selectedType
      });

      showStatus(`✅ Gravação concluída!\n📁 ${selectedType}/${mergeResult.filename}`, 'success');
      console.log(`✅ Arquivo final mesclado: ${selectedType}/${baseName}.mp3`);
    }

  } catch (error) {
    console.error('Erro ao processar gravação:', error);
    showStatus(`❌ Erro ao salvar: ${error.message}`, 'error');
  }

  // Limpa
  chunksMic = [];
  chunksSystem = [];
  mediaRecorderMic = null;
  mediaRecorderSystem = null;
}


startBtn.onclick = startRecording;
stopBtn.onclick = stopRecording;

// Event listeners para atualizar preview do nome do arquivo
subjectType.addEventListener('change', updateFilenamePreview);
descriptionInput.addEventListener('input', updateFilenamePreview);

// Carrega dispositivos quando a página abre
loadDevices();

// Atualiza preview inicial
updateFilenamePreview();
