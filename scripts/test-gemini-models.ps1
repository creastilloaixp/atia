$headers = @{
    'Content-Type' = 'application/json'
}

$apiKey = "AIzaSyCSOOyI0QWaulpV3eMCXyycDC88EWuCEUA"

# Test gemini-1.5-flash
Write-Host "=== Testing gemini-1.5-flash ==="
try {
    $body = @{ contents = @(@{ role = "user"; parts = @(@{ text = "di hola" }) }) } | ConvertTo-Json -Depth 5
    $r = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$apiKey" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode) OK"
} catch {
    Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream(); $reader = [System.IO.StreamReader]::new($stream); Write-Host "ERROR: $($reader.ReadToEnd())"
}

# Test gemini-2.0-flash
Write-Host "`n=== Testing gemini-2.0-flash ==="
try {
    $body = @{ contents = @(@{ role = "user"; parts = @(@{ text = "di hola" }) }) } | ConvertTo-Json -Depth 5
    $r = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode) OK"
} catch {
    Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream(); $reader = [System.IO.StreamReader]::new($stream); Write-Host "ERROR: $($reader.ReadToEnd())"
}

# Test gemini-1.5-flash-latest
Write-Host "`n=== Testing gemini-1.5-flash-latest ==="
try {
    $body = @{ contents = @(@{ role = "user"; parts = @(@{ text = "di hola" }) }) } | ConvertTo-Json -Depth 5
    $r = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=$apiKey" -Method POST -Headers $headers -Body $body -UseBasicParsing
    Write-Host "STATUS: $($r.StatusCode) OK"
} catch {
    Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream(); $reader = [System.IO.StreamReader]::new($stream); Write-Host "ERROR: $($reader.ReadToEnd())"
}

# Test gemini-embedding-001 
Write-Host "`n=== Testing gemini-embedding-001 ==="
try {
    $body = @{ model = "models/gemini-embedding-001"; content = @{ parts = @(@{ text = "test" }) }; taskType = "RETRIEVAL_QUERY" } | ConvertTo-Json -Depth 5
    $r = Invoke-WebRequest -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=$apiKey" -Method POST -Headers $headers -Body $body -UseBasicParsing
    $resp = $r.Content | ConvertFrom-Json
    Write-Host "STATUS: $($r.StatusCode) OK — dims: $($resp.embedding.values.Count)"
} catch {
    Write-Host "STATUS: $($_.Exception.Response.StatusCode.value__)"
    $stream = $_.Exception.Response.GetResponseStream(); $reader = [System.IO.StreamReader]::new($stream); Write-Host "ERROR: $($reader.ReadToEnd())"
}
