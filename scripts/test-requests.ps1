# Simple PowerShell script to exercise the API endpoints
param(
  [string]$base = "http://localhost:3000"
)

Write-Host "Register Alice"
$r = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register" -Body (@{name='Alice';email='alice@example.com';password='pass123'} | ConvertTo-Json) -ContentType 'application/json'
Write-Host "Token:" $r.token

Write-Host "Login Alice"
$l = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -Body (@{email='alice@example.com';password='pass123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $l.token
Write-Host "Token:" $token

Write-Host "Add money (50)"
Invoke-RestMethod -Method Post -Uri "$base/api/wallet/add" -Headers @{ Authorization = "Bearer $token" } -Body (@{ amount = 50 } | ConvertTo-Json) -ContentType 'application/json'

Write-Host "Balance"
Invoke-RestMethod -Method Get -Uri "$base/api/wallet/balance" -Headers @{ Authorization = "Bearer $token" }
