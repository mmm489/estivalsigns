# Estival Signals

Calendario interno de demanda hotelera para Estival Park basado exclusivamente
en datos públicos, externos y entradas manuales no sensibles. No modela ni
consume ocupación, ADR, reservas, datos de huéspedes o información del PMS.

## Funcionalidad

- Calendario mensual navegable a 18 meses con score de demanda 0–100.
- Festivos de Nager.Date para ES, FR, GB, IE, DE, NL y BE, incluidas las
  subdivisiones españolas prioritarias y detección de puentes probables.
- Vacaciones escolares mediante OpenHolidays, con zonas/subdivisiones cuando la
  fuente las proporciona. Los half-terms UK manuales se marcan por confirmar.
- Eventos cercanos mediante Ticketmaster (50 km desde La Pineda) y eventos
  locales curados manualmente.
- Previsión Open-Meteo a 14 días.
- Comp set manual/CSV, mediana diaria y tendencia de la última consulta.
- Agenda de 90 días exportable, comparador de fechas y pesos configurables.
- Adaptadores independientes por fuente y crons diarios con tolerancia a fallos.
- Esquema futuro para Amadeus, Google Trends y Ulyses agregado.

## Requisitos

- Node.js 22.13 o posterior
- PostgreSQL 15+; se recomienda Neon
- Una clave gratuita de Ticketmaster para activar sus eventos

## Instalación local

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abre `http://localhost:3000`. En desarrollo, si `ACCESS_PASSWORD` está vacío,
el acceso no se bloquea.

## Variables de entorno

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí | Conexión PostgreSQL con pool de Neon |
| `DIRECT_URL` | Sí | Conexión directa para migraciones Prisma |
| `ACCESS_PASSWORD` | Producción | Contraseña compartida del equipo |
| `ACCESS_COOKIE_SECRET` | Producción | Firma de la cookie de acceso |
| `CRON_SECRET` | Producción | Protección de refrescos automáticos |
| `TICKETMASTER_API_KEY` | Solo Ticketmaster | Discovery API |
| `ENABLE_PMS_MODULE` | Sí | Debe permanecer en `false` en esta fase |
| `NEXT_PUBLIC_APP_URL` | Producción | URL pública de Vercel |

La clave de Ticketmaster se obtiene creando una cuenta y una aplicación en el
[portal de desarrolladores de Ticketmaster](https://developer.ticketmaster.com/).
El valor denominado Consumer Key es la API key.

## Base de datos y seed

El modelo está en `prisma/schema.prisma`; la migración inicial está en
`prisma/migrations/202608120001_initial/migration.sql`. El seed configura:

- pesos iniciales y curva estacional mensual;
- mercados emisores activos;
- seis hoteles de comp set;
- eventos locales recurrentes marcados como no confirmados.

Para cargar festivos y vacaciones 2026–2027 en la base, ejecuta el refresco
después del seed o llama a `/api/sources/refresh` con el secreto de cron. Los
adaptadores nunca son invocados desde el navegador.

## Despliegue en Vercel + Neon

1. Crea un proyecto PostgreSQL en Neon y copia sus URLs pooled/direct.
2. Importa el repositorio en Vercel.
3. Añade todas las variables de entorno de la tabla anterior. Mantén
   `ENABLE_PMS_MODULE=false`.
4. Ejecuta `npx prisma migrate deploy` contra la base de producción.
5. Despliega. `vercel.json` registra dos crons diarios: fuentes estáticas a las
   03:17 UTC y Ticketmaster/Open-Meteo a las 04:37 UTC.

Si una fuente falla, el proceso informa del error por fuente y la aplicación
debe seguir sirviendo los últimos registros persistidos. La UI muestra la fecha
de frescura y no sustituye datos faltantes por valores inventados.

## Añadir una fuente nueva

1. Crea un módulo en `lib/sources/` que implemente `DataSourceAdapter<T>` de
   `lib/types.ts`.
2. Normaliza la respuesta a un tipo de señal del dominio; no expongas la forma
   propia del proveedor a la UI.
3. Añade estado de frescura y un upsert idempotente en PostgreSQL.
4. Conecta el adaptador al cron correspondiente y añade pruebas de mapeo,
   timeouts, errores y datos obsoletos.
5. Si el factor puntúa, hazlo explícito en `lib/score.ts` y expón sus puntos en
   el detalle del día.

## PMS futuro: bloqueado por diseño

`PmsSnapshot` y `PmsImportLog` existen únicamente para evitar una migración
estructural futura. Con `ENABLE_PMS_MODULE=false` no hay pantalla, navegación ni
endpoint PMS. `lib/sources/ulyses.ts` contiene solo una interfaz, un stub que
lanza `No implementado` y una validación que rechaza columnas que parezcan PII.
El esquema no contiene nombre, documento, email, teléfono ni otro dato de
huésped.

## Validación

```bash
npm run test:unit
npm test
npm run lint
npx tsc --noEmit
```
