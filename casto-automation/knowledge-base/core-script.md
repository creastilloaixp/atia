# Core Script — Voice AI Sales Conversation

## Opening (0:00-0:15)

```
Hola, ¿me puedes escuchar? Soy [agente] de Casto Inmobiliaria.
Estou llamando porque encontré su información y me gustaría contactarlo sobre su propiedad.
¿Tiene un momento para hablar?
```

## Discovery Phase (0:15-1:00)

### If yes (has time):
```
Perfecto, gracias. Primero que nada, ¿cómo te llamas?
[Nombre], ¿tienes una propiedad que te gustaría vender o que tiene algún tema financiero?
¿Me podrías contar un poco más sobre eso?
```

### If no (busy):
```
Entiendo completamente. ¿Qué tal si te llamo en otro momento que te venga mejor?
O si prefieres, puedo enviarte un WhatsApp para que me contactes cuando tú quieras.
```

## Qualification (1:00-2:00)

### Questions to ask:
1. "¿Qué tipo de situación tienes con tu propiedad?"
2. "¿Debes dinero a Infonavit, banco, o alguna institución?"
3. "¿Tu propiedad tiene embargo o proceso legal?"
4. "¿Es una herencia o hubo un divorcio reciente?"
5. "¿Necesitas vender rápido o hay urgencia?"

### Qualifying criteria:
- **Valid lead**: Has property + has debt/legal issue + wants to sell
- **Not valid**: Just curious, not owner, property already sold

## Handling Objections (2:00-3:00)

See `objection-handling.md` for specific responses.

## Closing (3:00-4:00)

### If qualified:
```
Entiendo tu situación. Nos especializamos exactamente en este tipo de casos.
¿Te parece si agendamos una breve llamada de 15 minutos para explicarte las opciones que tenemos?
Podemos hacerlo hoy o mañana, el horario que te funcione mejor.
```

### If not qualified:
```
Entiendo. Gracias por tu tiempo.
Si en el futuro necesitas información sobre vender tu propiedad, no dudes en contactarnos.
Que tengas un buen día.
```

## Follow-up (if left message):
```
Hola [nombre], te dejé un mensaje hace unos días sobre tu propiedad en [ciudad].
Quería saber si pudiste escuchar mi mensaje. Estoy disponible para charlar cuando te funcione.
Mi número es [whatsapp]. ¡Gracias!
```