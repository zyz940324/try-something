# Desktop-X Pro v5.9 (Zero-Touch Edition)
# One port, one process, total silent automation (Auto-Accept Mode).

$currentDir = $PSScriptRoot
if (-not $currentDir) { $currentDir = Get-Location }
Set-Location $currentDir

# 1. Admin Escalation
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Elevating privileges (Auto-Accepting UAC)..." -ForegroundColor Yellow
    $script = $MyInvocation.MyCommand.Definition
    $parms = "-NoProfile -ExecutionPolicy Bypass -File `"$script`""
    try {
        # Using -WindowStyle Normal to ensure UAC is visible, but logic is non-interactive
        Start-Process powershell.exe -ArgumentList $parms -Verb RunAs -ErrorAction Stop
        exit
    }
    catch {
        Write-Host "Error: System needs Administrator rights to manage processes." -ForegroundColor Red
        Start-Sleep -Seconds 5; exit
    }
}

Write-Host "--- Desktop-X Pro v5.8 Unified ---" -ForegroundColor Cyan

# 2. Automation: Dependency Check (Accept-All)
Write-Host "Syncing environment (Flask, Requests, PSUtil, etc.)..." -ForegroundColor Gray
$py = if (Test-Path "$currentDir\.venv\Scripts\python.exe") { "$currentDir\.venv\Scripts\python.exe" } else { "python" }
try {
    # Adding flask and flask-cors to the list
    Start-Process -FilePath $py -ArgumentList "-m pip install flask flask-cors requests beautifulsoup4 psutil --quiet --disable-pip-version-check --no-input" -Wait -WindowStyle Normal -ErrorAction SilentlyContinue
}
catch { }

# 3. Port Check (Only 8000 now)
$Port = 8000
$busy = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($busy) {
    Write-Host "Port $Port is busy (PID: $($busy.OwningProcess))!" -ForegroundColor Red
    Write-Host "This usually means the server is already running." -ForegroundColor Yellow
    Write-Host "Attempting to open the browser anyway..." -ForegroundColor Gray
    Start-Process "http://localhost:$Port"
    Start-Sleep -Seconds 3; exit
}

# 4. Startup (Single process)
$Process = $null
try {
    Write-Host "[1/2] Starting Unified Server (Port $Port)..." -ForegroundColor Yellow
    
    if (-not (Test-Path "app.py")) { throw "app.py not found!" }

    # Start the unified server
    $Process = Start-Process -FilePath $py -ArgumentList "app.py" -WorkingDirectory $currentDir -WindowStyle Hidden -PassThru -ErrorAction Stop

    # 4. Health Check
    Write-Host "Waiting for server..." -NoNewline
    $IsOk = $false
    $limit = 20
    $start = Get-Date

    while (((Get-Date) - $start).TotalSeconds -lt $limit) {
        Write-Host "." -NoNewline
        try {
            # Using 127.0.0.1 for more reliable local resolution
            $check = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/status" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($check.StatusCode -eq 200) { $IsOk = $true; break }
        }
        catch { }

        if ($Process.HasExited) { throw "Server crashed!" }
        Start-Sleep -Seconds 1
    }

    if ($IsOk) {
        Write-Host "`n[2/2] Success! Opening Dashboard." -ForegroundColor Green
        Start-Process "http://127.0.0.1:$Port"
        
        Write-Host "`n================================================" -ForegroundColor Cyan
        Write-Host " Unified Server is running on Port $Port." -ForegroundColor White
        Write-Host " CLOSE this window to stop all services." -ForegroundColor Gray
        Write-Host "================================================" -ForegroundColor Cyan
        
        while ($true) {
            if ($Process.HasExited) { break }
            Start-Sleep -Seconds 2
        }
    }
    else {
        throw "Startup timeout."
    }

}
catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    pause
}
finally {
    Write-Host "`nShutting down and cleaning up..." -ForegroundColor Yellow
    if ($Process -and -not $Process.HasExited) {
        Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Done." -ForegroundColor Gray
    Start-Sleep -Seconds 1
}
