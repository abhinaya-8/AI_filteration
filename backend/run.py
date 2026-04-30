"""
Run Flask development server.
"""
import os
from dotenv import load_dotenv   # ✅ ADD THIS

load_dotenv()  # ✅ ADD THIS (VERY IMPORTANT)

from app import create_app

app = create_app()

if __name__ == "__main__":
    print("GEMINI KEY:", os.getenv("GEMINI_API_KEY"))  # ✅ DEBUG

    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)