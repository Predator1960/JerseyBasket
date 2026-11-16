# JerseyBasket LOCAL versioned backup (independent of OneDrive).
#
# The working files now live OUTSIDE OneDrive:  C:\JerseyBasket\JERSEYBASKET  and  C:\JerseyBasket\Competition
# Snapshots go to two separate physical disks:   C:\JerseyBasket-Backups  (internal SSD)
#                                                H:\JerseyBasket-Backups  (external USB disk, skipped if not plugged in)
# A snapshot is never overwritten; only the oldest ones beyond -Keep are pruned.
#
# Usage (PowerShell):   .\backup_local.ps1                -> quick snapshot (no videos) to C: and H:, keeps the newest 14
#                       .\backup_local.ps1 -Full          -> everything including videos
#                       .\backup_local.ps1 -Dest "E:\JB"  -> only this destination (repeat the call for more)
#
param(
  [string[]]$Dest = @("C:\JerseyBasket-Backups", "H:\JerseyBasket-Backups"),
  [int]$Keep = 14,
  [switch]$Full
)
$ErrorActionPreference = "Continue"
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"

$sources = @(
  @{ Name = "JERSEYBASKET";  Path = "C:\JerseyBasket\JERSEYBASKET" },
  @{ Name = "Competition";   Path = "C:\JerseyBasket\Competition" },
  @{ Name = "ClaudeMemory";  Path = "C:\Users\eamon\.claude\projects\C--JerseyBasket-JERSEYBASKET\memory" }
)
$xd = @("node_modules", ".git", "build")
$xf = @()
if (-not $Full) { $xf = @("*.mp4", "*.mov", "*.MOV", "*.MP4", "*.mp3", "*.m4a") }

foreach ($d in $Dest) {
  $drive = Split-Path $d -Qualifier
  if (-not (Test-Path $drive)) { Write-Host "Skipping $d ($drive not available)" -ForegroundColor Yellow; continue }
  $snapRoot = Join-Path $d "snapshots"
  $snap = Join-Path $snapRoot $stamp
  New-Item -ItemType Directory -Force $snap | Out-Null
  $log = Join-Path $d "backup-log.txt"

  foreach ($s in $sources) {
    if (-not (Test-Path $s.Path)) { Add-Content $log "$stamp MISSING source $($s.Path)"; continue }
    $target = Join-Path $snap $s.Name
    $rargs = @($s.Path, $target, "/E", "/R:1", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/XD") + $xd
    if ($xf.Count -gt 0) { $rargs += "/XF"; $rargs += $xf }
    & robocopy @rargs | Out-Null
    if ($LASTEXITCODE -ge 8) { Add-Content $log "$stamp robocopy error $LASTEXITCODE for $($s.Name)" }
  }

  # guard: did a key file shrink compared with the previous snapshot?
  $alerts = @()
  $prev = Get-ChildItem $snapRoot -Directory | Where-Object { $_.Name -lt $stamp } | Sort-Object Name | Select-Object -Last 1
  if ($prev) {
    $checks = @(
      @{ Rel = "Competition\entries.csv"; Type = "lines" },
      @{ Rel = "JERSEYBASKET\marketing-tools\receipt_glossary.csv"; Type = "lines" },
      @{ Rel = "Competition\Nov-Receipt-Log.xlsx"; Type = "size" }
    )
    foreach ($c in $checks) {
      $a = Join-Path $prev.FullName $c.Rel; $b = Join-Path $snap $c.Rel
      if ((Test-Path $a) -and (Test-Path $b)) {
        if ($c.Type -eq "lines") { $va = (Get-Content $a).Count; $vb = (Get-Content $b).Count }
        else { $va = (Get-Item $a).Length; $vb = (Get-Item $b).Length }
        if ($vb -lt $va) { $alerts += "$($c.Rel) got SMALLER: $va -> $vb ($($c.Type)). Compare with the previous snapshot $($prev.Name) before doing anything else." }
      }
    }
  }
  if ($alerts.Count -gt 0) {
    $alerts | Set-Content (Join-Path $snap "ALERT.txt")
    $alerts | ForEach-Object { Write-Host "ALERT ($d): $_" -ForegroundColor Red; Add-Content $log "$stamp ALERT $_" }
  }

  # prune: keep only the newest $Keep snapshots
  $all = Get-ChildItem $snapRoot -Directory | Sort-Object Name
  if ($all.Count -gt $Keep) {
    $all | Select-Object -First ($all.Count - $Keep) | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force }
  }
  $sizeMb = [math]::Round((Get-ChildItem $snap -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)
  Add-Content $log "$stamp snapshot ok ($sizeMb MB, kept $((Get-ChildItem $snapRoot -Directory).Count) snapshots)"
  Write-Host "Backup done: $snap ($sizeMb MB). Snapshots kept: $((Get-ChildItem $snapRoot -Directory).Count)"
}
