from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from ucimlrepo import fetch_ucirepo
import math
import os 

app = FastAPI()

class PatientData(BaseModel):
    phone: str
    age: int
    bmi: float
    high_bp: int      
    phys_activity: int
    fruits: int      
    veggies: int       

scaler = StandardScaler()
smote = SMOTE(random_state=42)
model = LogisticRegression(
    class_weight='balanced',  
    random_state=42, 
    max_iter=500
)

DATA_FILE = "local_cdc_dataset.csv"

@app.on_event("startup")
def train_model():

    if os.path.exists(DATA_FILE):
        print("⚡ Loading CDC Dataset from local CSV... (Instantaneous!)")
        df = pd.read_csv(DATA_FILE)
        X_train = df[['Age', 'BMI', 'HighBP', 'PhysActivity', 'Fruits', 'Veggies']]
        y_full = df['Diabetes_binary']
        
        print(f"✅ Loaded {len(df):,} records from local cache")
        
    else:
        print("⏳ Downloading CDC Dataset from UC Irvine... (First time only - this will take 30-60 seconds)")
        cdc_data = fetch_ucirepo(id=891)
        
        X_full = cdc_data.data.features
        y_full = cdc_data.data.targets['Diabetes_binary']
        
        selected_columns = ['Age', 'BMI', 'HighBP', 'PhysActivity', 'Fruits', 'Veggies']
        X_train = X_full[selected_columns]
        
        print("💾 Saving data locally to 'local_cdc_dataset.csv' for future instant loading...")
        local_df = X_train.copy()
        local_df['Diabetes_binary'] = y_full
        local_df.to_csv(DATA_FILE, index=False)
        print(f"✅ Saved {len(local_df):,} records to local cache")
    
    print("⚖️ SMOTE: Generating synthetic high-risk patients...")
    X_resampled, y_resampled = smote.fit_resample(X_train, y_full)
    
    print(f"📊 Original dataset: {len(X_train):,} samples")
    print(f"📊 After SMOTE: {len(X_resampled):,} balanced samples")
    
    print("📏 Scaling features for mathematical optimization...")
    X_scaled = scaler.fit_transform(X_resampled)
    
    print("🧠 Training Logistic Regression with class_weight='balanced'...")
    model.fit(X_scaled, y_resampled)
    
    train_accuracy = model.score(X_scaled, y_resampled) * 100
    print(f"📈 Model Training Accuracy: {train_accuracy:.2f}%")
    
    print("✅ v2.0 Ready: Extreme case detection active!")
    print("=" * 50)


@app.post("/predict-risk")
def predict(data: PatientData):
    
    
    cdc_age_category = max(1, min(13, math.ceil((data.age - 17) / 5)))
    
    user_features = pd.DataFrame([[
        cdc_age_category,
        data.bmi,
        data.high_bp,
        data.phys_activity,
        data.fruits,
        data.veggies
    ]], columns=['Age', 'BMI', 'HighBP', 'PhysActivity', 'Fruits', 'Veggies'])
    
    
    user_features_scaled = scaler.transform(user_features)
    
    
    probabilities = model.predict_proba(user_features_scaled)[0]
    risk_percentage = round(probabilities[1] * 100, 2)
    
    
    coefficients = model.coef_[0]
    
   
    impacts = coefficients * user_features_scaled[0]
    
    
    abs_impacts = [abs(i) for i in impacts]
    total_impact = sum(abs_impacts)
    
    feature_names = ['Age', 'BMI', 'High Blood Pressure', 'Physical Activity', 'Fruits/Veggies Intake', 'Diet Quality']
    breakdown = []
    
    for name, impact in zip(feature_names, abs_impacts):
        percent = round((impact / total_impact) * 100, 1) if total_impact > 0 else 0
        breakdown.append({"feature": name, "contribution": percent})
     
    breakdown = sorted(breakdown, key=lambda x: x['contribution'], reverse=True)

    return {
        "risk_percentage": risk_percentage,
        "breakdown": breakdown
    }
