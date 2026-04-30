"""
Advanced Resume Filtering Model Training Script

This script trains multiple ML models for resume-job matching with high accuracy.
Includes feature engineering, hyperparameter tuning, and model evaluation.
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Dict, Tuple, Any
from collections import Counter

# ML imports
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.metrics.pairwise import cosine_similarity

# Models
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import MultinomialNB
from xgboost import XGBClassifier

# NLP
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer, PorterStemmer
import re

# Imbalanced learning
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns

# Download NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

class AdvancedResumeFilterTrainer:
    """Advanced trainer for resume filtering models"""

    def __init__(self, model_dir: str = "models"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)

        # Initialize NLP tools
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        self.stemmer = PorterStemmer()

        # Model configurations
        self.models_config = {
            'logistic_regression': {
                'model': LogisticRegression(random_state=42, max_iter=1000),
                'params': {
                    'C': [0.1, 1, 10, 100],
                    'penalty': ['l1', 'l2'],
                    'solver': ['liblinear', 'saga']
                }
            },
            'svm': {
                'model': SVC(random_state=42, probability=True),
                'params': {
                    'C': [0.1, 1, 10],
                    'kernel': ['linear', 'rbf', 'poly'],
                    'gamma': ['scale', 'auto', 0.1, 1]
                }
            },
            'random_forest': {
                'model': RandomForestClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [10, 20, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4]
                }
            },
            'gradient_boosting': {
                'model': GradientBoostingClassifier(random_state=42),
                'params': {
                    'n_estimators': [100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7]
                }
            },
            'xgboost': {
                'model': XGBClassifier(random_state=42, eval_metric='logloss'),
                'params': {
                    'n_estimators': [100, 200],
                    'learning_rate': [0.01, 0.1, 0.2],
                    'max_depth': [3, 5, 7],
                    'subsample': [0.8, 1.0]
                }
            }
        }

    def advanced_preprocess(self, text: str, use_stemming: bool = False) -> str:
        """Advanced text preprocessing with multiple techniques"""
        if not text or not text.strip():
            return ""

        # Convert to lowercase
        text = text.lower().strip()

        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)

        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)

        # Tokenize
        tokens = word_tokenize(text)

        # Remove stopwords and short tokens
        tokens = [token for token in tokens if token not in self.stop_words and len(token) > 2]

        # Apply lemmatization or stemming
        if use_stemming:
            tokens = [self.stemmer.stem(token) for token in tokens]
        else:
            tokens = [self.lemmatizer.lemmatize(token) for token in tokens]

        return ' '.join(tokens)

    def extract_features(self, job_text: str, resume_text: str) -> Dict[str, float]:
        """Extract comprehensive features for ML model"""
        features = {}

        # Preprocess texts
        job_clean = self.advanced_preprocess(job_text)
        resume_clean = self.advanced_preprocess(resume_text)

        # TF-IDF Cosine Similarity
        vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        try:
            tfidf_matrix = vectorizer.fit_transform([job_clean, resume_clean])
            features['tfidf_cosine_sim'] = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except:
            features['tfidf_cosine_sim'] = 0.0

        # Jaccard Similarity
        job_words = set(job_clean.split())
        resume_words = set(resume_clean.split())
        intersection = job_words.intersection(resume_words)
        union = job_words.union(resume_words)
        features['jaccard_sim'] = len(intersection) / len(union) if union else 0.0

        # Word overlap features
        features['word_overlap_ratio'] = len(intersection) / len(job_words) if job_words else 0.0
        features['resume_coverage'] = len(intersection) / len(resume_words) if resume_words else 0.0

        # Length features
        features['job_length'] = len(job_clean.split())
        features['resume_length'] = len(resume_clean.split())
        features['length_ratio'] = features['resume_length'] / features['job_length'] if features['job_length'] > 0 else 0.0

        # Keyword matching (common tech skills)
        tech_keywords = {
            'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
            'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring',
            'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'
        }

        job_tech_count = sum(1 for word in job_words if word in tech_keywords)
        resume_tech_count = sum(1 for word in resume_words if word in tech_keywords)
        features['tech_keyword_overlap'] = len(job_words.intersection(resume_words).intersection(tech_keywords))
        features['tech_keyword_ratio'] = features['tech_keyword_overlap'] / job_tech_count if job_tech_count > 0 else 0.0

        return features

    def generate_training_data(self, num_samples: int = 1000) -> pd.DataFrame:
        """Generate synthetic training data for model training"""
        print(f"Generating {num_samples} training samples...")

        # Sample job descriptions and skills
        job_templates = [
            "Software Engineer with experience in {tech} and {framework}",
            "Data Scientist proficient in {tech} and {ml_lib}",
            "Full Stack Developer skilled in {frontend} and {backend}",
            "DevOps Engineer with expertise in {cloud} and {tools}",
            "Mobile Developer experienced in {platform} development"
        ]

        tech_stacks = {
            'tech': ['Python', 'Java', 'JavaScript', 'C++', 'Go', 'Rust'],
            'framework': ['Django', 'Spring', 'React', 'Angular', 'Flask', 'Express'],
            'ml_lib': ['TensorFlow', 'PyTorch', 'scikit-learn', 'pandas', 'numpy'],
            'frontend': ['React', 'Angular', 'Vue.js', 'Svelte'],
            'backend': ['Node.js', 'Django', 'Spring Boot', 'Flask', 'Express'],
            'cloud': ['AWS', 'Azure', 'GCP', 'Heroku'],
            'tools': ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI'],
            'platform': ['iOS', 'Android', 'React Native', 'Flutter']
        }

        # Generate resume templates
        resume_templates = [
            "Experienced developer with {years} years in {tech} and {framework}. Skilled in {additional}",
            "Professional {role} with expertise in {tech}, {ml_lib}, and data analysis",
            "Full stack engineer proficient in {frontend}, {backend}, and cloud technologies",
            "{role} with {years} years experience in {platform} and {tech} development"
        ]

        data = []
        np.random.seed(42)

        for i in range(num_samples):
            # Randomly select job requirements
            job_template = np.random.choice(job_templates)
            job_data = {}
            for key, values in tech_stacks.items():
                if '{' + key + '}' in job_template:
                    job_data[key] = np.random.choice(values)

            job_desc = job_template.format(**job_data)

            # Generate matching/mismatching resume
            is_match = np.random.choice([True, False], p=[0.4, 0.6])  # 40% matches, 60% mismatches

            if is_match:
                # High similarity resume
                resume_template = np.random.choice(resume_templates[:2])  # Use relevant templates
                resume_data = job_data.copy()
                resume_data['years'] = np.random.choice(['2', '3', '4', '5', '6+'])
                resume_data['role'] = np.random.choice(['Software Engineer', 'Data Scientist', 'Developer'])
                resume_data['additional'] = np.random.choice(['SQL', 'Git', 'Agile', 'REST APIs'])
            else:
                # Low similarity resume - different tech stack
                resume_template = np.random.choice(resume_templates)
                resume_data = {}
                for key, values in tech_stacks.items():
                    if '{' + key + '}' in resume_template:
                        # Choose different tech than job requires
                        available_values = [v for v in values if v not in job_data.values()]
                        resume_data[key] = np.random.choice(available_values if available_values else values)
                resume_data['years'] = np.random.choice(['1', '2', '3'])
                resume_data['role'] = np.random.choice(['Designer', 'Analyst', 'Manager'])
                resume_data['additional'] = np.random.choice(['Excel', 'PowerPoint', 'Management'])

            try:
                resume_text = resume_template.format(**resume_data)
            except KeyError:
                resume_text = "General professional with various technical skills"

            # Extract features
            features = self.extract_features(job_desc, resume_text)
            features['is_selected'] = 1 if is_match else 0
            features['job_description'] = job_desc
            features['resume_text'] = resume_text

            data.append(features)

        df = pd.DataFrame(data)
        print(f"Generated {len(df)} samples: {df['is_selected'].sum()} selected, {len(df) - df['is_selected'].sum()} rejected")
        return df

    def train_models(self, X_train: np.ndarray, X_test: np.ndarray, y_train: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """Train and evaluate multiple models with hyperparameter tuning"""
        print("Training and evaluating models...")

        results = {}
        best_model = None
        best_score = 0

        for model_name, config in self.models_config.items():
            print(f"\nTraining {model_name}...")

            try:
                # Create pipeline with SMOTE for handling imbalance
                pipeline = ImbPipeline([
                    ('smote', SMOTE(random_state=42)),
                    ('scaler', StandardScaler()),
                    ('classifier', config['model'])
                ])

                # Grid search for hyperparameter tuning
                grid_search = GridSearchCV(
                    pipeline,
                    {'classifier__' + k: v for k, v in config['params'].items()},
                    cv=5,
                    scoring='f1',
                    n_jobs=-1,
                    verbose=1
                )

                grid_search.fit(X_train, y_train)

                # Evaluate on test set
                y_pred = grid_search.predict(X_test)
                y_pred_proba = grid_search.predict_proba(X_test)[:, 1]

                # Calculate metrics
                metrics = {
                    'accuracy': accuracy_score(y_test, y_pred),
                    'precision': precision_score(y_test, y_pred),
                    'recall': recall_score(y_test, y_pred),
                    'f1_score': f1_score(y_test, y_pred),
                    'best_params': grid_search.best_params_,
                    'cv_score': grid_search.best_score_
                }

                results[model_name] = {
                    'model': grid_search.best_estimator_,
                    'metrics': metrics,
                    'predictions': y_pred,
                    'probabilities': y_pred_proba
                }

                print(f"{model_name} - F1: {metrics['f1_score']:.4f}, Accuracy: {metrics['accuracy']:.4f}")

                # Track best model
                if metrics['f1_score'] > best_score:
                    best_score = metrics['f1_score']
                    best_model = model_name

            except Exception as e:
                print(f"Error training {model_name}: {str(e)}")
                continue

        results['best_model'] = best_model
        print(f"\nBest model: {best_model} with F1 score: {best_score:.4f}")
        return results

    def save_model(self, model_results: Dict[str, Any], feature_names: List[str]):
        """Save the best model and training artifacts"""
        best_model_name = model_results['best_model']
        best_model_data = model_results[best_model_name]

        # Save model
        model_path = self.model_dir / 'best_resume_filter_model.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump({
                'model': best_model_data['model'],
                'feature_names': feature_names,
                'model_name': best_model_name,
                'metrics': best_model_data['metrics'],
                'training_date': pd.Timestamp.now().isoformat()
            }, f)

        # Save training results
        results_path = self.model_dir / 'training_results.json'
        with open(results_path, 'w') as f:
            json.dump({
                model_name: {
                    'metrics': data['metrics'],
                    'best_params': str(data['metrics'].get('best_params', {}))
                }
                for model_name, data in model_results.items()
                if model_name != 'best_model'
            }, f, indent=2)

        print(f"Model saved to {model_path}")
        print(f"Training results saved to {results_path}")

    def plot_results(self, model_results: Dict[str, Any]):
        """Create visualization of model performance"""
        model_names = [name for name in model_results.keys() if name != 'best_model']
        f1_scores = [model_results[name]['metrics']['f1_score'] for name in model_names]
        accuracies = [model_results[name]['metrics']['accuracy'] for name in model_names]

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

        # F1 Scores
        ax1.bar(model_names, f1_scores, color='skyblue')
        ax1.set_title('F1 Scores by Model')
        ax1.set_ylabel('F1 Score')
        ax1.tick_params(axis='x', rotation=45)

        # Accuracy
        ax2.bar(model_names, accuracies, color='lightgreen')
        ax2.set_title('Accuracy by Model')
        ax2.set_ylabel('Accuracy')
        ax2.tick_params(axis='x', rotation=45)

        plt.tight_layout()
        plt.savefig(self.model_dir / 'model_comparison.png', dpi=300, bbox_inches='tight')
        plt.show()

    def train_complete_pipeline(self, num_samples: int = 2000):
        """Complete training pipeline"""
        print("Starting complete model training pipeline...")

        # Generate training data
        df = self.generate_training_data(num_samples)

        # Prepare features and target
        feature_cols = [col for col in df.columns if col not in ['is_selected', 'job_description', 'resume_text']]
        X = df[feature_cols].values
        y = df['is_selected'].values

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

        print(f"Training set: {X_train.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")
        print(f"Class distribution - Train: {np.bincount(y_train)}, Test: {np.bincount(y_test)}")

        # Train models
        model_results = self.train_models(X_train, X_test, y_train, y_test)

        # Save best model
        self.save_model(model_results, feature_cols)

        # Plot results
        try:
            self.plot_results(model_results)
        except:
            print("Could not generate plots")

        # Print final results
        best_model = model_results['best_model']
        metrics = model_results[best_model]['metrics']

        print("\n" + "="*50)
        print("FINAL RESULTS")
        print("="*50)
        print(f"Best Model: {best_model}")
        print(f"Accuracy: {metrics['accuracy']:.4f}")
        print(f"Precision: {metrics['precision']:.4f}")
        print(f"Recall: {metrics['recall']:.4f}")
        print(f"F1 Score: {metrics['f1_score']:.4f}")
        print(f"Cross-validation Score: {metrics['cv_score']:.4f}")
        print("="*50)

        return model_results

def main():
    """Main training function"""
    trainer = AdvancedResumeFilterTrainer()

    # Train with 2000 samples for good results
    results = trainer.train_complete_pipeline(num_samples=2000)

    print("\nTraining completed successfully!")
    print("The best model has been saved and can be used for resume filtering.")

if __name__ == "__main__":
    main()