Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projectDir = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
command = "cmd /c cd /d " & Chr(34) & projectDir & Chr(34) & " && npm run docker:up"
shell.Run command, 0, False
