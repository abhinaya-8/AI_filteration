"""
AI Resume Filtering & Recruitment Management System - Flask Application Factory
"""
import os
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    if config_name:
        app.config.from_object(f"app.config.{config_name}")

    # MongoDB
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    app.db = MongoClient(mongo_uri)[os.getenv("MONGO_DB", "recruitment_db")]

    CORS(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)

    # Ensure upload folder exists
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    from app.routes.auth import auth_bp
    from app.routes.companies import companies_bp
    from app.routes.recruitment_drives import drives_bp
    from app.routes.resumes import resumes_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(companies_bp, url_prefix="/api/companies")
    app.register_blueprint(drives_bp, url_prefix="/api/drives")
    app.register_blueprint(resumes_bp, url_prefix="/api/resumes")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "recruitment-api"}

    return app
