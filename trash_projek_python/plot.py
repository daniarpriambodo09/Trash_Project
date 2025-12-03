import json
import matplotlib.pyplot as plt
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--history", type=str, default="checkpoints/history.json")
    parser.add_argument("--output_dir", type=str, default=".")
    args = parser.parse_args()
    
    with open(args.history, "r") as f:
        hist = json.load(f)
    
    epochs = hist["epochs"]
    
    # Plot loss
    plt.figure(figsize=(10, 4))
    
    plt.subplot(1, 2, 1)
    plt.plot(epochs, hist["train_loss"], label="Train Loss", marker="o")
    plt.plot(epochs, hist["val_loss"], label="Val Loss", marker="s")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.title("Training and Validation Loss")
    plt.legend()
    plt.grid(True)
    
    # Plot accuracy
    plt.subplot(1, 2, 2)
    plt.plot(epochs, hist["train_acc"], label="Train Acc", marker="o")
    plt.plot(epochs, hist["val_acc"], label="Val Acc", marker="s")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.title("Training and Validation Accuracy")
    plt.legend()
    plt.grid(True)
    
    plt.tight_layout()
    plt.savefig(f"{args.output_dir}/training_curves.png", dpi=150)
    print(f"✅ Plots saved to '{args.output_dir}/training_curves.png'")
    plt.show()

if __name__ == "__main__":
    main()