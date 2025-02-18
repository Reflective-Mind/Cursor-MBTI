# MBTI Insights Development Helper Script
# ===================================

# Color codes for better visibility
$colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
}

# Show fancy header
Write-Host "`n=== MBTI Insights Development Helper ===" -ForegroundColor $colors.Info
Write-Host "====================================`n" -ForegroundColor $colors.Info

# Function to check if a port is in use
function Test-Port {
    param($port)
    $result = netstat -an | Select-String "LISTENING" | Select-String ":$port "
    return $null -ne $result
}

# Function to kill process on a port
function Kill-ProcessOnPort {
    param($port)
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess | 
               Get-Process
    if ($process) {
        Write-Host "Killing process on port $port (PID: $($process.Id))" -ForegroundColor $colors.Warning
        Stop-Process -Id $process.Id -Force
    }
}

# Function to run validation checks
function Run-ValidationChecks {
    Write-Host "`nRunning validation checks..." -ForegroundColor $colors.Info
    
    # Check if critical values file exists
    if (-not (Test-Path "docs/CRITICAL_VALUES.md")) {
        Write-Host "❌ CRITICAL_VALUES.md not found!" -ForegroundColor $colors.Error
        return $false
    }

    # Run prevent-mistakes script
    Write-Host "Running prevent-mistakes script..." -ForegroundColor $colors.Info
    try {
        node server/scripts/prevent-mistakes.js
    } catch {
        Write-Host "❌ Prevent-mistakes check failed!" -ForegroundColor $colors.Error
        return $false
    }

    Write-Host "✓ Validation checks passed" -ForegroundColor $colors.Success
    return $true
}

# Function to clean development environment
function Clean-DevEnvironment {
    Write-Host "`nCleaning development environment..." -ForegroundColor $colors.Info

    # Kill processes on development ports
    $portsToCheck = @(3000, 10000)
    foreach ($port in $portsToCheck) {
        if (Test-Port $port) {
            Kill-ProcessOnPort $port
            Write-Host "✓ Cleared port $port" -ForegroundColor $colors.Success
        }
    }

    # Clean npm caches if needed
    if (Test-Path "server/node_modules/.cache") {
        Remove-Item -Recurse -Force "server/node_modules/.cache"
    }
    if (Test-Path "client/node_modules/.cache") {
        Remove-Item -Recurse -Force "client/node_modules/.cache"
    }

    Write-Host "✓ Development environment cleaned" -ForegroundColor $colors.Success
}

# Function to start development servers
function Start-DevServers {
    Write-Host "`nStarting development servers..." -ForegroundColor $colors.Info

    # Start server
    $serverProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -Command `"cd server; npm start`"" -PassThru -WindowStyle Normal
    Write-Host "✓ Server starting on port 10000" -ForegroundColor $colors.Success

    # Wait for server to be ready
    $attempts = 0
    $maxAttempts = 30
    while (-not (Test-Port 10000) -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""

    if (-not (Test-Port 10000)) {
        Write-Host "❌ Server failed to start!" -ForegroundColor $colors.Error
        if ($serverProcess) { Stop-Process -Id $serverProcess.Id -Force }
        return $false
    }

    # Start client
    $clientProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -Command `"cd client; npm start`"" -PassThru -WindowStyle Normal
    Write-Host "✓ Client starting on port 3000" -ForegroundColor $colors.Success

    # Wait for client to be ready
    $attempts = 0
    while (-not (Test-Port 3000) -and $attempts -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempts++
        Write-Host "." -NoNewline
    }
    Write-Host ""

    if (-not (Test-Port 3000)) {
        Write-Host "❌ Client failed to start!" -ForegroundColor $colors.Error
        if ($serverProcess) { Stop-Process -Id $serverProcess.Id -Force }
        if ($clientProcess) { Stop-Process -Id $clientProcess.Id -Force }
        return $false
    }

    Write-Host "`n✅ Development environment ready!" -ForegroundColor $colors.Success
    Write-Host "   Server: http://localhost:10000" -ForegroundColor $colors.Info
    Write-Host "   Client: http://localhost:3000" -ForegroundColor $colors.Info
    Write-Host "`nPress Ctrl+C to stop all processes`n" -ForegroundColor $colors.Warning

    return $true
}

# Main execution
try {
    # Step 1: Run validation checks
    if (-not (Run-ValidationChecks)) {
        Write-Host "`n❌ Validation failed. Please fix the issues and try again." -ForegroundColor $colors.Error
        exit 1
    }

    # Step 2: Clean environment
    Clean-DevEnvironment

    # Step 3: Start development servers
    if (-not (Start-DevServers)) {
        Write-Host "`n❌ Failed to start development environment." -ForegroundColor $colors.Error
        exit 1
    }

    # Keep script running and handle Ctrl+C
    try {
        while ($true) { Start-Sleep -Seconds 1 }
    } finally {
        Write-Host "`nStopping development environment..." -ForegroundColor $colors.Warning
        Clean-DevEnvironment
        Write-Host "✓ Development environment stopped" -ForegroundColor $colors.Success
    }

} catch {
    Write-Host "`n❌ An error occurred:" -ForegroundColor $colors.Error
    Write-Host $_.Exception.Message -ForegroundColor $colors.Error
    exit 1
} 