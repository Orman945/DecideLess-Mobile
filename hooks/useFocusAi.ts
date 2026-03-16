import { useState } from 'react';
import { Alert } from 'react-native';
import { saveHistoryEntry } from '../utils/history';

export interface FocusTask {
    id: string;
    text: string;
    completed: boolean;
}

const extractBigThreeWithAi = async (brainDump: string): Promise<FocusTask[]> => {
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
                    content: `You are an elite productivity coach. Your goal is to eliminate decision fatigue.
                    Read the user's brain dump of thoughts and tasks.
                    Apply the Eisenhower Matrix: identify the HIGH URGENCY and HIGH IMPACT tasks.
                    Return EXACTLY AND ONLY the Top 3 most important tasks to focus on right now.
                    Format the output strictly as a JSON array of 3 short, actionable strings. No markdown formatting.
                    
                    Example Output:
                    [ "Call the accountant", "Finish project proposal", "Buy groceries" ]`
                },
                {
                    role: 'user',
                    content: `Brain Dump: ${brainDump}`
                }
            ],
            max_tokens: 200
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();

    const jsonMatch = resultText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
        const parsedObj = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedObj)) {
            return parsedObj.slice(0, 3).map((text: string, i: number) => ({
                id: `t-${i}-${Math.random().toString(36).substring(2, 9)}`,
                text,
                completed: false
            }));
        }
    }

    throw new Error("Failed to parse AI response into JSON format.");
};

export function useFocusAi() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [bigThree, setBigThree] = useState<FocusTask[] | null>(null);

    const handleProcessTasks = async (brainDump: string) => {
        if (!brainDump.trim()) return;

        setIsProcessing(true);
        try {
            const topTasks = await extractBigThreeWithAi(brainDump);
            setBigThree(topTasks);
            await saveHistoryEntry({
                module: 'focus',
                textPrompt: brainDump,
                aiResponse: topTasks,
            });
        } catch (error: any) {
            console.error("AI Focus Error:", error);
            Alert.alert("Processing Failed", error.message || "Could not analyze your tasks.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleTask = (id: string) => {
        setBigThree(prev =>
            prev ? prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t) : null
        );
    };

    const resetFocus = () => {
        setBigThree(null);
    };

    const allCompleted = bigThree?.length && bigThree.every(t => t.completed);

    return {
        isProcessing,
        bigThree,
        allCompleted,
        handleProcessTasks,
        toggleTask,
        resetFocus
    };
}
