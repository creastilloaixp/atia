-- =============================================================================
-- creastilo AI XPERIENCE — Seed: Campaign Templates por Industria
-- =============================================================================

-- Template 1: INMOBILIARIA — Lanzamiento de propiedad
INSERT INTO campaign_templates (name, industry, description, duration_days, content_structure, prompt_template, image_style, hashtag_sets, cta_templates)
VALUES (
  'Lanzamiento de Propiedad',
  'inmobiliaria',
  'Campana de 30 dias para lanzamiento de propiedad: desde hero image hasta cierre con urgencia y CTA WhatsApp.',
  30,
  '[
    {"day":1,"type":"promocional","theme":"hero_image","time":"10:00","description":"Foto principal de la propiedad con datos clave"},
    {"day":2,"type":"educativo","theme":"zona_datos","time":"13:00","description":"Datos de la colonia/zona: escuelas, hospitales, transporte"},
    {"day":3,"type":"social_proof","theme":"testimonial","time":"19:00","description":"Testimonial de cliente satisfecho"},
    {"day":4,"type":"educativo","theme":"tip_compra","time":"10:00","description":"Tip: como elegir la mejor ubicacion"},
    {"day":5,"type":"promocional","theme":"tour_virtual","time":"13:00","description":"Tour virtual o galeria de fotos interiores"},
    {"day":6,"type":"behind_scenes","theme":"equipo","time":"10:00","description":"Conoce al equipo de asesores"},
    {"day":7,"type":"educativo","theme":"mercado","time":"19:00","description":"Estado del mercado inmobiliario en la zona"},
    {"day":8,"type":"promocional","theme":"amenidades","time":"10:00","description":"Amenidades y espacios comunes"},
    {"day":9,"type":"social_proof","theme":"cifras","time":"13:00","description":"Numeros: plusvalia, ROI, datos duros"},
    {"day":10,"type":"educativo","theme":"financiamiento","time":"19:00","description":"Opciones de financiamiento y creditos"},
    {"day":11,"type":"promocional","theme":"comparativa","time":"10:00","description":"Comparativa vs propiedades similares en la zona"},
    {"day":12,"type":"behind_scenes","theme":"proceso","time":"13:00","description":"Asi es nuestro proceso de venta paso a paso"},
    {"day":13,"type":"social_proof","theme":"review","time":"19:00","description":"Review/calificacion de clientes anteriores"},
    {"day":14,"type":"educativo","theme":"documentos","time":"10:00","description":"Documentos que necesitas para comprar"},
    {"day":15,"type":"promocional","theme":"lifestyle","time":"13:00","description":"Estilo de vida en esta propiedad/zona"},
    {"day":16,"type":"educativo","theme":"inversion","time":"19:00","description":"Por que invertir en bienes raices en 2026"},
    {"day":17,"type":"social_proof","theme":"antes_despues","time":"10:00","description":"Antes y despues: transformacion/remodelacion"},
    {"day":18,"type":"promocional","theme":"planos","time":"13:00","description":"Planos y distribucion de espacios"},
    {"day":19,"type":"behind_scenes","theme":"construccion","time":"19:00","description":"Detras de camaras: proceso de construccion/remodelacion"},
    {"day":20,"type":"educativo","theme":"gastos","time":"10:00","description":"Gastos ocultos al comprar: escrituras, notario, etc."},
    {"day":21,"type":"promocional","theme":"urgencia","time":"13:00","description":"Solo quedan X unidades disponibles"},
    {"day":22,"type":"social_proof","theme":"entrega","time":"19:00","description":"Entrega de llaves a nuevo propietario"},
    {"day":23,"type":"educativo","theme":"decoracion","time":"10:00","description":"Tips de decoracion para tu nuevo hogar"},
    {"day":24,"type":"promocional","theme":"precio","time":"13:00","description":"Desglose de precios y opciones de pago"},
    {"day":25,"type":"behind_scenes","theme":"vecinos","time":"19:00","description":"La comunidad: vecinos y ambiente del lugar"},
    {"day":26,"type":"social_proof","theme":"media","time":"10:00","description":"Mencion en medios o reconocimiento"},
    {"day":27,"type":"promocional","theme":"oferta","time":"13:00","description":"Promocion especial por tiempo limitado"},
    {"day":28,"type":"educativo","theme":"mudanza","time":"19:00","description":"Checklist para tu mudanza perfecta"},
    {"day":29,"type":"promocional","theme":"countdown","time":"10:00","description":"Cuenta regresiva: ultimos dias de la oferta"},
    {"day":30,"type":"promocional","theme":"cta_final","time":"13:00","description":"CTA final: Agenda tu visita por WhatsApp HOY"}
  ]'::jsonb,
  'Eres un experto en marketing inmobiliario para el mercado mexicano. Genera contenido profesional y aspiracional para la venta de propiedades. Usa datos reales del mercado cuando sea posible. Siempre incluye CTA de WhatsApp. Tono: profesional pero cercano.',
  'profesional_inmobiliario',
  '{"educativo":["inmuebles","bienesraices","inversion","hogar","finanzas"],"promocional":["enventa","oportunidad","nuevacasa","lujo","exclusivo"],"social_proof":["clientefeliz","testimonial","resultado","confianza"],"behind_scenes":["equipo","detras","proceso"]}'::jsonb,
  '{"whatsapp":"Agenda tu visita: wa.me/526671326265","urgencia":"Solo quedan 3 unidades. No te quedes fuera.","consulta":"Cotizacion sin compromiso por WhatsApp"}'::jsonb
);

