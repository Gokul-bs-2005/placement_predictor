import os
import joblib
import pandas as pd

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
ML_DIR = os.path.join(PROJECT_ROOT, "ml-model")
MODEL_PATH = os.path.join(ML_DIR, "models", "best_model.joblib")

# =========================================================
# APP CONFIG
# =========================================================

app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "placement-secret-key")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "placement-jwt-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL",
    "sqlite:///" + os.path.join(BASE_DIR, "instance", "placement.db")
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")

# =========================================================
# CREATE FOLDERS
# =========================================================

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "instance"), exist_ok=True)

# =========================================================
# EXTENSIONS
# =========================================================

CORS(app, resources={r"/*": {"origins": "*"}})
jwt = JWTManager(app)
db = SQLAlchemy(app)

# =========================================================
# GROQ API KEY (set as environment variable)
# =========================================================

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# =========================================================
# FEATURES
# =========================================================

FEATURES = [
    "cgpa",
    "iq",
    "communication_skills",
    "projects",
    "internship_experience",
    "aptitude",
    "technical_skills",
    "backlogs",
    "extracurricular_activities",
]

# =========================================================
# DATABASE MODELS
# =========================================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)


class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(180), nullable=False)
    student_name = db.Column(db.String(120), nullable=False, default="Student")
    cgpa = db.Column(db.Float, nullable=False)
    iq = db.Column(db.Integer, nullable=False)
    communication_skills = db.Column(db.Integer, nullable=False)
    projects = db.Column(db.Integer, nullable=False)
    internship_experience = db.Column(db.Integer, nullable=False)
    aptitude = db.Column(db.Integer, nullable=False)
    technical_skills = db.Column(db.Integer, nullable=False)
    backlogs = db.Column(db.Integer, nullable=False)
    extracurricular_activities = db.Column(db.Integer, nullable=False)
    result = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)

# =========================================================
# LOAD MODEL
# =========================================================

def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not found. Run train_model.py first.")
    return joblib.load(MODEL_PATH)

# =========================================================
# ROUTES
# =========================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Placement Predictor API Running", "status": "ok"})

@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "User already exists"}), 409

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True, "message": "Signup successful"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    token = create_access_token(identity=email)
    return jsonify({
        "success": True,
        "token": token,
        "user": {"name": user.name, "email": user.email}
    })

@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    current_user = get_jwt_identity()
    data = request.get_json()

    # Validate all required features
    missing = [f for f in FEATURES if f not in data or data[f] == "" or data[f] is None]
    if missing:
        return jsonify({"success": False, "errors": {f: "Required" for f in missing}}), 400

    try:
        model = load_model()
    except FileNotFoundError as e:
        return jsonify({"success": False, "message": str(e)}), 500

    input_data = pd.DataFrame([{f: float(data[f]) for f in FEATURES}])
    prediction = int(model.predict(input_data)[0])
    probability = model.predict_proba(input_data)[0]
    confidence = float(max(probability) * 100)
    result = "Placed" if prediction == 1 else "Not Placed"

    record = Prediction(
        user_email=current_user,
        student_name=data.get("student_name", "Student"),
        result=result,
        confidence=round(confidence, 2),
        **{f: float(data[f]) for f in FEATURES}
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({"success": True, "result": result, "confidence": round(confidence, 2)})

@app.route("/students", methods=["GET"])
@jwt_required()
def students():
    search = request.args.get("search", "").strip()
    result_filter = request.args.get("result", "All")

    query = Prediction.query
    if search:
        query = query.filter(Prediction.student_name.ilike(f"%{search}%"))
    if result_filter and result_filter != "All":
        query = query.filter(Prediction.result == result_filter)

    records = query.all()
    data = [{
        "id": r.id,
        "student_name": r.student_name,
        "cgpa": r.cgpa,
        "technical_skills": r.technical_skills,
        "projects": r.projects,
        "backlogs": r.backlogs,
        "result": r.result,
        "confidence": r.confidence
    } for r in records]

    return jsonify({"success": True, "students": data})

@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    current_user = get_jwt_identity()
    records = Prediction.query.filter_by(user_email=current_user).order_by(Prediction.id.desc()).all()

    data = [{
        "id": r.id,
        "student_name": r.student_name,
        "cgpa": r.cgpa,
        "technical_skills": r.technical_skills,
        "result": r.result,
        "confidence": r.confidence
    } for r in records]

    return jsonify({"success": True, "history": data})

@app.route("/analytics", methods=["GET"])
@jwt_required()
def analytics():
    records = Prediction.query.all()
    total = len(records)
    placed = sum(1 for r in records if r.result == "Placed")
    not_placed = total - placed
    rate = round((placed / total) * 100, 2) if total > 0 else 0

    return jsonify({
        "success": True,
        "analytics": {
            "total": total,
            "placed": placed,
            "not_placed": not_placed,
            "placement_rate": rate
        }
    })

@app.route("/upload-dataset", methods=["POST"])
@jwt_required()
def upload_dataset():
    if "file" not in request.files:
        return jsonify({"success": False, "message": "CSV file required"}), 400

    file = request.files["file"]
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    return jsonify({"success": True, "message": "Dataset uploaded"})

@app.route("/download-report", methods=["POST"])
@jwt_required()
def download_report():
    data = request.get_json()
    report_path = os.path.join(BASE_DIR, "prediction_report.pdf")

    c = canvas.Canvas(report_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(70, 730, "Placement Prediction Report")
    c.setFont("Helvetica", 12)
    y = 680

    for key, value in data.items():
        c.drawString(70, y, f"{key}: {value}")
        y -= 25
        if y < 60:
            c.showPage()
            y = 730

    c.save()
    return send_file(report_path, as_attachment=True)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"success": False, "message": "Message required"}), 400

    if not GROQ_API_KEY:
        return jsonify({"success": False, "message": "GROQ_API_KEY not configured on server"}), 503

    try:
        import urllib.request
        import json as json_lib

        payload = json_lib.dumps({
            "model": "llama3-8b-8192",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a smart AI placement assistant helping students with coding, placements, projects, resumes and careers."
                },
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.7,
            "max_tokens": 300
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json_lib.loads(resp.read().decode("utf-8"))

        reply = result["choices"][0]["message"]["content"]
        return jsonify({"success": True, "reply": reply})

    except Exception as e:
        return jsonify({"success": False, "message": f"AI error: {str(e)}"}), 500

# =========================================================
# CREATE DATABASE
# =========================================================

with app.app_context():
    db.create_all()

# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":
    app.run(debug=True, port=5000)
