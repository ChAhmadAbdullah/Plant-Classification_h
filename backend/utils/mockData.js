// Temporary mock data for AI responses
// Replace this with actual AI service integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const getMockResponse = (query, type, language) => {
  const mockResponses = {
    english: {
      text: {
        "How to treat rust fungus in wheat?": {
          advice: "To treat rust fungus in wheat, apply fungicides containing propiconazole or tebuconazole. Remove and destroy infected plant parts. Ensure proper spacing for air circulation and avoid overhead watering. Apply treatment early in the morning for best results.",
          analysis: {
            detected_issues: ["rust_fungus"],
            recommendations: [
              "Apply fungicide containing propiconazole",
              "Remove infected leaves immediately",
              "Improve air circulation",
              "Avoid overhead watering",
              "Apply treatment in early morning"
            ]
          }
        },
        "Best fertilizer for rice crops?": {
          advice: "For rice crops, use a balanced NPK fertilizer (12-12-17 or 14-14-14). Apply nitrogen in split doses - 50% at planting, 25% at tillering, and 25% at panicle initiation. Organic compost and farmyard manure also work well.",
          analysis: {
            detected_issues: ["nutrient_management"],
            recommendations: [
              "Use balanced NPK fertilizer (12-12-17)",
              "Apply nitrogen in split doses",
              "Add organic compost",
              "Maintain proper water levels"
            ]
          }
        }
      },
      image: {
        default: {
          advice: "Based on the image analysis, your crop shows signs of rust fungus with 85% confidence. The disease appears in moderate stage. I recommend applying fungicide containing propiconazole immediately.",
          analysis: {
            detected_issues: [{
              disease: "rust_fungus",
              confidence: 0.85,
              symptoms: ["Orange-brown pustules on leaves", "Yellowing of foliage"],
              severity: "moderate"
            }],
            recommendations: [
              "Apply fungicide containing propiconazole",
              "Remove and destroy infected plant parts",
              "Improve air circulation around plants"
            ]
          }
        }
      },
      voice: {
        default: {
          transcription: "My wheat crop is showing yellow spots and leaves are wilting.",
          advice: "Based on your description, your wheat crop may be suffering from nutrient deficiency or possible fungal infection. I recommend testing your soil for nutrient levels and applying balanced fertilizer.",
          analysis: {
            detected_issues: ["nutrient_deficiency", "possible_fungal_infection"],
            confidence: 0.78,
            recommendations: [
              "Test soil for nutrient levels",
              "Apply balanced fertilizer",
              "Check for proper drainage"
            ]
          }
        }
      }
    },
    urdu: {
      text: {
        "گندم میں زنگ کے پھپھوندی کا علاج کیسے کریں؟": {
          advice: "گندم میں زنگ کے پھپھوندی کے علاج کے لیے، پروپیکونازول یا ٹیبوکونازول پر مشتمل فنگی سائیڈ استعمال کریں۔ متاثرہ پودوں کے حصے ہٹا دیں اور تلف کریں۔",
          analysis: {
            detected_issues: ["rust_fungus"],
            recommendations: [
              "پروپیکونازول پر مشتمل فنگی سائیڈ استعمال کریں",
              "متاثرہ پتے فوری طور پر ہٹا دیں",
              "ہوا کی گردش بہتر بنائیں"
            ]
          }
        }
      },
      image: {
        default: {
          advice: "تصویر کے تجزیے کی بنیاد پر، آپ کی فصل میں 85% اعتماد کے ساتھ زنگ کے پھپھوندی کی علامات نظر آ رہی ہیں۔",
          analysis: {
            detected_issues: [{
              disease: "rust_fungus",
              confidence: 0.85,
              symptoms: ["پتوں پر نارنجی-بھورے چھالے"],
              severity: "moderate"
            }]
          }
        }
      },
      voice: {
        default: {
          transcription: "میری گندم کی فصل میں پیلے دھبے نظر آ رہے ہیں",
          advice: "آپ کی وضاحت کی بنیاد پر، آپ کی گندم کی فصل میں غذائی کمی یا ممکنہ فنگل انفیکشن ہو سکتا ہے۔",
          analysis: {
            detected_issues: ["nutrient_deficiency"],
            confidence: 0.78
          }
        }
      }
    }
  };

  const langResponses = mockResponses[language] || mockResponses.english;
  
  if (type === 'text') {
    const matchingKey = Object.keys(langResponses.text).find(key => 
      query.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(query.toLowerCase())
    );
    
    if (matchingKey) {
      return { data: langResponses.text[matchingKey] };
    }
    
    return {
      data: {
        advice: language === 'urdu' 
          ? "آپ کے سوال کا جواب تیار کر رہا ہوں۔"
          : "I'm processing your question. Please provide more details.",
        analysis: { recommendations: [] }
      }
    };
  }
  
  if (type === 'image') {
    return { data: langResponses.image.default };
  }
  
  if (type === 'voice') {
    return { data: langResponses.voice.default };
  }
  
  return {
    data: {
      advice: language === 'urdu' ? "آپ کی درخواست پر کارروائی ہو رہی ہے۔" : "Processing your request.",
      analysis: {}
    }
  };
};

