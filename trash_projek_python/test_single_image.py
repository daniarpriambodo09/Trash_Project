import torch
import argparse
from PIL import Image
from torchvision import transforms
import sys
import os

from model import WasteClassifier
from dataset import LABEL_MAP

def predict_single_image(image_path, model_path, device='cuda'):
    """
    Prediksi 1 gambar dan tampilkan hasil lengkap
    """
    # Cek file ada atau tidak
    if not os.path.isfile(image_path):
        print(f"❌ Error: Gambar tidak ditemukan di '{image_path}'")
        sys.exit(1)
    
    if not os.path.isfile(model_path):
        print(f"❌ Error: Model tidak ditemukan di '{model_path}'")
        sys.exit(1)
    
    print("=" * 70)
    print("🗑️  WASTE CLASSIFICATION - SINGLE IMAGE TEST")
    print("=" * 70)
    
    # Load model
    print(f"\n📥 Loading model dari: {model_path}")
    model = WasteClassifier(num_classes=6)
    checkpoint = torch.load(model_path, map_location=device, weights_only=True)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    # Info model
    val_acc = checkpoint.get('val_acc', 0)
    epoch = checkpoint.get('epoch', 0)
    print(f"✅ Model loaded successfully!")
    print(f"   - Trained Epoch: {epoch}")
    print(f"   - Validation Accuracy: {val_acc:.2%}")
    
    # Preprocess gambar
    print(f"\n📸 Loading gambar: {image_path}")
    try:
        img = Image.open(image_path).convert('RGB')
        img_width, img_height = img.size
        print(f"   - Ukuran asli: {img_width}x{img_height} pixels")
    except Exception as e:
        print(f"❌ Error membuka gambar: {e}")
        sys.exit(1)
    
    # Transform (sama dengan saat training)
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                           std=[0.229, 0.224, 0.225])
    ])
    
    img_tensor = transform(img).unsqueeze(0).to(device)
    print(f"   - Preprocessed ke: 224x224 pixels")
    
    # Prediksi
    print(f"\n🤖 Melakukan prediksi...")
    with torch.no_grad():
        output = model(img_tensor)
        probs = torch.softmax(output, dim=1)[0]
        pred_idx = probs.argmax().item()
        confidence = probs[pred_idx].item()
    
    pred_label = LABEL_MAP[pred_idx + 1]
    
    # Tampilkan hasil utama
    print("\n" + "=" * 70)
    print("🎯 HASIL PREDIKSI")
    print("=" * 70)
    print(f"\n   Kategori Sampah : {pred_label.upper()}")
    print(f"   Confidence      : {confidence:.2%}")
    print(f"   Tingkat Keyakinan: {'🟢 TINGGI' if confidence > 0.8 else '🟡 SEDANG' if confidence > 0.6 else '🔴 RENDAH'}")
    
    # Tampilkan semua probabilitas
    print("\n" + "-" * 70)
    print("📊 PROBABILITAS UNTUK SEMUA KATEGORI:")
    print("-" * 70)
    
    # Urutkan dari tertinggi ke terendah
    sorted_indices = probs.argsort(descending=True)
    
    for rank, idx in enumerate(sorted_indices, 1):
        label = LABEL_MAP[idx.item() + 1]
        prob = probs[idx].item()
        
        # Bar chart sederhana dengan ASCII
        bar_length = int(prob * 50)  # Max 50 karakter
        bar = "█" * bar_length + "░" * (50 - bar_length)
        
        # Highlight prediksi terpilih
        marker = "👉" if idx == pred_idx else "  "
        
        print(f"{marker} {rank}. {label:12s} | {bar} | {prob:6.2%}")
    
    print("\n" + "=" * 70)
    print("✅ Prediksi selesai!")
    print("=" * 70)
    
    return pred_label, confidence, probs


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test model dengan 1 gambar")
    parser.add_argument("--image", type=str, required=True,
                       help="Path ke gambar yang akan diprediksi (contoh: test.jpg)")
    parser.add_argument("--model", type=str, 
                       default="checkpoints/final_v3/best_model.pth",
                       help="Path ke model checkpoint")
    parser.add_argument("--device", type=str, 
                       default="cuda" if torch.cuda.is_available() else "cpu",
                       help="Device: cuda atau cpu")
    
    args = parser.parse_args()
    
    predict_single_image(
        image_path=args.image,
        model_path=args.model,
        device=args.device
    )