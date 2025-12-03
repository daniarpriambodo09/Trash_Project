# train.py — versi anti-bias
import argparse
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from tqdm import tqdm
import os
import json
from datetime import datetime

from dataset import WasteDataset
from model import WasteClassifier
from utils import print_time, ensure_dir


def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0
    pbar = tqdm(dataloader, desc="Training", leave=False)
    for data, target in pbar:
        data, target = data.to(device), target.to(device)
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        pred = output.argmax(dim=1, keepdim=True)
        correct += pred.eq(target.view_as(pred)).sum().item()
        total += target.size(0)

        # Update tqdm description
        pbar.set_postfix({
            'Loss': f'{total_loss / len(pbar):.4f}',
            'Acc': f'{correct / total:.3%}'
        })

    return total_loss / len(dataloader), correct / total


def evaluate(model, dataloader, criterion, device):
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0
    pbar = tqdm(dataloader, desc="Evaluating", leave=False)
    with torch.no_grad():
        for data, target in pbar:
            data, target = data.to(device), target.to(device)
            output = model(data)
            loss = criterion(output, target)
            total_loss += loss.item()
            pred = output.argmax(dim=1, keepdim=True)
            correct += pred.eq(target.view_as(pred)).sum().item()
            total += target.size(0)

            pbar.set_postfix({
                'Loss': f'{total_loss / len(pbar):.4f}',
                'Acc': f'{correct / total:.3%}'
            })
    return total_loss / len(dataloader), correct / total


