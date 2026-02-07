# 🚀 Deployment Guide

## Workflow Pipeline

Cada push a `main` ejecuta:

```
1. CI Checks (Tests & Linting) ✅
   └─> Frontend: ESLint + Build
   └─> Backend: Maven compile + Tests

2. Security Scanning 🔒
   └─> CodeQL (Java + JavaScript)
   └─> Trivy (Docker vulnerabilities)
   └─> Dependency Review

3. Deploy to Production 🌐
   └─> Solo si CI y Security pasan
   └─> Build incremental (solo lo que cambió)
   └─> Zero-downtime deployment
```

## Optimizaciones Implementadas

### 🚀 Build Incremental
- Detecta qué servicios cambiaron (backend/frontend)
- Solo rebuilds lo modificado
- Ahorro: ~70% tiempo en cambios pequeños

### ⚡ Docker Buildx + Cache
- Cache persistente entre builds
- Reutiliza layers sin cambios
- Ahorro: 5-10x más rápido

### 🧹 Auto-cleanup
- Limpia imágenes dangling
- Limpia builder cache viejo (+24h)
- Mantiene el servidor limpio

## Branch Protection (Recomendado)

Para activar protección de rama:

1. Ve a: `https://github.com/mati-caliz/finarg/settings/branches`
2. Click en **Add rule**
3. Configurar:
   - **Branch name pattern:** `main`
   - ✅ **Require status checks to pass before merging**
     - ✅ `CI - Tests & Linting / frontend-lint`
     - ✅ `CI - Tests & Linting / backend-build`
     - ✅ `Security Scanning / codeql`
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Do not allow bypassing the above settings**
4. **Save changes**

Esto previene merges a `main` si:
- ❌ Tests fallan
- ❌ Linting falla
- ❌ Build falla
- ❌ Vulnerabilidades críticas

## Performance Metrics

### Antes
- 🐌 Build completo: ~5-8 min
- 🐌 Deploy total: ~6-10 min
- 🐌 Cada cambio rebuilds todo

### Después
- ⚡ Build incremental: ~30-60 seg
- ⚡ Deploy total: ~1-2 min
- ⚡ Solo rebuilds lo que cambió
- 💾 Cache persistente

## Troubleshooting

### Build lento
```bash
# En el servidor
docker builder prune -a -f
docker buildx rm finarg-builder
```

### Limpiar todo y empezar fresh
```bash
docker compose -f docker-compose.prod.yml down
docker system prune -a --volumes -f
```

### Ver logs del deploy
Ve a: `https://github.com/mati-caliz/finarg/actions`
