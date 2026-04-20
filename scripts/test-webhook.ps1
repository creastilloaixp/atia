$body = @{
    event = "messages.upsert"
    data = @{
        key = @{
            remoteJid = "5216671234567@s.whatsapp.net"
            fromMe = $false
            id = "TEST_DIAG_$(Get-Date -Format 'HHmmss')"
        }
        message = @{
            conversation = "hola prueba de diagnostico"
        }
        pushName = "TestUser"
    }
} | ConvertTo-Json -Depth 5

$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGxuZG50c216b3hnZ3RydW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDcwNjEsImV4cCI6MjA1OTM4MzA2MX0.b_r7LlcuSVFlVGG_eiR59-bCx-rppQR16d9TPWZ9iFI'
}

Write-Host "Enviando request de prueba al webhook..."
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri 'https://vjdlndntsmzoxggtruot.supabase.co/functions/v1/evolution-webhook' `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing

    Write-Host "STATUS: $($response.StatusCode)"
    Write-Host "RESPONSE: $($response.Content)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "STATUS: $statusCode"
    
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = [System.IO.StreamReader]::new($stream)
    $errorBody = $reader.ReadToEnd()
    Write-Host "ERROR BODY: $errorBody"
    
    Write-Host "EXCEPTION: $($_.Exception.Message)"
}
