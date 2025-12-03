# export_onnx.py — versi aman
import torch
from model import WasteClassifier

ckpt = torch.load("checkpoints/final_v2/best_model.pth", map_location="cpu")
model = WasteClassifier(num_classes=6)
model.load_state_dict(ckpt["model_state_dict"])
model.eval()

dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)  # <-- eksplisit float32

torch.onnx.export(
    model,
    dummy_input,
    "waste_classifier.onnx",
    input_names=["input"],
    output_names=["output"],
    opset_version=18,
    export_params=True,
    do_constant_folding=True,
    dynamic_axes={"input": {0: "batch_size"}},
)

print("✅ Model ONNX tersimpan sebagai satu file: waste_classifier.onnx")