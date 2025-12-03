import torch
import torch.nn as nn
import torch.nn.functional as F

def conv_relu(in_channels, out_channels, kernel_size, stride=1, padding=0):
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding),
        nn.ReLU(inplace=True)
    )

def conv_relu_pool(in_channels, out_channels, kernel_size, stride, padding,
                   pool_kernel, pool_stride, pool_pad=0):
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding),
        nn.ReLU(inplace=True),
        nn.MaxPool2d(pool_kernel, pool_stride, pool_pad)
    )

class WasteClassifier(nn.Module):
    def __init__(self, num_classes=6, scale=1.0):
        super().__init__()
        
        c1 = int(96 * scale)
        c2 = int(256 * scale)
        c3 = int(384 * scale)
        c4 = int(384 * scale)
        c5 = int(256 * scale)
        fc6 = int(4096 * scale)
        fc7 = int(4096 * scale)

        self.features = nn.Sequential(
            conv_relu_pool(3, c1, 11, 4, 2, 3, 2),      # -> 63x63 → 31x31
            conv_relu_pool(c1, c2, 5, 1, 2, 3, 2),      # -> 31x31 → 15x15
            conv_relu(c2, c3, 3, 1, 1),                  # 15x15
            conv_relu(c3, c4, 3, 1, 1),                  # 15x15
            conv_relu_pool(c4, c5, 3, 1, 1, 3, 2),      # 15x15 → 7x7
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Dropout(0.5),
            nn.Linear(c5 * 7 * 7, fc6),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(fc6, fc7),
            nn.ReLU(inplace=True),
            nn.Linear(fc7, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

    def init_weights(self, method="kaiming"):
        for m in self.modules():
            if isinstance(m, nn.Conv2d) or isinstance(m, nn.Linear):
                if method == "kaiming":
                    nn.init.kaiming_normal_(m.weight, mode='fan_in', nonlinearity='relu')
                elif method == "xavier":
                    nn.init.xavier_normal_(m.weight)
                elif method == "xavier_caffe":
                    nn.init.xavier_normal_(m.weight, gain=1.0)
                else:  # heuristic (Lecun)
                    fan_in = m.weight.size(1)
                    std = (1.0 / (3 * fan_in)) ** 0.5
                    nn.init.normal_(m.weight, std=std)
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)