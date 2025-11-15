# ============================================
# GRAVADOR DE ÁUDIO v2.0 - SYSTEM REQUIREMENTS
# ============================================
# Data: 12 de Novembro de 2025
# Versão: 2.0
#
# Este arquivo documenta TODOS os requisitos do sistema,
# incluindo software, hardware, permissões e configurações.
#
# Para instalar pacotes Python, use: requirements.txt
# ============================================

## ========================================
## 1. SISTEMA OPERACIONAL
## ========================================

Sistema: Windows 10 (build 1809+) ou Windows 11
Arquitetura: x64 (64 bits)
Server: Windows Server 2016+ (para ambientes corporativos)

## ========================================
## 2. SOFTWARE OBRIGATÓRIO
## ========================================

### Node.js (Runtime JavaScript)
Versão mínima: 18.0.0
Versão recomendada: 18.17.0 ou superior
Download: https://nodejs.org/
Verificar: node --version

### npm (Gerenciador de pacotes Node)
Versão mínima: 8.0.0
Versão recomendada: 9.6.7 ou superior
Incluído com Node.js
Verificar: npm --version

## ========================================
## 3. SOFTWARE INCLUÍDO (NÃO PRECISA INSTALAR)
## ========================================

### FFmpeg (Conversão de áudio)
Localização: ffmpeg/bin/ffmpeg.exe
Versão: 4.4.x (incluído na pasta ffmpeg/)
Status: ✅ JÁ INCLUÍDO - Não precisa instalar
Alternativa: choco install ffmpeg -y (se quiser usar globalmente)
Documentação: Ver FERRAMENTAS_EXTERNAS.md

## ========================================
## 4. SOFTWARE OPCIONAL
## ========================================

### Git (Controle de versão - apenas para desenvolvedores)
Versão: 2.0+
Download: https://git-scm.com/
Verificar: git --version

### VoiceMeeter (Roteamento de áudio virtual)
Versão: Qualquer (Básico, Banana ou Potato)
Download: https://vb-audio.com/Voicemeeter/
Uso: Gravar áudio de aplicações (Teams, Zoom, Spotify)
Status: OPCIONAL - Apenas se precisar gravar áudio do sistema
Documentação: Ver FERRAMENTAS_EXTERNAS.md

### VB-Cable (Driver de áudio virtual)
Download: https://vb-audio.com/Cable/
Uso: Alternativa mais simples ao VoiceMeeter
Status: OPCIONAL

## ========================================
## 5. DEPENDÊNCIAS NPM (Node.js)
## ========================================

### Produção (incluídas em package.json)

@xenova/transformers: ^2.6.5
├─ Descrição: Biblioteca para modelos de ML
├─ Tamanho: ~50 MB
├─ Licença: Apache-2.0
└─ Uso: Funcionalidades futuras de processamento

### Desenvolvimento (incluídas em package.json)

electron: 31.0.0
├─ Descrição: Framework desktop
├─ Tamanho: ~200 MB
├─ Licença: MIT
├─ Node.js embarcado: 18.17.0
├─ Chromium embarcado: 124.0.6367.207
└─ Uso: Runtime principal

electron-builder: 24.6.4
├─ Descrição: Empacotador
├─ Tamanho: ~100 MB
├─ Licença: MIT
└─ Uso: Gerar instaladores .exe

### Instalar dependências npm:
```bash
npm install
```

## ========================================
## 6. DEPENDÊNCIAS PYTHON (OPCIONAIS)
## ========================================

Este projeto é principalmente Node.js/Electron.
Python é OPCIONAL e apenas necessário se você quiser:
- Usar scripts de transcrição automática
- Integrar com serviços de ML
- Processar arquivos em batch

### Para instalar dependências Python (se necessário):
```bash
pip install -r requirements.txt
```

Veja requirements.txt para lista de pacotes Python.

## ========================================
## 7. MÓDULOS NODE.JS NATIVOS (Built-in)
## ========================================

Estes módulos estão incluídos no Node.js:
- fs: Operações com arquivos
- path: Manipulação de caminhos
- child_process: Execução de FFmpeg
- events: Sistema de eventos
- os: Informações do sistema

