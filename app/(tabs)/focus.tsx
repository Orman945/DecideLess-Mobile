import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Target, Sparkles, CheckCircle2, Circle, Zap, Clock } from 'lucide-react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusAi } from '../../hooks/useFocusAi';
import { cn } from '../../utils/utils';
import { useRouter } from 'expo-router';

export default function FocusScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [brainDump, setBrainDump] = useState('');
    const {
        isProcessing,
        bigThree,
        allCompleted,
        handleProcessTasks,
        toggleTask,
        resetFocus
    } = useFocusAi();

    const handleClear = () => {
        setBrainDump('');
        resetFocus();
    };

    return (
        <ScrollView
            className="flex-1 bg-zinc-950"
            contentContainerStyle={{
                paddingTop: insets.top + 24,
                paddingBottom: 100,
                paddingHorizontal: 24,
                alignItems: 'center'
            }}
        >
            <View className="flex-col gap-8 w-full max-w-sm">

                {/* Header Row with Randomize Button */}
                <View className="w-full flex-row items-center justify-between mt-2">
                    <Text className="text-3xl font-semibold tracking-tight text-white">Focus.</Text>
                    {/* Global Randomize Restored */}
                    <Pressable onPress={() => router.push('/randomize')} className="bg-zinc-900 p-2.5 rounded-full active:bg-zinc-800 border border-zinc-800">
                        <Zap color="#a1a1aa" size={20} />
                    </Pressable>
                </View>

                {/* Subheading / Explanatory Label */}
                <View className="items-center bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/80 mb-2">
                    <Text className="text-zinc-300 text-center leading-relaxed">
                        Brain dump everything on your mind below. We'll identify your <Text className="text-zinc-50 font-semibold">Big 3</Text> and hide the rest so you don't get overwhelmed.
                    </Text>
                </View>

                {!bigThree && (
                    <View className="flex-col gap-6 w-full">
                        <View className="relative w-full">
                            <TextInput
                                multiline
                                textAlignVertical="top"
                                value={brainDump}
                                onChangeText={setBrainDump}
                                editable={!isProcessing}
                                placeholder="What's heavily on your mind right now? Just start typing..."
                                placeholderTextColor="#71717a"
                                className={cn(
                                    "w-full h-56 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 text-white text-base leading-relaxed",
                                    isProcessing && "opacity-50"
                                )}
                            />
                        </View>

                        <Pressable
                            onPress={() => handleProcessTasks(brainDump)}
                            disabled={isProcessing || !brainDump.trim()}
                            className={cn(
                                "w-full py-5 rounded-[28px] flex-row items-center justify-center gap-3 overflow-hidden shadow-sm",
                                isProcessing || !brainDump.trim() ? 'bg-zinc-100 opacity-50' : 'bg-zinc-100 active:bg-white'
                            )}
                        >
                            {isProcessing ? (
                                <>
                                    <ActivityIndicator color="#000000" size="small" />
                                    <Text className="text-zinc-950 font-semibold text-lg ml-2">Finding clarity...</Text>
                                </>
                            ) : (
                                <>
                                    <Sparkles color="#000000" size={22} />
                                    <Text className="text-zinc-950 font-bold text-lg tracking-wide">Find My Big 3</Text>
                                </>
                            )}
                        </Pressable>
                    </View>
                )}

                {bigThree && (
                    <View className="flex-col gap-8 mt-2 w-full">
                        <View className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 w-full">
                            <View className="flex-row items-center justify-center gap-2 mb-8 mt-2">
                                <Target color="#a1a1aa" size={22} />
                                <Text className="font-semibold text-lg text-zinc-100 tracking-wide uppercase">Highest Impact Action</Text>
                            </View>

                            <View className="flex-col gap-4">
                                {bigThree.map(task => (
                                    <Pressable
                                        key={task.id}
                                        onPress={() => toggleTask(task.id)}
                                        className={cn(
                                            "w-full flex-row items-center gap-4 p-5 rounded-2xl border", // changed to items-center
                                            task.completed
                                                ? "bg-zinc-950/50 border-zinc-900 opacity-50" // more faded
                                                : "bg-zinc-800/80 border-zinc-700 active:border-zinc-600"
                                        )}
                                    >
                                        <View>
                                            {task.completed ? (
                                                <CheckCircle2 color="#a1a1aa" size={26} />
                                            ) : (
                                                <Circle color="#d4d4d8" size={26} />
                                            )}
                                        </View>
                                        <Text className={cn(
                                            "text-base leading-snug flex-1", // removed pt-0.5
                                            task.completed ? "text-zinc-500 line-through" : "text-zinc-100"
                                        )}>
                                            {task.text}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View className="items-center px-4">
                            {allCompleted ? (
                                <View className="items-center bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] w-full">
                                    <Text className="text-zinc-200 font-semibold text-lg mb-2 text-center">Amazing focus today.</Text>
                                    <Text className="text-zinc-400 text-sm mb-6 text-center leading-relaxed">You crushed your Big 3. Take a step back and breathe.</Text>
                                    <Pressable
                                        onPress={handleClear}
                                        className="bg-zinc-800 py-4 px-8 rounded-[24px] active:bg-zinc-700 w-full items-center"
                                    >
                                        <Text className="text-base font-medium text-white">Clear & Start Over</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <View className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                                    <Text className="text-sm text-zinc-400 text-center leading-relaxed">
                                        The rest of your dump is safely stored but hidden. Focus only on these 3 until they are checked off.
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            {/* Past Recommendations Button */}
            <Pressable
                onPress={() => router.push('/history' as any)}
                className="w-full flex-row items-center justify-center gap-2.5 py-4 rounded-[24px] bg-zinc-900 border border-zinc-800 active:bg-zinc-800"
            >
                <Clock color="#71717a" size={16} />
                <Text className="text-sm font-medium text-zinc-400">Past Recommendations</Text>
            </Pressable>

            </View>
        </ScrollView>
    );
}
