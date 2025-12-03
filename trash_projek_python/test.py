# test.py
import argparse
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
import json
import os

from dataset import WasteDataset
from model import WasteClassifier
from utils import print_time
import matplotlib.pyplot as plt
import seaborn as sns


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", type=str, required=True)
    parser.add_argument("--split", type=str, default="all", choices=["train", "val", "test", "all"])
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu")
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--num_workers", type=int, default=4)
    # Default args (karena tidak diambil dari checkpoint)
    parser.add_argument("--data_folder", type=str, default="data/pics")
    parser.add_argument("--input_size", type=int, nargs=2, default=[224, 224])
    parser.add_argument("--num_classes", type=int, default=6)
    parser.add_argument("--threshold_trash", type=float, default=0.6,
                        help="Threshold probabilitas untuk prediksi trash (label=5)")
    
    args = parser.parse_args()
    device = torch.device(args.device)
    print_time(f"Loading checkpoint: {args.checkpoint}")
    
    # Muat checkpoint tanpa asumsi 'args'
    ckpt = torch.load(args.checkpoint, map_location=device, weights_only=True)
    
    # Bangun model secara eksplisit
    model = WasteClassifier(num_classes=args.num_classes)
    model.load_state_dict(ckpt["model_state_dict"])
    model = model.to(device)
    model.eval()
    
    splits = ["train", "val", "test"] if args.split == "all" else [args.split]
    results = {}
    
    default_paths = {
        "train": "data/one-indexed-files-notrash_train.txt",
        "val": "data/one-indexed-files-notrash_val.txt",
        "test": "data/one-indexed-files-notrash_test.txt"
    }
    
    for split in splits:
        list_file = default_paths[split]
        if not os.path.isfile(list_file):
            print_time(f"❌ File {list_file} tidak ditemukan!")
            continue
            
        dataset = WasteDataset(
            list_file=list_file,
            data_root=args.data_folder,
            input_size=args.input_size,
            augment=False
        )
        dataloader = DataLoader(
            dataset,
            batch_size=args.batch_size,
            shuffle=False,
            num_workers=args.num_workers
        )
        
        criterion = torch.nn.CrossEntropyLoss()
        total_loss = 0.0
        correct = 0
        all_preds, all_labels = [], []
        
        with torch.no_grad():
            for data, target in dataloader:
                data, target = data.to(device), target.to(device)
                output = model(data)
                loss = criterion(output, target)
                total_loss += loss.item()
                
                # 🔥 Thresholding khusus untuk trash
                probs = torch.softmax(output, dim=1)
                pred = torch.argmax(probs, dim=1)
                
                # Jika probabilitas trash > threshold & maksimum → prediksi trash
                # Jika tidak, abaikan kelas trash dan pilih dari 5 kelas lain
                for i in range(len(pred)):
                    if probs[i, 5] > args.threshold_trash and probs[i, 5] == probs[i].max():
                        pred[i] = 5
                    else:
                        pred[i] = torch.argmax(probs[i, :5])  # hanya 0–4 (non-trash)
                
                correct += pred.eq(target).sum().item()
                all_preds.extend(pred.cpu().numpy())
                all_labels.extend(target.cpu().numpy())
        
        acc = correct / len(dataset)
        avg_loss = total_loss / len(dataloader)
        results[split] = {"acc": acc, "loss": avg_loss}
        
        print_time(f"{split.capitalize()} → Acc: {acc:.4f}, Loss: {avg_loss:.4f}")
        
        # Simpan confusion matrix hanya untuk test
        if split == "test":
            labels = ["glass", "paper", "cardboard", "plastic", "metal", "trash"]
            cm = confusion_matrix(all_labels, all_preds)
            plt.figure(figsize=(8, 6))
            sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                        xticklabels=labels, yticklabels=labels)
            plt.title(f"Confusion Matrix (Test Set, trash_threshold={args.threshold_trash})")
            plt.ylabel("True Label")
            plt.xlabel("Predicted Label")
            plt.tight_layout()
            plt.savefig("confusion_matrix.png", dpi=150, bbox_inches="tight")
            print_time("📊 Confusion matrix saved as 'confusion_matrix.png'")
            
            report = classification_report(
                all_labels, all_preds,
                target_names=labels,
                digits=4,
                zero_division=0
            )
            print("\n" + "="*50)
            print("CLASSIFICATION REPORT (Test Set)")
            print("="*50)
            print(report)
    
    # Simpan hasil
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print_time("✅ Results saved to 'test_results.json'")


if __name__ == "__main__":
    main()