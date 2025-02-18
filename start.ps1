# MBTI Insights Quick Start Script
# ============================
# Just run '.\start.ps1' to start everything

# Colors for better visibility
$colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
}

# Show welcome message
Clear-Host
Write-Host "`n>> Starting MBTI Insights..." -ForegroundColor $colors.Success
Write-Host "============================`n" -ForegroundColor $colors.Success

# Function to check if port is in use
function Test-Port($port) {
    $result = netstat -an | Select-String "LISTENING" | Select-String ":$port "
    return $null -ne $result
}

# Function to kill process on port
function Kill-Process($port) {
    if (Test-Port $port) {
        Write-Host "Cleaning up port $port..." -ForegroundColor $colors.Warning
        taskkill /F /IM "node.exe" /FI "LISTENING eq $port" 2>$null
    }
}

# Function to open browser
function Open-Browser($url, $retryCount = 3) {
    Write-Host "Opening browser..." -ForegroundColor $colors.Info
    
    for ($i = 1; $i -le $retryCount; $i++) {
        try {
            Start-Process $url
            return $true
        } catch {
            if ($i -eq $retryCount) {
                Write-Host "WARNING: Could not open browser. Please open manually: $url" -ForegroundColor $colors.Warning
                return $false
            }
            Start-Sleep -Seconds 2
        }
    }
}

# Main execution
try {
    # Step 1: Kill existing processes
    Write-Host "Stopping any existing processes..." -ForegroundColor $colors.Info
    Kill-Process 3000
    Kill-Process 10000
    Start-Sleep -Seconds 2

    # Step 2: Start server
    Write-Host "`nStarting server..." -ForegroundColor $colors.Info
    $serverProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -Command `"cd server; npm start`"" -PassThru -WindowStyle Normal

    # Wait for server
    Write-Host "Waiting for server to start..." -ForegroundColor $colors.Info
    $serverReady = $false
    $attempts = 0
    while (-not $serverReady -and $attempts -lt 30) {
        if (Test-Port 10000) {
            $serverReady = $true
        } else {
            $attempts++
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 1
        }
    }

    if (-not $serverReady) {
        throw "Server failed to start. Check server logs for details."
    }

    Write-Host "`n>> Server running on http://localhost:10000" -ForegroundColor $colors.Success

    # Step 3: Start client
    Write-Host "`nStarting client..." -ForegroundColor $colors.Info
    $clientProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -Command `"cd client; npm start`"" -PassThru -WindowStyle Normal

    # Wait for client
    Write-Host "Waiting for client to start..." -ForegroundColor $colors.Info
    $clientReady = $false
    $attempts = 0
    while (-not $clientReady -and $attempts -lt 30) {
        if (Test-Port 3000) {
            $clientReady = $true
        } else {
            $attempts++
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 1
        }
    }

    if (-not $clientReady) {
        throw "Client failed to start. Check client logs for details."
    }

    Write-Host "`n>> Client running on http://localhost:3000" -ForegroundColor $colors.Success

    # Step 4: Open browser
    Start-Sleep -Seconds 2
    Open-Browser "http://localhost:3000"

    # Show success message
    Write-Host "`n>> MBTI Insights is ready!" -ForegroundColor $colors.Success
    Write-Host "   Client: http://localhost:3000" -ForegroundColor $colors.Info
    Write-Host "   Server: http://localhost:10000" -ForegroundColor $colors.Info
    Write-Host "`nPress Ctrl+C to stop all processes.`n" -ForegroundColor $colors.Warning

    # Keep running until Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "`nERROR: $($_.Exception.Message)" -ForegroundColor $colors.Error
    Write-Host "Please check the logs above for more details." -ForegroundColor $colors.Info
} finally {
    # Cleanup on exit
    if ($serverProcess) { Stop-Process -Id $serverProcess.Id -Force }
    if ($clientProcess) { Stop-Process -Id $clientProcess.Id -Force }
    Write-Host "`nAll processes stopped." -ForegroundColor $colors.Success
} 