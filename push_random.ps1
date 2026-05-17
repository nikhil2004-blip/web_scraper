$files = git status --porcelain | ForEach-Object { $_ -replace '^[ \t]*[A-Z\?]+[ \t]+', '' }
$files = $files | Sort-Object { Get-Random }
if ($files.Count -eq 0) {
    Write-Host "No changes to commit."
    exit
}
$commits = [math]::Min(10, $files.Count)
$chunkSize = [math]::Ceiling($files.Count / $commits)
for ($i = 0; $i -lt $commits; $i++) {
    $chunk = $files | Select-Object -Skip ($i * $chunkSize) -First $chunkSize
    foreach ($file in $chunk) {
        git add "$file"
    }
    git commit -m "Incremental updates part ($i + 1)"
    if ($i -lt $commits - 1) {
        $sleepTime = Get-Random -Minimum 1 -Maximum 3
        Write-Host "Sleeping for $sleepTime seconds..."
        Start-Sleep -Seconds $sleepTime
    }
}
git push origin main
