"""
Placement Prediction ML Training Script
Models:
1. Logistic Regression
2. Random Forest Classifier

Run:
    python train_model.py
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, ConfusionMatrixDisplay
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "placement_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
PLOT_DIR = os.path.join(BASE_DIR, "plots")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(PLOT_DIR, exist_ok=True)

FEATURES = [
    "cgpa",
    "iq",
    "communication_skills",
    "projects",
    "internship_experience",
    "aptitude",
    "technical_skills",
    "backlogs",
    "extracurricular_activities",
]

TARGET = "placed"


def create_sample_dataset(rows=600):
    """Create a realistic synthetic placement dataset."""
    rng = np.random.default_rng(42)

    data = pd.DataFrame({
        "cgpa": np.round(rng.uniform(5.0, 10.0, rows), 2),
        "iq": rng.integers(80, 150, rows),
        "communication_skills": rng.integers(1, 11, rows),
        "projects": rng.integers(0, 8, rows),
        "internship_experience": rng.integers(0, 3, rows),
        "aptitude": rng.integers(1, 11, rows),
        "technical_skills": rng.integers(1, 11, rows),
        "backlogs": rng.integers(0, 5, rows),
        "extracurricular_activities": rng.integers(0, 2, rows),
    })

    score = (
        data["cgpa"] * 1.7
        + data["communication_skills"] * 0.9
        + data["projects"] * 0.8
        + data["internship_experience"] * 1.4
        + data["aptitude"] * 1.0
        + data["technical_skills"] * 1.2
        + data["extracurricular_activities"] * 0.8
        + (data["iq"] / 20)
        - data["backlogs"] * 1.7
        + rng.normal(0, 2.2, rows)
    )

    threshold = np.percentile(score, 48)
    data["placed"] = (score >= threshold).astype(int)
    data.to_csv(DATA_PATH, index=False)
    print(f"Sample dataset created at {DATA_PATH}")


def train():
    if not os.path.exists(DATA_PATH):
        create_sample_dataset()

    df = pd.read_csv(DATA_PATH)

    # Data preprocessing
    df = df.drop_duplicates()
    df = df.dropna()

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), FEATURES)
        ],
        remainder="drop"
    )

    models = {
        "logistic_regression": Pipeline([
            ("preprocessor", preprocessor),
            ("model", LogisticRegression(max_iter=1000))
        ]),
        "random_forest": Pipeline([
            ("preprocessor", preprocessor),
            ("model", RandomForestClassifier(n_estimators=250, random_state=42))
        ])
    }

    results = {}

    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)

        accuracy = accuracy_score(y_test, predictions)
        cm = confusion_matrix(y_test, predictions)

        results[name] = {
            "accuracy": round(float(accuracy), 4),
            "confusion_matrix": cm.tolist(),
            "classification_report": classification_report(y_test, predictions, output_dict=True),
        }

        joblib.dump(model, os.path.join(MODEL_DIR, f"{name}.joblib"))

        display = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Not Placed", "Placed"])
        display.plot()
        plt.title(f"{name.replace('_', ' ').title()} Confusion Matrix")
        plt.savefig(os.path.join(PLOT_DIR, f"{name}_confusion_matrix.png"), bbox_inches="tight")
        plt.close()

    # Save best model
    best_model_name = max(results, key=lambda k: results[k]["accuracy"])
    joblib.dump(models[best_model_name], os.path.join(MODEL_DIR, "best_model.joblib"))

    # Feature importance graph for Random Forest
    rf_model = models["random_forest"].named_steps["model"]
    importances = rf_model.feature_importances_

    plt.figure(figsize=(10, 6))
    plt.barh(FEATURES, importances)
    plt.xlabel("Importance Score")
    plt.title("Random Forest Feature Importance")
    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_DIR, "feature_importance.png"), bbox_inches="tight")
    plt.close()

    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json_ready = json_safe(results, best_model_name)
        import json
        json.dump(json_ready, f, indent=4)

    print("\nModel Training Completed")
    print("Best Model:", best_model_name)
    for name, result in results.items():
        print(f"{name}: Accuracy = {result['accuracy']}")


def json_safe(results, best_model_name):
    return {
        "best_model": best_model_name,
        "results": results,
        "features": FEATURES,
        "target": TARGET,
        "labels": {
            "0": "Not Placed",
            "1": "Placed"
        }
    }


if __name__ == "__main__":
    train()
