from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "NeuralForge"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    REDIS_URL: str = "redis://localhost:6379"
    MLFLOW_TRACKING_URI: str = "./mlflow_artifacts"
    MLFLOW_EXPERIMENT_NAME: str = "neuralforge"
    MODEL_DIR: str = "./models"
    IMAGE_MODEL_PATH: str = "./models/image_classifier.pt"
    NLP_MODEL_PATH: str = "./models/sentiment_model.pt"
    SECRET_KEY: str = "neuralforge-secret-key-change-in-production"
    ADVERSARIAL_THRESHOLD: float = 0.7
    DRIFT_THRESHOLD: float = 0.15

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
