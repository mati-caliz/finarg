# AI Assistant Configuration

## Code Style Rules

### Comments
- **Do NOT add comments to code**
- Code should be self-documenting through clear naming
- Remove any existing comments when refactoring

### Language
- Use English for all variable names, method names, and class names
- Exception: Domain-specific terms in Spanish are acceptable for Argentine financial context (e.g., "cotizacion", "inflacion")

### General Guidelines
- Follow existing project patterns and conventions
- Keep methods short and focused (max 120 lines)
- Prefer explicit imports over wildcard imports (except for lombok, jakarta.persistence, jakarta.validation)
- Use constructor injection for dependencies
- Avoid self-invocation in @Cacheable methods

### Tech Stack
- Backend: Spring Boot 3.5.x, Java 17
- Frontend: Next.js 14, TypeScript, React 18
- Styling: Tailwind CSS
- State: Zustand, TanStack Query

### Testing
- Run `mvn clean compile` before committing backend changes
- Run `npm run lint` before committing frontend changes
