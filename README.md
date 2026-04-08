# AI-Based Energy Consumption & Cost Optimization Platform ⚡

A complete, cloud-native full-stack academic project utilizing **Microsoft Azure**, **Machine Learning (Scikit-Learn)**, **Python FastAPI**, and **React**.

## 📖 Project Overview

This platform dynamically analyzes and predicts electricity usage to help households or organizations reduce energy waste and lower costs.

- **Frontend:** React + Vite, styled beautifully with Tailwind CSS and Recharts.
- **Backend API:** High-performance Python FastAPI server.
- **Machine Learning Engine:** Predictive models (Random Forest) for usage forecasting and Unsupervised Learning (Isolation Forest) for real-time anomaly detection.
- **Cloud Database:** Azure Blob Storage for hosting the datasets separately from the compute engine.
- **CI/CD:** Automated GitHub Actions workflows for seamless deployment to Azure Cloud.

---

## 🛠️ Local Development Setup

To run this project on your local machine for evaluation:

### 1. The Python Backend (FastAPI + ML)
1. Navigate to the `backend/` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install requirements: `pip install -r requirements.txt`
5. Create a `.env` file and add your Azure Storage connection securely:
   ```env
   AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT;..."
   ```
6. Start the server: `python -m uvicorn app.main:app --reload --port 8000`

### 2. The React Frontend (Vite)
1. Open a new terminal and navigate to the `frontend/` directory.
2. Install node dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open your browser to `http://localhost:5173`.

---

## ☁️ Azure Cloud Deployment

This repository is equipped with GitHub Actions (`.github/workflows`) to automate cloud deployment.

### Backend -> Azure App Service
1. Create a **Linux Web App** in Azure (Python 3.10 stack).
2. Grab the Publish Profile XML from Azure.
3. In your GitHub Repo, go to `Settings -> Secrets and variables -> Actions`.
4. Add a Repository Secret named `AZURE_WEBAPP_PUBLISH_PROFILE` with the XML contents.
5. Push your code. The GitHub Action will auto-build and deploy your backend to Azure.

### Frontend -> Azure Static Web Apps
1. Create a **Static Web App** in Azure.
2. Select GitHub as the source and choose this repository.
3. Set the Build Presets to "React" or "Vite", with App Location as `/frontend` and Output as `dist`.
4. Azure will automatically create the secret and deploy the website.

---

## 👨‍💻 Developed By
*(Add your name / student ID here)*
