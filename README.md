# Setup Project

## Clone the repository:

```bash
git clone https://github.com/andri-egils/quantum-dice-ed.git
cd quantum-dice-ed
```

# Backend

## Create and activate .venv environment
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # macOS/Linux
# Windows: .\.venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

## Run 
```bash
uvicorn main:app --reload --port 8000
```


# Frontend

## Create .env
```bash
cd frontend
echo "VITE_API_BASE=http://localhost:8000" > frontend/.env
```

## Install dependencies
```bash
npm install
```

## Run
```bash
npm run dev
```
