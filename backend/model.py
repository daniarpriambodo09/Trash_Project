# model.py — ResNet18 pretrained untuk klasifikasi sampah
import torch
import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights

class WasteClassifier(nn.Module):
    def __init__(self, num_classes=6, freeze_backbone=False):
        super().__init__()
        # Load pretrained ResNet18
        weights = ResNet18_Weights.DEFAULT
        self.backbone = resnet18(weights=weights)
        
        # Freeze backbone (opsional — cocok untuk dataset kecil)
        if freeze_backbone:
            for param in self.backbone.parameters():
                param.requires_grad = False
        
        # Ganti head layer terakhir
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(in_features, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)

    def init_weights(self, method="kaiming"):
        # Hanya inisialisasi ulang head layer (jika tidak freeze)
        for m in self.backbone.fc.modules():
            if isinstance(m, nn.Linear):
                if method == "kaiming":
                    nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                elif method == "xavier":
                    nn.init.xavier_normal_(m.weight)
                nn.init.constant_(m.bias, 0)