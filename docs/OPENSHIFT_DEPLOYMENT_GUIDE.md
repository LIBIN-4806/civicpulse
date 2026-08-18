# CivicPulse — Red Hat OpenShift & GitHub Actions CI/CD Deployment Guide

This guide details how to configure GitHub Actions and Red Hat OpenShift to automatically build, test, containerize, and deploy the **CivicPulse** platform on every Git push.

---

## 🏗️ Architecture Overview

```
 [ Git Push to main ]
          │
          ▼
 [ GitHub Actions CI/CD ]
    ├─ 1. Automated Tests (Pytest + React Build)
    ├─ 2. Docker Build & Push -> ghcr.io/<owner>/civicpulse-backend
    │                           -> ghcr.io/<owner>/civicpulse-frontend
    └─ 3. OpenShift Deployment via `oc` & Kustomize
          │
          ▼
 [ Red Hat OpenShift Cluster ]
    ├─ Route: civicpulse-frontend (HTTPS) ──► Nginx (Port 8080)
    │                                              │ (Internal /api/ proxy)
    │                                              ▼
    ├─ Route: civicpulse-backend (HTTPS)  ──► FastAPI (Port 8000)
    └─ PVC: civicpulse-data-pvc ──────────────► SQLite DB & User Uploads
```

---

## 📋 Step 1: Prepare OpenShift Project & Service Account

Log into your OpenShift cluster via the `oc` CLI or web console:

```bash
# 1. Login to your OpenShift cluster
oc login --server=https://api.<your-cluster-domain>:6443 --token=<YOUR_DEVELOPER_TOKEN>

# 2. Create or select the project/namespace
oc new-project civicpulse || oc project civicpulse

# 3. Create a ServiceAccount for GitHub Actions CI/CD
oc create serviceaccount github-actions-sa -n civicpulse

# 4. Grant deployment and editing permissions to the ServiceAccount
oc adm policy add-role-to-user edit -z github-actions-sa -n civicpulse
```

---

## 🔑 Step 2: Generate ServiceAccount Token & Server URL

### 1. Get OpenShift Server URL
Your server URL is the API endpoint of your cluster (e.g. `https://api.mycluster.openshift.com:6443`).
To check your active server URL:
```bash
oc whoami --show-server
```

### 2. Create / Retrieve ServiceAccount Token
For OpenShift 4.11+:
```bash
# Generate a long-lived token secret
oc apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: github-actions-sa-token
  namespace: civicpulse
  annotations:
    kubernetes.io/service-account.name: github-actions-sa
type: kubernetes.io/service-account-token
EOF

# Extract the token value
oc get secret github-actions-sa-token -n civicpulse -o jsonpath='{.data.token}' | base64 --decode
```

---

## 🔐 Step 3: Configure GitHub Repository Secrets

In your GitHub repository:
1. Navigate to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| `OPENSHIFT_SERVER` | OpenShift API Server URL | `https://api.sandbox-m2.ll9k.p1.openshiftapps.com:6443` |
| `OPENSHIFT_TOKEN` | ServiceAccount Token from Step 2 | `sha256~AbCdEf...` |
| `OPENSHIFT_NAMESPACE` | Target OpenShift project/namespace | `civicpulse` |

---

## 📦 Step 4: Container Registry Access (GHCR)

GitHub Actions pushes container images to GitHub Packages / Container Registry (`ghcr.io`).

### Option A: Make Packages Public (Easiest)
1. After the first GitHub Actions workflow runs, go to your GitHub Profile/Organization -> **Packages**.
2. Click on `civicpulse-backend` and `civicpulse-frontend`.
3. Go to **Package settings** -> **Danger Zone** -> **Change visibility** -> Select **Public**.
4. OpenShift can now pull your images without any authentication secrets!

### Option B: Link OpenShift to GHCR via Image Pull Secret (Private)
If you prefer keeping your images private:
```bash
# 1. Create GitHub Personal Access Token (classic) with `read:packages` scope.
# 2. Create the pull secret in OpenShift:
oc create secret docker-registry ghcr-secret \
    --docker-server=ghcr.io \
    --docker-username=<YOUR_GITHUB_USERNAME> \
    --docker-password=<YOUR_GITHUB_PAT> \
    --docker-email=<YOUR_EMAIL> \
    -n civicpulse

# 3. Link it to default service account in OpenShift so Pods can pull automatically:
oc secrets link default ghcr-secret --for=pull -n civicpulse
```

---

## 🚀 Step 5: Trigger Deployment (Automatic or Manual)

### Method A: Manual Trigger via GitHub UI (No Push Needed)
1. Go to your GitHub repository in your browser.
2. Click the **Actions** tab at the top.
3. In the left sidebar, click **Deploy CivicPulse to Red Hat OpenShift**.
4. Click the **Run workflow** dropdown button on the right:
   * **Branch**: `main`
   * **Target Environment**: `production` or `staging`
   * **Skip Pytest & Frontend validation**: (Check if you want a fast rebuild/deploy)
5. Click the green **Run workflow** button!

*Or trigger manually via GitHub CLI (`gh`):*
```bash
gh workflow run deploy-openshift.yml -f deploy_env=production
```

### Method B: Automatic Trigger on Git Push
Push any commit to `main` or `master` to trigger the entire pipeline automatically:
```bash
git add .
git commit -m "feat: updates"
git push origin main
```

---

## 🔍 Step 6: Verify Deployment & Useful `oc` Commands

```bash
# Check pod status
oc get pods -n civicpulse

# View live application logs
oc logs -f deployment/civicpulse-backend -n civicpulse
oc logs -f deployment/civicpulse-frontend -n civicpulse

# Get public application URLs
oc get routes -n civicpulse

# Check PVC status
oc get pvc -n civicpulse
```

---

## ⚙️ Customizing Environment Variables & Secrets

- **Non-sensitive configs**: Edit [`openshift/configmap.yaml`](../openshift/configmap.yaml)
- **Production Secret Key**: 
  ```bash
  oc create secret generic civicpulse-secret \
    --from-literal=SECRET_KEY="your-super-strong-jwt-secret-key" \
    -n civicpulse
  ```
- **External PostgreSQL Database** (Optional):
  Update `DATABASE_URL` in `openshift/configmap.yaml`:
  ```yaml
  DATABASE_URL: "postgresql://user:password@postgres-service:5432/civicpulse_db"
  ```
