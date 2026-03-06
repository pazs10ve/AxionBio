# AxionBio CI/CD: Multi-Worker Image Build & Push (PowerShell Version)
# Usage: .\scripts\ci-build-push.ps1 -ProjectId "axionbio"

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = $env:GCP_PROJECT_ID,

    [Parameter(Mandatory=$false)]
    [string]$Region = "asia-south1",

    [Parameter(Mandatory=$false)]
    [string]$Repo = "axionbio-workers"
)

# Check if ProjectId is provided; if not, try to load from .env.local
if (-not $ProjectId -and (Test-Path ".env.local")) {
    $envFile = Get-Content ".env.local"
    $match = $envFile | Select-String -Pattern "^GCP_PROJECT_ID=(.*)"
    if ($match) {
        $ProjectId = $match.Matches.Groups[1].Value.Trim().Trim('"').Trim("'")
    }
}

if (-not $ProjectId) {
    Write-Error "Error: ProjectId not set. Pass it as -ProjectId (e.g., .\scripts\ci-build-push.ps1 -ProjectId 'axionbio') or set it in .env.local"
    exit 1
}

Write-Host "Starting AxionBio Worker Build Flow..." -ForegroundColor Cyan
Write-Host "Target: $Region-docker.pkg.dev/$ProjectId/$Repo" -ForegroundColor White

# Iterate through each compute directory
Get-ChildItem -Path "compute" -Directory | ForEach-Object {
    $dir = $_.FullName
    $workerName = $_.Name
    $dockerfile = Join-Path $dir "Dockerfile"

    # Skip the shared directory and anything without a Dockerfile
    if ((Test-Path $dockerfile) -and ($workerName -ne "shared")) {
        # Using curly braces ${workerName} to prevent PowerShell from misinterpreting the :
        $imageTag = "${Region}-docker.pkg.dev/${ProjectId}/${Repo}/${workerName}:latest"
        
        Write-Host "----------------------------------------------------" -ForegroundColor Gray
        Write-Host "Building worker: $workerName" -ForegroundColor Yellow
        Write-Host "Tag: $imageTag" -ForegroundColor White
        
        # Build from the root context
        docker build -t $imageTag -f $dockerfile .
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build $workerName"
            return
        }

        Write-Host "Pushing to Artifact Registry..." -ForegroundColor Green
        docker push $imageTag
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to push $imageTag"
        }
    }
}

Write-Host "`n All workers built and pushed successfully." -ForegroundColor Green
