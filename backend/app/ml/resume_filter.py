"""
ML Module: Resume filtering using Advanced ML Models.

- Preprocessing: lowercase, stopwords removal, tokenization, lemmatization
- Advanced feature engineering: TF-IDF, Jaccard, word overlap, tech keywords, length features
- ML Models: Logistic Regression, SVM, Random Forest, Gradient Boosting, XGBoost
- Fallback to TF-IDF + Cosine Similarity if model not available
- sklearn is required for advanced features
"""
import os
import pickle
from pathlib import Path
from typing import List, Tuple

# Resume parsing (required for upload)
import PyPDF2
from docx import Document as DocxDocument

# NLTK and sklearn are required
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import re

# ML libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Download NLTK data if needed
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet', quiet=True)

# Global variables
_STOP_WORDS = None
_LEMMATIZER = None
_ML_MODEL = None
_FEATURE_NAMES = None


def _get_nltk():
    global _STOP_WORDS, _LEMMATIZER
    if _STOP_WORDS is not None:
        return _STOP_WORDS, _LEMMATIZER
    try:
        _STOP_WORDS = set(stopwords.words("english"))
        _LEMMATIZER = WordNetLemmatizer()
        return _STOP_WORDS, _LEMMATIZER
    except Exception:
        return set(), None


def _load_ml_model():
    """Load the trained ML model if available"""
    global _ML_MODEL, _FEATURE_NAMES
    if _ML_MODEL is not None:
        return _ML_MODEL, _FEATURE_NAMES

    model_path = Path(__file__).parent.parent.parent / "models" / "best_resume_filter_model.pkl"
    if model_path.exists():
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                _ML_MODEL = model_data['model']
                _FEATURE_NAMES = model_data['feature_names']
                print(f"Loaded ML model: {model_data.get('model_name', 'Unknown')}")
                return _ML_MODEL, _FEATURE_NAMES
        except Exception as e:
            print(f"Error loading ML model: {e}")

    _ML_MODEL = None
    _FEATURE_NAMES = None
    return None, None


def _preprocess(text: str) -> str:
    """Advanced text preprocessing with multiple techniques"""
    if not text or not text.strip():
        return ""
    stop_words, lemmatizer = _get_nltk()
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in stop_words and len(t) > 1]
    if lemmatizer:
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens)


def _extract_features(job_text: str, resume_text: str) -> dict:
    """Extract comprehensive features for ML model"""
    import math
    features = {}

    # Preprocess texts
    job_clean = _preprocess(job_text)
    resume_clean = _preprocess(resume_text)

    # TF-IDF Cosine Similarity with better handling for short job descriptions
    try:
        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=1)
        tfidf_matrix = vectorizer.fit_transform([job_clean, resume_clean])
        features['tfidf_cosine_sim'] = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    except:
        features['tfidf_cosine_sim'] = 0.0

    # Jaccard Similarity (improved)
    job_words = set(job_clean.split())
    resume_words = set(resume_clean.split())
    intersection = job_words.intersection(resume_words)
    union = job_words.union(resume_words)
    features['jaccard_sim'] = len(intersection) / len(union) if union else 0.0

    # Word overlap features (improved for short job descriptions)
    features['word_overlap_ratio'] = len(intersection) / len(job_words) if job_words else 0.0
    # Use geometric mean instead of just ratio to reduce penalty for long resumes
    features['resume_coverage'] = len(intersection) / max(len(resume_words), len(job_words)) if (resume_words or job_words) else 0.0

    # Length features (improved - use log scale to reduce extreme penalties)
    job_length = len(job_clean.split())
    resume_length = len(resume_clean.split())
    features['job_length'] = min(job_length, 50)  # Cap at 50 for reasonable range
    features['resume_length'] = min(resume_length, 200)  # Cap at 200
    # Use log ratio instead of raw ratio to handle extreme differences
    features['length_ratio'] = math.log(1 + resume_length / max(job_length, 1)) / math.log(11)  # Normalize to 0-1 range

    # Keyword matching (common tech skills) - this is working well
    tech_keywords = {
        'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
        'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring',
        'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'
    }

    job_tech_count = sum(1 for word in job_words if word in tech_keywords)
    resume_tech_count = sum(1 for word in resume_words if word in tech_keywords)
    tech_overlap = len(job_words.intersection(resume_words).intersection(tech_keywords))
    
    features['tech_keyword_overlap'] = tech_overlap
    # Tech keyword ratio: if job mentions tech keywords, prioritize matching them
    if job_tech_count > 0:
        features['tech_keyword_ratio'] = tech_overlap / job_tech_count
    else:
        # If job doesn't mention specific tech, check if resume has any tech skills
        features['tech_keyword_ratio'] = min(resume_tech_count / 5, 1.0) if resume_tech_count > 0 else 0.0

    return features


