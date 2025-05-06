exports.extractPromptContext = (prompt) => {
    const lower = prompt.toLowerCase();
  
    const categories = ["bedroom", "child bedroom", "kitchen", "bathroom", "living room"];
    const styles = ["modern", "classic", "minimal", "industrial", "boho"];
    const colors = ["white", "blue", "gray", "black", "wood", "beige", "light", "dark"];
  
    const category = categories.find(cat => lower.includes(cat));
    const style = styles.find(s => lower.includes(s));
    const color = colors.find(c => lower.includes(c));
  
    return { category, style, color };
  };
  