# AI Resume Filtering & Recruitment Management System: Comprehensive Documentation

## 1. System Overview & Features
The AI Resume Filtering system is a full-stack recruitment platform (React + Node/Flask + MongoDB) that bridges the gap between hiring managers (Admins) and applicants (Users). It utilizes Natural Language Processing (NLP) and Machine Learning (ML) to automatically parse, evaluate, and score candidate resumes against specific job descriptions.

### Core Platform Features:
- **Role-Based Access Control**: Separate dashboards for Admins (Companies) and Users (Applicants).
- **Recruitment Drives**: Admins can create targeted job drives with specific roles, job descriptions, and required keywords.
- **Applicant Pipeline**: Users can browse companies, view open drives, and upload their resumes (PDF/DOCX) natively.
- **Resume Builder**: A built-in feature allowing users to generate beautifully formatted, ATS-compliant resumes with multiple template layouts and export them natively.
- **Automated AI Filtering**: A 1-click intelligent screening mechanism that reads hundreds of resumes simultaneously and separates viable candidates from unqualified ones.
- **Real-Time Status Tracking**: Applicants can track their application state (Pending, Selected, Rejected) and view their AI-calculated Similarity Score dynamically.

---

## 2. Types of ML Models Utilized
The system leverages a sophisticated, multi-tiered algorithm approach to evaluate candidates. 

During the development and training phase, the system evaluated **5 distinct Machine Learning algorithms** on 2000 synthetic resume/job pairs:
1. **Logistic Regression** (SELECTED) - Achieved highest stability with **97.76% Accuracy** and **97.28% F1-score**.
2. **Support Vector Machine (SVM)** - Linear kernel with 97.76% accuracy and 97.28% F1-score.
3. **Gradient Boosting** - 97.50% accuracy.
4. **XGBoost** - 97.25% accuracy.
5. **Random Forest** - 96.25% accuracy.

### Fallback Model
If the primary ML model (`best_resume_filter_model.pkl`) is missing or fails to load, the system intelligently falls back to a **Heuristic Fallback Model**:
- **TF-IDF (Term Frequency-Inverse Document Frequency) + L2 Cosine Similarity**: A pure mathematical vectorization approach that plots the resume and job description on a multi-dimensional axis and calculates the cosine angle between them.

---

## 3. How the Models Work (Feature Engineering)
Before a resume is fed into the ML model, the natural language must be transformed into mathematical data. This is done through a rigorous pipeline:

### Step A: Text Preprocessing
1. **Format Extraction**: Raw text is pulled using `PyPDF2` (for PDFs) and `python-docx` (for Word docs).
2. **Cleaning & Tokenization**: Text is converted to lowercase, special characters are removed, and the sentence is split into "tokens" (words) using the `NLTK` library.
3. **Stop Word Removal & Lemmatization**: Words like "and", "the", "is" are stripped. Words are reduced to their root forms (e.g., "developer" -> "develop").

### Step B: Feature Extraction
The system calculates **7 distinct numerical features** that represent the relationship between the resume and the job description:
1. **TF-IDF Cosine Similarity**: Overarching thematic similarity.
2. **Jaccard Similarity**: Mathematical set-based overlap between job keywords and resume keywords.
3. **Word Overlap Ratio**: Percentage of required job keywords found in the applicant's resume.
4. **Resume Coverage**: Ensures the resume isn't just keyword stuffing but actually matches requirements proportionally.
5. **Length Ratio**: Normalized length comparisons to penalize extreme outliers.
6. **Tech Keyword Matching**: Specialized hard-matching for programming languages, databases, cloud providers (e.g., AWS, Python, React, MongoDB).
7. **N-gram Features**: Bigram patterns (2 words together) to catch specific phrases like "Machine Learning" instead of just "Machine" and "Learning".

### Step C: Classification
The 7 features are scaled mathematically using `StandardScaler` to prevent any one feature from dominating, and then fed into the **Logistic Regression** model. The model calculates a `Probability Score (0 to 1)`. 
- If the probability score is **>= 0.65** (configurable threshold), the model flags the candidate as **Selected**.
- If the probability score is **< 0.65**, the candidate is marked as **Rejected**.

---

## 4. Where the Models are Utilized
The machine learning pipeline acts entirely in the backend architecture and is integrated seamlessly into the recruiter's workflow.

1. **Trigger Point (Frontend)**: When an Admin opens a specific Recruitment Drive on their `AdminDriveDetail` dashboard, they click the **"Start AI Filter"** button. They are prompted to optionally enter bonus keywords they are looking for.
2. **API Endpoint**: The request is routed to the Backend API at `/api/resumes/analyze-all`.
3. **Execution (`resume_filter.py`)**: The backend simultaneously loads all uploaded applicant resumes for that specific drive. It runs the batch through the `.predict_proba()` function of the Logistic Regression model in memory.
4. **Database Database**: The backend updates MongoDB with both the `status` ("Selected" or "Rejected") and the `similarityScore` percentage for every calculated resume.
5. **UI Reflection**: The Admin dashboard instantly updates with visual colored badges (Green for Selected, Red for Rejected) and visual progress bars representing the candidate's exact match percentage, making it effortless to filter the best candidates for interviews.
