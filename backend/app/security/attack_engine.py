import torch
import torch.nn as nn
import numpy as np
from dataclasses import dataclass, field
from enum import Enum
from loguru import logger
import time

class AttackType(str, Enum):
    FGSM = "fgsm"
    PGD  = "pgd"
    CW   = "cw"

class ThreatLevel(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"

@dataclass
class AttackResult:
    attack_type: str
    original_label: str
    adversarial_label: str
    original_confidence: float
    adversarial_confidence: float
    perturbation_magnitude: float
    success: bool
    threat_level: ThreatLevel
    execution_time_ms: float
    confidence_drop: float
    metadata: dict = field(default_factory=dict)

def fgsm_attack(model, image, label, epsilon=0.03):
    image = image.clone().requires_grad_(True)
    loss = nn.CrossEntropyLoss()(model(image), label)
    model.zero_grad(); loss.backward()
    return torch.clamp(image + epsilon * image.grad.sign(), 0, 1).detach()

def pgd_attack(model, image, label, epsilon=0.03, alpha=0.01, num_steps=40):
    adv = image.clone()
    for _ in range(num_steps):
        adv = adv.clone().requires_grad_(True)
        loss = nn.CrossEntropyLoss()(model(adv), label)
        model.zero_grad(); loss.backward()
        with torch.no_grad():
            adv = torch.clamp(image + torch.clamp(adv + alpha*adv.grad.sign() - image, -epsilon, epsilon), 0, 1)
    return adv.detach()

def cw_attack(model, image, label, c=1.0, max_iter=50, lr=0.01):
    w = torch.atanh(image.clamp(0.001,0.999)*2-1).detach().clone().requires_grad_(True)
    opt = torch.optim.Adam([w], lr=lr)
    best = image.clone()
    best_l2 = float("inf")
    for _ in range(max_iter):
        adv = 0.5*(torch.tanh(w)+1)
        l2 = torch.sum((adv-image)**2)
        out = model(adv)
        oh = torch.zeros_like(out); oh.scatter_(1,label.unsqueeze(1),1.0)
        f = torch.clamp(torch.sum(oh*out,1) - torch.max((1-oh)*out-oh*1e4,1)[0], min=0)
        loss = l2 + c*f.sum(); opt.zero_grad(); loss.backward(); opt.step()
        if l2.item() < best_l2: best_l2=l2.item(); best=adv.detach().clone()
    return best

class AdversarialAttackEngine:
    def __init__(self, model, class_names):
        self.model = model
        self.class_names = class_names
        self.device = next(model.parameters()).device
        self.attack_history = []

    def run_attack(self, image, true_label, attack_type=AttackType.FGSM, epsilon=0.03, **kwargs):
        start = time.perf_counter()
        image = image.to(self.device)
        label = torch.tensor([true_label], device=self.device)
        img = image.unsqueeze(0) if image.dim()==3 else image
        self.model.eval()
        with torch.no_grad():
            op = torch.softmax(self.model(img), dim=-1)
        oi, oc = op.argmax().item(), op.max().item()
        if attack_type == AttackType.FGSM:
            adv = fgsm_attack(self.model, img, label, epsilon)
        elif attack_type == AttackType.PGD:
            adv = pgd_attack(self.model, img, label, epsilon, kwargs.get("alpha",0.01), kwargs.get("num_steps",40))
        else:
            adv = cw_attack(self.model, img, label)
        with torch.no_grad():
            ap = torch.softmax(self.model(adv), dim=-1)
        ai, ac = ap.argmax().item(), ap.max().item()
        pert = (adv-img).abs().max().item()
        drop = oc - ac
        success = ai != oi
        elapsed = (time.perf_counter()-start)*1000
        score = min((0.5 if success else 0) + (0.25 if drop>0.5 else 0.15 if drop>0.2 else 0) + (0.25 if pert<0.01 else 0.1 if pert<0.05 else 0), 1.0)
        level = ThreatLevel.CRITICAL if score>=0.75 else ThreatLevel.HIGH if score>=0.5 else ThreatLevel.MEDIUM if score>=0.25 else ThreatLevel.LOW
        result = AttackResult(
            attack_type=attack_type.value,
            original_label=self.class_names[oi] if oi<len(self.class_names) else str(oi),
            adversarial_label=self.class_names[ai] if ai<len(self.class_names) else str(ai),
            original_confidence=round(oc,4), adversarial_confidence=round(ac,4),
            perturbation_magnitude=round(pert,6), success=success, threat_level=level,
            execution_time_ms=round(elapsed,2), confidence_drop=round(drop,4),
            metadata={"epsilon":epsilon,"original_probs":op.squeeze().tolist(),"adversarial_probs":ap.squeeze().tolist()}
        )
        self.attack_history.append(result)
        logger.info(f"[{attack_type.value.upper()}] success={success} threat={level.value}")
        return result

    def detect_adversarial(self, image, threshold=0.7):
        self.model.eval()
        img = image.unsqueeze(0) if image.dim()==3 else image
        smoothed = torch.round(img*8)/8
        with torch.no_grad():
            op = torch.softmax(self.model(img), dim=-1)
            sp = torch.softmax(self.model(smoothed), dim=-1)
        score = (op-sp).abs().sum().item()
        return {"is_adversarial": score>threshold, "detection_score": round(score,4),
                "threshold": threshold, "method": "feature_squeezing",
                "threat_level": ThreatLevel.HIGH.value if score>threshold else ThreatLevel.LOW.value}

    def get_attack_statistics(self):
        if not self.attack_history: return {"total_attacks":0}
        successes = [r for r in self.attack_history if r.success]
        by_type = {}
        for r in self.attack_history:
            by_type.setdefault(r.attack_type,[]).append(r)
        return {
            "total_attacks": len(self.attack_history),
            "success_rate": round(len(successes)/len(self.attack_history),3),
            "avg_confidence_drop": round(np.mean([r.confidence_drop for r in self.attack_history]),4),
            "threat_distribution": {l.value:len([r for r in self.attack_history if r.threat_level==l]) for l in ThreatLevel},
            "by_attack_type": {k:{"count":len(v),"success_rate":round(sum(r.success for r in v)/len(v),3)} for k,v in by_type.items()}
        }