-- Template 2: E-COMMERCE — Lanzamiento de producto
INSERT INTO campaign_templates (name, industry, description, duration_days, content_structure, prompt_template, image_style, hashtag_sets, cta_templates)
VALUES (
  'Lanzamiento de Producto',
  'ecommerce',
  'Campana de 30 dias para lanzamiento de producto e-commerce: teaser, reveal, beneficios, social proof, oferta y cierre.',
  30,
  '[
    {"day":1,"type":"promocional","theme":"teaser","time":"10:00","description":"Teaser misterioso: algo nuevo viene"},
    {"day":2,"type":"promocional","theme":"teaser_2","time":"19:00","description":"Segundo teaser con pista visual"},
    {"day":3,"type":"promocional","theme":"reveal","time":"10:00","description":"REVEAL: presentacion oficial del producto"},
    {"day":4,"type":"educativo","theme":"problema","time":"13:00","description":"El problema que resuelve este producto"},
    {"day":5,"type":"promocional","theme":"beneficios","time":"19:00","description":"5 beneficios clave del producto"},
    {"day":6,"type":"educativo","theme":"como_funciona","time":"10:00","description":"Como funciona: explicacion simple"},
    {"day":7,"type":"behind_scenes","theme":"creacion","time":"13:00","description":"La historia detras del producto"},
    {"day":8,"type":"social_proof","theme":"beta_review","time":"19:00","description":"Primeras opiniones de beta testers"},
    {"day":9,"type":"educativo","theme":"comparativa","time":"10:00","description":"Comparativa vs alternativas del mercado"},
    {"day":10,"type":"promocional","theme":"demo","time":"13:00","description":"Demo en accion / unboxing"},
    {"day":11,"type":"social_proof","theme":"ugc","time":"19:00","description":"Contenido generado por usuarios"},
    {"day":12,"type":"educativo","theme":"tip_uso","time":"10:00","description":"Tip de uso #1"},
    {"day":13,"type":"behind_scenes","theme":"equipo","time":"13:00","description":"Conoce al equipo detras del producto"},
    {"day":14,"type":"social_proof","theme":"review_detallado","time":"19:00","description":"Review detallado de un cliente"},
    {"day":15,"type":"educativo","theme":"faq","time":"10:00","description":"FAQ: respondemos las preguntas mas comunes"},
    {"day":16,"type":"promocional","theme":"oferta_early","time":"13:00","description":"Oferta especial de lanzamiento"},
    {"day":17,"type":"educativo","theme":"tip_uso_2","time":"19:00","description":"Tip de uso #2"},
    {"day":18,"type":"social_proof","theme":"influencer","time":"10:00","description":"Influencer usando el producto"},
    {"day":19,"type":"behind_scenes","theme":"empaque","time":"13:00","description":"Proceso de empaque y envio"},
    {"day":20,"type":"promocional","theme":"bundle","time":"19:00","description":"Bundle especial / combo"},
    {"day":21,"type":"educativo","theme":"cuidado","time":"10:00","description":"Como cuidar/mantener tu producto"},
    {"day":22,"type":"social_proof","theme":"numeros","time":"13:00","description":"Numeros: X vendidos, Y resenas 5 estrellas"},
    {"day":23,"type":"promocional","theme":"countdown_3","time":"19:00","description":"Solo 3 dias para que termine la oferta"},
    {"day":24,"type":"behind_scenes","theme":"next","time":"10:00","description":"Sneak peek: que viene despues"},
    {"day":25,"type":"social_proof","theme":"testimonial_video","time":"13:00","description":"Video testimonial de cliente"},
    {"day":26,"type":"promocional","theme":"countdown_2","time":"19:00","description":"2 dias: ultimas piezas"},
    {"day":27,"type":"educativo","theme":"guia","time":"10:00","description":"Guia completa de uso"},
    {"day":28,"type":"promocional","theme":"flash_sale","time":"13:00","description":"Flash sale: 24 horas de descuento extra"},
    {"day":29,"type":"social_proof","theme":"milestone","time":"19:00","description":"Milestone: X unidades vendidas"},
    {"day":30,"type":"promocional","theme":"ultimo_dia","time":"10:00","description":"ULTIMO DIA de oferta de lanzamiento + mega CTA"}
  ]'::jsonb,
  'Eres un experto en marketing de e-commerce para el mercado mexicano. Genera contenido que impulse ventas con urgencia y social proof. Usa lenguaje casual y cercano. Emojis permitidos. CTAs directos a WhatsApp.',
  'ecommerce_producto',
  '{"educativo":["tips","tutorial","aprende","guia"],"promocional":["oferta","descuento","nuevoproducto","lanzamiento","compra"],"social_proof":["resena","clientefeliz","recomendado","5estrellas"],"behind_scenes":["detras","equipo","proceso","hechoenmexico"]}'::jsonb,
  '{"whatsapp":"Pidelo ya: wa.me/526671326265","urgencia":"Quedan pocas piezas. Pide el tuyo antes de que se agoten.","descuento":"Usa codigo LANZAMIENTO para 15% OFF"}'::jsonb
);

