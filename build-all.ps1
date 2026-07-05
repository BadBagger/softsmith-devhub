[CmdletBinding()]
param(
    [string]$App = "all",
    [string]$Task = "assembleDebug"
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$apps = Get-SelectedApps -AppId $App
$failures = New-Object System.Collections.Generic.List[string]

foreach ($item in $apps) {
    Write-AppHeader $item

    try {
        $repoPath = Assert-RepoExists -App $item
        $gradle = Get-GradleCommand -RepoPath $repoPath
        Invoke-Checked -FilePath $gradle -Arguments @($Task) -WorkingDirectory $repoPath -FailureMessage "Gradle build failed for $($item.name)."
        Write-Host "Build passed for $($item.name)." -ForegroundColor Green
    }
    catch {
        $failures.Add("$($item.id): $($_.Exception.Message)")
        Write-Warning $_.Exception.Message
    }
}

if ($failures.Count -gt 0) {
    throw "Build failures:`n$($failures -join "`n")"
}
