# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
from torchvision import transforms
from PIL import Image
import io
import logging

from model import WasteClassifier

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Waste Classification API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite/React ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Label mapping (0-indexed)
LABEL_MAP = {
    0: "glass",
    1: "paper",
    2: "cardboard",
    3: "plastic",
    4: "metal",
    5: "trash"
}

# Global variables
model = None
device = None
transform = None

# Image preprocessing transform
def get_transform():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

@app.on_event("startup")
async def load_model():
    """Load model saat server start"""
    global model, device, transform
    
    try:
        logger.info("🚀 Loading model...")
        
        # Set device
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"📱 Using device: {device}")
        
        # Load model
        model = WasteClassifier(num_classes=6)
        checkpoint_path = "checkpoints/final_v3/best_model.pth"
        
        checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=True)
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        model.eval()
        
        # Setup transform
        transform = get_transform()
        
        logger.info("✅ Model loaded successfully!")
        logger.info(f"   - Validation Accuracy: {checkpoint.get('val_acc', 0):.2%}")
        logger.info(f"   - Epoch: {checkpoint.get('epoch', 0)}")
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Waste Classification API is running",
        "device": str(device),
        "model_loaded": model is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": str(device),
        "classes": list(LABEL_MAP.values())
    }

@app.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    """
    Klasifikasi gambar sampah
    
    Parameters:
    - file: Gambar dalam format JPG, JPEG, atau PNG
    
    Returns:
    - class: Kategori sampah (glass, paper, cardboard, plastic, metal, trash)
    - confidence: Confidence score (0-1)
    - probabilities: Dict semua probabilitas per kelas
    """
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type: {file.content_type}. Please upload an image."
        )
    
    try:
        # Read image
        logger.info(f"📥 Receiving file: {file.filename} ({file.content_type})")
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        logger.info(f"🖼️  Image size: {image.size}")
        
        # Preprocess
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Predict
        with torch.no_grad():
            output = model(image_tensor)
            probabilities = torch.softmax(output, dim=1)[0]
            predicted_idx = probabilities.argmax().item()
            confidence = probabilities[predicted_idx].item()
        
        # Convert to dict
        probs_dict = {
            LABEL_MAP[i]: float(probabilities[i].item()) 
            for i in range(len(LABEL_MAP))
        }
        
        predicted_class = LABEL_MAP[predicted_idx]
        
        logger.info(f"✅ Prediction: {predicted_class} ({confidence:.2%})")
        
        return JSONResponse(content={
            "success": True,
            "class": predicted_class,
            "confidence": confidence,
            "probabilities": probs_dict,
            "message": f"Image classified as {predicted_class}"
        })
        
    except Exception as e:
        logger.error(f"❌ Classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/classify-batch")
async def classify_batch(files: list[UploadFile] = File(...)):
    """
    Klasifikasi multiple gambar sekaligus
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images per request")
    
    results = []
    
    for idx, file in enumerate(files):
        try:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents)).convert("RGB")
            image_tensor = transform(image).unsqueeze(0).to(device)
            
            with torch.no_grad():
                output = model(image_tensor)
                probabilities = torch.softmax(output, dim=1)[0]
                predicted_idx = probabilities.argmax().item()
                confidence = probabilities[predicted_idx].item()
            
            results.append({
                "filename": file.filename,
                "class": LABEL_MAP[predicted_idx],
                "confidence": confidence,
                "success": True
            })
            
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "success": False
            })
    
    return JSONResponse(content={"results": results})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)