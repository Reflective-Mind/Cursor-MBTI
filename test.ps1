# MBTI Insights Test Helper Script
# ==============================

# Color codes for better visibility
$colors = @{
    Success = 'Green'
    Warning = 'Yellow'
    Error = 'Red'
    Info = 'Cyan'
}

# Show fancy header
Write-Host "`n=== MBTI Insights Test Helper ===" -ForegroundColor $colors.Info
Write-Host "==============================`n" -ForegroundColor $colors.Info

# Function to run all validation scripts
function Run-AllValidations {
    Write-Host "Running all validation scripts..." -ForegroundColor $colors.Info
    
    $scripts = @(
        "server/scripts/prevent-mistakes.js",
        "server/scripts/validate-config.js",
        "server/scripts/enforce-structure.js"
    )

    foreach ($script in $scripts) {
        Write-Host "`nRunning $script..." -ForegroundColor $colors.Info
        try {
            node $script
            Write-Host "✓ $script passed" -ForegroundColor $colors.Success
        } catch {
            Write-Host "❌ $script failed:" -ForegroundColor $colors.Error
            Write-Host $_.Exception.Message -ForegroundColor $colors.Error
            return $false
        }
    }

    return $true
}

# Function to run all tests
function Run-AllTests {
    Write-Host "`nRunning all tests..." -ForegroundColor $colors.Info
    
    $tests = @(
        "server/test/verify-mbti-implementation.js",
        "server/test/verify-all.js",
        "server/test/verify-profile-features.js"
    )

    foreach ($test in $tests) {
        Write-Host "`nRunning $test..." -ForegroundColor $colors.Info
        try {
            node $test
            Write-Host "✓ $test passed" -ForegroundColor $colors.Success
        } catch {
            Write-Host "❌ $test failed:" -ForegroundColor $colors.Error
            Write-Host $_.Exception.Message -ForegroundColor $colors.Error
            return $false
        }
    }

    return $true
}

# Function to verify environment files
function Verify-EnvironmentFiles {
    Write-Host "`nVerifying environment files..." -ForegroundColor $colors.Info
    
    $requiredFiles = @(
        "server/.env",
        "server/.env.example",
        "client/.env.development",
        "client/.env.production"
    )

    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "❌ Missing required file: $file" -ForegroundColor $colors.Error
            return $false
        }
    }

    Write-Host "✓ All environment files present" -ForegroundColor $colors.Success
    return $true
}

# Function to verify critical values
function Verify-CriticalValues {
    Write-Host "`nVerifying critical values..." -ForegroundColor $colors.Info
    
    if (-not (Test-Path "docs/CRITICAL_VALUES.md")) {
        Write-Host "❌ CRITICAL_VALUES.md not found!" -ForegroundColor $colors.Error
        return $false
    }

    $content = Get-Content "docs/CRITICAL_VALUES.md" -Raw
    $requiredSections = @(
        "## Render Values",
        "## Vercel Values",
        "## Security Notice",
        "## Change Log"
    )

    foreach ($section in $requiredSections) {
        if (-not ($content -match [regex]::Escape($section))) {
            Write-Host "❌ Missing required section: $section" -ForegroundColor $colors.Error
            return $false
        }
    }

    Write-Host "✓ Critical values verified" -ForegroundColor $colors.Success
    return $true
}

# Main execution
try {
    # Step 1: Verify environment files
    if (-not (Verify-EnvironmentFiles)) {
        Write-Host "`n❌ Environment verification failed" -ForegroundColor $colors.Error
        exit 1
    }

    # Step 2: Verify critical values
    if (-not (Verify-CriticalValues)) {
        Write-Host "`n❌ Critical values verification failed" -ForegroundColor $colors.Error
        exit 1
    }

    # Step 3: Run all validations
    if (-not (Run-AllValidations)) {
        Write-Host "`n❌ Validation checks failed" -ForegroundColor $colors.Error
        exit 1
    }

    # Step 4: Run all tests
    if (-not (Run-AllTests)) {
        Write-Host "`n❌ Tests failed" -ForegroundColor $colors.Error
        exit 1
    }

    Write-Host "`n✅ All tests and validations passed successfully!" -ForegroundColor $colors.Success

} catch {
    Write-Host "`n❌ An error occurred:" -ForegroundColor $colors.Error
    Write-Host $_.Exception.Message -ForegroundColor $colors.Error
    exit 1
} 