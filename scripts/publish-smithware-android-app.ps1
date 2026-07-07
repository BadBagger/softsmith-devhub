param(
    [Parameter(Mandatory=$true)][string]$AppRepoPath,
    [Parameter(Mandatory=$true)][string]$AppName,
    [Parameter(Mandatory=$true)][string]$AppId,
    [Parameter(Mandatory=$true)][string]$PackageName,
    [Parameter(Mandatory=$true)][string]$RepoName,
    [Parameter(Mandatory=$true)][string]$ReleaseTag,
    [string]$Owner = "BadBagger",
    [string]$CommitMessage = "Publish Android MVP",
    [string]$ReleaseTitle = "",
    [string]$ReleaseNotes = "Initial Smithware Android MVP release.",
    [string]$SimpleApkName = "",
    [string]$VersionedApkName = "",
    [string]$DevHubRepoPath = "",
    [switch]$UpdateDevHub,
    [string]$Tagline = "Local-first Android MVP",
    [string]$Category = "Tools",
    [string]$Description = "Local-first Smithware Android app.",
    [string]$IconRes = "devhub_logo",
    [string]$PreviewRes = "preview_devhub",
    [string]$AccentRgb = "255, 138, 61",
    [int]$DevHubVersionCode = 0,
    [string]$DevHubReleaseTag = ""
)

$ErrorActionPreference = "Stop"

function Get-Gh {
    $cmd = Get-Command gh -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $fallback = "C:\Program Files\GitHub CLI\gh.exe"
    if (Test-Path $fallback) { return $fallback }
    throw "GitHub CLI was not found on PATH or at $fallback."
}

function Invoke-Checked {
    param([string]$Command, [string]$WorkingDirectory)
    Push-Location $WorkingDirectory
    try {
        Write-Host ">> $Command"
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) { throw "Command failed with exit code ${LASTEXITCODE}: $Command" }
    } finally {
        Pop-Location
    }
}

function Replace-Text {
    param([string]$Path, [string]$Pattern, [string]$Replacement)
    $text = Get-Content $Path -Raw
    $text = $text -replace $Pattern, $Replacement
    Set-Content -Path $Path -Value $text -NoNewline
}

function Insert-Before {
    param([string]$Path, [string]$Needle, [string]$Block)
    $text = Get-Content $Path -Raw
    if ($text.Contains($Block.Trim())) { return }
    $index = $text.IndexOf($Needle)
    if ($index -lt 0) { throw "Could not find insertion point '$Needle' in $Path." }
    $newText = $text.Insert($index, $Block)
    Set-Content -Path $Path -Value $newText -NoNewline
}

function Ensure-LineBefore {
    param([string]$Path, [string]$Line, [string]$Before)
    $text = Get-Content $Path -Raw
    if ($text.Contains($Line.Trim())) { return }
    $index = $text.IndexOf($Before)
    if ($index -lt 0) { throw "Could not find insertion point '$Before' in $Path." }
    $newText = $text.Insert($index, $Line)
    Set-Content -Path $Path -Value $newText -NoNewline
}

$gh = Get-Gh
$appRepo = Resolve-Path $AppRepoPath
if (-not $DevHubRepoPath) {
    $DevHubRepoPath = Resolve-Path (Join-Path $PSScriptRoot "..")
}
$devHubRepo = Resolve-Path $DevHubRepoPath

if (-not $ReleaseTitle) { $ReleaseTitle = "$AppName $ReleaseTag" }
if (-not $SimpleApkName) { $SimpleApkName = ($AppName -replace '[^A-Za-z0-9]', '') + ".apk" }
if (-not $VersionedApkName) { $VersionedApkName = (($AppName -replace '[^A-Za-z0-9]', '') + "-release-$ReleaseTag.apk") }

