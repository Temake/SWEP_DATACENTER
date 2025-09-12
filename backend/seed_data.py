from sqlmodel import Session

from services.enums import Role
from models.account import  StudentAccount, SupervisorAccount
from models.database import engine

def seed_sample_data():
    with Session(engine) as session:
        print("Seeding sample data...")
      
        student1 = StudentAccount(
            name="Soliu Kabiru",
            role=Role.STUDENT,
            email="kabiru@school.edu",
            hashed_password="hashedpassword1",
            matric_no="STU001",
            department="Computer Science"
        )

        supervisor1 = SupervisorAccount(
            name="Dr. Gambo",
            role=Role.SUPERVISOR,
            email="gambo@school.edu",
            hashed_password="hashedpassword2",
            faculty="Science",
            office_address="Room 101"
        )
        session.add_all([student1, supervisor1])
        session.commit()
        session.refresh(student1)
        
        # # Create projects
        # project1 = Project(
        #     title="AI-Powered Learning System",
        #     description="An intelligent system that adapts to student learning patterns",
        #     year=2025,
        #     student_id=student1.id,
        #     supervisor_id=supervisor1.id,
        #     status=ProjectStatus.APPROVED
        # )
        # project1.tags = [, tag_web]
        
        # project2 = Project(
        #     title="Smart Campus IoT Network",
        #     description="Implementing IoT devices across campus for energy efficiency",
        #     year=2023,
        #     student_id=student2.id,
        #     supervisor_id=supervisor2.id,
        #     status=ProjectStatus.PENDING
        # )
        # project2.tags = [tag_iot, tag_db]
        
        # session.add_all([project1, project2])
        # session.commit()
        
        print("Done, Sample data created successfully!")

if __name__ == "__main__":
    seed_sample_data()