import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shirt, Flame, Target } from 'lucide-react-native';
import { getHistory, HistoryEntry } from '../../utils/history';

const MODULE_CONFIG = {
    wardrobe: { label: 'Wardrobe', Icon: Shirt, color: '#a78bfa' },
    fuel: { label: 'Fuel', Icon: Flame, color: '#fb923c' },
    focus: { label: 'Focus', Icon: Target, color: '#34d399' },
};

function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [entries, setEntries] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHistory().then(h => {
            setEntries(h);
            setLoading(false);
        });
    }, []);

    return (
        <View className="flex-1 bg-zinc-950">
            <Stack.Screen options={{ title: 'Past Recommendations' }} />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 32,
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    alignItems: 'center',
                }}
            >
                <View className="w-full max-w-sm flex-col gap-3">
                    {loading && (
                        <View className="items-center pt-16">
                            <ActivityIndicator color="#a1a1aa" size="large" />
                        </View>
                    )}

                    {!loading && entries.length === 0 && (
                        <View className="items-center pt-16 gap-3">
                            <Text className="text-zinc-500 text-base text-center">No recommendations yet.</Text>
                            <Text className="text-zinc-600 text-sm text-center">Run the AI on any tab to get started.</Text>
                        </View>
                    )}

                    {!loading && entries.map(entry => {
                        const { label, Icon, color } = MODULE_CONFIG[entry.module];
                        return (
                            <Pressable
                                key={entry.id}
                                onPress={() => router.push(`/history/${entry.id}` as any)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-[28px] p-5 flex-row items-center gap-4 active:bg-zinc-800"
                            >
                                <View className="w-11 h-11 rounded-2xl bg-zinc-800 items-center justify-center">
                                    <Icon color={color} size={20} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-zinc-100 font-semibold text-base">{label}</Text>
                                    <Text className="text-zinc-500 text-sm mt-0.5">
                                        {formatTime(entry.timestamp)}  ·  {formatDate(entry.timestamp)}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
