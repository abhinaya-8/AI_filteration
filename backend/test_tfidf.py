import math
from collections import Counter

ref = "python software developer"
res = "experienced developer with python skills and java"

def custom_tfidf(ref_clean, resumes_clean):
    corpus = [ref_clean] + resumes_clean
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
            idf = math.log((1 + N) / (1 + df[term])) + 1
            vec[term] = count * idf
        norm = math.sqrt(sum(v*v for v in vec.values()))
        if norm > 0:
            vec = {term: v/norm for term, v in vec.items()}
        doc_vecs.append(vec)
        
    ref_vec = doc_vecs[0]
    sims = []
    for vec in doc_vecs[1:]:
        sim = sum(ref_vec.get(term, 0.0) * val for term, val in vec.items())
        sims.append(sim)
    return sims

print("Custom:", custom_tfidf(ref, [res]))
