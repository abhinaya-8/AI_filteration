import re
from typing import List, Dict

TEMPLATE_DEFINITIONS = [
    {
        "id": "classic",
        "name": "Classic Professional",
        "category": "Professional",
        "description": "A timeless resume layout with a formal structure and clean visual hierarchy.",
    },
    {
        "id": "modern",
        "name": "Modern Minimal",
        "category": "Professional",
        "description": "A polished modern resume with minimal styling and strong section separation.",
    },
    {
        "id": "executive",
        "name": "Executive Clean",
        "category": "Professional",
        "description": "A refined executive-style resume tailored for senior-level roles and leadership positions.",
    },
    {
        "id": "polished",
        "name": "Polished Layout",
        "category": "Professional",
        "description": "A professional resume format that emphasizes impact, skills, and clear organization.",
    },
]

SKILL_KEYWORDS = {
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Django", "Flask", "SQL",
    "NoSQL", "MongoDB", "PostgreSQL", "AWS", "Azure", "Cloud", "Docker", "Kubernetes", "Git",
    "REST", "GraphQL", "HTML", "CSS", "Tailwind", "Machine Learning", "Data Analysis", "Tableau",
    "Power BI", "Excel", "Project Management", "Leadership", "Agile", "Scrum", "Communication",
    "Customer Service", "Sales", "Marketing", "Content Writing", "Copywriting", "Research", "Design",
    "UI/UX", "Figma", "Photoshop", "Illustrator", "Public Speaking", "Problem Solving", "Process Improvement",
}

ACTION_VERBS = [
    "Led", "Designed", "Built", "Improved", "Delivered", "Created", "Optimized", "Automated", "Launched",
    "Coordinated", "Managed", "Implemented", "Streamlined", "Reduced", "Increased", "Solved", "Spearheaded",
]

REWRITE_PATTERNS = [
    (r"responsible for", "Led"),
    (r"worked on", "Built"),
    (r"participated in", "Contributed to"),
    (r"helped with", "Supported"),
    (r"assisted with", "Assisted"),
    (r"involved in", "Worked on"),
]

ACTION_VERB_PATTERN = re.compile(rf"^({'|'.join([re.escape(v) for v in ACTION_VERBS])})\b", re.IGNORECASE)


def get_resume_templates() -> List[Dict[str, str]]:
    return TEMPLATE_DEFINITIONS


def extract_skills_from_text(text: str) -> List[str]:
    if not text:
        return []

    lower = text.lower()
    found = {skill for skill in SKILL_KEYWORDS if skill.lower() in lower}

    # Also capture simple capitalized skills and acronym tokens
    tokens = re.findall(r"[A-Za-z+#]+", text)
    for token in tokens:
        if token.lower() in {skill.lower() for skill in SKILL_KEYWORDS}:
            found.add(next(skill for skill in SKILL_KEYWORDS if skill.lower() == token.lower()))

    return sorted(found)


def suggest_bullet_point(bullet: str) -> str:
    if not bullet or not bullet.strip():
        return "Start with an action verb and quantify your impact."

    cleaned = bullet.strip().rstrip(".")

    for pattern, replacement in REWRITE_PATTERNS:
        if re.search(pattern, cleaned, flags=re.IGNORECASE):
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)
            break

    if not ACTION_VERB_PATTERN.match(cleaned):
        cleaned = f"{ACTION_VERBS[0]} {cleaned[0].lower() + cleaned[1:]}"

    return cleaned


def score_resume_data(resume_data: Dict) -> int:
    if not isinstance(resume_data, dict):
        return 0

    score = 0

    # Basic professional profile
    for key, points in [
        ("fullName", 10),
        ("email", 10),
        ("phone", 10),
        ("title", 10),
    ]:
        if resume_data.get(key):
            score += points

    if resume_data.get("summary"):
        score += 15

    # Skills & projects
    skills = resume_data.get("skills") or []
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    score += min(20, len(skills) * 4)

    project_text = " ".join(
        [p.get("description", "") for p in resume_data.get("projects", []) if isinstance(p, dict)]
    )
    if project_text.strip():
        score += 10

    # Experience bullets
    experience = resume_data.get("experience") or []
    if isinstance(experience, str):
        experience = [experience]
    bullet_count = sum(1 for item in experience if isinstance(item, str) and item.strip())
    score += min(20, bullet_count * 4)

    # Template fit and completeness
    completeness_items = [
        resume_data.get("education"),
        resume_data.get("certifications"),
        project_text.strip(),
    ]
    score += min(15, sum(1 for item in completeness_items if item and str(item).strip()) * 5)

    return min(100, max(0, int(score)))
