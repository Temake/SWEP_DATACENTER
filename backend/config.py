from pydantic_settings import SettingsConfigDict
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv(".env")
print(">>> DEBUG: ENV_STATE=:", os.getenv("ENV_STATE"))


from pydantic import BaseModel

from functools import lru_cache

class BaselConfig(BaseModel):
    ENV_STATE :str = os.getenv("ENV_STATE")
    model_config=SettingsConfigDict(env_file=".env")

class GlobalConfig(BaselConfig):
    DATABASE_URL : Optional[str] = "sqlite:///data.db"
    DB_ROLL_BACK: bool = False

class DevConfig(GlobalConfig):
    DATABASE_URL : str  = os.getenv("DEV_DATABASE_URL")
    model_config= SettingsConfigDict(env_prefix="DEV_")

class ProdConfig(GlobalConfig):
    DATABASE_URL: str = os.getenv("PROD_DATABASE_URL")
    model_config= SettingsConfigDict(env_prefix="PROD_")

@lru_cache()
def get_config(env_state:str):
    configs= {"dev": DevConfig,"prod": ProdConfig}
    return configs[env_state]()

print(">>> ENV_STATE from .env: ", BaselConfig().ENV_STATE)
print(">>> DEV_DATABASE_URL from .env:", os.getenv("DEV_DATABASE_URL"))
print(">>> PROD_DATABASE_URL from .env:", os.getenv("PROD_DATABASE_URL"))

config= get_config(BaselConfig().ENV_STATE)
print(">>> Loaded config DATABASE_URL:", config.DATABASE_URL)

#uvicorn backend.main:app --reload