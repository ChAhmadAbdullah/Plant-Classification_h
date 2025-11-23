import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os

# Get the directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLASS_FILE = os.path.join(BASE_DIR, "class_labels.txt")
MODEL_FILE = os.path.join(BASE_DIR, "plant_disease_resnet50.pth")

# Load class names
with open(CLASS_FILE, "r") as f:
    class_names = [line.strip() for line in f.readlines()]

# Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.resnet50()
model.fc = nn.Linear(model.fc.in_features, len(class_names))
model.load_state_dict(torch.load(MODEL_FILE, map_location=device, weights_only=True))
model.to(device)
model.eval()

# Transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Prediction Function
def predict_image(image, conf_thresh=0.60):
    """
    Predict plant disease from PIL Image
    
    Args:
        image: PIL Image object
        conf_thresh: Confidence threshold (default 0.60)
    
    Returns:
        dict: {
            "predicted_class": str,
            "confidence": float,
            "all_predictions": list of top 3 predictions
        }
    """
    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probs = torch.softmax(outputs, dim=1)
        confidence, pred_idx = torch.max(probs, 1)
        
        # Get top 3 predictions
        top3_probs, top3_indices = torch.topk(probs, 3)

    confidence_score = confidence.item()
    predicted_class = class_names[pred_idx.item()]

    # Format top 3 predictions
    top_predictions = [
        {
            "class": class_names[idx.item()],
            "confidence": prob.item()
        }
        for prob, idx in zip(top3_probs[0], top3_indices[0])
    ]

    return {
        "predicted_class": predicted_class if confidence_score >= conf_thresh else "Unknown",
        "confidence": confidence_score,
        "all_predictions": top_predictions,
        "threshold_met": confidence_score >= conf_thresh
    }

def predict_from_bytes(image_bytes, conf_thresh=0.60):
    """
    Predict plant disease from image bytes
    
    Args:
        image_bytes: bytes object containing image data
        conf_thresh: Confidence threshold (default 0.60)
    
    Returns:
        dict: Prediction results
    """
    from io import BytesIO
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return predict_image(image, conf_thresh)

if __name__ == "__main__":
    print(f"Model loaded successfully!")
    print(f"Device: {device}")
    print(f"Number of classes: {len(class_names)}")
    print(f"Sample classes: {class_names[:5]}")
