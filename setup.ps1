# setup.ps1 — Run once before `npm run dev`
# Removes conflicting placeholder files created during scaffolding

Write-Host "Cleaning up conflicting placeholder files..." -ForegroundColor Yellow

$filesToDelete = @(
    "app\(public)\page.tsx",        # conflicts with app\page.tsx -> both resolve to /
    "app\(admin)\layout.tsx",        # superseded by app\admin\layout.tsx
    "app\(admin)\login\page.tsx",    # superseded by app\admin\login\page.tsx
    "app\(admin)\dashboard\page.tsx", # superseded by app\admin\dashboard\page.tsx
    "app\(admin)\blogs\page.tsx",    # superseded by app\admin\blogs\page.tsx
    "app\(admin)\blogs\[id]\page.tsx", # superseded by app\admin\blogs\[id]\page.tsx
    "app\(admin)\gallery\page.tsx"   # conflicts with app\(public)\gallery\page.tsx -> both /gallery
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "  Already gone: $file" -ForegroundColor Gray
    }
}

# Remove empty (admin) directories
@("app\(admin)\login", "app\(admin)\blogs\[id]", "app\(admin)\blogs", "app\(admin)\dashboard", "app\(admin)\gallery", "app\(admin)") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Removed dir: $_" -ForegroundColor Green
    }
}

Write-Host "`nSetup complete! Now:" -ForegroundColor Cyan
Write-Host "  1. Copy .env.local.example to .env.local and fill in credentials"
Write-Host "  2. Run: npm run dev"
