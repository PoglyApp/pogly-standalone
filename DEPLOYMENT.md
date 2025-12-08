# Kubernetes Deployment Guide

This guide covers deploying Pogly to Kubernetes with persistent storage and OIDC authentication.

## Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Storage class for persistent volumes
- OIDC provider (Authentik, Keycloak, etc.)
- Container registry access

## Architecture

```
┌─────────────────┐
│   Ingress       │
│  (TLS/HTTPS)    │
└────────┬────────┘
         │
┌────────▼────────┐
│   Service       │
│   (pogly:80)    │
└────────┬────────┘
         │
┌────────▼────────────────────────────┐
│         Deployment                  │
│  ┌──────────────────────────────┐  │
│  │ Caddy (reverse proxy)        │  │
│  │ SpacetimeDB                  │  │
│  │ React Frontend               │  │
│  └──────────────────────────────┘  │
│                                     │
│  Volumes:                           │
│  - pogly-data: /stdb               │
│  - pogly-config: /root/.spacetime  │
└─────────────────────────────────────┘
```

## Quick Start

### 1. Configure OIDC Provider

In your OIDC provider, create an application with these redirect URIs:
- `https://your-domain.com/callback`
- `https://your-domain.com/`
- `https://your-domain.com/silent-oidc-renew.html`

Note your:
- **Issuer URL** (e.g., `https://auth.example.com/application/o/pogly/`)
- **Client ID**

### 2. Create Namespace

```bash
kubectl create namespace pogly
```

### 3. Deploy Resources

Create `kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: pogly

resources:
  - pvc.yaml
  - deployment.yaml
  - service.yaml
  - ingress.yaml

# Substitute your values
replacements:
  - source:
      kind: ConfigMap
      name: pogly-config
      fieldPath: data.oidc_issuer
    targets:
      - select:
          kind: Deployment
        fieldPaths:
          - spec.template.spec.containers.[name=pogly].env.[name=OIDC_ISSUER].value
```

Create `pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pogly-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pogly-config
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Create `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pogly
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pogly
  template:
    metadata:
      labels:
        app: pogly
    spec:
      containers:
      - name: pogly
        image: ghcr.io/poglyapp/pogly-standalone:latest
        ports:
        - containerPort: 80
        env:
        - name: OIDC_ISSUER
          value: "https://your-oidc-provider.com/application/o/pogly/"
        - name: OIDC_CLIENT_ID
          value: "your_client_id"
        - name: STREAM_PLATFORM
          value: "twitch"
        - name: STREAM_NAME
          value: "bobross"
        volumeMounts:
        - name: data
          mountPath: /stdb
        - name: config
          mountPath: /root/.spacetime
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: pogly-data
      - name: config
        persistentVolumeClaim:
          claimName: pogly-config
```

Create `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: pogly
spec:
  selector:
    app: pogly
  ports:
  - port: 80
    targetPort: 80
```

Create `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pogly
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - pogly.example.com
    secretName: pogly-tls
  rules:
  - host: pogly.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: pogly
            port:
              number: 80
```

Deploy:

```bash
kubectl apply -k .
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n pogly

# View logs
kubectl logs -n pogly -l app=pogly --tail=50

# Check if database initialized
kubectl exec -n pogly -it deploy/pogly -- spacetime database list --server local
```

## GitOps with Flux

For automated deployments with Flux:

### 1. Create GitRepository

```yaml
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: pogly
  namespace: flux-system
spec:
  interval: 1m
  url: https://github.com/your-org/pogly-config
  ref:
    branch: main
```

### 2. Create Kustomization

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: pogly
  namespace: flux-system
spec:
  interval: 5m
  path: ./
  prune: true
  sourceRef:
    kind: GitRepository
    name: pogly
  postBuild:
    substitute:
      oidcIssuer: "https://auth.example.com/application/o/pogly/"
      oidcClientId: "your_client_id"
      domain: "example.com"
      subdomain: "pogly"
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OIDC_ISSUER` | OIDC provider issuer URL | Yes | - |
| `OIDC_CLIENT_ID` | OIDC client ID | Yes | - |
| `STREAM_PLATFORM` | Platform (`twitch`/`youtube`) | No | `twitch` |
| `STREAM_NAME` | Channel/video ID | No | `bobross` |
| `MODULES` | Space-separated module names | No | `pogly` |
| `DEBUG_MODE` | Enable debug logging | No | `false` |
| `STRICT_MODE` | Enable strict security | No | `false` |

