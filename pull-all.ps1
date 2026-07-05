[CmdletBinding()]
param(
    [string]$App = "all"
)

. "$PSScriptRoot\scripts\lib\SoftSmith.DevHub.ps1"

$apps = Get-SelectedApps -AppId $App

foreach ($item in $apps) {
    Write-AppHeader $item
    $repoPath = Assert-RepoExists -App $item
    Invoke-Checked -FilePath "git" -Arguments @("pull", "--ff-only") -WorkingDirectory $repoPath -FailureMessage "Pull failed for $($item.name)."
}
