[CmdletBinding()]
param(
    [string]$Owner = "BadBagger",
    [switch]$Private,
    [switch]$WhatIf
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$ErrorActionPreference = "Stop"

$token = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "Set a GitHub token first: `$env:GITHUB_TOKEN = 'ghp_...' The token needs repo creation permissions. Do not commit it."
}

$apps = Read-SoftSmithApps
$headers = @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

foreach ($app in $apps) {
    $repoName = $app.id
    $repoApi = "https://api.github.com/repos/$Owner/$repoName"
    Write-AppHeader $app

    try {
        Invoke-RestMethod -Uri $repoApi -Headers $headers -Method Get | Out-Null
        Write-Host "Repo already exists: https://github.com/$Owner/$repoName" -ForegroundColor Green
        continue
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -ne 404) {
            throw
        }
    }

    $body = @{
        name = $repoName
        private = [bool]$Private
        description = "$($app.name) Android app repository managed by SoftSmith DevHub."
        auto_init = $true
    } | ConvertTo-Json

    if ($WhatIf) {
        Write-Host "Would create: https://github.com/$Owner/$repoName"
        continue
    }

    Write-Host "Creating https://github.com/$Owner/$repoName"
    Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $headers -Method Post -Body $body -ContentType "application/json" | Out-Null
}
