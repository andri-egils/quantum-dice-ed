GET ENVIRONMENT SETUP:
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

RUN BACKEND:
uvicorn main:app --reload --port 8000