## ========================================
## 8. APIs WEB UTILIZADAS
## ========================================

Nativas do Electron/Chromium:
- Web Audio API: Captura de áudio
- MediaDevices API: Acesso a microfone
- MediaRecorder API: Gravação de streams
- File API: Manipulação de arquivos
- IPC: Comunicação entre processos

## ========================================
## 9. HARDWARE MÍNIMO
## ========================================

CPU: Dual-core 1.6 GHz ou superior
RAM: 4 GB (mínimo), 8 GB (recomendado)
Disco: 
├─ 500 MB para aplicação
├─ 100 MB por hora de gravação
└─ SSD recomendado para melhor performance

Dispositivos:
├─ Microfone (USB, P2, ou integrado)
├─ Alto-falantes/Fones (opcional, para monitoramento)
└─ Placa de som (integrada ou USB)

## ========================================
## 10. PERMISSÕES NECESSÁRIAS
## ========================================

### Permissões do Sistema:
✅ Acesso ao microfone
   └─ Configurações → Privacidade → Microfone
✅ Leitura/Escrita na pasta do projeto
✅ Leitura/Escrita em recordings/
✅ Leitura/Escrita em logs/
✅ Execução de scripts (.bat, .ps1, .vbs)
✅ Execução de FFmpeg

### Permissões de Rede (se usar em share):
✅ Leitura no share de rede
✅ Escrita no share de rede
✅ Porta SMB 445 aberta
✅ Protocolo SMB/CIFS habilitado

### Permissões Corporativas:
✅ Política de execução PowerShell: RemoteSigned ou Bypass
✅ Antivírus: Adicionar exceção para a pasta (opcional)
✅ Firewall: Permitir Node.js e Electron (se necessário)

## ========================================
## 11. CONFIGURAÇÃO DO AMBIENTE
## ========================================

### Variáveis de Ambiente (opcional):
NODE_ENV=production          # Modo produção
ELECTRON_ENABLE_LOGGING=1    # Logs detalhados (dev)
ELECTRON_ENABLE_STACK_DUMPING=1  # Stack traces (dev)

### PATH do Windows:
Não é necessário adicionar nada ao PATH.
FFmpeg está incluído localmente em ffmpeg/bin/

## ========================================
## 12. PORTAS E REDE
## ========================================

### Portas Utilizadas:
Nenhuma porta de rede é aberta.
A aplicação roda 100% localmente.

### Execução em Rede:
✅ Suportado via UNC paths (\\servidor\pasta\)
✅ Usa protocolo SMB/CIFS (porta 445)
✅ Detecção automática de caminhos de rede
✅ Múltiplos usuários podem executar simultaneamente

## ========================================
## 13. COMPATIBILIDADE DE NAVEGADORES
## ========================================

Electron usa Chromium embarcado:
Versão: 124.0.6367.207 (incluído no Electron 31.0.0)

APIs suportadas:
✅ Web Audio API
✅ MediaRecorder API
✅ MediaDevices API
✅ File API
✅ Promises/Async-Await
✅ ES6+ JavaScript

## ========================================
## 14. INSTALAÇÃO PASSO A PASSO
## ========================================

### Instalação Básica (Usuário Final):

1. Instalar Node.js 18+
   └─ Download: https://nodejs.org/

2. Extrair/Clonar projeto para uma pasta

3. Instalar dependências Node.js:
   ```bash
   cd "d:\Agrotis\Depósito\Apps\Gravador"
   npm install
   ```

4. Executar aplicação:
   ```bash
   # Opção 1: VBScript (silencioso)
   iniciar.vbs

   # Opção 2: Batch (com janela)
   iniciar.bat

   # Opção 3: PowerShell (corporativo)
   iniciar.ps1

   # Opção 4: Desenvolvimento (com logs)
   Gravador.bat
   ```

### Instalação Avançada (com Python - OPCIONAL):

5. Instalar Python 3.8+ (se necessário):
   ```bash
   winget install Python.Python.3.11
   ```

6. Instalar pacotes Python (se necessário):
   ```bash
   pip install -r requirements.txt
   ```

