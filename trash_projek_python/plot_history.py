import json
import matplotlib.pyplot as plt

with open("checkpoints/final_v3/history.json", "r") as f:
    history = json.load(f)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Loss
ax1.plot(history['epochs'], history['train_loss'], 'b-', label='Train Loss', linewidth=2)
ax1.plot(history['epochs'], history['val_loss'], 'r-', label='Val Loss', linewidth=2)
ax1.axvline(x=14, color='g', linestyle='--', label='Best Model (Epoch 14)')
ax1.set_xlabel('Epoch', fontsize=12)
ax1.set_ylabel('Loss', fontsize=12)
ax1.set_title('Training & Validation Loss', fontsize=14, fontweight='bold')
ax1.legend()
ax1.grid(alpha=0.3)

# Accuracy
ax2.plot(history['epochs'], [x*100 for x in history['train_acc']], 'b-', 
         label='Train Acc', linewidth=2)
ax2.plot(history['epochs'], [x*100 for x in history['val_acc']], 'r-', 
         label='Val Acc', linewidth=2)
ax2.axvline(x=14, color='g', linestyle='--', label='Best Model (Epoch 14)')
ax2.set_xlabel('Epoch', fontsize=12)
ax2.set_ylabel('Accuracy (%)', fontsize=12)
ax2.set_title('Training & Validation Accuracy', fontsize=14, fontweight='bold')
ax2.legend()
ax2.grid(alpha=0.3)

plt.tight_layout()
plt.savefig('training_history.png', dpi=150)
print("📈 Plot saved: training_history.png")
plt.show()