def extract_text_from_file(file_path: str) -> str:
    """
    Extract raw text from PDF or DOCX file.
    Returns empty string on failure.
    """
    path = Path(file_path)
    if not path.exists():
        return ""

    try:
        if path.suffix.lower() == ".pdf":
            with open(path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                parts = []
                for page in reader.pages:
                    parts.append(page.extract_text() or "")
                return "\n".join(parts)
        if path.suffix.lower() in (".docx", ".doc"):
            doc = DocxDocument(path)
            return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        pass
    return ""


def compute_similarity(
    reference_text: str,
    resume_texts: List[str],
    threshold: float = 0.45,
) -> List[Tuple[float, str]]:
    """
    Compare each resume text to reference (job description + keywords) using ML model or TF-IDF fallback.
    Uses trained ML model if available, otherwise falls back to TF-IDF + Cosine Similarity.
    Default threshold is 0.45 for better recall with short job descriptions.

    Args:
        reference_text: Job description + optional keywords (single combined string).
        resume_texts: List of resume text strings.
        threshold: Minimum similarity (0–1) for "Selected"; below = "Rejected".

    Returns:
        List of (similarity_score, status) per resume. status is "Selected" or "Rejected".
    """
    if not reference_text or not resume_texts:
        return [(0.0, "Rejected")] * len(resume_texts)

    # Try to use ML model first
    model, feature_names = _load_ml_model()
    if model is not None and feature_names is not None:
        try:
            results = []
            for resume_text in resume_texts:
                features = _extract_features(reference_text, resume_text)

                # KEYWORD BOOST: If tech keywords match perfectly, boost the score
                tech_ratio = features.get('tech_keyword_ratio', 0.0)
                keyword_overlap = features.get('tech_keyword_overlap', 0.0)
                
                # Create feature vector in correct order
                feature_vector = [features.get(name, 0.0) for name in feature_names]

                # Get prediction probability
                proba = model.predict_proba([feature_vector])[0][1]  # Probability of being selected
                score = float(proba)
                
                # If tech keywords match well, boost score
                if tech_ratio >= 0.7 and keyword_overlap > 0:
                    score = max(score, 0.6)  # Boost to at least 0.6 for good tech match
                    threshold = min(threshold, 0.45)  # Use lower threshold for tech matches

                status = "Selected" if score >= threshold else "Rejected"
                results.append((score, status))
            return results
        except Exception as e:
            print(f"ML model prediction failed, falling back to TF-IDF: {e}")

    # Fallback to TF-IDF implementation
    print("Using TF-IDF fallback method")
    ref_clean = _preprocess(reference_text)
    resumes_clean = [_preprocess(t) for t in resume_texts]

    # Build corpus: first document = reference, rest = resumes
    corpus = [ref_clean] + resumes_clean

    try:
        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        matrix = vectorizer.fit_transform(corpus)
        ref_vec = matrix[0:1]
        resume_vecs = matrix[1:]
        sims = cosine_similarity(ref_vec, resume_vecs).flatten()
    except Exception:
        # Fallback pure Python TF-IDF implementation
        import math
        from collections import Counter
        doc_tokens = []
        for doc in corpus:
            words = doc.split()
            doc_tokens.append(words + [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)])
            
        doc_tfs = [Counter(tokens) for tokens in doc_tokens]
        df = Counter()
        for tfs in doc_tfs:
            for term in tfs.keys():
                df[term] += 1
                
        N = len(corpus)
        doc_vecs = []
        for tfs in doc_tfs:
            vec = {}
            for term, count in tfs.items():
                # sklearn-style smoothed IDF: log((1+N)/(1+df)) + 1
                idf = math.log((1 + N) / (1 + df[term])) + 1
                vec[term] = count * idf
            # L2 Normalization
            norm = math.sqrt(sum(v*v for v in vec.values()))
            if norm > 0:
                vec = {term: v/norm for term, v in vec.items()}
            doc_vecs.append(vec)
            
        ref_vec = doc_vecs[0]
        sims = []
        for vec in doc_vecs[1:]:
            sim = sum(ref_vec.get(term, 0.0) * val for term, val in vec.items())
            sims.append(sim)

    results = []
    for i, s in enumerate(sims):
        score = float(s)
        
        # Apply keyword boosting in TF-IDF fallback too
        if i < len(resume_texts):
            features = _extract_features(reference_text, resume_texts[i])
            tech_ratio = features.get('tech_keyword_ratio', 0.0)
            keyword_overlap = features.get('tech_keyword_overlap', 0.0)
            
            if tech_ratio >= 0.7 and keyword_overlap > 0:
                score = max(score, 0.6)
                threshold = min(threshold, 0.45)
        
        status = "Selected" if score >= threshold else "Rejected"
        results.append((score, status))
    return results


def analyze_resumes_batch(
    job_description: str,
    keywords: str,
    resume_texts: List[str],
    threshold: float = 0.65,
) -> List[dict]:
    """
    Run full analysis: combine job description + keywords, compute similarity for each resume.

    Returns list of dicts: [{"similarityScore": float, "status": "Selected"|"Rejected"}, ...]
    """
    combined = f"{job_description}\n{keywords}".strip()
    pairs = compute_similarity(combined, resume_texts, threshold)
    return [
        {"aiScore": round(score, 4), "status": status}
        for score, status in pairs
    ]