## ========================================
## 15. VERIFICAÇÃO PRÉ-INSTALAÇÃO
## ========================================

### Windows PowerShell:
```powershell
# Verificar versão do PowerShell
$PSVersionTable.PSVersion          # 5.1+ ou 7+

# Verificar Node.js e npm
node --version                     # 18.0.0+
npm --version                      # 8.0.0+

# Verificar se SMB está habilitado (para rede)
Get-Service -Name LanmanWorkstation

# Verificar informações do sistema
systeminfo | Select-String "OS Name|OS Version"
```

### CMD:
```cmd
systeminfo | findstr /C:"OS Name"
node --version
npm --version
```

## ========================================
## 16. TROUBLESHOOTING DE INSTALAÇÃO
## ========================================

### PROBLEMA: "node não é reconhecido"
SOLUÇÃO: Adicionar Node.js ao PATH
Caminho típico: C:\Program Files\nodejs\

### PROBLEMA: "npm install falha com EACCES"
SOLUÇÃO: Executar terminal como Administrador

### PROBLEMA: "Electron não abre"
SOLUÇÃO: Limpar cache e reinstalar
```bash
npm cache clean --force
Remove-Item -Recurse -Force node_modules
npm install
```

### PROBLEMA: "FFmpeg não encontrado"
SOLUÇÃO: Verificar se existe
```powershell
Test-Path "d:\Agrotis\Depósito\Apps\Gravador\ffmpeg\bin\ffmpeg.exe"
```
Se False, o FFmpeg foi removido. Baixe em https://ffmpeg.org/

### PROBLEMA: "Permissão negada ao gravar"
SOLUÇÃO: Ajustar permissões
```powershell
# Dar permissões completas
icacls "recordings" /grant Users:(OI)(CI)F
icacls "logs" /grant Users:(OI)(CI)F
```

### PROBLEMA: "Microfone não detectado"
SOLUÇÃO: 
1. Configurações → Som → Entrada
2. Configurações → Privacidade → Microfone → Permitir acesso

## ========================================
## 17. ESTRUTURA DE ARQUIVOS NECESSÁRIA
## ========================================

### Arquivos Obrigatórios:
```
Gravador/
├── main.js                 ← Obrigatório
├── preload.js              ← Obrigatório
├── package.json            ← Obrigatório
├── renderer/
│   ├── index.html          ← Obrigatório
│   └── renderer.js         ← Obrigatório
└── ffmpeg/
    └── bin/
        └── ffmpeg.exe      ← Obrigatório para conversão
```

### Arquivos Recomendados:
```
├── iniciar.vbs             ← Launcher produção
├── iniciar.bat             ← Launcher simples
├── iniciar.ps1             ← Launcher corporativo
├── Gravador.bat            ← Launcher desenvolvimento
└── requirements.txt        ← Dependências Python (opcional)
```

### Pastas Criadas Automaticamente:
```
├── logs/                   ← Criada na 1ª execução
│   ├── iniciar_vbs.log
│   ├── electron_runtime.log
│   └── app_runtime.log
├── recordings/             ← Criada na 1ª gravação
│   ├── reunioes/
│   ├── treinamentos/
│   └── tickets/
└── node_modules/           ← Criada por npm install
```

## ========================================
## 18. DEPLOY EM PRODUÇÃO
## ========================================

### Opção 1: Share de Rede
```
\\servidor\Apps\Gravador\
├── [todos os arquivos]
├── Permissões: Leitura + Escrita
└── Usuários executam: \\servidor\Apps\Gravador\iniciar.vbs
```

### Opção 2: Instalação Local
```bash
# Copiar para cada máquina
C:\Program Files\Gravador\

# Executar npm install uma vez
cd "C:\Program Files\Gravador"
npm install

# Criar atalho na Área de Trabalho
```

### Opção 3: Compilar para .exe
```bash
# Gerar instalador
npm run build:win

# Distribuir:
dist/Gravador de Áudio Setup 2.0.exe  ← Instalador
dist/Gravador de Áudio 2.0.exe        ← Portável
```

