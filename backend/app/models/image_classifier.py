import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from pathlib import Path
import mlflow
import mlflow.pytorch
from loguru import logger
from typing import Optional

CIFAR10_CLASSES = [
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck"
]

class ImageClassifier(nn.Module):
    def __init__(self, num_classes: int = 10):
        super().__init__()
        self.backbone = models.resnet18(pretrained=False)
        self.backbone.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
        self.backbone.maxpool = nn.Identity()
        self.backbone.fc = nn.Linear(512, num_classes)
        self.num_classes = num_classes

    def forward(self, x):
        return self.backbone(x)

def get_transforms(train=True):
    if train:
        return transforms.Compose([
            transforms.RandomHorizontalFlip(),
            transforms.RandomCrop(32, padding=4),
            transforms.ToTensor(),
            transforms.Normalize((0.4914,0.4822,0.4465),(0.2023,0.1994,0.2010)),
        ])
    return transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.4914,0.4822,0.4465),(0.2023,0.1994,0.2010)),
    ])

def train_model(num_epochs=5, batch_size=128, learning_rate=0.1, save_path="./models/image_classifier.pt"):
    import torchvision.datasets as datasets
    from torch.utils.data import DataLoader
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Training on: {device}")
    train_dataset = datasets.CIFAR10(root="./data", train=True, download=True, transform=get_transforms(True))
    test_dataset  = datasets.CIFAR10(root="./data", train=False, download=True, transform=get_transforms(False))
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2)
    test_loader  = DataLoader(test_dataset,  batch_size=batch_size, shuffle=False, num_workers=2)
    model = ImageClassifier().to(device)
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate, momentum=0.9, weight_decay=5e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)
    criterion = nn.CrossEntropyLoss()
    mlflow.set_tracking_uri("./mlflow_artifacts")
    mlflow.set_experiment("neuralforge")
    with mlflow.start_run(run_name="image_classifier"):
        mlflow.log_params({"model":"ResNet-18","epochs":num_epochs,"lr":learning_rate})
        for epoch in range(num_epochs):
            model.train()
            correct, total, loss_sum = 0, 0, 0
            for inputs, labels in train_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                optimizer.zero_grad()
                out = model(inputs)
                loss = criterion(out, labels)
                loss.backward()
                optimizer.step()
                loss_sum += loss.item()
                correct += out.argmax(1).eq(labels).sum().item()
                total += labels.size(0)
            scheduler.step()
            acc = 100*correct/total
            logger.info(f"Epoch {epoch+1}/{num_epochs} | Acc: {acc:.1f}%")
            mlflow.log_metrics({"train_accuracy":acc}, step=epoch)
        torch.save(model.state_dict(), save_path)
        logger.info(f"Saved to {save_path}")
    return model

def load_model(path="./models/image_classifier.pt"):
    model = ImageClassifier()
    if Path(path).exists():
        model.load_state_dict(torch.load(path, map_location="cpu"))
        logger.info(f"Loaded image classifier from {path}")
    else:
        logger.warning("Image model not found, using random weights")
    model.eval()
    return model
