[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string]$App,
    [ValidateSet("patch", "minor", "major")] [string]$Bump = "patch",
    [int]$VersionCodeIncrement = 1,
    [switch]$AllowDirty
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

function Get-NextVersionName {
    param(
        [Parameter(Mandatory = $true)] [string]$Current,
        [Parameter(Mandatory = $true)] [string]$BumpKind
    )

    if ($Current -notmatch '^(\d+)\.(\d+)\.(\d+)(.*)$') {
        throw "versionName '$Current' is not simple semver like 1.2.3. Update manually or normalize it first."
    }

    $major = [int]$Matches[1]
    $minor = [int]$Matches[2]
    $patch = [int]$Matches[3]
    $suffix = $Matches[4]

    switch ($BumpKind) {
        "major" { $major++; $minor = 0; $patch = 0 }
        "minor" { $minor++; $patch = 0 }
        default { $patch++ }
    }

    return "$major.$minor.$patch$suffix"
}

$item = Find-SoftSmithApp -AppId $App
Write-AppHeader $item
$repoPath = Assert-RepoExists -App $item
$buildFile = Get-AndroidBuildFile -RepoPath $repoPath

Push-Location $repoPath
try {
    $dirtyFiles = git status --porcelain -- $buildFile
    if ($dirtyFiles -and -not $AllowDirty) {
        throw "Build file has uncommitted changes. Commit/stash them first or rerun with -AllowDirty."
    }
}
finally {
    Pop-Location
}

$content = Get-Content -LiteralPath $buildFile -Raw

$codePattern = '(?m)(versionCode\s*[= ]\s*)(\d+)'
$namePattern = '(?m)(versionName\s*[= ]\s*["''])([^"'']+)(["''])'

if ($content -notmatch $codePattern) {
    throw "Could not find versionCode in $buildFile"
}
if ($content -notmatch $namePattern) {
    throw "Could not find versionName in $buildFile"
}

$oldCode = [int]([regex]::Match($content, $codePattern).Groups[2].Value)
$oldName = [regex]::Match($content, $namePattern).Groups[2].Value
$newCode = $oldCode + $VersionCodeIncrement
$newName = Get-NextVersionName -Current $oldName -BumpKind $Bump

$content = [regex]::Replace($content, $codePattern, "`${1}$newCode", 1)
$content = [regex]::Replace($content, $namePattern, "`${1}$newName`${3}", 1)
Set-Content -LiteralPath $buildFile -Value $content -NoNewline

Write-Host "Updated $($item.name)"
Write-Host "versionCode: $oldCode -> $newCode"
Write-Host "versionName: $oldName -> $newName"
Write-Host "File: $buildFile"