Ver GUIA_DEPLOYMENT.md para detalhes.

## ========================================
## 19. ATUALIZAÇÕES E MANUTENÇÃO
## ========================================

### Atualizar Dependências Node.js:
```bash
npm update
```

### Atualizar Electron:
```bash
npm install electron@latest --save-dev
```

### Atualizar FFmpeg:
1. Download: https://ffmpeg.org/download.html
2. Substituir: ffmpeg/bin/ffmpeg.exe
3. Manter estrutura de pastas

### Backup:
Fazer backup de:
- recordings/ (gravações)
- logs/ (histórico)
- package.json (configuração)
- Todos os arquivos .js, .html

## ========================================
## 20. COMPARAÇÃO: DESENVOLVIMENTO VS PRODUÇÃO
## ========================================

| Aspecto | Desenvolvimento | Produção |
|---------|-----------------|----------|
| **Node.js** | 18.0.0+ | 18.0.0+ |
| **npm modules** | Instalados localmente | Instalados localmente |
| **FFmpeg** | ffmpeg/ local | ffmpeg/ local |
| **Logs** | Terminal visível | Logs em arquivos |
| **Launcher** | Gravador.bat | iniciar.vbs |
| **Permissões** | Admin recomendado | Usuário normal OK |
| **PATH** | Não necessário | Não necessário |
| **Antivírus** | Exceção útil | Exceção opcional |

## ========================================
## 21. REFERÊNCIAS E LINKS
## ========================================

### Software Principal:
- Node.js: https://nodejs.org/
- Electron: https://www.electronjs.org/
- electron-builder: https://www.electron.build/

### Ferramentas Externas:
- FFmpeg: https://ffmpeg.org/
- VoiceMeeter: https://vb-audio.com/Voicemeeter/
- VB-Cable: https://vb-audio.com/Cable/

### Gerenciadores de Pacotes:
- Chocolatey: https://chocolatey.org/
- Winget: https://github.com/microsoft/winget-cli

### Documentação do Projeto:
- README.md: Guia principal
- FERRAMENTAS_EXTERNAS.md: FFmpeg e VoiceMeeter
- GUIA_DEPLOYMENT.md: Deploy em produção
- DESENVOLVIMENTO.md: Modo desenvolvimento

## ========================================
## 22. CHECKLIST DE REQUISITOS
## ========================================

Antes de executar, confirme:
- [ ] Windows 10/11 instalado
- [ ] Node.js 18+ instalado
- [ ] npm 8+ instalado
- [ ] Pasta ffmpeg/bin/ presente
- [ ] Microfone disponível e funcionando
- [ ] Permissões de leitura/escrita na pasta
- [ ] (Rede) Share com permissões configuradas
- [ ] (Rede) Porta 445 aberta (SMB)

Para desenvolvimento adicional:
- [ ] Git instalado (opcional)
- [ ] Editor de código (VS Code, etc)
- [ ] Python 3.8+ (opcional, para scripts)

Para uso avançado:
- [ ] VoiceMeeter instalado (opcional)
- [ ] VB-Cable instalado (opcional)
- [ ] FFmpeg global (opcional)

## ========================================
## 23. NOTAS FINAIS
## ========================================

✅ Este projeto é principalmente Node.js/Electron
✅ Python é OPCIONAL (apenas para scripts auxiliares)
✅ FFmpeg está INCLUÍDO (não precisa instalar)
✅ VoiceMeeter é OPCIONAL (apenas para áudio do sistema)
✅ Funciona em rede (UNC paths)
✅ Múltiplos usuários simultâneos OK
✅ Não requer permissões de administrador (exceto instalação)

Para dúvidas sobre requisitos:
1. Consulte README.md (visão geral)
2. Veja este arquivo (detalhes técnicos)
3. Leia FERRAMENTAS_EXTERNAS.md (FFmpeg/VoiceMeeter)
4. Verifique logs/ (diagnóstico de problemas)

## ========================================
## FIM DO ARQUIVO
## ========================================

Data: 12 de Novembro de 2025
Versão: 2.0
Mantido por: Equipe de Desenvolvimento
