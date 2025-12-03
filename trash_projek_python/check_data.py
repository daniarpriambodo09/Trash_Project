from dataset import WasteDataset
train = WasteDataset("data/one-indexed-files-notrash_train.txt", "data/pics")
val   = WasteDataset("data/one-indexed-files-notrash_val.txt",   "data/pics")
test  = WasteDataset("data/one-indexed-files-notrash_test.txt",  "data/pics")
print(f"Train: {len(train)} | Val: {len(val)} | Test: {len(test)}")
# Output: Train: 1768 | Val: 328 | Test: 431