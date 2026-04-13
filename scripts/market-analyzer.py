
import os
import json
import requests
from datetime import datetime

# Configuración
SB_URL = "https://vjdlndntsmzoxggtruot.supabase.co"
# Usando la llave anon confirmada
SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGxuZG50c216b3hnZ3RydW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTU2MTQsImV4cCI6MjA4MjczMTYxNH0.yMW0p9yFHLSeh9txZHxHzPcWA6jC1vvfTk-FsROBN7U"

def run_analysis():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Iniciando Análisis de Inteligencia de Mercado...")
    
    headers = {
        "apikey": SB_KEY,
        "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    # 1. Obtener propiedades
    print(f"Consultando propiedades en {SB_URL}...")
    try:
        response = requests.get(f"{SB_URL}/rest/v1/corretaje_properties?select=*", headers=headers)
        if response.status_code != 200:
            print(f"Error al obtener datos (Status {response.status_code}): {response.text}")
            return

        properties = response.json()
        if not properties:
            print("No se encontraron propiedades para analizar.")
            return
            
        print(f"Éxito: Procesando {len(properties)} propiedades...")

        # 2. Calcular promedios por zona y tipo
        market_stats = {}
        for p in properties:
            key = f"{p['sector']}_{p['property_type']}"
            # Asegurar que el precio sea numérico
            try:
                price = float(p['price']) if p['price'] is not None else 0
            except:
                price = 0
                
            if price <= 0: continue
            
            if key not in market_stats:
                market_stats[key] = []
            market_stats[key].append(price)

        averages = {k: sum(v)/len(v) for k, v in market_stats.items() if v}
        
        # 3. Identificar Gemas y Actualizar DB
        gems_found = 0
        updates_performed = 0
        
        for p in properties:
            key = f"{p['sector']}_{p['property_type']}"
            if key not in averages: continue
            
            avg = averages[key]
            try:
                price = float(p['price']) if p['price'] is not None else 0
            except:
                price = 0
                
            if price <= 0: continue
            
            # Desviación (Negativa es más barato -> Oportunidad)
            deviation = ((price - avg) / avg) * 100
            # Consideramos Gema si es al menos 5% más barato que el promedio (ajustado para ser más inclusivo en el demo)
            is_gem = deviation <= -5 
            
            # Datos de actualización
            update_payload = {
                "is_gem": is_gem,
                "market_deviation": round(deviation, 2)
            }
            
            # Solo actualizar si el valor cambió o para asegurar el demo
            patch_res = requests.patch(
                f"{SB_URL}/rest/v1/corretaje_properties?id=eq.{p['id']}",
                headers=headers,
                json=update_payload
            )
            
            if patch_res.status_code in [200, 201, 204]:
                updates_performed += 1
                if is_gem:
                    gems_found += 1
                    print(f"💎 Gema Etiquetada: {p['property_type']} en {p['sector']} ({round(deviation, 2)}% vs promedio)")
            else:
                print(f"Advertencia: No se pudo actualizar ID {p['id']} (Status {patch_res.status_code})")

        print(f"\n--- Resumen de Inteligencia de Mercado ---")
        print(f"Sectores Analizados: {len(averages)}")
        print(f"Propiedades Actualizadas: {updates_performed}")
        print(f"Gemas Detectadas (🔥): {gems_found}")
        print(f"Estado: Motor de Analítica Sincronizado ✅")

    except Exception as e:
        print(f"Error crítico en la ejecución: {str(e)}")

if __name__ == "__main__":
    run_analysis()
