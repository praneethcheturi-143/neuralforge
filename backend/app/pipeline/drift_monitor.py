import numpy as np
from dataclasses import dataclass, field
from loguru import logger
import mlflow
import time

@dataclass
class DriftReport:
    dataset_drift: bool
    drift_share: float
    feature_stats: dict
    timestamp: float
    severity: str
    recommendations: list

class ModelDriftDetector:
    def __init__(self, reference_data=None):
        self.reference_data = reference_data
        self.drift_history = []
        self.psi_threshold = 0.2

    def set_reference(self, data):
        self.reference_data = data

    def compute_psi(self, expected, actual, buckets=10):
        bp = np.unique(np.percentile(expected, np.linspace(0,100,buckets+1)))
        ep = np.histogram(expected, bins=bp)[0] + 1e-6
        ap = np.histogram(actual,   bins=bp)[0] + 1e-6
        ep /= ep.sum(); ap /= ap.sum()
        return float(np.sum((ap-ep)*np.log(ap/ep)))

    def detect_drift(self, current_data):
        ref = self.reference_data
        if ref.ndim==1: ref=ref.reshape(-1,1)
        cur = current_data
        if cur.ndim==1: cur=cur.reshape(-1,1)
        stats = {}
        drifted = 0
        for i in range(ref.shape[1]):
            psi = self.compute_psi(ref[:,i], cur[:,i])
            d = psi > self.psi_threshold
            stats[f"feature_{i}"] = {"psi":round(psi,4),"drifted":d,"mean_shift":round(float(cur[:,i].mean()-ref[:,i].mean()),4)}
            if d: drifted += 1
        share = drifted/ref.shape[1]
        sev = "severe" if share>0.5 else "moderate" if share>0.2 else "mild" if share>0 else "none"
        recs = {"none":["No action required."],"mild":["Monitor closely."],
                "moderate":["Trigger retraining within 24h.","Investigate root cause."],
                "severe":["URGENT: Rollback model.","Freeze endpoint."]}[sev]
        report = DriftReport(dataset_drift=share>0.5, drift_share=round(share,3),
                             feature_stats=stats, timestamp=time.time(), severity=sev, recommendations=recs)
        self.drift_history.append(report)
        logger.info(f"Drift: share={share:.1%} severity={sev}")
        return report