-- Template 3: SERVICIOS/AGENCIAS — Posicionamiento de marca
INSERT INTO campaign_templates (name, industry, description, duration_days, content_structure, prompt_template, image_style, hashtag_sets, cta_templates)
VALUES (
  'Posicionamiento de Marca',
  'servicios',
  'Campana de 30 dias para posicionar una marca de servicios: autoridad, casos de exito, educacion y generacion de leads.',
  30,
  '[
    {"day":1,"type":"educativo","theme":"intro_marca","time":"10:00","description":"Quienes somos y que hacemos diferente"},
    {"day":2,"type":"educativo","theme":"problema_mercado","time":"13:00","description":"El problema #1 que resolvemos en la industria"},
    {"day":3,"type":"social_proof","theme":"caso_exito_1","time":"19:00","description":"Caso de exito: cliente + resultados numericos"},
    {"day":4,"type":"educativo","theme":"tip_1","time":"10:00","description":"Tip gratuito #1 de alto valor"},
    {"day":5,"type":"behind_scenes","theme":"equipo_intro","time":"13:00","description":"Conoce a nuestro fundador/CEO"},
    {"day":6,"type":"educativo","theme":"mito","time":"19:00","description":"Desmintiendo un mito comun de la industria"},
    {"day":7,"type":"promocional","theme":"servicio_1","time":"10:00","description":"Servicio estrella: que incluye y como funciona"},
    {"day":8,"type":"social_proof","theme":"testimonial_1","time":"13:00","description":"Testimonial en video/texto de cliente"},
    {"day":9,"type":"educativo","theme":"tutorial_1","time":"19:00","description":"Mini tutorial: como hacer X (relacionado al servicio)"},
    {"day":10,"type":"educativo","theme":"datos","time":"10:00","description":"Estadisticas de la industria que debes conocer"},
    {"day":11,"type":"behind_scenes","theme":"dia_tipico","time":"13:00","description":"Un dia tipico en nuestra oficina/empresa"},
    {"day":12,"type":"social_proof","theme":"caso_exito_2","time":"19:00","description":"Caso de exito #2 con metricas"},
    {"day":13,"type":"educativo","theme":"tip_2","time":"10:00","description":"Tip gratuito #2"},
    {"day":14,"type":"promocional","theme":"paquetes","time":"13:00","description":"Nuestros paquetes y precios"},
    {"day":15,"type":"educativo","theme":"error_comun","time":"19:00","description":"5 errores comunes que cometen las empresas en X"},
    {"day":16,"type":"social_proof","theme":"numeros","time":"10:00","description":"Nuestros numeros: X clientes, Y anos, Z proyectos"},
    {"day":17,"type":"educativo","theme":"tutorial_2","time":"13:00","description":"Tutorial: herramienta gratuita que recomendamos"},
    {"day":18,"type":"behind_scenes","theme":"cultura","time":"19:00","description":"Nuestra cultura y valores"},
    {"day":19,"type":"promocional","theme":"consulta_gratis","time":"10:00","description":"Ofrecemos consulta gratuita de 30 min"},
    {"day":20,"type":"educativo","theme":"tendencias","time":"13:00","description":"Tendencias de la industria para 2026"},
    {"day":21,"type":"social_proof","theme":"testimonial_2","time":"19:00","description":"Testimonial de cliente #2"},
    {"day":22,"type":"educativo","theme":"tip_3","time":"10:00","description":"Tip gratuito #3"},
    {"day":23,"type":"behind_scenes","theme":"herramientas","time":"13:00","description":"Las herramientas que usamos (tech stack)"},
    {"day":24,"type":"social_proof","theme":"caso_exito_3","time":"19:00","description":"Caso de exito #3: el mas impactante"},
    {"day":25,"type":"educativo","theme":"checklist","time":"10:00","description":"Checklist descargable / recurso gratuito"},
    {"day":26,"type":"promocional","theme":"diferenciador","time":"13:00","description":"Por que elegirnos vs la competencia"},
    {"day":27,"type":"educativo","theme":"prediccion","time":"19:00","description":"Nuestra prediccion para la industria"},
    {"day":28,"type":"behind_scenes","theme":"celebracion","time":"10:00","description":"Celebrando un logro reciente"},
    {"day":29,"type":"social_proof","theme":"compilacion","time":"13:00","description":"Compilacion de los mejores testimoniales"},
    {"day":30,"type":"promocional","theme":"cta_final","time":"19:00","description":"CTA final: Agenda tu consulta gratuita por WhatsApp"}
  ]'::jsonb,
  'Eres un experto en marketing B2B y posicionamiento de marca para el mercado mexicano. Genera contenido que posicione a la empresa como autoridad en su industria. Combina educacion con generacion de leads. Tono profesional pero humano.',
  'profesional_servicios',
  '{"educativo":["tips","estrategia","negocio","emprendimiento","marketing"],"promocional":["servicios","consultoria","agencia","soluciones"],"social_proof":["resultado","casoexito","clientefeliz","testimonio"],"behind_scenes":["equipo","cultura","oficina","startup"]}'::jsonb,
  '{"whatsapp":"Agenda tu consulta gratis: wa.me/526671326265","lead":"Descarga nuestra guia gratuita (link en bio)","consulta":"30 min de asesoria sin costo. Escribenos."}'::jsonb
);
