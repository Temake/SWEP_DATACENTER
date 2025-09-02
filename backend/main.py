from fastapi import FastAPI

app=FastAPI(title="Student Data Center")

@app.router.get("/")
def root():
    return "Welcome here"