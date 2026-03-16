import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@decideless_history';

export interface HistoryEntry {
    id: string;
    timestamp: string;
    module: 'wardrobe' | 'fuel' | 'focus';
    imageUri?: string;
    textPrompt?: string;
    aiResponse: any;
}

export async function saveHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    const newEntry: HistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        ...entry,
    };
    const existing = await getHistory();
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([newEntry, ...existing]));
}

export async function getHistory(): Promise<HistoryEntry[]> {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function getHistoryEntry(id: string): Promise<HistoryEntry | null> {
    const history = await getHistory();
    return history.find(e => e.id === id) ?? null;
}
