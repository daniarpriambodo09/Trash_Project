import torch
from PIL import Image
from torchvision import transforms
from model import WasteClassifier
from dataset import LABEL_MAP

def predict_image(image_path, model_path, device='cuda'):
    # Load model
    model = WasteClassifier(num_classes=6)
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    # Preprocess
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    img = Image.open(image_path).convert('RGB')
    img_tensor = transform(img).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        output = model(img_tensor)
        probs = torch.softmax(output, dim=1)[0]
        pred_idx = probs.argmax().item()
        confidence = probs[pred_idx].item()
    
    pred_label = LABEL_MAP[pred_idx + 1]
    
    print(f"\n🎯 Prediksi: {pred_label.upper()}")
    print(f"📊 Confidence: {confidence:.2%}\n")
    print("Probabilitas per kelas:")
    for i in range(6):
        print(f"  {LABEL_MAP[i+1]:10s}: {probs[i].item():.2%}")
    
    return pred_label, confidence

if __name__ == "__main__":
    predict_image(
        image_path="test_image.jpg",  # ganti path
        model_path="checkpoints/final_v3/best_model.pth"
    )