def load_checkpoint_if_exists(checkpoint_path, model, optimizer, scheduler):
    if os.path.isfile(checkpoint_path):
        print_time(f"🔁 Memuat checkpoint: {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path, map_location='cpu', weights_only=True)
        model.load_state_dict(checkpoint['model_state_dict'])
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        if scheduler and 'scheduler_state_dict' in checkpoint:
            scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        history = checkpoint.get('history', {
            'epochs': [], 'train_loss': [], 'train_acc': [],
            'val_loss': [], 'val_acc': []
        })
        start_epoch = checkpoint.get('epoch', 0) + 1
        best_val_loss = checkpoint.get('best_val_loss', float('inf'))
        patience_counter = checkpoint.get('patience_counter', 0)
        print_time(f"▶️  Lanjut dari epoch {start_epoch}, best val loss: {best_val_loss:.5f}")
        return model, optimizer, scheduler, history, start_epoch, best_val_loss, patience_counter
    else:
        print_time("🆕 Tidak ada checkpoint — mulai dari awal.")
        return model, optimizer, scheduler, {
            'epochs': [], 'train_loss': [], 'train_acc': [],
            'val_loss': [], 'val_acc': []
        }, 1, float('inf'), 0


def main():
    parser = argparse.ArgumentParser()
    # Dataset
    parser.add_argument("--train_list", type=str, default="data/one-indexed-files-notrash_train.txt")
    parser.add_argument("--val_list", type=str, default="data/one-indexed-files-notrash_val.txt")
    parser.add_argument("--data_folder", type=str, default="data/pics")
    parser.add_argument("--input_size", type=int, nargs=2, default=[224, 224])
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--num_workers", type=int, default=4)
    # Model
    parser.add_argument("--num_classes", type=int, default=6)
    parser.add_argument("--init_method", type=str, default="kaiming",
                        choices=["kaiming", "xavier", "xavier_caffe", "heuristic"])
    # Training
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--weight_decay", type=float, default=1e-4)
    parser.add_argument("--lr_decay_factor", type=float, default=0.5)
    parser.add_argument("--lr_decay_every", type=int, default=8)
    # Early Stopping
    parser.add_argument("--patience", type=int, default=7,
                        help="Jumlah epoch menunggu sebelum berhenti jika val loss tidak turun")
    # Output
    parser.add_argument("--checkpoint_dir", type=str, default="checkpoints/final_v3")
    parser.add_argument("--save_every", type=int, default=5)
    # Device
    parser.add_argument("--device", type=str, default="cuda" if torch.cuda.is_available() else "cpu")

    args = parser.parse_args()
    device = torch.device(args.device)
    print_time(f"🚀 Memulai pelatihan di perangkat: {device}")

    ensure_dir(args.checkpoint_dir)
    checkpoint_path = os.path.join(args.checkpoint_dir, "last_checkpoint.pth")
    best_model_path = os.path.join(args.checkpoint_dir, "best_model.pth")

    # Dataset & DataLoader
    print_time("📁 Memuat dataset...")
    train_dataset = WasteDataset(
        args.train_list, args.data_folder,
        input_size=args.input_size, augment=True
    )
    val_dataset = WasteDataset(
        args.val_list, args.data_folder,
        input_size=args.input_size, augment=False
    )
    train_loader = DataLoader(
        train_dataset, batch_size=args.batch_size, shuffle=True,
        num_workers=args.num_workers, pin_memory=(device.type == 'cuda')
    )
    val_loader = DataLoader(
        val_dataset, batch_size=args.batch_size, shuffle=False,
        num_workers=args.num_workers, pin_memory=(device.type == 'cuda')
    )

    # Model
    print_time("🧠 Membangun model...")
    model = WasteClassifier(num_classes=args.num_classes)
    model.init_weights(method=args.init_method)
    model = model.to(device)

    # Optimizer & Scheduler
    # ⚖️ Class-weighted loss untuk mengurangi bias
    weights = torch.tensor([1.5, 1.0, 1.0, 1.0, 1.5, 4.0]).to(device)  # glass & metal lebih berat
    criterion = nn.CrossEntropyLoss(weight=weights)
    optimizer = optim.Adam(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=args.lr_decay_every, gamma=args.lr_decay_factor)

    # Resume or start fresh
    model, optimizer, scheduler, history, epoch, best_val_loss, patience_counter = \
        load_checkpoint_if_exists(checkpoint_path, model, optimizer, scheduler)

    print_time("✅ Siap melatih!")

    try:
        while epoch <= args.epochs:
            print_time(f"🔁 Epoch {epoch}/{args.epochs}")

            # Train & eval
            train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
            val_loss, val_acc = evaluate(model, val_loader, criterion, device)

            if scheduler:
                scheduler.step()

            # Logging
            print_time(f"📊 Train Loss: {train_loss:.5f}, Acc: {train_acc:.3%} | "
                       f"Val Loss: {val_loss:.5f}, Acc: {val_acc:.3%}")

            # Update history
            history['epochs'].append(epoch)
            history['train_loss'].append(train_loss)
            history['train_acc'].append(train_acc)
            history['val_loss'].append(val_loss)
            history['val_acc'].append(val_acc)

            # Save best model
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                patience_counter = 0
                torch.save({
                    'epoch': epoch,
                    'model_state_dict': model.state_dict(),
                    'val_loss': val_loss,
                    'val_acc': val_acc
                }, best_model_path)
                print_time(f"✅ New best model saved (Val Loss: {val_loss:.5f})")
            else:
                patience_counter += 1

            # Save last checkpoint (for resume)
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'scheduler_state_dict': scheduler.state_dict() if scheduler else None,
                'history': history,
                'best_val_loss': best_val_loss,
                'patience_counter': patience_counter,
                'args': vars(args)
            }, checkpoint_path)

            # Save history separately
            with open(os.path.join(args.checkpoint_dir, "history.json"), "w") as f:
                json.dump(history, f, indent=2)

            # Early stopping check
            if patience_counter >= args.patience:
                print_time(f"⏹️  Early stopping diaktifkan! (Val loss tidak turun dalam {args.patience} epoch)")
                break
            epoch += 1

    except KeyboardInterrupt:
        print_time("⚠️  Pelatihan dihentikan pengguna. Checkpoint terakhir telah disimpan.")
    finally:
        print_time("🏁 Pelatihan selesai.")
        print_time(f"📊 Hasil akhir: Best Val Loss = {best_val_loss:.5f}")
        print_time(f"📁 Model terbaik: {best_model_path}")

if __name__ == "__main__":
    main()