### Persistent Volumes

The deployment requires two persistent volumes:

1. **pogly-data** (`/stdb`): SpacetimeDB database files
   - Minimum: 1Gi
   - Recommended: 10Gi
   - Contains module state and transaction history

2. **pogly-config** (`/root/.spacetime`): Identity and CLI config
   - Minimum: 100Mi
   - Recommended: 1Gi
   - Contains authentication tokens and identity

**Important:** Do not delete these PVCs unless you want to reset the database. The identity persists here.

## Troubleshooting

### Pod Fails to Start

Check logs:
```bash
kubectl logs -n pogly -l app=pogly --tail=100
```

Common issues:
- Missing OIDC env vars
- PVC not bound
- Image pull errors

### Database Publish Fails (403)

This means the identity changed but the database still exists. Clear the PVCs:

```bash
kubectl delete pvc -n pogly pogly-data pogly-config
kubectl delete pod -n pogly -l app=pogly
```

### Ownership Verification Prompt

If you see "verify ownership" after login:
- The first user to connect should automatically become owner
- Check logs for "auto-claimed ownership" message
- If issue persists, clear PVCs and restart

### Database Lock Errors

The entrypoint has retry logic for lock errors. If persistent:

```bash
kubectl exec -n pogly -it deploy/pogly -- rm -f /stdb/spacetime.pid /stdb/control-db/db/LOCK
kubectl delete pod -n pogly -l app=pogly
```

## Backup and Restore

### Backup

```bash
# Backup database
kubectl exec -n pogly deploy/pogly -- tar czf - /stdb > pogly-backup.tar.gz

# Backup identity
kubectl exec -n pogly deploy/pogly -- tar czf - /root/.spacetime > pogly-identity.tar.gz
```

### Restore

```bash
# Restore database
kubectl exec -n pogly -i deploy/pogly -- tar xzf - -C / < pogly-backup.tar.gz

# Restore identity
kubectl exec -n pogly -i deploy/pogly -- tar xzf - -C / < pogly-identity.tar.gz

# Restart pod
kubectl delete pod -n pogly -l app=pogly
```

## Scaling

Pogly currently requires `replicas: 1` due to:
- SpacetimeDB using local storage
- No distributed state synchronization

For high availability:
- Use PVCs with ReadWriteMany (if available)
- Set up automated backups
- Monitor pod health with readiness/liveness probes

## Security

### Network Policies

Restrict ingress/egress:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pogly
  namespace: pogly
spec:
  podSelector:
    matchLabels:
      app: pogly
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - port: 80
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - port: 443  # OIDC provider
    - port: 53   # DNS
```

### Secrets Management

For production, use Kubernetes secrets or external secret managers:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: pogly-oidc
type: Opaque
stringData:
  issuer: "https://auth.example.com/application/o/pogly/"
  clientId: "your_client_id"
---
# Reference in deployment
env:
- name: OIDC_ISSUER
  valueFrom:
    secretKeyRef:
      name: pogly-oidc
      key: issuer
- name: OIDC_CLIENT_ID
  valueFrom:
    secretKeyRef:
      name: pogly-oidc
      key: clientId
```

## Monitoring

### Health Checks

Add to deployment:

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /
    port: 80
  initialDelaySeconds: 10
  periodSeconds: 5
```

### Metrics

SpacetimeDB exposes metrics on the control port. Monitor:
- Database transaction rate
- Active connections
- Memory usage

## Support

For deployment assistance:
- [Discord](https://discord.gg/pogly)
- [GitHub Issues](https://github.com/PoglyApp/pogly-standalone/issues)
