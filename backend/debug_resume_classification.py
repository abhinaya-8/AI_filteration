#!/usr/bin/env python
"""
Debug script to test resume classification
"""

from app.ml.resume_filter import (
    _preprocess,
    _extract_features,
    _load_ml_model,
    compute_similarity
)

# Your resume text (extracted and formatted)
your_resume = """
Abhinaya Bandaru
abhinayabandaru8@gmail.com +918019755024 Ravikamatham

Education
Vignan University Vadlamudi Andhra Pradesh
Computer Science Engineering B.Tech July 2023 March 2027
CGPA 8.65

Sri Viswa Jr College Vizag Andhra Pradesh
MPC Intermediate July 2021 May 2023
Percentage 97.6%

Sri Chaithanya Vizag Andhra Pradesh
SSC School June 2020 April 2021
Percentage 100%

Skills
Programming Languages C Java Python
Libraries Frameworks React Express JavaScript
Databases MongoDB SQL

Projects Open Source
Task Management and Team Collaboration React Express MongoDB
Built a full stack MERN task management and collaboration app with real time updates Socket IO
role based access dashboards analytics and a notification system
Implemented secure authentication task workflows and admin panel deployed the system on Render
with a responsive scalable UI

Word Guess HTML CSS JS Flask
Created a Flask based Word Guess Game with difficulty modes Easy Medium Hard hints lives and
used words tracking
Built a responsive UI with JavaScript driven logic for instant feedback scoring and dynamic gameplay

Certifications
Qualified Gate 2026
Responsive Web Design freeCodeCamp
Introduction To Artificial Intelligence LinkedIn
Data Base Management System NPTEL
Cisco Packet Tracer Networking Essentials Cisco Networking Academy
PET certification 151 Cambridge University
"""

print("="*70)
print("RESUME CLASSIFICATION DEBUG")
print("="*70)

# Test 1: Check if Python is in resume
print("\n[Test 1] Resume Content Check")
print(f"Resume contains 'Python': {'python' in your_resume.lower()}")
print(f"Resume contains 'Flask': {'flask' in your_resume.lower()}")
print(f"Resume contains 'MongoDB': {'mongodb' in your_resume.lower()}")

# Test 2: Preprocessing check
print("\n[Test 2] Text Preprocessing")
preprocessed = _preprocess(your_resume)
print(f"Original length: {len(your_resume)} chars")
print(f"Preprocessed length: {len(preprocessed)} chars")
print(f"Preprocessed contains 'python': {'python' in preprocessed}")
print(f"Preprocessed contains 'flask': {'flask' in preprocessed}")
print(f"Sample preprocessed text: {preprocessed[:200]}...")

# Test 3: Feature extraction
print("\n[Test 3] Feature Extraction")
job_desc = "Python developer"
features = _extract_features(job_desc, your_resume)
print("Extracted Features:")
for feature_name, value in features.items():
    print(f"  {feature_name}: {value:.4f}")

# Test 4: ML Model prediction
print("\n[Test 4] ML Model Prediction")
model, feature_names = _load_ml_model()
if model:
    try:
        feature_vector = [features.get(name, 0.0) for name in feature_names]
        print(f"Feature vector shape: {len(feature_vector)}")
        print(f"Feature vector: {feature_vector}")
        
        proba = model.predict_proba([feature_vector])
        print(f"\nPrediction probabilities:")
        print(f"  Rejected: {proba[0][0]:.4f}")
        print(f"  Selected: {proba[0][1]:.4f}")
        
        prediction = model.predict([feature_vector])[0]
        print(f"\nPrediction: {'Selected' if prediction == 1 else 'Rejected'}")
    except Exception as e:
        print(f"Error in prediction: {e}")
else:
    print("Model not loaded")

# Test 5: Different job descriptions
print("\n[Test 5] Testing Different Job Descriptions")
job_descriptions = [
    "Python developer",
    "Python developer with Flask experience",
    "Junior Python Engineer",
    "Python developer with React and MongoDB",
    "Full stack developer Python Java JavaScript",
    "Software engineer"
]

for job_desc in job_descriptions:
    result = compute_similarity(job_desc, [your_resume], threshold=0.5)
    score, status = result[0]
    print(f"  '{job_desc}' → Score: {score:.4f} | Status: {status}")

# Test 6: Keyword analysis
print("\n[Test 6] Keyword Analysis")
job_keywords = ["Python", "Flask", "MongoDB", "React"]
resume_lower = your_resume.lower()
print("Keywords found in resume:")
for keyword in job_keywords:
    found = keyword.lower() in resume_lower
    count = resume_lower.count(keyword.lower())
    print(f"  {keyword}: {found} (appears {count} times)")

print("\n" + "="*70)
print("DEBUG COMPLETE")
print("="*70)
