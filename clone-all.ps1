[CmdletBinding()]
param(
    [string]$App = "all"
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$apps = Get-SelectedApps -AppId $App
$root = Get-DevHubRoot

foreach ($item in $apps) {
    Write-AppHeader $item
    $repoPath = Resolve-AppPath -App $item -Root $root

    if (Test-Path -LiteralPath $repoPath) {
        Write-Host "Already exists: $repoPath"
        continue
    }

    $parent = Split-Path -Parent $repoPath
    New-Item -ItemType Directory -Force -Path $parent | Out-Null

    Write-Host "Cloning $($item.repoUrl) into $repoPath"
    git clone $item.repoUrl $repoPath
    if ($LASTEXITCODE -ne 0) {
        throw "Clone failed for $($item.name). Check GitHub access and repo URL."
    }
}
