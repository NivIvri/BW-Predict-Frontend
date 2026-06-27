## Machine Learning Model

This project uses supervised machine learning regression models to predict neonatal birth weight from maternal, obstetric, and fetal measurements available before delivery.

The final objective was to identify the model that produced the lowest prediction error while remaining fast, stable, interpretable, and suitable for integration into the application.

---

### Dataset and preprocessing

The original dataset contained approximately 18,000 clinical records.

Before model training, the data was cleaned and transformed to ensure that all features were numeric, consistent, and clinically meaningful.

The preprocessing pipeline included:

- Removing records without a valid `birth_weight` target
- Converting fetal sex into a binary variable
- Applying one-hot encoding to diabetes status
- Filling missing numerical values using median-based imputation
- Adding binary `is_missing` indicators to distinguish original values from imputed values
- Removing duplicated or non-informative variables
- Excluding unreliable fields whose measurement units could not be verified
- Creating additional derived features

One of the derived features was maternal weight gain:

```python
maternal_weight_gain = current_weight - pre_pregnancy_weight
```

A corresponding missing-value indicator was also created:

```python
maternal_weight_gain_is_missing = (
    (curr_weight_is_missing == 1)
    | (pre_weight_is_missing == 1)
)
```

The cleaned dataset was divided into:

* 80% training data
* 20% final test data

A fixed `random_state=42` was used to ensure reproducible and fair comparisons between all models.

---

### Input features

The models were trained using maternal, obstetric, and fetal variables, including:

* Gestational age
* Maternal age
* Maternal height
* Pre-pregnancy weight
* Current maternal weight
* BMI
* Maternal weight gain
* Smoking status
* Alcohol use
* Drug use
* Number of pregnancies
* Number of previous deliveries
* Number of abortions
* Number of previous cesarean sections
* Number of living children
* Ectopic pregnancy history
* Vaginal birth after cesarean history
* Diabetes status
* Fetal sex
* Ultrasound-estimated fetal weight
* Clinical estimated fetal weight
* Average previous birth weights
* Missing-value indicators

The target variable was:

```text
birth_weight
```

measured in grams.

---

### Missing-value handling

Several variables contained missing data, especially maternal height, maternal weight, BMI, current weight, and previous birth-weight history.

Instead of removing all incomplete records, missing values were imputed using medians.

Binary missing-value indicators were added for fields such as:

```text
height_is_missing
pre_weight_is_missing
curr_weight_is_missing
bmi_is_missing
avg_previous_is_missing
maternal_weight_gain_is_missing
```

The indicators were encoded as:

* `0` — the original value was available
* `1` — the value was missing and later imputed

This allowed the model to distinguish between original measurements and imputed values.

---

### Feature engineering

Maternal weight gain was calculated as:

```python
df["maternal_weight_gain"] = (
    df["current_weight"]
    - df["pre_pregnancy_weight"]
)
```

This feature slightly improved the LightGBM model, but its feature importance remained relatively low.

The model-selection decision was therefore based mainly on the complete evaluation metrics rather than on the importance of one derived feature.

---

### Models evaluated

Several regression models were trained and evaluated using the same preprocessing pipeline and the same train-test split.

| Model         |            Test MAE |
| ------------- | ------------------: |
| Random Forest | approximately 211 g |
| Extra Trees   | approximately 210 g |
| CatBoost      | approximately 208 g |
| LightGBM      |            208.46 g |
| XGBoost       |        **207.41 g** |

All models were evaluated using the same final test set to ensure a fair comparison.

---

### Random Forest

Random Forest was used as the initial baseline model.

It combines many decision trees that are trained independently on random samples of the data. The final prediction is the average prediction of all trees.

The model achieved an MAE of approximately:

```text
211 grams
```

This established a strong baseline and showed that nonlinear tree-based models were suitable for the dataset.

---

### Extra Trees

Extra Trees is similar to Random Forest but introduces more randomness when selecting split points.

It achieved an MAE of approximately:

```text
210 grams
```

This was slightly better than Random Forest, but the improvement was small.

---

### CatBoost

CatBoost was evaluated because it performs well on structured tabular datasets and can learn complex nonlinear relationships.

Its hyperparameter search included:

* Number of boosting iterations
* Tree depth
* Learning rate
* L2 regularization
* Random strength
* Bagging temperature

CatBoost achieved an MAE of approximately:

```text
208 grams
```

