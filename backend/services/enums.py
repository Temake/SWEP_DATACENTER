import enum

class Role(str,enum.Enum):
    STUDENT = "Student"
    SUPERVISOR = "Supervisor"
    ADMIN = "Admin"

class Tags(str,enum.Enum):
    AI = "AI"
    WEB_DEV = "Web Development"
    DATA_SCIENCE = "Data Science"
    MOBILE_DEV = "Mobile Development"
    CYBER_SECURITY = "Cyber Security"
    CLOUD_COMPUTING = "Cloud Computing"
    GAME_DEV = "Game Development"
    DEVOPS = "DevOps"
    IOT = "Internet of Things (IoT)"
    BLOCKCHAIN = "Blockchain"
    SOFTWARE_TESTING = "Software Testing"
    UI_UX = "UI/UX Design"
    NETWORKING = "Networking"
    DATABASES = "Databases"
    EMBEDDED_SYSTEMS = "Embedded Systems"
    ANIMATION = "Animation"
    MACHINE_LEARNING = "Machine Learning"
    AR_VR = "AR/VR"
    BIG_DATA = "Big Data"
    ROBOTICS="Robotics"
    OTHERS="Others"
    OTHERS2="[]"
    
    
    
class Status(str,enum.Enum):
    PENDING = "Pending"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    SUSPENDED = "Suspended"
    