import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
from tqdm import tqdm

from dataset import WasteDataset, LABEL_MAP
from model import WasteClassifier

def evaluate_model(model_path, test_list, data_folder, device='cuda'):
    # Load model
    model = WasteClassifier(num_classes=6)
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    # Load test data
    test_dataset = WasteDataset(test_list, data_folder, augment=False)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)
    
    # Predict
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for data, target in tqdm(test_loader, desc="Testing"):
            data = data.to(device)
            output = model(data)
            pred = output.argmax(dim=1)
            all_preds.extend(pred.cpu().numpy())
            all_labels.extend(target.numpy())
    
    # Metrics
    class_names = [LABEL_MAP[i+1] for i in range(6)]
    print("\n" + "="*60)
    print("CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(all_labels, all_preds, 
                                target_names=class_names, digits=4))
    
    # Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=class_names, yticklabels=class_names)
    plt.title(f'Confusion Matrix\nVal Acc: {checkpoint["val_acc"]:.2%}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=150)
    print("\n📊 Confusion matrix saved: confusion_matrix.png")
    
    # Per-class accuracy
    print("\n" + "="*60)
    print("PER-CLASS ACCURACY")
    print("="*60)
    for i, name in enumerate(class_names):
        acc = cm[i, i] / cm[i].sum() * 100
        print(f"{name:12s}: {acc:6.2f}% ({cm[i,i]:3d}/{cm[i].sum():3d})")

if __name__ == "__main__":
    evaluate_model(
        model_path="checkpoints/final_v3/best_model.pth",
        test_list="data/one-indexed-files-notrash_val.txt",  # ganti ke test jika ada
        data_folder="data/pics",
        device='cuda' if torch.cuda.is_available() else 'cpu'
    )