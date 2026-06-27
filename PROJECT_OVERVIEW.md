# BW-Predict — Project Overview

A clinical web app that predicts fetal birth weight using a real XGBoost ML model, with SHAP explainability so doctors can see *why* the model made each prediction.

---

## Two Repositories

| Repo | Purpose | Language |
|---|---|---|
| `BW-Predict-Frontend` | The React UI doctors use | TypeScript + React |
| `BW-Predict-Backend` | The API server + ML model | Node.js + Python |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React + TypeScript + Vite |
| UI components | shadcn/ui (Radix UI primitives + Tailwind CSS) |
| Routing | React Router |
| Charts | Recharts |
| Backend server | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (JWT) |
| ML model | XGBoost (Python, joblib) |
| SHAP explainability | shap (Python, TreeExplainer) |

---

## How the App Works — End to End

```
Doctor fills form (4 steps)
        ↓
Frontend sends POST /predict  (with Bearer JWT token)
        ↓
Backend (server.js) verifies JWT via Supabase Auth
        ↓
Backend spawns Python subprocess → ml_model/predict.py
        ↓
Python loads XGBoost model → predicts weight + computes SHAP values
        ↓
Result returned to server.js as JSON
        ↓
server.js saves prediction + SHAP to Supabase DB
        ↓
Frontend receives response → navigates to Results page
        ↓
Doctor sees predicted weight + SHAP bar chart
```

---

## Backend — Key Files

### `server.js`
The entire backend in one file. Key sections:

- **`requireAuth` middleware** — every route calls this first. It takes the `Authorization: Bearer <token>` header, verifies it with Supabase, and attaches the doctor's user to `req.user`.
- **`runModel(payload)`** — spawns `python ml_model/predict.py`, sends JSON via stdin, reads the result from stdout.
- **`POST /predict`** — main endpoint. Gets/creates the patient, calls `runModel()`, saves everything to DB.
- **`GET /predictions`** — returns all predictions for the logged-in doctor.
- **`POST /patients/lookup`** — checks if a patient ID already exists in the DB.
- **`PATCH /predictions/:id/actual-weight`** — lets the doctor enter the real birth weight after delivery.

### `ml_model/predict.py`
The Python ML script. Called as a subprocess by server.js.

- Loads `birth_weight_xgboost_model.joblib` once at startup.
- Reads a JSON object from stdin (the patient data).
- Maps the 30 input fields, handles missing values with `_is_missing` flags.
- Runs `model.predict()` → predicted weight in grams.
- Runs `shap.TreeExplainer` → SHAP values showing each feature's contribution.
- Prints the result as JSON to stdout.

### `ml_model/birth_weight_xgboost_model.joblib`
The trained model file. A Python dict with keys:
- `model` — the XGBRegressor
- `features` — list of 30 feature names
- `test_mae`, `test_rmse`, `test_r2` — model accuracy metrics

---

## Frontend — Key Files

### `src/App.tsx`
App entry point. Sets up all the providers (Auth, Prediction, Router) and defines the routes:
- `/login` → LoginPage
- `/` → Dashboard
- `/predict` → PredictionForm (4 steps)
- `/results/:id` → ResultsPage
- `/history` → HistoryPage

All routes except `/login` are wrapped in `ProtectedRoute` — if not logged in, redirected to `/login`.

### `src/context/AuthContext.tsx`
Manages the logged-in doctor session. Wraps Supabase Auth. Exposes `useAuth()` hook with: `user`, `session`, `signIn`, `signOut`.

### `src/context/PredictionContext.tsx`
The brain of the prediction form. Stores all form state:
- `patientInfo`, `maternalInfo`, `obstetricHistory`, `fetalBiometry`
- `foundPatient` — the patient fetched from DB (or null if new)
- `lookupPatient()` — calls the backend, pre-fills height if patient exists
- `submitPrediction()` — sends all form data to `/predict`

### `src/lib/api.ts`
All HTTP calls to the backend in one place:
- `apiLookupPatient()` → POST /patients/lookup
- `apiSubmitPrediction()` → POST /predict
- `apiGetPredictions()` → GET /predictions
- `apiUpdateActualWeight()` → PATCH /predictions/:id/actual-weight
- `rowToPrediction()` — maps the raw DB row format to the frontend TypeScript types

