from pydantic_settings import SettingsConfigDict
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv(".env")
import cloudinary


from pydantic import BaseModel

from functools import lru_cache

class BaselConfig(BaseModel):
    ENV_STATE :str = os.getenv("ENV_STATE")
    model_config=SettingsConfigDict(env_file=".env")
    CLOUDINARY_CLOUD_NAME: Optional[str] = os.getenv("CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: Optional[str] = os.getenv("CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: Optional[str] = os.getenv("CLOUDINARY_API_SECRET")
    
 class  GloablConfig(BaseConfig):
    def __init__(self):
        super().__init__()
        cloudinary.config(
            cloud_name = self.CLOUDINARY_CLOUD_NAME,
            api_key = self.CLOUDINARY_API_KEY,
            api_secret = self.CLOUDINARY_API_SECRET
        )
    DATABASE_URL : Optional[str] = "sqlite:///data.db"
    DB_ROLL_BACK: bool = False
   
class DevConfig(GlobalConfig):
    DATABASE_URL : str  = os.getenv("DEV_DATABASE_URL", "sqlite:///data.db")
    # model_config= SettingsConfigDict(env_prefix="DEV_")
    REDIS_URL: str = os.getenv("DEV_REDIS_URL", "redis://localhost:6379/0")
    

    CELERY_BROKER_URL: str = os.getenv("DEV_CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("DEV_CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

class ProdConfig(GlobalConfig):
    DATABASE_URL: str = os.getenv("DATABASE_URL") or os.getenv("PROD_DATABASE_URL", "postgresql://user:password@db:5432/scholarbase")
    model_config= SettingsConfigDict(env_prefix="PROD_")
    REDIS_URL: str = os.getenv("PROD_REDIS_URL", "redis://localhost:6379/0")
    
    # Celery Configuration
    CELERY_BROKER_URL: str = os.getenv("PROD_CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("PROD_CELERY_RESULT_BACKEND", "redis://localhost:6379/0")


@lru_cache()
def get_config(env_state:str):
    configs= {"dev": DevConfig,"prod": ProdConfig}
    return configs[env_state]()

config= get_config(BaselConfig().ENV_STATE)


#uvicorn backend.main:app --reload