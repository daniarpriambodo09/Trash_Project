# test_onnx.py
import onnx
import onnxruntime as ort
import numpy as np

# Cek struktur ONNX
model = onnx.load("waste_classifier.onnx")
onnx.checker.check_model(model)
print("✅ ONNX model valid!")

# Coba inferensi dummy
ort_session = ort.InferenceSession("waste_classifier.onnx")
dummy_input = np.random.randn(1, 3, 224, 224).astype(np.float32)
outputs = ort_session.run(None, {"input": dummy_input})
print("✅ Inferensi berhasil! Output shape:", outputs[0].shape)
# Harus: (1, 6)