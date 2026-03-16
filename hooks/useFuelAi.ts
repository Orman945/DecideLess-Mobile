import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { saveHistoryEntry } from '../utils/history';

export interface MealOption {
    id: string;
    name: string;
    time: string;
    steps: [string, string, string];
}

const generateRecipesWithAi = async (input: { text?: string, imageUri?: string }): Promise<MealOption[]> => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing EXPO_PUBLIC_OPENAI_API_KEY environment variable. Please add it to your .env file.");
    }

    let userMessageContent: any[] = [];

    if (input.imageUri) {
        const base64Data = await FileSystem.readAsStringAsync(input.imageUri, { encoding: 'base64' });
        userMessageContent.push({ type: 'text', text: 'Analyze the ingredients in this image and create recipes.' });
        userMessageContent.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } });
    } else if (input.text) {
        userMessageContent.push({ type: 'text', text: `Create recipes using these ingredients: ${input.text}` });
    } else {
        throw new Error("No input provided for recipe generation.");
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
                    content: `You are an elite culinary AI designed to eliminate decision fatigue.
                    Based on the ingredients provided, create EXACTLY TWO distinct recipes.
                    Ensure the recipes are healthy and take under 20 minutes to prepare.
                    Return a raw JSON object (without markdown blocks) containing an array of exactly 2 objects.
                    
                    Output Format:
                    {
                      "recipes": [
                        {
                           "id": "1",
                           "name": "Short Catchy Name",
                           "time": "XX mins",
                           "steps": ["Step 1 text", "Step 2 text", "Step 3 text"]
                        },
                        ...
                      ]
                    }`
                },
                {
                    role: 'user',
                    content: userMessageContent
                }
            ],
            max_tokens: 400
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
        if (parsed.recipes && Array.isArray(parsed.recipes) && parsed.recipes.length > 0) {
            return parsed.recipes;
        }
    }

    throw new Error("Failed to parse AI response into JSON format.");
};

export function useFuelAi() {
    const [isScanning, setIsScanning] = useState(false);
    const [meals, setMeals] = useState<MealOption[] | null>(null);
    const [currentImageUri, setCurrentImageUri] = useState<string | null>(null);

    // Kept this named simulatePantryScan so we don't have to rewrite fuel.tsx logic too heavily
    // but now it actually makes real AI calls based on whether you passed a text string or a bool proxying for an image
    const simulatePantryScan = async (inputConfig: { text?: string, imageUri?: string } | boolean) => {
        // Handle backwards compatibility where fuel.tsx was passing `true`
        if (typeof inputConfig === 'boolean' && inputConfig === false) return;

        setIsScanning(true);
        setMeals(null);

        try {
            let payload = {};
            // Note: Normally we'd strictly refactor Fuel.tsx to pass {text} or {imageUri}, 
            // but since we are modifying the hook directly, we'll gracefully handle it if it throws the old signature.
            if (typeof inputConfig === 'object') {
                payload = inputConfig;
                if (inputConfig.imageUri) {
                    setCurrentImageUri(inputConfig.imageUri);
                } else {
                    setCurrentImageUri(null);
                }
            }

            const generatedMeals = await generateRecipesWithAi(payload);
            setMeals(generatedMeals);
            await saveHistoryEntry({
                module: 'fuel',
                imageUri: typeof inputConfig === 'object' ? inputConfig.imageUri : undefined,
                textPrompt: typeof inputConfig === 'object' ? inputConfig.text : undefined,
                aiResponse: generatedMeals,
            });
        } catch (error: any) {
            console.error("AI Recipe Error:", error);
            Alert.alert("Generation Failed", error.message || "Could not generate recipes.");
        } finally {
            setIsScanning(false);
        }
    };

    const resetFuel = () => {
        setMeals(null);
        setCurrentImageUri(null);
    };

    return {
        isScanning,
        meals,
        currentImageUri,
        simulatePantryScan,
        resetFuel
    };
}
