import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock } from 'lucide-react-native';
import { getHistoryEntry, HistoryEntry } from '../../utils/history';

function SectionLabel({ text }: { text: string }) {
    return (
        <Text className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">{text}</Text>
    );
}

function WardrobeResponse({ aiResponse }: { aiResponse: any[] }) {
    return (
        <View className="flex-col gap-4">
            {aiResponse.map((item: any) => (
                <View key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-[24px] overflow-hidden">
                    {item.imageUrl && (
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={{ width: '100%', aspectRatio: 4 / 3 }}
                            resizeMode="cover"
                        />
                    )}
                    <View className="p-4">
                        <Text className="text-zinc-100 font-semibold capitalize">{item.type}</Text>
                        <Text className="text-zinc-400 text-sm mt-1">{item.color}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

function FuelResponse({ aiResponse }: { aiResponse: any[] }) {
    return (
        <View className="flex-col gap-5">
            {aiResponse.map((meal: any) => (
                <View key={meal.id} className="bg-zinc-900 border border-zinc-800 rounded-[28px] p-5">
                    <View className="flex-row items-center justify-between mb-5">
                        <Text className="font-semibold text-lg text-zinc-100 flex-1 pr-4">{meal.name}</Text>
                        <View className="flex-row items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                            <Clock color="#a1a1aa" size={13} />
                            <Text className="text-sm text-zinc-400 mt-0.5">{meal.time}</Text>
                        </View>
                    </View>
                    <View className="flex-col gap-4">
                        {meal.steps.map((step: string, idx: number) => (
                            <View key={idx} className="flex-row gap-3">
                                <View className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center mt-0.5">
                                    <Text className="text-xs font-bold text-zinc-300">{idx + 1}</Text>
                                </View>
                                <Text className="text-zinc-300 text-sm leading-relaxed flex-1">{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}

function FocusResponse({ aiResponse }: { aiResponse: any[] }) {
    return (
        <View className="flex-col gap-3">
            {aiResponse.map((task: any, idx: number) => (
                <View key={task.id ?? idx} className="bg-zinc-900 border border-zinc-800 rounded-[20px] p-4 flex-row items-center gap-3">
                    <View className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
                        <Text className="text-xs font-bold text-zinc-300">{idx + 1}</Text>
                    </View>
                    <Text className="text-zinc-100 text-base flex-1 leading-snug">{task.text}</Text>
                </View>
            ))}
        </View>
    );
}

export default function HistoryDetailScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [entry, setEntry] = useState<HistoryEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHistoryEntry(id).then(e => {
            setEntry(e);
            setLoading(false);
        });
    }, [id]);

    const moduleTitle =
        entry?.module === 'wardrobe' ? 'Wardrobe' :
        entry?.module === 'fuel' ? 'Fuel' :
        'Focus';

    return (
        <View className="flex-1 bg-zinc-950">
            <Stack.Screen options={{ title: `${moduleTitle} Recommendation` }} />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 32,
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    alignItems: 'center',
                }}
            >
                <View className="w-full max-w-sm flex-col gap-6">
                    {loading && (
                        <View className="items-center pt-16">
                            <ActivityIndicator color="#a1a1aa" size="large" />
                        </View>
                    )}

                    {!loading && !entry && (
                        <View className="items-center pt-16">
                            <Text className="text-zinc-500 text-base">Entry not found.</Text>
                        </View>
                    )}

                    {!loading && entry && (
                        <>
                            {/* Context section */}
                            {(entry.imageUri || entry.textPrompt) && (
                                <View className="flex-col gap-3">
                                    <SectionLabel text="Context" />
                                    {entry.imageUri && (
                                        <Image
                                            source={{ uri: entry.imageUri }}
                                            className="w-full rounded-3xl border border-zinc-800"
                                            style={{ aspectRatio: 4 / 3 }}
                                            resizeMode="cover"
                                        />
                                    )}
                                    {entry.textPrompt && (
                                        <View className="bg-zinc-900 border border-zinc-800 rounded-[24px] p-4">
                                            <Text className="text-zinc-300 text-sm leading-relaxed">{entry.textPrompt}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Recommendation section */}
                            <View className="flex-col gap-3">
                                <SectionLabel text="Recommendation" />
                                {entry.module === 'wardrobe' && <WardrobeResponse aiResponse={entry.aiResponse} />}
                                {entry.module === 'fuel' && <FuelResponse aiResponse={entry.aiResponse} />}
                                {entry.module === 'focus' && <FocusResponse aiResponse={entry.aiResponse} />}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
