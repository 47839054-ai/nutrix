# Setup Trello - Nutrix

## Crear el tablero
1. Ir a `https://trello.com`
2. Crear cuenta con el correo del terciario (ej: `47839054@terciariourquiza.edu.ar`)
3. Crear tablero nuevo: **"Nutrix - Gestión de Proyecto"**
4. Compartir con los 4 integrantes y con `servan.diego@terciariourquiza.edu.ar`

## Listas (columnas)
Crear estas 5 listas en orden:
1. **Backlog** (pendientes)
2. **En Progreso**
3. **En Revisión**
4. **Hecho**
5. **Archivado**

## Etiquetas (colores)
Crear estas etiquetas:
- 🔴 **Urgente** (rojo)
- 🟡 **Desarrollo** (amarillo)
- 🔵 **Documentación** (azul)
- 🟢 **Testing** (verde)
- 🟣 **Diseño** (morado)
- 🟠 **Relevamiento** (naranja)

## Tarjetas por Integrante

### Thomas Cuellar (Desarrollo frontend/backend, IA)
- CU-U01: Gestionar cuenta
- CU-U02: Gestionar perfil nutricional
- CU-U03: Gestionar plan nutricional
- CU-U04: Consultar catálogo de productos
- CU-U05: Escaneo y análisis de productos
- CU-U06: Registrar consumo diario
- CU-U07: Ver progreso y logros
- CU-S01: Gestionar validaciones y seguridad
- CU-S02: Generar plan con IA
- CU-S03: Procesar productos (OCR, API externa)

### Manuel Alvarez (Relevamiento, casos de uso)
- CU-U08: Gestionar recetas
- CU-U09: Gestionar suscripción Premium
- CU-U10: Configurar la aplicación
- CU-U11: Soporte y legales
- CU-A01: Gestionar usuarios y roles (admin)
- CU-A02: Gestionar catálogo (admin)
- CU-A03: Moderar contenido (admin)
- CU-S04: Generar recomendaciones complementarias
- CU-S05: Actualizar seguimiento y estadísticas
- CU-S06: Gestionar comunicaciones automáticas

### Yoel Scarafia (Diseño, wireframes, UX)
- Documento de wireframes (WF-01 a WF-06)
- Diseño de pantallas principales
- Prototipo en Figma
- CU-A04: Configurar IA y test (admin)
- CU-A05: Gestionar Premium (admin)
- CU-A06: Supervisar métricas (admin)
- CU-A07: Configurar plataforma (admin)
- CU-S07: Gestionar ciclo de suscripciones
- CU-S08: Ejecutar mantenimiento y auditoría

### Luca Bartolacci (Testing, documentación)
- Plan de testing
- Casos de prueba
- Documentación final
- Verificación de casos de uso
- Pruebas de integración
- Revisión de calidad

## Instrucciones para agregar los 4 integrantes
1. Ir a **Menú → Permisos del tablero → Compartir**
2. Agregar los 4 correos del terciario:
   - `47839054@terciariourquiza.edu.ar` (Thomas)
   - `47076438@terciariourquiza.edu.ar` (Manuel)
   - `47073323@terciariourquiza.edu.ar` (Yoel)
   - `46839504@terciariourquiza.edu.ar` (Luca)
   - `servan.diego@terciariourquiza.edu.ar` (Profesor - solo lectura)
3. Asignar cada tarjeta al integrante correspondiente

## Formato de commits
Cada commit debe tener este formato:
```
[Nombre] - Tarea: descripción breve
Prompt: "el prompt exacto que le dimos a la IA"
Ticket: https://trello.com/c/xxxx/tarea
```
Mínimo 3 commits por alumno hasta la próxima entrega.
