# Club del Bodegón - Backend

Backend para el sistema de fidelización del Club del Bodegón. Construido con Java 21 y Spring Boot 3.3.

## Requisitos
- Docker y Docker Compose
- Java 21 (para desarrollo local sin Docker)
- Maven

## Cómo ejecutar

### Usando Docker (Recomendado)
Levanta la base de datos PostgreSQL y la aplicación Backend automáticamente.
```bash
docker-compose up --build
```
La API estará disponible en `http://localhost:8080`.

### Desarrollo Local
1. Levantar solo la base de datos:
   ```bash
   docker-compose up postgres
   ```
2. Ejecutar la aplicación (asegurate de tener Java 21):
   ```bash
   ./mvnw spring-boot:run
   ```

## Documentación API
Una vez levantado, acceder a la documentación interactiva Swagger UI:
- **URL**: `http://localhost:8080/swagger-ui.html`

## Usuarios de Prueba (Seed Data)
Al iniciar, la migración `V2__seed_data.sql` intenta crear datos iniciales.
Si el usuario Admin no se crea correctamente por problemas con el hash del password, puedes registrar uno nuevo usando el endpoint `/api/auth/register` y luego cambiarle el rol manual o usar el usuario insertado si ajustas el hash en la migración.

**Endpoint Registro Admin (Truco dev):**
Registra un usuario normal y cambia su rol en base de datos:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

## Arquitectura
- **Controladores**: Capa REST (`/api/**`)
- **Servicios**: Lógica de negocio Transactional.
- **Repositorios**: Acceso a datos JPA.
- **Seguridad**: JWT con Access Token (15m) y Refresh Token (7d).

## Funcionalidades Clave
1. **Registro y Auth**: Generación de JWT.
2. **Sistema de Puntos**: Acumulación por compras/visitas.
3. **Niveles**: BRONZE, SILVER, GOLD (Cálculo automático).
4. **Promociones**: Públicas y para Miembros.
5. **Canjes (Redemptions)**: Generación de códigos únicos `BDG-XXXXXX` y validación por Admin.

## Testing
Ejecutar tests de integración:
```bash
mvn test
```
