Set-StrictMode -Version Latest

function Get-DevHubRoot {
    if ($PSScriptRoot) {
        return (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
    }

    return (Get-Location).Path
}

function Read-SoftSmithApps {
    param(
        [string]$ConfigPath = (Join-Path (Get-DevHubRoot) "apps.yml")
    )

    if (-not (Test-Path -LiteralPath $ConfigPath)) {
        throw "Could not find apps.yml at $ConfigPath"
    }

    $apps = New-Object System.Collections.Generic.List[object]
    $current = $null

    foreach ($line in Get-Content -LiteralPath $ConfigPath) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith("#") -or $trimmed -eq "apps:") {
            continue
        }

        if ($trimmed.StartsWith("- ")) {
            if ($null -ne $current) {
                $apps.Add([pscustomobject]$current)
            }

            $current = [ordered]@{}
            $trimmed = $trimmed.Substring(2).Trim()
        }

        if ($null -eq $current -or -not $trimmed.Contains(":")) {
            continue
        }

        $parts = $trimmed.Split(":", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        $value = $value.Trim("'`"")
        $current[$key] = $value
    }

    if ($null -ne $current) {
        $apps.Add([pscustomobject]$current)
    }

    return $apps
}

function Resolve-AppPath {
    param(
        [Parameter(Mandatory = $true)] [object]$App,
        [string]$Root = (Get-DevHubRoot)
    )

    if ([System.IO.Path]::IsPathRooted($App.localFolder)) {
        return $App.localFolder
    }

    return (Join-Path $Root $App.localFolder)
}

function Find-SoftSmithApp {
    param(
        [Parameter(Mandatory = $true)] [string]$AppId,
        [object[]]$Apps = (Read-SoftSmithApps)
    )

    $match = $Apps | Where-Object {
        $_.id -eq $AppId -or
        $_.name -eq $AppId -or
        ($_.name -replace '\s+', '-').ToLowerInvariant() -eq $AppId.ToLowerInvariant()
    } | Select-Object -First 1

    if (-not $match) {
        $known = ($Apps | ForEach-Object { $_.id }) -join ", "
        throw "Unknown app '$AppId'. Known apps: $known"
    }

    return $match
}

function Get-SelectedApps {
    param(
        [string]$AppId = "all",
        [object[]]$Apps = (Read-SoftSmithApps)
    )

    if ([string]::IsNullOrWhiteSpace($AppId) -or $AppId -eq "all") {
        return $Apps
    }

    return @(Find-SoftSmithApp -AppId $AppId -Apps $Apps)
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)] [string]$FilePath,
        [Parameter(Mandatory = $true)] [string[]]$Arguments,
        [Parameter(Mandatory = $true)] [string]$WorkingDirectory,
        [string]$FailureMessage = "Command failed."
    )

    Push-Location $WorkingDirectory
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$FailureMessage Exit code: $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

function Get-GradleCommand {
    param(
        [Parameter(Mandatory = $true)] [string]$RepoPath
    )

    $gradlew = Join-Path $RepoPath "gradlew.bat"
    if (Test-Path -LiteralPath $gradlew) {
        return $gradlew
    }

    $gradle = Get-Command "gradle" -ErrorAction SilentlyContinue
    if ($gradle) {
        return $gradle.Source
    }

    throw "No Gradle wrapper found at $gradlew and 'gradle' is not available on PATH."
}

function Assert-RepoExists {
    param(
        [Parameter(Mandatory = $true)] [object]$App
    )

    $repoPath = Resolve-AppPath -App $App
    if (-not (Test-Path -LiteralPath $repoPath)) {
        throw "Repo path does not exist for $($App.name): $repoPath. Run '.\smith.ps1 clone $($App.id)' first."
    }

    if (-not (Test-Path -LiteralPath (Join-Path $repoPath ".git"))) {
        throw "Folder exists but is not a Git repo for $($App.name): $repoPath"
    }

    return $repoPath
}

function Write-AppHeader {
    param([object]$App)

    Write-Host ""
    Write-Host "== $($App.name) [$($App.id)] ==" -ForegroundColor Cyan
}

function Get-AndroidBuildFile {
    param([Parameter(Mandatory = $true)] [string]$RepoPath)

    $candidates = @(
        "app\build.gradle.kts",
        "app\build.gradle",
        "build.gradle.kts",
        "build.gradle"
    ) | ForEach-Object { Join-Path $RepoPath $_ }

    $match = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (-not $match) {
        throw "Could not find an Android Gradle build file in $RepoPath"
    }

    return $match
}
