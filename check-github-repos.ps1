[CmdletBinding()]
param(
    [string]$Owner = "BadBagger"
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$ErrorActionPreference = "Continue"
$apps = Read-SoftSmithApps
$headers = @{
    Accept = "application/vnd.github+json"
    "User-Agent" = "SoftSmith-DevHub"
}

foreach ($app in $apps) {
    Write-AppHeader $app
    $url = "https://api.github.com/repos/$Owner/$($app.id)"

    try {
        $repo = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
        Write-Host "Repo:    exists ($($repo.visibility))" -ForegroundColor Green

        try {
            $release = Invoke-RestMethod -Uri "$url/releases/latest" -Headers $headers -Method Get
            Write-Host "Release: latest $($release.tag_name)" -ForegroundColor Green
        }
        catch {
            Write-Host "Release: none published yet" -ForegroundColor Yellow
        }
    }
    catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "Repo:    missing" -ForegroundColor Yellow
        }
        else {
            Write-Warning "Repo check failed: $($_.Exception.Message)"
        }
    }
}
