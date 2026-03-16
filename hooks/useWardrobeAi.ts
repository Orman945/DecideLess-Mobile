import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { saveHistoryEntry } from '../utils/history';

export interface ClothingItem {
    id: string;
    imageUrl: string;
    type: 'top' | 'bottom' | 'shoes' | 'outerwear';
    color: string;
    formalityScore: number;
    weatherSuitability: ('hot' | 'mild' | 'cold' | 'rain')[];
}

const analyzeImageWithAi = async (base64Image: string): Promise<Omit<ClothingItem, 'id' | 'imageUrl'>> => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY environment variable. Please add it to your .env file.");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a professional fashion AI. Analyze the image of the clothing item provided.
                    Return a raw JSON object (without markdown blocks) with exactly these properties:
                    - type: must be exactly one of "top", "bottom", "shoes", or "outerwear".
                    - color: a simple string describing the dominant color.
                    - formalityScore: an integer from 1 to 10 (1=loungewear, 10=tuxedo/gown).
                    - weatherSuitability: an array containing ONE OR MORE of "hot", "mild", "cold", "rain".
                    Ensure the response is ONLY valid JSON.`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this clothing item and return the JSON.' },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }
            ],
            max_tokens: 300
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();

    // Attempt to parse exactly the json out of any markdown wrapper if GPT disobeys
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Failed to parse AI response into JSON format.");
};

export function useWardrobeAi() {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [suggestedOutfit, setSuggestedOutfit] = useState<ClothingItem[] | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);

    const processImageUpload = async (imageUrl: string) => {
        setCurrentImageUri(imageUrl);
        setIsUploading(true);
        try {
            // Read image as base64 string
            const base64Data = await FileSystem.readAsStringAsync(imageUrl, {
                encoding: 'base64', // Valid literal for Expo FileSystem
            });

            // Send to OpenAI Vision API
            const metadata = await analyzeImageWithAi(base64Data);

            const newItem: ClothingItem = {
                id: Math.random().toString(36).substring(2, 9),
                imageUrl,
                ...metadata
            };

            setItems((prev) => [newItem, ...prev]);
        } catch (error: any) {
            console.error("AI Categorization Error:", error);
            Alert.alert("Analysis Failed", error.message || "Could not analyze the clothing item.");
        } finally {
            setIsUploading(false);
        }
    };

    const getOutfitSuggestion = async () => {
        setIsThinking(true);
        try {
            const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
            if (!apiKey) throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY environment variable. Please add it to your .env file.");

            if (items.length === 0) throw new Error("Your wardrobe is empty.");

            // Create a slim representation of the wardrobe to save tokens
            const wardrobeSnapshot = items.map(item => ({
                id: item.id,
                type: item.type,
                color: item.color,
                formalityScore: item.formalityScore,
                weatherSuitability: item.weatherSuitability
            }));

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an elite automated stylist. You must create EXACTLY ONE perfect outfit from the provided wardrobe inventory.
                            The user wants an outfit for today (assume 72° Mild).
                            Return a raw JSON object (no markdown) containing an array of exact 'id' strings chosen.
                            The outfit must have exactly one top, one bottom, and one pair of shoes.
                            Output Format: { "selectedIds": ["id1", "id2", "id3"] }`
                        },
                        {
                            role: 'user',
                            content: `Inventory: ${JSON.stringify(wardrobeSnapshot)}`
                        }
                    ],
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const resultText = data.choices[0].message.content.trim();

            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.selectedIds && Array.isArray(parsed.selectedIds)) {
                    const curatedOutfit = items.filter(item => parsed.selectedIds.includes(item.id));
                    setSuggestedOutfit(curatedOutfit.length > 0 ? curatedOutfit : null);
                    if (curatedOutfit.length > 0) {
                        await saveHistoryEntry({
                            module: 'wardrobe',
                            imageUri: currentImageUri ?? undefined,
                            aiResponse: curatedOutfit,
                        });
                    }
                }
            } else {
                throw new Error("Invalid format from AI stylist.");
            }
        } catch (error: any) {
            console.error("AI Suggestion Error:", error);
            Alert.alert("Styling Failed", error.message || "The AI could not put together an outfit right now.");
        } finally {
            setIsThinking(false);
        }
    };

    return {
        items,
        isUploading,
        suggestedOutfit,
        isThinking,
        currentImageUri,
        processImageUpload,
        getOutfitSuggestion
    };
}
