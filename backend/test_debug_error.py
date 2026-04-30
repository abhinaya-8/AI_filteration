import sys
sys.path.insert(0, '.')

from app.ml.resume_filter import compute_similarity, _extract_features, _load_ml_model, _preprocess

# Test with actual resume and job data
job = "Senior Python developer. Required Skills: Python Flask MongoDB React Express JavaScript"
resume_text = """Abhinaya Bandaru abhinaya.bandaru8@gmail.com
Education: Vignan University, B.Tech Computer Science Engineering, July 2023 - May 2027, CGPA 8.65
Skills: Python, Java, C, React, Express, MongoDB, SQL, Flask
Experience: Full stack development with MERN stack, Flask backend"""

print("=" * 70)
print("DEBUGGING ML MODEL AND FALLBACK")
print("=" * 70)

# Pre-process and check
job_clean = _preprocess(job)
resume_clean = _preprocess(resume_text)
print(f"\nPreprocessed job length: {len(job_clean)}")
print(f"Preprocessed resume length: {len(resume_clean)}")

# Try to extract features
try:
    features = _extract_features(job, resume_text)
    print("\n✓ Features extracted successfully:")
    for key, val in features.items():
        print(f"  {key}: {val}")
except Exception as e:
    print(f"\n✗ Feature extraction error: {e}")
    import traceback
    traceback.print_exc()

# Try to load model
try:
    model, feature_names = _load_ml_model()
    if model is None:
        print("\n✗ ML model is None")
    else:
        print(f"\n✓ ML model loaded successfully")
        print(f"  Feature names: {feature_names}")
        
        # Try to predict
        try:
            feature_vector = [features.get(name, 0.0) for name in feature_names]
            print(f"  Feature vector: {feature_vector}")
            proba = model.predict_proba([feature_vector])[0]
            print(f"  Prediction: Rejected={proba[0]:.4f}, Selected={proba[1]:.4f}")
        except Exception as pred_e:
            print(f"  ✗ Prediction error: {pred_e}")
            import traceback
            traceback.print_exc()
except Exception as e:
    print(f"\n✗ Model loading error: {e}")
    import traceback
    traceback.print_exc()

# Now test compute_similarity
print("\n" + "=" * 70)
print("Testing compute_similarity")
print("=" * 70)
try:
    results = compute_similarity(job, [resume_text], threshold=0.45)
    score, status = results[0]
    print(f"\nScore: {score}")
    print(f"Status: {status}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
