# Quick Reference - ML Resume Filter

## Model Performance
- **Accuracy**: 97.76% ✓
- **F1-Score**: 97.28% ✓
- **Threshold**: 0.65 (configurable)

## Usage

### Python API
```python
from app.ml.resume_filter import compute_similarity, analyze_resumes_batch

# Single score
score, status = compute_similarity(job_desc, [resume_text])[0]

# Batch analysis  
results = analyze_resumes_batch(job_desc, keywords, resume_texts, 0.65)
```

### REST API (via Backend)
```bash
POST /api/resumes/analyze-all
{
  "recruitmentDriveId": "...",
  "keywords": "Python, Django, AWS"
}
```

## Threshold Values
- **0.55**: High recall (99%)
- **0.65**: Balanced (recommended)
- **0.75**: High precision (97%)
- **0.85**: Very strict

## Testing
```bash
python test_ml_model.py              # Run tests
python train_advanced_model.py      # Retrain model
```

## Model Info
- **Type**: Logistic Regression
- **Features**: 9 engineered features
- **Size**: 2.3 MB
- **Speed**: 10-50ms per resume
- **Tech Recognition**: 50+ technologies

## Recognized Tech Skills
**Languages**: Python, Java, JavaScript, C++, C#, PHP, Ruby, Go, Rust  
**Databases**: SQL, PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch  
**Cloud**: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, Git  
**Frameworks**: Django, Flask, Spring, React, Angular, Vue, Node.js  
**AI/ML**: TensorFlow, PyTorch, scikit-learn, pandas, NumPy

## Feature Engineering
1. TF-IDF Cosine Similarity
2. Jaccard Similarity (set overlap)
3. Word Overlap Ratio
4. Resume Coverage
5. Length Features (normalized)
6. Tech Keyword Overlap
7. Tech Keyword Ratio
8. Job/Resume Length Ratio
9. Combined scoring metrics

## If Model Fails
- Automatically falls back to TF-IDF
- Print: "Using TF-IDF fallback method"
- Accuracy: ~75-80% (still good)

## Files
- Model: `models/best_resume_filter_model.pkl`
- Metrics: `models/training_results.json`
- Docs: `ML_MODEL_GUIDE.md`
- Summary: `TRAINING_SUMMARY.md`

## Configuration
Edit `app/routes/resumes.py`:
```python
threshold = 0.65  # Change this value
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Low scores | Lower threshold (0.55) |
| Too many rejections | Lower threshold (0.55) |
| Poor accuracy | Retrain: `python train_advanced_model.py` |
| Model not found | Run training script |

## Performance Tips
- Batch process resumes (faster)
- Use appropriate threshold
- Ensure quality job descriptions
- Update model with real data

## Support Files
- `train_advanced_model.py` - Training
- `test_ml_model.py` - Testing
- `app/ml/resume_filter.py` - Core module
- `requirements.txt` - Dependencies

---
**Model Status**: ✅ Production Ready  
**Last Trained**: April 4, 2026  
**Success Rate**: 97.76%
