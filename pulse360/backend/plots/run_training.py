
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
import shutil

# Load dataset
df = pd.read_csv(r"C:\Users\shenyee\Desktop\HackAttack 2026\ai-customer-success\pulse360\backend\plots\Telco-Customer-Churn.csv")

# Clean and pre-process
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'].str.strip(), errors='coerce')
df = df.dropna()
df['Churn'] = df['Churn'].map({'Yes': 1, 'No': 0})

# Drop CustomerID
df_clean = df.drop(columns=['customerID'])

# Convert categorical variables to dummies
X = pd.get_dummies(df_clean.drop(columns=['Churn']), drop_first=True)
y = df_clean['Churn']

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

# Fit Random Forest Classifier
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# Evaluate predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

# 1. Plot Confusion Matrix
plt.figure(figsize=(6, 5))
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='YlGnBu', cbar=False,
            xticklabels=['Retained', 'Churned'], yticklabels=['Retained', 'Churned'],
            annot_kws={'size': 14, 'weight': 'bold'})
plt.title('SubSentry Model: Confusion Matrix', fontsize=14, weight='bold', pad=15)
plt.ylabel('Actual Label', fontsize=12, labelpad=10)
plt.xlabel('Predicted Label', fontsize=12, labelpad=10)
plt.tight_layout()
cm_path = os.path.join(r"C:\Users\shenyee\Desktop\HackAttack 2026\ai-customer-success\pulse360\backend\plots", "confusion_matrix.png")
plt.savefig(cm_path, dpi=300)
plt.close()

# 2. Plot ROC-AUC Curve
fpr, tpr, _ = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

plt.figure(figsize=(7, 5.5))
plt.plot(fpr, tpr, color='#9D6638', lw=3, label=f'ROC curve (AUC = {roc_auc:.3f})')
plt.plot([0, 1], [0, 1], color='#4E220F', lw=1.5, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate', fontsize=11, labelpad=8)
plt.ylabel('True Positive Rate', fontsize=11, labelpad=8)
plt.title('SubSentry Churn Engine: Receiver Operating Characteristic (ROC)', fontsize=13, weight='bold', pad=15)
plt.legend(loc="lower right", fontsize=11)
plt.grid(True, alpha=0.15)
plt.tight_layout()
roc_path = os.path.join(r"C:\Users\shenyee\Desktop\HackAttack 2026\ai-customer-success\pulse360\backend\plots", "roc_auc_curve.png")
plt.savefig(roc_path, dpi=300)
plt.close()

print(f"Model Training Complete! AUC: {roc_auc:.3f}")
print(f"Confusion Matrix saved to: {cm_path}")
print(f"ROC Curve saved to: {roc_path}")

# Copy plots to Antigravity artifact directory for conversation embedding
shutil.copy(cm_path, os.path.join(r"C:\Users\shenyee\.gemini\antigravity\brain\8ab7d642-9b75-4492-91d8-4602962b8638", "confusion_matrix.png"))
shutil.copy(roc_path, os.path.join(r"C:\Users\shenyee\.gemini\antigravity\brain\8ab7d642-9b75-4492-91d8-4602962b8638", "roc_auc_curve.png"))
