$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $PSScriptRoot "start-uxfocus.vbs"
$startupDir = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupDir "UX Focus V2.lnk"

if (-not (Test-Path -LiteralPath $launcher)) {
    throw "Launcher not found: $launcher"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:SystemRoot "System32\wscript.exe"
$shortcut.Arguments = '"' + $launcher + '"'
$shortcut.WorkingDirectory = $projectDir
$shortcut.Description = "Start UX Focus V2 and its Docker container"
$shortcut.Save()

Write-Output "Installed Windows startup shortcut: $shortcutPath"
