[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string]$App,
    [string]$Since = "",
    [int]$MaxCount = 30,
    [string]$OutputPath = ""
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$item = Find-SoftSmithApp -AppId $App
Write-AppHeader $item
$repoPath = Assert-RepoExists -App $item

$rangeArgs = @()
if (-not [string]::IsNullOrWhiteSpace($Since)) {
    $rangeArgs += "$Since..HEAD"
}

Push-Location $repoPath
try {
    $commits = git log @rangeArgs "--max-count=$MaxCount" --pretty=format:"- %s (%h)"
    if (-not $commits) {
        $commits = "- No commits found for the selected range."
    }

    $notes = @"
# $($item.name) Release Notes

Track: $($item.playStoreTrack)
Package: $($item.packageName)
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm")

## Changes
$commits

## Pre-release checks
- [ ] Version code and version name bumped.
- [ ] Signed AAB built locally or in CI.
- [ ] Internal testing upload verified.
- [ ] Store listing and screenshots checked if user-visible changes shipped.
- [ ] No production publish step has been run from this hub.
"@

    if ([string]::IsNullOrWhiteSpace($OutputPath)) {
        $safeDate = Get-Date -Format "yyyyMMdd-HHmm"
        $OutputPath = Join-Path (Get-DevHubRoot) "release-notes\$($item.id)-$safeDate.md"
    }

    $parent = Split-Path -Parent $OutputPath
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Set-Content -LiteralPath $OutputPath -Value $notes
    Write-Host "Release notes written to $OutputPath"
}
finally {
    Pop-Location
}
