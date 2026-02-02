#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import mlflow
from loguru import logger

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--quick", action="store_true")
    args = parser.parse_args()

    mlflow.set_tracking_uri("./mlflow_artifacts")
    mlflow.set_experiment("neuralforge")

    logger.info("=" * 50)
    logger.info("NeuralForge Model Training")
    logger.info("=" * 50)

    logger.info("\n[1/2] Training image classifier...")
    from app.models.image_classifier import train_model
    train_model(num_epochs=2 if args.quick else 10, save_path="./models/image_classifier.pt")
    logger.info("Image classifier done!")

    logger.info("\n[2/2] Training NLP sentiment model...")
    from app.models.nlp_sentiment import train_nlp_model
    train_nlp_model(num_epochs=2 if args.quick else 4, save_path="./models/sentiment_model.pt")
    logger.info("NLP model done!")

    logger.info("\nAll models saved to ./models/")
    logger.info("Now run: uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()