### `src/types/prediction.ts`
All TypeScript interfaces. The most important ones:
- `MaternalInfo` — age, height, weights, BMI, smoking/alcohol/drugs/GDM/DM
- `ObstetricHistory` — G, P, AB, CS, LC, EUP, VBAC, avg past weight
- `FetalBiometry` — gestational age, EFW ultrasound, clinical estimation, fetal sex
- `PredictionData` — the full saved prediction (includes SHAP explanation)
- `ShapFactor` — `{ factor, value, contribution, direction }`

### `src/components/prediction/`
The 4-step form:
1. `PatientLookupStep.tsx` — search by ID, auto-fill if patient exists
2. `MaternalInfoStep.tsx` — age, height, weights, BMI (auto-calc), medical history
3. `ObstetricHistoryStep.tsx` — GPACS + EUP + VBAC + average past birth weight
4. `FetalBiometryStep.tsx` — gestational age, EFW, clinical estimate, fetal sex
5. `PredictionForm.tsx` — orchestrates the steps, handles validation and submit

### `src/components/charts/ShapChart.tsx`
Renders the SHAP bar chart using Recharts. Shows top 8 features sorted by impact. Green bars = pushed weight up, red bars = pushed weight down.

### `src/pages/`
- `Dashboard.tsx` — home screen
- `PredictPage.tsx` — wraps PredictionForm
- `ResultsPage.tsx` — shows predicted weight + SHAP chart after submit
- `HistoryPage.tsx` — list of all past predictions for the doctor
- `LoginPage.tsx` — email/password login via Supabase

---

## Database (Supabase)

Two tables:

**`patients`**
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| id_number | text | National ID (unique) |
| name | text | First name |
| family_name | text | Family name |
| height | numeric | Height in cm |

**`predictions`**
Stores everything — all input fields + model output:
| Column | Description |
|---|---|
| doctor_id | UUID of the logged-in doctor |
| patient_id | FK to patients table |
| age, bmi, pre_pregnancy_weight, current_weight | Maternal inputs |
| smoking, alcohol, drugs, gdm, dm | Boolean maternal flags |
| gestational_age_days | Gestational age × 7 |
| g_count, p_count, ab_count, cs_count, lc_count, eup_count, vbac_count | Obstetric counts |
| past_births_average_weight | Avg weight of previous births |
| sonographic_weight_estimate | Ultrasound EFW |
| clinical_weight_estimate | Clinical estimation |
| fetal_sex | 0 = Female, 1 = Male |
| current_weight | Current maternal weight |
| predicted_birth_weight | Model output in grams |
| shap_explanation | JSON array of SHAP factors |
| actual_birth_weight | Filled in after delivery |
| prediction_error | % deviation from actual |

---

## The ML Model — How It Works

The model was trained on historical birth data to predict birth weight in grams. It uses **XGBoost** (gradient-boosted decision trees).

**SHAP (SHapley Additive exPlanations)** breaks open the black box:
- Every prediction = baseline (average birth weight in training data) + sum of all SHAP values
- Each SHAP value = how much that one feature pushed the prediction up or down (in grams)
- Example: Ultrasound EFW +329g means the EFW reading strongly increased the predicted weight

The 30 model features map directly to the form fields. Five fields also have a `_is_missing` flag so the model handles blank inputs gracefully without crashing.

> For the full ML documentation — dataset, preprocessing, all models evaluated, hyperparameter tuning, feature importance, and final metrics — see [ML_MODEL.md](./ML_MODEL.md).

---

## How to Run Locally

**Backend:**
```bash
cd BW-Predict-Backend
npm install
pip install joblib xgboost scikit-learn shap pandas numpy
# create .env with SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
node server.js
# runs on http://localhost:5000
```

**Frontend:**
```bash
cd BW-Predict-Frontend
npm install
# create .env with VITE_API_URL=http://localhost:5000
npm run dev
# runs on http://localhost:8080
```

---

## Where to Start Reading the Code

If you want to understand the full flow, read these files in order:

1. `src/types/prediction.ts` — understand the data shapes
2. `src/context/PredictionContext.tsx` — understand the form state
3. `src/components/prediction/PredictionForm.tsx` — understand the steps + validation
4. `src/lib/api.ts` — understand how data is sent to the backend
5. `server.js` — understand the backend routes
6. `ml_model/predict.py` — understand how the model runs
