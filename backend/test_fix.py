import sys
sys.path.insert(0, '.')

from app.ml.resume_filter import compute_similarity, _extract_features, _load_ml_model

# Simple test
job = "Python developer"
resume_text = "Abhinaya Bandaru, Python developer with Flask, MongoDB, React"

print("=" * 60)
print("TESTING COMPUTE_SIMILARITY")
print("=" * 60)

# Test with threshold 0.45
results = compute_similarity(job, [resume_text], threshold=0.45)
score, status = results[0]

print(f"Job: {job}")
print(f"Resume: {resume_text}")
print(f"Threshold: 0.45")
print(f"Score: {score}")
print(f"Status: {status}")

# Check features
features = _extract_features(job, resume_text)
print("\nFeatures extracted:")
for key, val in features.items():
    print(f"  {key}: {val}")

# Check tech keyword match
print("\nKeyword Matching:")
print(f"  tech_keyword_ratio: {features.get('tech_keyword_ratio', 0.0)}")
print(f"  tech_keyword_overlap: {features.get('tech_keyword_overlap', 0.0)}")
print(f"  Should boost? {features.get('tech_keyword_ratio', 0.0) >= 0.9 and features.get('tech_keyword_overlap', 0.0) > 0}")

# Check model
model, feature_names = _load_ml_model()
if model and feature_names:
    print(f"\nFeature names: {feature_names}")
    feature_vector = [features.get(name, 0.0) for name in feature_names]
    print(f"Feature vector: {feature_vector}")
    proba = model.predict_proba([feature_vector])[0]
    print(f"Model probabilities: [Rejected: {proba[0]:.4f}, Selected: {proba[1]:.4f}]")
