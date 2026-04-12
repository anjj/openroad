# Diseño de openRoad: Visualizador de Roadmaps Minimalista para GitHub

**Fecha:** 2026-04-12
**Estado:** Borrador / Pendiente de Revisión
**Autor:** Gemini CLI

## 1. Visión General
openRoad es una herramienta interna diseñada para proporcionar a los *stakeholders* y equipos una visión clara y minimalista del progreso de los proyectos alojados en GitHub. Se conecta directamente a los milestones (hitos) de repositorios privados y calcula automáticamente el riesgo de retraso basándose en el progreso real frente al tiempo transcurrido.

## 2. Objetivos y Éxito
- **Minimalismo:** Interfaz ultra-limpia que elimina el "ruido" de GitHub.
- **Transparencia:** Indicadores visuales claros de salud del proyecto (Semáforo de Riesgo).
- **Seguridad:** Acceso controlado mediante OAuth de GitHub para repositorios privados.
- **Simplicidad de Datos:** Sin base de datos propia; GitHub es la única fuente de verdad.

## 3. Stack Tecnológico
- **Framework:** Next.js 14+ (App Router).
- **Autenticación:** Auth.js (NextAuth.js) con GitHub Provider (Scope: `repo`).
- **UI/Estilos:** Tailwind CSS + Lucide Icons.
- **Tipografía:** Montserrat / Inter.
- **API GitHub:** Octokit (SDK oficial).
- **Despliegue:** Vercel o similar (soporta Server Actions y Edge Runtime).

## 4. Arquitectura de Datos
### 4.1. Flujo de Autenticación
1. El usuario inicia sesión con su cuenta de GitHub.
2. La sesión almacena el `accessToken` proporcionado por GitHub.
3. NextAuth gestiona la persistencia de la sesión en una cookie segura.

### 4.2. Obtención de Hitos
- Se utiliza un **Server Action** para consultar la API de GitHub usando el token del usuario.
- Endpoint consultado: `GET /repos/{owner}/{repo}/milestones`.
- Se filtran los hitos por estado `open` y se ordenan por `due_on`.

### 4.3. Lógica de Riesgo (Semáforo)
Para cada hito, se calculan dos variables:
- **Progreso (P):** `closed_issues / (open_issues + closed_issues)`.
- **Tiempo Transcurrido (T):** `(Hoy - Fecha_Creación) / (Fecha_Límite - Fecha_Creación)`.
- **Índice de Salud (S):** `P - T`.

**Estados Visuales:**
- **Verde:** `S >= 0` (A tiempo o adelantado).
- **Amarillo:** `-0.2 < S < 0` (Retraso menor al 20%).
- **Rojo Golive (#E40032):** `S <= -0.2` o `Fecha_Límite < Hoy` con issues abiertos (Retraso crítico).

## 5. Diseño de Interfaz (UX/UI)
### 5.1. Pantalla Principal
- **Header:** Logo de openRoad (minimalista) y botón de Logout.
- **Selector:** Dropdown para elegir entre los repositorios a los que el usuario tiene acceso.
- **Línea de Tiempo:** Vista vertical con una línea central gris clara.
    - **Nodos:** Círculos de color según el riesgo.
    - **Tarjetas:** Título, progreso porcentual, fecha de entrega y barra de progreso minimalista.

### 5.2. Interacciones
- Al hacer clic en una tarjeta, se abre un **Drawer** (panel lateral) que lista los issues del hito (Título y Estado).

## 6. Consideraciones Técnicas
- **Rate Limiting:** Al ser una app interna de poco tráfico, los límites de la API de GitHub son suficientes.
- **Sin DB:** Facilita el mantenimiento y garantiza que no haya datos "desincronizados".
- **Privacidad:** Los datos solo se muestran a usuarios con acceso legítimo al repositorio en GitHub.

## 7. Próximos Pasos (Fases)
1. Configuración de Next.js y Auth.js con GitHub.
2. Implementación del servicio Octokit para fetch de milestones.
3. Desarrollo de la UI de la línea de tiempo con Tailwind.
4. Lógica de cálculo de riesgo y visualización dinámica.
