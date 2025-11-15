# 🎙️ Gravador de Áudio

![Version](https://img.shields.io/badge/version-1.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightblue)

Aplicação Electron para gravação de áudio em **MP3**, com organização automática e interface simples.

---

## ⚡ Quick Start

### **Usuários Finais** 👥

1. Certifique-se que **Node.js 18+** está instalado
2. Navegue até a pasta do projeto
3. **Clique duplo em `iniciar.vbs`** ✅

---

## ✨ O Que Faz

- ✅ **Grava em MP3** (192 kbps @ 16 kHz)
- ✅ **Organiza por pasta** - Reuniões / Treinamentos / Tickets
- ✅ **Nomeação automática** - `tipo_YYYY-MM-DD_descrição.mp3`
- ✅ **Modo Dual** - Microfone + áudio do sistema
- ✅ **Executa local ou em rede** - UNC paths suportados
- ✅ **Seleção de dispositivos** - Microfone e alto-falantes

---

## ⚠️ Limitações

- ❌ Sem transcrição automática (em desenvolvimento)
- ❌ Sem lista/player de gravações (v1.1)
- ❌ Sem executável standalone (v1.1)
- ❌ Apenas Windows

---

## 📋 Instalação

### Requisitos Básicos

| Software | Obrigatório? | Instalação |
|----------|-------------|------------|
| **Node.js 18+** | ✅ SIM | [nodejs.org](https://nodejs.org/) → LTS → Marque "Add to PATH" |
| **FFmpeg** | ✅ SIM | ❌ Não incluído no projeto |
| **Windows 10/11** | ✅ SIM | — |
| **Microfone** | ✅ SIM | USB ou integrado |

### Para Modo Dual (Gravar Sistema + Mic)

Para gravar **reuniões/chamadas enquanto escuta**:

| Software | Link | Após instalar |
|----------|------|--------------|
| **VoiceMeeter** | [vb-audio.com/Voicemeeter](https://vb-audio.com/Voicemeeter/) | Reinicie o PC |
| **VB-Cable** | [vb-audio.com/Cable](https://vb-audio.com/Cable/) | Reinicie o PC |

**Configuração rápida**:
1. Windows Som → Saída = `CABLE Input`
2. VoiceMeeter → Stereo Input 1 = `CABLE Output` → Habilite A1 + B1
3. App → Saída de Áudio = `CABLE Output`

Veja [`INSTALACAO.md`](INSTALACAO.md) para guia completo.

### Verificar:
```powershell
node --version  # v18+
ffmpeg -version
```

---

## 📁 Estrutura

```
Gravador/
├── main.js                      # Electron main
├── preload.js                   # Security bridge
├── renderer/                    # UI
│   ├── index.html
│   └── renderer.js
├── package.json
├── iniciar.vbs                  # Para usuários (⭐)
├── iniciar.bat
├── iniciar.ps1
├── Gravador.bat                 # Modo desenvolvimento
├── recordings/                  # Gravações (organizado por tipo)
└── logs/                        # Logs automáticos
```

---

## 🎯 Como Usar

1. **Selecione o tipo**: Reunião / Treinamento / Ticket
2. **Adicione descrição** (opcional): "Sprint Planning"
3. **Escolha dispositivos**: Mic e alto-falantes
4. **Clique Iniciar** ▶️ → Fale → Clique Parar ⏹️
5. **Arquivo salvo em**: `recordings/{tipo}/tipo_YYYY-MM-DD_descrição.mp3`

---

---
---
## 📊 Specs

| Propriedade | Valor |
|-------------|-------|
| Formato | MP3 |
| Bitrate | 192 kbps |
| Taxa de Amostragem | 16 kHz |
| Tamanho (1h) | ~30 MB |

---

---

## 🚀 Próximas Versões

- **v1.1** - Executável + Instalador + Player
- **v1.2** - Transcrição básica
- **v2.0** - Multiplataforma

---

## 📄 Licença

MIT

---

**Status**: ✅ Funcional  
**Última atualização**: 15 de Novembro de 2025  
**Versão**: 1.0
