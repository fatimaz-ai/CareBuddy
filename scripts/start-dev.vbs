Set objShell = CreateObject("WScript.Shell")
projectDir = "c:\Users\fatim\Downloads\CareBuddy"
objShell.CurrentDirectory = projectDir
objShell.Run "cmd /c cd /d " & Chr(34) & projectDir & Chr(34) & " && npm run dev > dev-server.log 2>&1", 0, False
