# BirthWeight 

BirthWeight is a clinical decision-support web application designed to predict fetal birth weight using machine learning and ultrasound biometry data.

The system assists medical staff in estimating fetal weight before delivery, improving clinical decision-making in maternity care.

---

## Project Overview

This project was developed in collaboration with Meir Medical Center and focuses on providing accurate, data-driven fetal weight predictions.

The system integrates a web-based interface with a machine learning model trained on real clinical data, enabling fast and reliable predictions.

---

## System Architecture

The system follows a modern **MVC (Model-View-Controller)** architecture using a client-server approach :contentReference[oaicite:0]{index=0}.

### Frontend (View)
- Built with React
- Provides a clean and responsive user interface
- Allows input of maternal and fetal clinical data
- Displays prediction results with confidence intervals

### Backend (Controller)
- Built with Node.js
- Handles API requests and data validation
- Communicates with the machine learning engine
- Returns prediction results in JSON format

### ML Engine (Model)
- Built with Python (Scikit-learn, Pandas)
- Uses a Random Forest algorithm
- Trained on clinical data from Meir Medical Center
- Generates accurate birth weight predictions based on:
  - Gestational age
  - Maternal characteristics
  - Ultrasound measurements (HC, AC, FL)

---

## Features

- AI-based fetal weight prediction
- Multi-step clinical data input form
- Confidence interval for predictions
- Explainable AI using SHAP
- Performance tracking (prediction vs actual outcome)
- Clean and responsive UI

---

## Machine Learning Approach

### Model
- Random Forest Regressor
- Ensemble-based model for high accuracy and stability

### Data Processing
- Missing value imputation
- One-hot encoding for categorical variables
- Outlier filtering (physiological validation)
- Feature scaling

### Explainability
- SHAP integration for feature contribution analysis
- Provides transparency for clinical decision-making

### Output
- Predicted birth weight (grams)
- Confidence interval
- Future comparison with actual birth outcome

---

## Database Design

The system includes the following core entities :contentReference[oaicite:1]{index=1}:

- **User** – medical staff using the system  
- **Prediction** – stores prediction results and metadata  
- **MaternalData** – clinical input variables  
- **BirthOutcome** – actual birth weight for validation  

### Relationships
- One user can generate multiple predictions
- Separation between input data and outcomes ensures clean analysis

---

## Security

- Role-based access control for medical staff
- Secure communication via HTTPS (TLS)
- Data minimization (no unnecessary identifiers)
- Prediction logging for traceability

---

## Technologies Used

- React
- TypeScript
- Node.js
- Python
- Scikit-learn
- Pandas
- Tailwind CSS

---

## Getting Started

### Clone the repository

```bash
git clone <YOUR_GIT_URL>
