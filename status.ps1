[CmdletBinding()]
param(
    [string]$App = "all"
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$apps = Get-SelectedApps -AppId $App

foreach ($item in $apps) {
    Write-AppHeader $item
    $repoPath = $null

    try {
        $repoPath = Assert-RepoExists -App $item
        Push-Location $repoPath

        $branch = git branch --show-current
        $commit = git log -1 --pretty=format:"%h %s (%cr)"
        $porcelain = git status --porcelain
        $dirty = if ($porcelain) { "yes" } else { "no" }

        git fetch --quiet
        $upstream = git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null
        if ($LASTEXITCODE -eq 0 -and $upstream) {
            $counts = git rev-list --left-right --count "HEAD...@{u}"
            $aheadBehind = $counts -split "\s+"
            $ahead = $aheadBehind[0]
            $behind = $aheadBehind[1]
        }
        else {
            $ahead = "n/a"
            $behind = "n/a"
            $upstream = "none"
        }

        Write-Host "Path:      $repoPath"
        Write-Host "Branch:    $branch"
        Write-Host "Upstream:  $upstream"
        Write-Host "Changed:   $dirty"
        Write-Host "Ahead:     $ahead"
        Write-Host "Behind:    $behind"
        Write-Host "Latest:    $commit"
    }
    catch {
        Write-Warning $_.Exception.Message
    }
    finally {
        if ($repoPath -and (Get-Location).Path -eq $repoPath) {
            Pop-Location
        }
    }
}
