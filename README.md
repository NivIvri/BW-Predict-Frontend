# BW-Predict — Frontend

React + TypeScript frontend for the birth weight prediction clinical tool.  
Doctors fill a 4-step form, the app calls the backend ML model, and displays the predicted birth weight with a SHAP explainability chart.

> For a full deep-dive into how the project is built, see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md).

---

## Tech Stack

- React + TypeScript + Vite
- shadcn/ui + Tailwind CSS
- React Router
- Recharts (SHAP bar chart)
- Supabase (Auth + Database)

---

## Setup

```bash
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://ijrkemmsdhzbzuudrwej.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

```bash
npm run dev
# runs on http://localhost:8080
```

---

## Pages

| Route | Description |
|---|---|
| `/login` | Doctor login |
| `/` | Dashboard |
| `/predict` | New prediction (4-step form) |
| `/results/:id` | Prediction result + SHAP chart |
| `/history` | All past predictions |

---

## Form Steps

1. **Patient Identification** — search by ID, auto-fill if existing patient
2. **Maternal Info** — age, height, pre-pregnancy weight, current weight, BMI, medical history
3. **Obstetric History** — G, P, AB, CS, LC, EUP, VBAC, avg past birth weight
4. **Fetal Biometry** — gestational age, ultrasound EFW, clinical estimation, fetal sex

---

## Related

- **Backend repo:** [BW-Predict-Backend](https://github.com/NivIvri/BW-Predict-Backend)
