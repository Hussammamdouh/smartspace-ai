exports.extractPromptContext = (prompt) => {
    const lower = prompt.toLowerCase();
  
    // Enhanced categories with synonyms
    const categories = {
      "bedroom": ["bedroom", "master bedroom", "guest bedroom", "kids room", "child bedroom"],
      "living room": ["living room", "lounge", "sitting room", "family room", "den"],
      "kitchen": ["kitchen", "cooking area", "kitchenette"],
      "bathroom": ["bathroom", "washroom", "toilet", "en suite"],
      "dining room": ["dining room", "dining area", "breakfast nook"],
      "office": ["office", "study", "home office", "workspace"],
      "entryway": ["entryway", "foyer", "hallway", "entrance"],
      "outdoor": ["outdoor", "patio", "balcony", "terrace", "garden"]
    };
  
    // Enhanced styles with synonyms
    const styles = {
      "modern": ["modern", "contemporary", "minimalist", "clean", "sleek"],
      "classic": ["classic", "traditional", "elegant", "timeless", "formal"],
      "industrial": ["industrial", "urban", "loft", "warehouse", "exposed"],
      "bohemian": ["bohemian", "boho", "eclectic", "free-spirited", "artistic"],
      "scandinavian": ["scandinavian", "nordic", "hygge", "simple", "natural"],
      "mediterranean": ["mediterranean", "tuscan", "spanish", "warm", "rustic"],
      "asian": ["asian", "japanese", "zen", "minimal", "peaceful"],
      "vintage": ["vintage", "retro", "antique", "nostalgic", "old-world"]
    };
  
    // Enhanced colors with synonyms
    const colors = {
      "white": ["white", "cream", "ivory", "off-white", "pure"],
      "black": ["black", "charcoal", "dark", "ebony"],
      "gray": ["gray", "grey", "silver", "neutral", "monochrome"],
      "blue": ["blue", "navy", "sky blue", "teal", "aqua"],
      "green": ["green", "sage", "emerald", "forest", "mint"],
      "brown": ["brown", "wood", "tan", "beige", "taupe"],
      "red": ["red", "burgundy", "maroon", "coral", "rose"],
      "purple": ["purple", "lavender", "violet", "plum", "mauve"],
      "yellow": ["yellow", "gold", "amber", "mustard", "cream"],
      "pink": ["pink", "rose", "blush", "salmon", "peach"]
    };
  
    // Extract category
    let category = null;
    for (const [cat, synonyms] of Object.entries(categories)) {
      if (synonyms.some(syn => lower.includes(syn))) {
        category = cat;
        break;
      }
    }
  
    // Extract style
    let style = null;
    for (const [sty, synonyms] of Object.entries(styles)) {
      if (synonyms.some(syn => lower.includes(syn))) {
        style = sty;
        break;
      }
    }
  
    // Extract color
    let color = null;
    for (const [col, synonyms] of Object.entries(colors)) {
      if (synonyms.some(syn => lower.includes(syn))) {
        color = col;
        break;
      }
    }
  
    // Extract additional context
    const context = {
      category,
      style,
      color,
      lighting: extractLighting(lower),
      mood: extractMood(lower),
      furniture: extractFurniture(lower),
      materials: extractMaterials(lower),
      size: extractSize(lower),
      budget: extractBudget(lower)
    };
  
    return context;
  };
  
function extractLighting(text) {
  const lightingKeywords = {
    "natural": ["natural light", "sunlight", "bright", "airy", "windows"],
    "warm": ["warm lighting", "cozy", "soft", "ambient", "dimmer"],
    "modern": ["modern lighting", "led", "track lighting", "recessed"],
    "chandelier": ["chandelier", "crystal", "elegant lighting"],
    "minimal": ["minimal lighting", "simple", "clean lighting"]
  };

  for (const [type, keywords] of Object.entries(lightingKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }
  return null;
}

function extractMood(text) {
  const moodKeywords = {
    "cozy": ["cozy", "comfortable", "warm", "inviting", "homey"],
    "elegant": ["elegant", "sophisticated", "luxurious", "upscale", "refined"],
    "energetic": ["energetic", "vibrant", "lively", "dynamic", "bold"],
    "calm": ["calm", "peaceful", "serene", "tranquil", "relaxing"],
    "romantic": ["romantic", "intimate", "passionate", "dreamy"],
    "professional": ["professional", "formal", "business", "corporate"]
  };

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return mood;
    }
  }
  return null;
}

function extractFurniture(text) {
  const furnitureTypes = [
    "sofa", "couch", "chair", "table", "bed", "desk", "dresser",
    "bookshelf", "cabinet", "ottoman", "bench", "stool", "armchair",
    "dining table", "coffee table", "side table", "nightstand"
  ];

  return furnitureTypes.filter(item => text.includes(item));
}

function extractMaterials(text) {
  const materials = {
    "wood": ["wood", "wooden", "oak", "pine", "mahogany", "walnut"],
    "metal": ["metal", "steel", "iron", "aluminum", "brass"],
    "glass": ["glass", "transparent", "clear"],
    "fabric": ["fabric", "textile", "cotton", "linen", "velvet"],
    "leather": ["leather", "faux leather", "suede"],
    "marble": ["marble", "stone", "granite", "quartz"]
  };

  const foundMaterials = [];
  for (const [material, keywords] of Object.entries(materials)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      foundMaterials.push(material);
    }
  }
  return foundMaterials;
}

function extractSize(text) {
  if (text.includes("small") || text.includes("tiny") || text.includes("compact")) {
    return "small";
  } else if (text.includes("large") || text.includes("big") || text.includes("spacious")) {
    return "large";
  } else if (text.includes("medium") || text.includes("average")) {
    return "medium";
  }
  return null;
}

function extractBudget(text) {
  const budgetPatterns = [
    /(\d+)\s*(k|thousand)/i,
    /(\d+)\s*(dollar|dollars|\$)/i,
    /budget\s*(\d+)/i,
    /(\d+)\s*to\s*(\d+)/i
  ];

  for (const pattern of budgetPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2] && match[3]) {
        // Range like "1000 to 2000"
        return {
          min: parseInt(match[2]),
          max: parseInt(match[3])
        };
      } else {
        // Single value
        let value = parseInt(match[1]);
        if (match[2] === 'k' || match[2] === 'thousand') {
          value *= 1000;
        }
        return value;
      }
    }
  }
  return null;
}
  