This result was competitive and close to LightGBM and XGBoost.

However, CatBoost required significantly longer training and hyperparameter-search time than the other models.

Because it did not outperform XGBoost and was more computationally expensive, it was not selected as the final model.

---

### LightGBM

LightGBM is a gradient-boosting algorithm designed for efficient training on tabular datasets.

Its final test results were:

| Metric |   Result |
| ------ | -------: |
| MAE    | 208.46 g |
| RMSE   | 266.14 g |
| R²     |   0.6751 |
| MAPE   |    6.28% |

LightGBM performed well and was computationally efficient.

It slightly outperformed CatBoost and the tree-ensemble baselines, but it remained slightly weaker than XGBoost across the main evaluation metrics.

---

### XGBoost

XGBoost is a gradient-boosting decision-tree algorithm.

Unlike Random Forest, where trees are trained independently, XGBoost builds trees sequentially.

Each new tree attempts to correct the prediction errors made by the previous trees.

This approach allowed the model to learn complex nonlinear relationships and interactions between clinical variables.

---

### Hyperparameter tuning

The models were optimized using `RandomizedSearchCV`.

For XGBoost:

* 50 random parameter combinations were tested
* 5-fold cross-validation was used
* The optimization metric was Mean Absolute Error
* A total of 250 model fits were performed

The XGBoost parameter search included:

```python
param_grid = {
    "n_estimators": [300, 500, 700, 1000],
    "max_depth": [2, 3, 4, 5, 6],
    "learning_rate": [0.01, 0.02, 0.03, 0.05, 0.08],
    "subsample": [0.7, 0.8, 0.9, 1.0],
    "colsample_bytree": [0.6, 0.7, 0.8, 0.9, 1.0],
    "min_child_weight": [1, 3, 5, 7, 10],
    "gamma": [0, 0.05, 0.1, 0.2, 0.5],
    "reg_alpha": [0, 0.001, 0.01, 0.1, 1],
    "reg_lambda": [1, 2, 5, 10, 20]
}
```

The best cross-validation MAE was:

```text
212.53 grams
```

The hyperparameter search required approximately:

```text
2.35 minutes
```

---

### Best XGBoost parameters

The selected XGBoost parameters were:

| Parameter          | Selected value |
| ------------------ | -------------: |
| `n_estimators`     |            500 |
| `max_depth`        |              4 |
| `learning_rate`    |           0.02 |
| `subsample`        |            0.8 |
| `colsample_bytree` |            0.6 |
| `min_child_weight` |             10 |
| `gamma`            |           0.05 |
| `reg_alpha`        |          0.001 |
| `reg_lambda`       |              2 |

These parameters provided the best balance between model complexity, generalization, and prediction accuracy.

---

### Evaluation metrics

The models were evaluated using the following metrics.

#### Mean Absolute Error

MAE measures the average absolute difference between the actual and predicted birth weights.

```text
Lower MAE is better.
```

An MAE of 207.41 grams means that the prediction differs from the actual birth weight by approximately 207 grams on average.

#### Root Mean Squared Error

RMSE gives more weight to large prediction errors.

```text
Lower RMSE is better.
```

#### Coefficient of Determination

R² measures how much of the variance in birth weight is explained by the model.

```text
Higher R² is better.
```

An R² value of 0.6784 means that the model explains approximately 67.84% of the variation in birth weight.

#### Mean Absolute Percentage Error

MAPE expresses the average prediction error as a percentage.

```text
Lower MAPE is better.
```

A MAPE of 6.25% means that the predicted birth weight differs from the actual weight by approximately 6.25% on average.

---

### Final XGBoost performance

The final XGBoost model achieved:

| Metric          |             Result |
| --------------- | -----------------: |
| MAE             |       **207.41 g** |
| RMSE            |       **264.82 g** |
| R²              |         **0.6784** |
| MAPE            |          **6.25%** |
| Prediction time | **0.0328 seconds** |

This means that:

* The average prediction error was approximately 207 grams
* Larger errors increased the RMSE to approximately 265 grams
* The model explained approximately 67.8% of the variance in birth weight
* The average percentage error was approximately 6.25%
* Prediction was nearly instantaneous

---

### Final model comparison

