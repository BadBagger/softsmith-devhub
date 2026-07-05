[CmdletBinding()]
param(
    [Parameter(Position = 0)] [string]$Command = "help",
    [Parameter(Position = 1)] [string]$Target = "all",
    [Parameter(Position = 2)] [string]$Option = ""
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
SoftSmith DevHub

Usage:
  .\smith.ps1 clone all
  .\smith.ps1 status
  .\smith.ps1 pull all
  .\smith.ps1 build all
  .\smith.ps1 build workday-planner
  .\smith.ps1 test renewal-radar
  .\smith.ps1 bump workday-planner patch
  .\smith.ps1 notes renewal-radar
  .\smith.ps1 release renewal-radar internal
  .\smith.ps1 github create

Safety:
  - Release target defaults to internal testing.
  - Production publishing is blocked.
  - Secrets stay in your local environment or future CI secrets, never in this repo.
"@
}

switch ($Command.ToLowerInvariant()) {
    "clone" {
        & "$PSScriptRoot\clone-all.ps1" -App $Target
    }
    "status" {
        & "$PSScriptRoot\status.ps1" -App $Target
    }
    "pull" {
        & "$PSScriptRoot\pull-all.ps1" -App $Target
    }
    "build" {
        & "$PSScriptRoot\build-all.ps1" -App $Target
    }
    "test" {
        & "$PSScriptRoot\test-all.ps1" -App $Target
    }
    "bump" {
        $bump = if ([string]::IsNullOrWhiteSpace($Option)) { "patch" } else { $Option }
        & "$PSScriptRoot\bump-version.ps1" -App $Target -Bump $bump
    }
    "notes" {
        & "$PSScriptRoot\release-notes.ps1" -App $Target
    }
    "release" {
        $track = if ([string]::IsNullOrWhiteSpace($Option)) { "internal" } else { $Option }
        & "$PSScriptRoot\release-app.ps1" -App $Target -Track $track
    }
    "github" {
        switch ($Target.ToLowerInvariant()) {
            "create" { & "$PSScriptRoot\create-github-repos.ps1" }
            "check" { & "$PSScriptRoot\check-github-repos.ps1" }
            default { Write-Host "Use '.\smith.ps1 github check' or '.\smith.ps1 github create'." }
        }
    }
    default {
        Show-Help
    }
}
