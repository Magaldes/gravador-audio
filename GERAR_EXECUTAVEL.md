# 📦 Como Gerar um Executável (.exe) do App

Este guia mostra como transformar seu app Electron em um executável instalável para Windows.

---

## 📝 Passo 1: Instale o `electron-builder`

Abra o terminal PowerShell na pasta do projeto e execute:

```powershell
npm install --save-dev electron-builder
```

---

## 🔧 Passo 2: Configure o `package.json`

Abra seu `package.json` e verifique se contém a seguinte configuração:

```json
{
  "name": "electron-audio-recorder",
  "version": "1.0.0",
  "description": "Gravador de áudio com entrada e saída separadas",
  "main": "main.js",
  "author": "Seu Nome",
  "license": "MIT",
  "homepage": "./",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win --publish never"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^latest"
  },
  "build": {
    "appId": "com.audiorecorder.app",
    "productName": "Gravador de Áudio",
    "directories": {
      "buildResources": "assets"
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "certificateFile": null,
      "certificatePassword": null
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Gravador de Áudio"
    },
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "node_modules/**/*"
    ]
  }
}
```

### Explicação das seções:

- **`scripts`**: Comandos para iniciar e compilar
  - `start`: Executa o app em modo desenvolvimento
  - `build:win`: Gera o executável para Windows

- **`build`**: Configurações de build
  - `appId`: Identificador único da aplicação
  - `productName`: Nome que aparece no instalador
  - `nsis`: Configurações do instalador (permite escolher pasta de instalação, cria atalho na área de trabalho)
  - `files`: Arquivos a incluir no pacote

---

## 🎨 Passo 3: (Opcional) Crie um Ícone

Para uma melhor aparência, você pode adicionar um ícone personalizado:

1. Crie uma pasta chamada `assets` na raiz do projeto:
   ```powershell
   mkdir assets
   ```

2. Coloque um arquivo de imagem **PNG 256x256 pixels** chamado `icon.png` na pasta `assets/`

3. O electron-builder usará este ícone automaticamente

**Se você não tiver um ícone**, o electron-builder criará um ícone padrão.

---

## 🚀 Passo 4: Gere o Executável

No terminal PowerShell, execute:

```powershell
npm run build:win
```

Este comando:
- ✅ Compila a aplicação
- ✅ Gera um instalador interativo (`.exe`)
- ✅ Gera uma versão portável (sem instalação)

A saída será criada na pasta **`dist/`**:

```
dist/
├── Gravador de Áudio 1.0.0.exe (instalador)
└── Gravador de Áudio 1.0.0 Setup.exe (portável)
└── builder-effective-config.yaml
└── [outras dependências]
```

---

## 📋 Checklist de Requisitos

Antes de gerar o executável, verifique:

- ✅ Node.js e npm instalados (`npm --version`)
- ✅ Projeto contém: `main.js`, `preload.js`, `renderer/` 
- ✅ `package.json` atualizado com configuração de build
- ✅ `electron-builder` instalado (`npm list electron-builder`)
- ✅ (Opcional) Ícone em `assets/icon.png`

---

## 🌍 Distribuir para Outro Windows

### Método 1: Instalador (Recomendado)
1. Copie o arquivo `Gravador de Áudio 1.0.0.exe` para outro computador
2. Execute o instalador
3. Siga as instruções na tela
4. A aplicação será instalada com atalhos no menu Iniciar e área de trabalho

### Método 2: Portável (Sem Instalação)
1. Copie o arquivo `Gravador de Áudio 1.0.0.exe` (versão portável) para outro computador
2. Execute diretamente - não requer instalação
3. Pode ser executado de qualquer pasta

---

## ⚠️ Observações Importantes

1. **FFmpeg é necessário**
   - O usuário final precisará instalar FFmpeg
   - Comando: `choco install ffmpeg -y` (com Chocolatey)
   - Ou baixar em: https://ffmpeg.org/download.html

2. **VB-Cable/VoiceMeeter (Opcional)**
   - Se o usuário quiser gravar áudio do sistema, precisará dos drivers
   - VB-Cable: https://vb-audio.com/Cable/
   - VoiceMeeter: https://vb-audio.com/Voicemeeter/

3. **O executável é standalone**
   - ✅ Nenhuma necessidade de Node.js ou npm no outro computador
   - ✅ Todos os arquivos necessários estão inclusos

4. **Tamanho do executável**
   - Esperado: ~250-350 MB (inclui Chromium + Node.js)

---

## 🔄 Atualizações Futuras

Quando quiser gerar uma nova versão:

1. Atualize o `version` no `package.json` (ex: de `1.0.0` para `1.1.0`)
2. Execute novamente: `npm run build:win`
3. O novo `.exe` estará em `dist/`

---

## 🐛 Resolução de Problemas

### Erro: "electron-builder not found"
```powershell
npm install --save-dev electron-builder
npm run build:win
```

### Erro: "Cannot find module 'electron'"
```powershell
npm install
```

### O executável fica muito grande
- Isso é normal (Chromium + runtime)
- Use versão portável para economizar espaço

### O app não funciona no outro Windows
- Verifique se FFmpeg está instalado no outro computador
- Veja a pasta `recordings/` - deve existir
- Teste em um Windows com as mesmas especificações

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs em `dist/builder-effective-config.yaml`
2. Consulte a documentação: https://www.electron.build/
3. Teste o app localmente antes de compilar

---

✅ **Pronto!** Seu app está pronto para distribuição! 🎙️