| Model         |          MAE | Notes                                     |
| ------------- | -----------: | ----------------------------------------- |
| Random Forest |       ~211 g | Strong baseline                           |
| Extra Trees   |       ~210 g | Slightly better than Random Forest        |
| CatBoost      |       ~208 g | Competitive but computationally expensive |
| LightGBM      |     208.46 g | Fast and accurate                         |
| **XGBoost**   | **207.41 g** | Best overall result                       |

XGBoost achieved the lowest test MAE among all evaluated models.

It also achieved the strongest reported combination of RMSE, R², MAPE, and prediction speed.

---

### Feature importance

The most influential features in the final XGBoost model were:

| Feature                        | Importance |
| ------------------------------ | ---------: |
| Ultrasound estimated weight    |     44.29% |
| Clinical estimated weight      |     30.90% |
| Average previous birth weights |      3.54% |
| Fetal sex                      |      2.44% |
| Previous deliveries            |      1.70% |
| Living children                |      1.30% |
| Maternal height                |      1.26% |
| Current weight                 |      0.99% |
| No diabetes                    |      0.99% |
| Gestational diabetes           |      0.93% |
| Gestational age                |      0.83% |

The two dominant variables were:

```text
us_estimated_weight
clinical_estimated_weight
```

Together, they represented approximately:

```text
75.19%
```

of the reported feature importance.

This result is clinically reasonable because both variables are direct estimates of fetal weight.

Feature importance reflects how strongly the model relied on each variable during prediction. It should not be interpreted as proof of clinical causality.

---

### Worst-prediction analysis

For every test record, the absolute prediction error was calculated:

```python
absolute_error = abs(
    actual_birth_weight
    - predicted_birth_weight
)
```

The 50 records with the largest errors were exported for manual inspection.

The analysis checked for:

* Implausible gestational ages
* Incorrect measurement units
* Unusual BMI values
* Incorrect estimated fetal weights
* Large numbers of imputed fields
* Potential data-entry errors
* Rare but medically valid cases

Rare but clinically possible records were not removed only because the model predicted them poorly.

---

### Model selection

XGBoost was selected as the final model because it achieved the best confirmed overall performance.

It provided:

* The lowest MAE
* The lowest RMSE among the fully evaluated boosting models
* The highest R²
* The lowest MAPE
* Very fast prediction time
* Stable performance across cross-validation and final testing

Although CatBoost and LightGBM produced similar results, neither model outperformed XGBoost.

CatBoost was also considerably slower to tune.

For these reasons, XGBoost provided the best balance between accuracy, efficiency, stability, and ease of integration.

---

### Model saving and integration

The trained model was saved using `joblib`.

The saved object includes:

* The trained XGBoost model
* The ordered feature list
* The selected hyperparameters
* Cross-validation MAE
* Test MAE
* RMSE
* R²
* MAPE

```python
joblib.dump(
    {
        "model": model,
        "features": features,
        "best_parameters": search.best_params_,
        "cross_validation_mae": -search.best_score_,
        "test_mae": test_mae,
        "test_rmse": test_rmse,
        "test_r2": test_r2,
        "test_mape": test_mape
    },
    "birth_weight_xgboost_model.joblib"
)
```

The application can load the saved model, receive the required clinical inputs, preserve the same feature order, and return a predicted birth weight in grams.

---

### Synthetic mock data

The model was trained inside a restricted network, while the user interface was developed outside that environment.

To support frontend development and integration testing, a synthetic dataset containing 5,000 mock records was created.

The synthetic dataset was calibrated to reproduce the aggregate final-model performance:

| Metric | Synthetic target |
| ------ | ---------------: |
| MAE    |         207.41 g |
| RMSE   |         264.82 g |
| R²     |           0.6784 |
| MAPE   |            6.25% |

The mock dataset:

* Does not contain real patient data
* Does not reconstruct original medical records
* Is intended only for development, demonstration, and integration testing

---

### Final conclusion

Several machine-learning regression models were evaluated for neonatal birth-weight prediction.

Random Forest and Extra Trees provided strong baseline results.

CatBoost and LightGBM improved the prediction error and demonstrated the effectiveness of gradient-boosting methods.

However, XGBoost achieved the best overall performance with:

```text
MAE: 207.41 grams
RMSE: 264.82 grams
R²: 0.6784
MAPE: 6.25%
```

The model predicts birth weight almost instantly and can be integrated into the project's user interface.

The final results demonstrate that carefully cleaned clinical tabular data, combined with gradient-boosted decision trees, can provide accurate and computationally efficient neonatal birth-weight predictions.
