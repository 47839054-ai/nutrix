# ============================================================
# Nutrix - Iniciar todo de nuevo
# Levanta el backend, abre Android Studio (para probar en el
# celular) y Chrome con el modo web de la app.
#
# Uso:  .\iniciar.ps1
# ============================================================

Write-Host "=== Nutrix: iniciando todo ===" -ForegroundColor Cyan

# 1) Levantar el backend (si no esta corriendo)
$backend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "[OK] El backend ya esta corriendo en http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "Levantando backend (node server.js)..."
    Start-Process node -ArgumentList "server.js" -WorkingDirectory "F:\nutrix\nutrix\server" -WindowStyle Hidden
    Start-Sleep -Seconds 4
    Write-Host "[OK] Backend corriendo en http://localhost:3000" -ForegroundColor Green
}

# 2) Servidor web (Vite) para el modo navegador
$vite = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if (-not $vite) {
    Write-Host "Levantando servidor web (npm run dev)..."
    Start-Process npm -ArgumentList "run","dev" -WorkingDirectory "F:\nutrix\nutrix\client" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}
Write-Host "[OK] Web lista en http://localhost:5173" -ForegroundColor Green

# 3) Abrir Android Studio (para tocar el play verde y probar en el celular)
Write-Host "Abriendo Android Studio..."
Start-Process "F:\nutrix\nutrix\client\android" -ErrorAction SilentlyContinue

# 4) Abrir Chrome con la app web
Start-Process "http://localhost:5173" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Todo listo!" -ForegroundColor Green
Write-Host "  - Backend:  http://localhost:3000"
Write-Host "  - Web:      http://localhost:5173"
Write-Host "  - Celular:  Android Studio > boton Play verde (con el celular conectado por USB)"
