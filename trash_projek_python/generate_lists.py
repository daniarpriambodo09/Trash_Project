# generate_lists.py
import os
import random
from collections import defaultdict

data_root = "data/pics"
classes = ["glass", "paper", "cardboard", "plastic", "metal", "trash"]
label_map = {cls: i+1 for i, cls in enumerate(classes)}  # 1-indexed

# Kumpulkan semua file per kelas (hanya .jpg/.jpeg/.png)
all_files = defaultdict(list)
for cls in classes:
    cls_dir = os.path.join(data_root, cls)
    if not os.path.isdir(cls_dir):
        raise FileNotFoundError(f"Folder tidak ditemukan: {cls_dir}")
    for fname in os.listdir(cls_dir):
        if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            all_files[cls].append(fname)

# Verifikasi jumlah file
print("✅ Jumlah file per kelas (harus sesuai data mentah):")
true_counts = {"glass": 501, "paper": 594, "cardboard": 403, "plastic": 482, "metal": 410, "trash": 137}
for cls in classes:
    count = len(all_files[cls])
    mark = "✅" if count == true_counts[cls] else "❌"
    print(f"{mark} {cls:10}: {count} / {true_counts[cls]}")

# Bagi train/val/test → 70% / 20% / 10% (stratified)
splits = {"train": [], "val": [], "test": []}
ratios = {"train": 0.7, "val": 0.2, "test": 0.1}

random.seed(42)  # reproducible
for cls in classes:
    files = sorted(all_files[cls])  # sort agar konsisten
    n = len(files)
    n_train = int(n * 0.7)
    n_val = int(n * 0.2)
    splits["train"].extend([(f, label_map[cls]) for f in files[:n_train]])
    splits["val"].extend([(f, label_map[cls]) for f in files[n_train:n_train+n_val]])
    splits["test"].extend([(f, label_map[cls]) for f in files[n_train+n_val:]])

# Simpan ke file
os.makedirs("data", exist_ok=True)
total = 0
for split, items in splits.items():
    with open(f"data/one-indexed-files-notrash_{split}.txt", "w") as f:
        for fname, label in sorted(items):  # sort agar mudah dicek
            f.write(f"{fname} {label}\n")
    print(f"✅ {split:5}: {len(items)} sampel")
    total += len(items)

print(f"\n🎯 Total dataset: {total} gambar (137 trash terpakai semua)")