# dataset.py
import os
import torch
from torch.utils.data import Dataset
from torchvision import transforms
from PIL import Image

# Label mapping (1-indexed → folder name)
GLASS = 1
PAPER = 2
CARDBOARD = 3
PLASTIC = 4
METAL = 5
TRASH = 6
LABEL_MAP = {
    GLASS: "glass",
    PAPER: "paper",
    CARDBOARD: "cardboard",
    PLASTIC: "plastic",
    METAL: "metal",
    TRASH: "trash"
}

class WasteDataset(Dataset):
    def __init__(self, list_file: str, data_root: str,
                 input_size=(224, 224), mean=None, std=None, augment=False):
        """
        Dataset untuk klasifikasi sampah.
        Format file: <nama_file.jpg> <label_1_indexed>
        """
        self.data_root = data_root
        self.input_h, self.input_w = input_size
        self.augment = augment
        
        # Load file paths and labels
        self.filepaths = []
        self.labels = []
        with open(list_file, 'r') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                parts = line.split()
                if len(parts) < 2:
                    print(f"⚠️  Warning: baris {line_num} tidak lengkap: '{line}'")
                    continue
                img_path = parts[0]
                try:
                    label = int(parts[1])
                except ValueError:
                    print(f"⚠️  Warning: label tidak valid di baris {line_num}: '{parts[1]}'")
                    continue
                if label not in LABEL_MAP:
                    print(f"⚠️  Warning: label {label} tidak dikenal di baris {line_num}")
                    continue
                folder = LABEL_MAP[label]
                full_path = os.path.join(data_root, folder, img_path)
                if not os.path.isfile(full_path):
                    print(f"❌ File tidak ditemukan: {full_path}")
                    continue
                self.filepaths.append(full_path)
                self.labels.append(label - 1)  # 0-indexed untuk PyTorch

        # Normalisasi ImageNet default
        if mean is None:
            mean = [0.485, 0.456, 0.406]
        if std is None:
            std = [0.229, 0.224, 0.225]

        # Transform
        if augment:
            self.transform = transforms.Compose([
                transforms.Resize(
                    (int(self.input_h * 1.1), int(self.input_w * 1.1)),
                    interpolation=transforms.InterpolationMode.LANCZOS
                ),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomRotation(degrees=10),
                transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
                transforms.RandomAdjustSharpness(sharpness_factor=2, p=0.3),
                transforms.RandomAutocontrast(p=0.3),
                transforms.RandomPerspective(distortion_scale=0.1, p=0.2),
                transforms.RandomCrop((self.input_h, self.input_w)),
                transforms.ToTensor(),
                transforms.Normalize(mean=mean, std=std),
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize((self.input_h, self.input_w)),
                transforms.ToTensor(),
                transforms.Normalize(mean=mean, std=std),
            ])

    def __len__(self):
        return len(self.filepaths)

    def __getitem__(self, idx):
        try:
            img = Image.open(self.filepaths[idx]).convert("RGB")
        except Exception as e:
            raise RuntimeError(f"Gagal memuat {self.filepaths[idx]}: {e}")
        label = self.labels[idx]
        img = self.transform(img)
        return img, label