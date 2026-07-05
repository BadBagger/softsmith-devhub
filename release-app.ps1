[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string]$App,
    [ValidateSet("internal", "alpha", "beta", "production")] [string]$Track = "internal",
    [string]$Task = "bundleRelease"
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

if ($Track -eq "production") {
    throw "Production publishing is intentionally disabled. Build for internal testing first, then promote manually after review."
}

$item = Find-SoftSmithApp -AppId $App
Write-AppHeader $item

$repoPath = Assert-RepoExists -App $item
$gradle = Get-GradleCommand -RepoPath $repoPath

Write-Host "Release target: $Track"
Write-Host "Building signed Android App Bundle with Gradle task '$Task'."
Write-Host "TODO: Wire signing through local env vars or CI secrets:"
Write-Host "  ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD"
Write-Host "TODO: Add Fastlane or Google Play Publishing API upload later. This script does not publish."

Invoke-Checked -FilePath $gradle -Arguments @($Task) -WorkingDirectory $repoPath -FailureMessage "Release build failed for $($item.name)."

$bundles = Get-ChildItem -Path $repoPath -Recurse -Filter "*.aab" |
    Where-Object { $_.FullName -match "\\build\\outputs\\bundle\\release\\" } |
    Sort-Object LastWriteTime -Descending

if (-not $bundles) {
    throw "Gradle completed, but no release .aab was found under build\outputs\bundle\release."
}

Write-Host "Built release bundle:"
Write-Host $bundles[0].FullName
