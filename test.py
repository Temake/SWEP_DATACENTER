import requests


json= {
  "name": 11,
  "email": "user@example.com",
  "role": "Student",
  "department": "string",
  "password": "string",
  "matric_no": "string"
}

res= requests.post("http://localhost:8000/api/auth/register/student",json=json)
de=res.json()

print(de[0])