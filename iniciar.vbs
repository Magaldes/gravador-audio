' Gravador de Audio - Script VBS de Inicializacao
' Suporta execucao via rede e caminhos UNC

Dim objShell, objFSO, strScriptPath, intResult, logFolderPath, logFilePath, electronLogPath
Dim tempLocalPath, userTempDir, hostname

' Criar objetos
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Função utilitária para registrar mensagens em log
Sub LogMessage(message)
    On Error Resume Next
    Dim logFile
    If IsEmpty(logFilePath) Or logFilePath = "" Then Exit Sub
    Set logFile = objFSO.OpenTextFile(logFilePath, 8, True)
    If Err.Number <> 0 Then
        Err.Clear
        Set logFile = objFSO.CreateTextFile(logFilePath, True)
    End If
    If Not logFile Is Nothing Then
        logFile.WriteLine "[" & Now() & "] " & message
        logFile.Close
    End If
    On Error GoTo 0
End Sub

' Obter diretorio do script
strScriptPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Definir diretorio de trabalho
objShell.CurrentDirectory = strScriptPath

' Configurar caminho de log
logFolderPath = strScriptPath & "\logs"
If Not objFSO.FolderExists(logFolderPath) Then
    On Error Resume Next
    objFSO.CreateFolder logFolderPath
    If Err.Number <> 0 Then
        Err.Clear
        logFolderPath = strScriptPath
    End If
    On Error GoTo 0
End If

logFilePath = logFolderPath & "\iniciar_vbs.log"
LogMessage "==== Inicializacao iniciar.vbs ===="
LogMessage "Diretorio do script: " & strScriptPath
tempLocalPath = objShell.ExpandEnvironmentStrings("%TEMP%")
userTempDir = objShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\AppData\Local\Temp"
LogMessage "Temp do sistema: " & tempLocalPath
LogMessage "Temp local do usuario: " & userTempDir
If logFolderPath = strScriptPath Then
    LogMessage "Aviso: nao foi possivel criar pasta dedicada de logs. Usando diretorio do script."
End If

electronLogPath = logFolderPath & "\electron_runtime.log"
On Error Resume Next
Dim electronLogFile
Set electronLogFile = objFSO.OpenTextFile(electronLogPath, 8, True)
If Err.Number <> 0 Then
    Err.Clear
    Set electronLogFile = objFSO.CreateTextFile(electronLogPath, True)
End If
If Not electronLogFile Is Nothing Then
    electronLogFile.WriteLine "==== Execucao Electron: " & Now & " ===="
    electronLogFile.WriteLine "Script host: " & objShell.ExpandEnvironmentStrings("%COMPUTERNAME%")
    If logFolderPath = strScriptPath Then
        electronLogFile.WriteLine "Aviso: log armazenado no diretorio do script (fallback)."
    End If
    electronLogFile.Close
End If
On Error GoTo 0
LogMessage "Log de execucao do Electron: " & electronLogPath

Dim isUNCPath
isUNCPath = False
If Left(strScriptPath, 2) = "\\" Then
    isUNCPath = True
    LogMessage "UNC path detectado para diretorio do script."
End If

' Verificar se Node.js esta disponivel
LogMessage "Verificando Node.js..."
On Error Resume Next
intResult = objShell.Run("node --version", 0, True)
If Err.Number <> 0 Or intResult <> 0 Then
    LogMessage "ERRO: Node.js nao encontrado. ExitCode=" & intResult & " Err=" & Err.Number
    MsgBox "ERRO: Node.js nao esta instalado ou nao esta no PATH do sistema." & vbCrLf & vbCrLf & "Baixe e instale em: https://nodejs.org/", vbCritical, "Gravador de Audio - Erro"
    WScript.Quit 1
Else
    LogMessage "Node.js detectado com sucesso."
End If
On Error GoTo 0

' Verificar se npm esta disponivel
LogMessage "Verificando npm..."
On Error Resume Next
intResult = objShell.Run("npm --version", 0, True)
If Err.Number <> 0 Or intResult <> 0 Then
    LogMessage "ERRO: npm nao encontrado. ExitCode=" & intResult & " Err=" & Err.Number
    MsgBox "ERRO: npm nao esta disponivel.", vbCritical, "Gravador de Audio - Erro"
    WScript.Quit 1
Else
    LogMessage "npm detectado com sucesso."
End If
On Error GoTo 0

' Verificar se node_modules existe, se nao instalar dependencias
If Not objFSO.FolderExists(strScriptPath & "\node_modules") Then
    LogMessage "Dependencias nao encontradas. Executando npm install..."
    MsgBox "Primeira execucao detectada." & vbCrLf & "Instalando dependencias, isso pode levar alguns minutos...", vbInformation, "Gravador de Audio"
    
    intResult = objShell.Run("npm install", 1, True)
    If intResult <> 0 Then
        LogMessage "ERRO: npm install falhou. Codigo=" & intResult
        MsgBox "ERRO: Falha ao instalar dependencias." & vbCrLf & "Codigo de saida: " & intResult, vbCritical, "Gravador de Audio - Erro"
        WScript.Quit 1
    Else
        LogMessage "npm install concluido com sucesso."
    End If
Else
    LogMessage "Dependencias ja instaladas."
End If

' Iniciar a aplicacao
Dim launchCommand
Dim envLogCommand
envLogCommand = "(echo ==== Inicio execucao: %DATE% %TIME% ====>>""" & electronLogPath & """"
envLogCommand = envLogCommand & " & echo Host: %COMPUTERNAME% - Usuario: %USERNAME%>>""" & electronLogPath & """"
envLogCommand = envLogCommand & " & echo Sistema: %OS%>>""" & electronLogPath & """"
envLogCommand = envLogCommand & " & echo Node.js: >>""" & electronLogPath & """"
envLogCommand = envLogCommand & " & node --version >>""" & electronLogPath & """ 2>&1"
envLogCommand = envLogCommand & " & echo npm: >>""" & electronLogPath & """"
envLogCommand = envLogCommand & " & npm --version >>""" & electronLogPath & """ 2>&1)"

If isUNCPath Then
    launchCommand = "cmd.exe /c pushd """ & strScriptPath & """ && " & envLogCommand & " && set ELECTRON_ENABLE_LOGGING=1 && set ELECTRON_ENABLE_STACK_DUMPING=1 && npm start >> """ & electronLogPath & """ 2>&1"
    LogMessage "Iniciando aplicacao via PUSHDir para suporte UNC com logging habilitado..."
Else
    launchCommand = "cmd.exe /c cd /d """ & strScriptPath & """ && " & envLogCommand & " && set ELECTRON_ENABLE_LOGGING=1 && set ELECTRON_ENABLE_STACK_DUMPING=1 && npm start >> """ & electronLogPath & """ 2>&1"
    LogMessage "Iniciando aplicacao (npm start) com logging habilitado..."
End If

LogMessage "Comando executado: " & launchCommand
On Error Resume Next
objShell.Run launchCommand, 0, False
If Err.Number <> 0 Then
    LogMessage "ERRO ao executar comando. Err=" & Err.Number & " Desc=" & Err.Description
    MsgBox "ERRO ao tentar iniciar a aplicacao. Verifique o arquivo de log em '" & logFilePath & "' para detalhes.", vbCritical, "Gravador de Audio - Erro"
    WScript.Quit 1
End If
On Error GoTo 0

LogMessage "npm start disparado em janela separada."

' Limpeza
LogMessage "Script iniciar.vbs finalizado."
Set objShell = Nothing
Set objFSO = Nothing
