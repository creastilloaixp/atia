#!/usr/bin/env python3
"""
Lead Crawler — Casto Automation
Busca propiedades con problemas financieros en Google Maps

Usage:
    python casto-crawler.py "casa embargada" "Culiacan"
    python casto-crawler.py "propiedad con deuda" "Monterrey"
"""

import sys
import json
import time
from datetime import datetime


class LeadCrawler:
    def __init__(self, search_query, city):
        self.search_query = search_query
        self.city = city
        self.leads = []

    def build_search_queries(self):
        """Genera queries de búsqueda para encontrar propiedades con problemas"""
        base_queries = [
            f"{self.search_query} {self.city}",
            f"casa embargada {self.city}",
            f"propiedad en foreclosure {self.city}",
            f"inmueble con deuda {self.city}",
            f"casa en venta urgentes {self.city}",
        ]
        return base_queries

    def extract_leads(self):
        """
        Simula la extracción de leads.
        En producción, esto usaría Puppeteer/Selenium para scrape Google Maps.
        """
        print(f"🔍 Crawling Google Maps for: {self.search_query} in {self.city}")
        print("=" * 50)

        # Simular datos extraídos (en producción, scrapear real)
        sample_leads = [
            {
                "name": "Juan Pérez",
                "phone": "+526671234567",
                "email": "juan.perez@email.com",
                "address": "Av. Principal 123, Col. Centro",
                "city": self.city,
                "property_type": "casa",
                "debt_type": "infonavit",
                "source": "google_maps",
                "notes": "Casa con adeudo de Infonavit, busca vender",
            },
            {
                "name": "María García",
                "phone": "+526678765432",
                "email": "maria.garcia@email.com",
                "address": "Calle Segunda 456, Col. Las Quintas",
                "city": self.city,
                "property_type": "departamento",
                "debt_type": "embargo",
                "source": "google_maps",
                "notes": "Propiedad en embargo bancario",
            },
            {
                "name": "Roberto López",
                "phone": "+526671112233",
                "email": None,
                "address": "Blvd. Francisco I. Madero 789, Col. Chapultepec",
                "city": self.city,
                "property_type": "casa",
                "debt_type": "herencia",
                "source": "google_maps",
                "notes": "Herencia sin testamento, varios herederos",
            },
            {
                "name": "Sofia Hernández",
                "phone": "+526679998877",
                "email": "sofia.h@email.com",
                "address": "Calle Norte 321, Col. San Miguel",
                "city": self.city,
                "property_type": "terreno",
                "debt_type": "banco",
                "source": "google_maps",
                "notes": "Terreno con crédito vencido",
            },
            {
                "name": "Carlos Mendoza",
                "phone": "+526674445566",
                "email": "carlos.m@email.com",
                "address": "Av. Tecnológico 555, Col. Guadalupe",
                "city": self.city,
                "property_type": "casa",
                "debt_type": "divorcio",
                "source": "google_maps",
                "notes": "Divorcio en proceso, necesitan vender",
            },
        ]

        for lead in sample_leads:
            lead["created_at"] = datetime.now().isoformat()
            lead["status"] = "new"
            print(f"  ✓ Found: {lead['name']} - {lead['debt_type']} - {lead['phone']}")

        self.leads = sample_leads
        return self.leads

    def deduplicate(self):
        """Evita duplicados basado en teléfono y nombre"""
        seen = set()
        unique_leads = []

        for lead in self.leads:
            key = (lead.get("phone", ""), lead.get("name", ""))
            if key not in seen and key[0]:  # Skip if no phone
                seen.add(key)
                unique_leads.append(lead)

        print(
            f"\n📊 Deduplication: {len(self.leads)} → {len(unique_leads)} unique leads"
        )
        self.leads = unique_leads
        return self.leads

    def to_json(self):
        """Exporta leads a JSON"""
        return json.dumps(self.leads, indent=2, ensure_ascii=False)

    def to_supabase_format(self):
        """Prepara formato para insertar en Supabase"""
        return self.leads


def main():
    if len(sys.argv) < 3:
        print("Usage: python casto-crawler.py <search_query> <city>")
        print("Example: python casto-crawler.py 'casa embargada' 'Culiacan'")
        sys.exit(1)

    search_query = sys.argv[1]
    city = sys.argv[2]

    crawler = LeadCrawler(search_query, city)

    # Step 1: Build queries
    queries = crawler.build_search_queries()
    print(f"Search queries: {queries}\n")

    # Step 2: Extract leads
    crawler.extract_leads()

    # Step 3: Deduplicate
    crawler.deduplicate()

    # Step 4: Output
    print(f"\n✅ Total leads extracted: {len(crawler.leads)}")
    print("\n" + "=" * 50)
    print("JSON Output:")
    print(crawler.to_json())

    # Save to file
    filename = f"leads-{city.lower()}-{int(time.time())}.json"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(crawler.to_json())
    print(f"\n💾 Saved to: {filename}")


if __name__ == "__main__":
    main()
