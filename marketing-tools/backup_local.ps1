# JerseyBasket LOCAL versioned backup (independent of OneDrive).
#
# Why: OneDrive decides which copy of a file is "correct". On 16 Nov 2026 it put an older entries.csv back
# over the current one. This script keeps its own dated snapshots on a normal local folder, outside OneDrive,
# so an older file can never overwrite a newer snapshot. It never deletes or overwrites a previous snapshot
# (only prunes the oldest ones beyond -Keep).
#
# Usage (PowerShell):   .\backup_local.ps1                 -> quick snapshot (no videos), keeps the newest 14
#                       .\backup_local.ps1 -Full           -> everything including videos
#                       .\backup_local.ps1 -Dest "E:\JB"   -> put snapshots on another drive (USB / external)
#
param(
  [string]$Dest = "C:\JerseyBasket-Backups",
  [int]$Keep = 14,
  [switch]$Full
)
$ErrorActionPreference = "Continue"
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$snapRoot = Join-Path $Dest "snapshots"
$snap = Join-Path $snapRoot $stamp
New-Item -ItemType Directory -Force $snap | Out-Null
$log = Join-Path $Dest "backup-log.txt"

$sources = @(
  @{ Name = "JERSEYBASKET";  Path = "C:\Users\eamon\OneDrive\Desktop\JERSEYBASKET" },
  @{ Name = "Competition";   Path = "C:\Users\eamon\OneDrive\Desktop\JerseyBasket Competition" },
  @{ Name = "ClaudeMemory";  Path = "C:\Users\eamon\.claude\projects\C--Users-eamon-OneDrive-Desktop-JERSEYBASKET\memory" }
)
$xd = @("node_modules", ".git", "build")
$xf = @()
if (-not $Full) { $xf = @("*.mp4", "*.mov", "*.MOV", "*.MP4", "*.mp3", "*.m4a") }

foreach ($s in $sources) {
  if (-not (Test-Path $s.Path)) { Add-Content $log "$stamp MISSING source $($s.Path)"; continue }
  $target = Join-Path $snap $s.Name
  $args = @($s.Path, $target, "/E", "/R:1", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS", "/NP", "/XD") + $xd
  if ($xf.Count -gt 0) { $args += "/XF"; $args += $xf }
  & robocopy @args | Out-Null
  if ($LASTEXITCODE -ge 8) { Add-Content $log "$stamp robocopy error $LASTEXITCODE for $($s.Name)" }
}

# ---- guard: did a key file shrink compared with the previous snapshot? (what the OneDrive revert looked like)
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
      if ($vb -lt $va) { $alerts += "$($c.Rel) got SMALLER: $va -> $vb ($($c.Type)). Compare it with the previous snapshot $($prev.Name) before doing anything else." }
    }
  }
}
if ($alerts.Count -gt 0) {
  $alerts | Set-Content (Join-Path $snap "ALERT.txt")
  $alerts | ForEach-Object { Write-Host "ALERT: $_" -ForegroundColor Red; Add-Content $log "$stamp ALERT $_" }
}

# ---- prune: keep only the newest $Keep snapshots
$all = Get-ChildItem $snapRoot -Directory | Sort-Object Name
if ($all.Count -gt $Keep) {
  $all | Select-Object -First ($all.Count - $Keep) | ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force }
}
$sizeMb = [math]::Round((Get-ChildItem $snap -Recurse -File | Measure-Object Length -Sum).Sum / 1MB)
Add-Content $log "$stamp snapshot ok ($sizeMb MB, kept $((Get-ChildItem $snapRoot -Directory).Count) snapshots)"
Write-Host "Backup done: $snap ($sizeMb MB). Snapshots kept: $((Get-ChildItem $snapRoot -Directory).Count)"
