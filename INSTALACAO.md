# 🔧 Instalação Completa

Guia passo-a-passo para instalar e configurar o Gravador de Áudio.

---

## 📋 Resumo Rápido

**Tempo total**: ~20 minutos

| Software | Obrigatório? | Instalação |
|----------|-------------|------------|
| Node.js 18+ | ✅ SIM | Download oficial |
| FFmpeg | ✅ SIM | ✅ Incluído (ou Chocolatey) |
| VoiceMeeter | ✅ SIM (modo dual) | Download VB-Audio |
| VB-Cable | ✅ SIM (modo dual) | Download VB-Audio |

---

## 🎯 Instalação Passo-a-Passo

### **1. Node.js** (Obrigatório)

```powershell
# Baixe e instale de: https://nodejs.org/
# Versão LTS (v20.x ou v18.x)
# ✅ Marque: "Add to PATH"
# ✅ Reinicie o PC após instalação
```

**Verificar**:
```powershell
node --version  # Deve ser >= v18
npm --version   # Deve ser >= 8
```

---

### **2. FFmpeg** (Obrigatório)

**Opção A - Usar incluído** (Recomendado):
- FFmpeg já está em `ffmpeg/bin/ffmpeg.exe`
- Não precisa instalar nada!

**Opção B - Instalar globalmente**:
```powershell
# PowerShell (Admin)
choco install ffmpeg -y
```

**Verificar**:
```powershell
ffmpeg -version  # Deve imprimir versão
```

---

### **3. VoiceMeeter** (Obrigatório para Modo Dual)

**Por que preciso?** Para gravar áudio do sistema (reuniões, vídeos) + microfone simultaneamente.

#### Instalação:

1. Baixe: https://vb-audio.com/Voicemeeter/
2. Execute o instalador como **Administrador**
3. Clique **Install**
4. **Reinicie o PC** (importante!)

#### Configuração:

```
Abra VoiceMeeter:

1. Hardware Out A1 = seus Alto-falantes/Fones
   (para você escutar)

2. Hardware Input 1 = seu Microfone físico
   (se quiser rotear pelo VoiceMeeter)

3. Virtual Input (VAIO) = receberá áudio do sistema
   (configurado no passo 4)
```

---

### **4. VB-Cable** (Obrigatório para Modo Dual)

**Por que preciso?** Para o VoiceMeeter capturar o áudio do sistema.

#### Instalação Manual:

```powershell
# PowerShell (Admin)
cd $env:TEMP

# Baixa VB-Cable
Invoke-WebRequest -Uri "https://vb-audio.com/Cable/VB-Cable_Driver_Pack43.zip" -OutFile "VB-Cable.zip"

# Extrai
Expand-Archive -Path "VB-Cable.zip" -DestinationPath "VB-Cable" -Force

# Instala
cd VB-Cable
.\VBCABLE_Setup_x64.exe

# Na janela: "Install Driver" → "Install" → "Restart Now"
```

#### Configuração:

```
1. Windows → Configurações de Som
2. Saída padrão = "CABLE Input (VB-Audio Virtual Cable)"
   (áudio do sistema vai para o CABLE)

3. VoiceMeeter:
   - Stereo Input 1 = "CABLE Output"
   - Habilite A1 (você escuta) e B1 (grava)
```

**Verificar**:
```powershell
ffmpeg -list_devices true -f dshow -i dummy 2>&1 | Select-String "CABLE"
# Deve retornar: "CABLE Output (VB-Audio Virtual Cable)"
```

---

### **5. Dependências do Projeto**

No diretório do projeto:

```powershell
cd "d:\Prototipos\Gravador"
npm install
npm start   # ou duplo clique em iniciar.vbs para usuários
```

## Verificações básicas

Execute no PowerShell:

```powershell
node --version    # deve ser >= v18
npm --version     # geralmente >= 8
ffmpeg -version   # deve imprimir versão do ffmpeg
```

## ✅ Configuração Final (Modo Dual)

Para gravar **sistema + microfone** enquanto escuta:

### No Windows:
```
Configurações → Som → Saída
→ Selecione: "CABLE Input (VB-Audio Virtual Cable)"
```

### No VoiceMeeter:
```
1. Stereo Input 1 = "CABLE Output (VB-Audio Virtual Cable)"
   → Habilite: A1 ✅ (escutar) + B1 ✅ (gravar)

2. Hardware Out A1 = "Alto-falantes" ou "Fones"

3. Virtual Input pode ficar desabilitado
   (não é necessário se usar CABLE)
```

### No Gravador:
```
1. Modo de Gravação = "Entrada e Saída"
2. Entrada (Microfone) = seu microfone físico
3. Saída de Áudio = "CABLE Output (VB-Audio Virtual Cable)"
4. Clique Iniciar → Fale e reproduza áudio → Pare
5. Arquivo salvo com MIC + SISTEMA ✅
```

## Troubleshooting

- "node não é reconhecido": reinicie o Windows ou verifique PATH.
- "ffmpeg não é reconhecido": adicione `C:\ffmpeg\bin` ao PATH ou use o ffmpeg incluído em `ffmpeg/bin/` do projeto.
- Se o Gravador não detecta VB-Cable: reinicie o sistema e o Gravador.

## Links úteis

- Node.js: https://nodejs.org/
- FFmpeg: https://ffmpeg.org/download.html
- VoiceMeeter / VB-Cable: https://vb-audio.com/

---

**Última atualização**: 15 de Novembro de 2025
