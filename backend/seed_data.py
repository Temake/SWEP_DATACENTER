from sqlmodel import Session
from models import Department, Student, Supervisor, Project, Tag, ProjectStatus
from models.database import engine

def seed_sample_data():
    with Session(engine) as session:
        print("Seeding sample data...")
        
        # Create departments
        comp_sci = Department(name="Computer Science", faculty="Computing Science and Engineering")
        inf_sys = Department(name="Information System", faculty="Computing Science and Engineering")
        
        session.add_all([comp_sci, inf_sys])
        session.commit()
        
        # Create students
        student1 = Student(name="Soliu Kabiru", email="kabiru@school.edu", 
                          level="300L", department_id=comp_sci.id)
        student2 = Student(name="Akingbade Michael", email="Michael@school.edu", 
                          level="300L", department_id=inf_sys.id)
        
        # Create supervisors
        supervisor1 = Supervisor(name="Dr. Gambo", 
                               email="gambo@school.edu", department_id=comp_sci.id)
        supervisor2 = Supervisor(name="Engr. Ajayi", 
                               email="Ajayi@school.edu", department_id=inf_sys.id)
        
        session.add_all([student1, student2, supervisor1, supervisor2])
        session.commit()
        
        # Create tags
        tag_ai = Tag(name="Artificial Intelligence")
        tag_web = Tag(name="Web Development")
        tag_iot = Tag(name="Internet of Things")
        tag_db = Tag(name="Database Systems")
        
        session.add_all([tag_ai, tag_web, tag_iot, tag_db])
        session.commit()
        
        # Create projects
        project1 = Project(
            title="AI-Powered Learning System",
            description="An intelligent system that adapts to student learning patterns",
            year=2025,
            student_id=student1.id,
            supervisor_id=supervisor1.id,
            status=ProjectStatus.APPROVED
        )
        project1.tags = [tag_ai, tag_web]
        
        project2 = Project(
            title="Smart Campus IoT Network",
            description="Implementing IoT devices across campus for energy efficiency",
            year=2023,
            student_id=student2.id,
            supervisor_id=supervisor2.id,
            status=ProjectStatus.PENDING
        )
        project2.tags = [tag_iot, tag_db]
        
        session.add_all([project1, project2])
        session.commit()
        
        print("Done, Sample data created successfully!")

if __name__ == "__main__":
    seed_sample_data()