$javaHome = "C:\Users\KyleB\Documents\Codex\2026-07-04\build-a-native-android-app-using\.local-jdk\jdk-17.0.19+10"
if (Test-Path $javaHome) {
    $env:JAVA_HOME = $javaHome
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

Invoke-Checked ".\gradlew.bat :app:assembleRelease" $appRepo
$apk = Get-ChildItem (Join-Path $appRepo "app\build\outputs\apk\release") -Filter *.apk -File |
    Where-Object { $_.Name -notmatch "unsigned" } |
    Select-Object -First 1
if (-not $apk) { throw "No signed release APK found under app\build\outputs\apk\release." }

Copy-Item $apk.FullName (Join-Path $appRepo $SimpleApkName) -Force
Copy-Item $apk.FullName (Join-Path $appRepo $VersionedApkName) -Force

Push-Location $appRepo
try {
    if (-not (Test-Path ".git")) {
        git init
        git branch -M main
        git config user.name "BadBagger"
        git config user.email "BadBagger@users.noreply.github.com"
    }
    git add .
    if (git status --short) {
        git commit -m $CommitMessage
    }
    & $gh repo view "$Owner/$RepoName" *> $null
    if ($LASTEXITCODE -ne 0) {
        & $gh repo create "$Owner/$RepoName" --public --source . --remote origin --push --description $Description
    } else {
        $remote = git remote
        if (-not ($remote -contains "origin")) {
            git remote add origin "https://github.com/$Owner/$RepoName.git"
        }
        git push -u origin main
    }
    & $gh release view $ReleaseTag --repo "$Owner/$RepoName" *> $null
    if ($LASTEXITCODE -eq 0) {
        & $gh release upload $ReleaseTag $SimpleApkName $VersionedApkName --repo "$Owner/$RepoName" --clobber
    } else {
        & $gh release create $ReleaseTag $SimpleApkName $VersionedApkName --repo "$Owner/$RepoName" --title $ReleaseTitle --notes $ReleaseNotes
    }
    & $gh release view $ReleaseTag --repo "$Owner/$RepoName" --json tagName,assets,url
} finally {
    Pop-Location
}

if ($UpdateDevHub) {
    $appsPath = Join-Path $devHubRepo "apps.yml"
    $contextPath = Join-Path $devHubRepo "PROJECT_CONTEXT.md"
    $manifestPath = Join-Path $devHubRepo "android-app\app\src\main\AndroidManifest.xml"
    $mainActivityPath = Join-Path $devHubRepo "android-app\app\src\main\java\com\softsmith\devhub\MainActivity.java"
    $buildGradlePath = Join-Path $devHubRepo "android-app\app\build.gradle.kts"

    if ((Get-Content $appsPath -Raw) -notmatch [regex]::Escape("id: $AppId")) {
        $entry = @"
  - id: $AppId
    name: $AppName
    repoUrl: https://github.com/$Owner/$RepoName.git
    localFolder: repos/$RepoName
    packageName: $PackageName
    appType: android-compose
    playStoreTrack: internal
    notes: GitHub repo and $ReleaseTag APK release connected.

"@
        Insert-Before $appsPath "  - id: codex-buddy" $entry
    }

    Ensure-LineBefore $manifestPath "        <package android:name=`"$PackageName`" />`r`n" "        <package android:name=`"com.softsmith.codexbuddy`" />"

    $appInfoLine = "        new AppInfo(`"$AppName`", `"$AppId`", `"$Owner`", `"$RepoName`", `"$PackageName`", `"$Tagline`", `"$Category`", `"$Description`", R.drawable.$IconRes, R.drawable.$PreviewRes, Color.rgb($AccentRgb), `"$ReleaseTag`", `"$SimpleApkName`"),`r`n"
    Insert-Before $mainActivityPath "        new AppInfo(`"Codex Buddy`"" $appInfoLine

    $tableLine = "| $AppName | ``$Owner/$RepoName`` | ``$PackageName`` | ``$ReleaseTag`` |`r`n"
    Ensure-LineBefore $contextPath $tableLine "| Codex Buddy |"
    $noteLine = "- $AppName ``$ReleaseTag`` was published at ``https://github.com/$Owner/$RepoName/releases/tag/$ReleaseTag`` with ``$SimpleApkName`` and ``$VersionedApkName``. DevHub metadata was updated for package ``$PackageName``.`r`n"
    Insert-Before $contextPath "- ManagerMeet" $noteLine

    if ($DevHubVersionCode -gt 0 -and $DevHubReleaseTag) {
        Replace-Text $buildGradlePath 'versionCode = \d+' "versionCode = $DevHubVersionCode"
        Replace-Text $buildGradlePath 'versionName = "[^"]+"' "versionName = `"$($DevHubReleaseTag.TrimStart('v'))`""

        Invoke-Checked ".\gradlew.bat :app:assembleRelease" (Join-Path $devHubRepo "android-app")
        $devApk = Get-ChildItem (Join-Path $devHubRepo "android-app\app\build\outputs\apk\release") -Filter *.apk -File |
            Where-Object { $_.Name -notmatch "unsigned" } |
            Select-Object -First 1
        if (-not $devApk) { throw "No signed DevHub APK found." }
        Copy-Item $devApk.FullName (Join-Path $devHubRepo "DevHub.apk") -Force
        Copy-Item $devApk.FullName (Join-Path $devHubRepo "DevHub-release-$DevHubReleaseTag.apk") -Force
    }

    Push-Location $devHubRepo
    try {
        git add apps.yml PROJECT_CONTEXT.md android-app/app/src/main/AndroidManifest.xml android-app/app/src/main/java/com/softsmith/devhub/MainActivity.java android-app/app/build.gradle.kts
        if (git status --short) {
            git commit -m "Connect $AppName to DevHub"
            git push origin main
        }
        if ($DevHubReleaseTag) {
            $devSimple = "DevHub.apk"
            $devVersioned = "DevHub-release-$DevHubReleaseTag.apk"
            & $gh release view $DevHubReleaseTag --repo "$Owner/softsmith-devhub" *> $null
            if ($LASTEXITCODE -eq 0) {
                & $gh release upload $DevHubReleaseTag $devSimple $devVersioned --repo "$Owner/softsmith-devhub" --clobber
            } else {
                & $gh release create $DevHubReleaseTag $devSimple $devVersioned --repo "$Owner/softsmith-devhub" --title "DevHub $DevHubReleaseTag" --notes "Connects $AppName to Smithware Studios DevHub."
            }
            & $gh release view $DevHubReleaseTag --repo "$Owner/softsmith-devhub" --json tagName,assets,url
        }
    } finally {
        Pop-Location
    }
}
