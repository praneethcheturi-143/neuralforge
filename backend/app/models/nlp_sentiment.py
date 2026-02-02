import torch
import torch.nn as nn
from transformers import DistilBertTokenizer, DistilBertModel
from pathlib import Path
import mlflow
import mlflow.pytorch
from loguru import logger
import numpy as np

class SentimentClassifier(nn.Module):
    def __init__(self, num_classes=3, dropout=0.3):
        super().__init__()
        self.bert = DistilBertModel.from_pretrained("distilbert-base-uncased")
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Sequential(
            nn.Linear(768, 256), nn.ReLU(), nn.Dropout(dropout), nn.Linear(256, num_classes)
        )
        self.labels = ["negative", "neutral", "positive"]

    def forward(self, input_ids, attention_mask):
        out = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        return self.classifier(self.dropout(out.last_hidden_state[:,0,:]))

    def predict(self, text, tokenizer, device="cpu"):
        self.eval()
        enc = tokenizer(text, truncation=True, max_length=128, padding="max_length", return_tensors="pt")
        with torch.no_grad():
            logits = self.forward(enc["input_ids"].to(device), enc["attention_mask"].to(device))
            probs = torch.softmax(logits, dim=-1).squeeze().cpu().numpy()
        idx = int(np.argmax(probs))
        return {"label": self.labels[idx], "confidence": float(probs[idx]),
                "probabilities": {l:float(p) for l,p in zip(self.labels, probs)}}

def train_nlp_model(num_epochs=3, save_path="./models/sentiment_model.pt"):
    from torch.utils.data import DataLoader, TensorDataset
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    model = SentimentClassifier().to(device)
    samples = [
        ("This model performs exceptionally well.", 2),
        ("Outstanding accuracy in production.", 2),
        ("The defences blocked the attack successfully.", 2),
        ("Excellent drift detection saved the system.", 2),
        ("Routine inference completed normally.", 1),
        ("System logs show 1200 requests processed.", 1),
        ("Pipeline completed in 4.2 minutes.", 1),
        ("Model version 3.1 registered.", 1),
        ("Critical adversarial attack detected.", 0),
        ("Severe data drift, accuracy dropped to 61%.", 0),
        ("Model producing unreliable predictions.", 0),
        ("Anomaly detected in input distribution.", 0),
    ]
    texts, label_list = [s[0] for s in samples], torch.tensor([s[1] for s in samples])
    enc = tokenizer(texts, truncation=True, max_length=128, padding="max_length", return_tensors="pt")
    loader = DataLoader(TensorDataset(enc["input_ids"], enc["attention_mask"], label_list), batch_size=4, shuffle=True)
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    criterion = nn.CrossEntropyLoss()
    mlflow.set_tracking_uri("./mlflow_artifacts")
    mlflow.set_experiment("neuralforge")
    with mlflow.start_run(run_name="nlp_sentiment"):
        for epoch in range(num_epochs):
            model.train()
            correct, total = 0, 0
            for ids, mask, labels in loader:
                ids, mask, labels = ids.to(device), mask.to(device), labels.to(device)
                optimizer.zero_grad()
                out = model(ids, mask)
                loss = criterion(out, labels)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                correct += out.argmax(1).eq(labels).sum().item()
                total += labels.size(0)
            logger.info(f"NLP Epoch {epoch+1}/{num_epochs} | Acc: {100*correct/total:.1f}%")
    torch.save(model.state_dict(), save_path)
    tokenizer.save_pretrained(str(Path(save_path).parent / "tokenizer"))
    logger.info(f"NLP model saved to {save_path}")
    return model

def load_nlp_model(path="./models/sentiment_model.pt"):
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    model = SentimentClassifier()
    if Path(path).exists():
        model.load_state_dict(torch.load(path, map_location="cpu"))
        logger.info(f"Loaded NLP model from {path}")
    else:
        logger.warning("NLP model not found, using random weights")
    model.eval()
    return model, tokenizer
