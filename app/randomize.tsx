import { View, Text, Pressable, Animated } from 'react-native';
import { Dice5, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';

const RANDOM_DECISIONS = [
    "Take a 5 minute walk.",
    "Drink a glass of water.",
    "Do 10 deep breaths.",
    "Stretch your neck and shoulders.",
    "Listen to your favorite song.",
    "Message a friend.",
    "Close your eyes for 2 minutes."
];

export default function RandomizeModal() {
    const router = useRouter();
    const [decision, setDecision] = useState<string>('');
    const [isSpinning, setIsSpinning] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        handleSpin();
    }, []);

    const handleSpin = () => {
        setIsSpinning(true);
        Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
        }).start();

        let spins = 0;
        const interval = setInterval(() => {
            setDecision(RANDOM_DECISIONS[Math.floor(Math.random() * RANDOM_DECISIONS.length)]);
            spins++;
            // Stop spinning after ~1 second
            if (spins > 10) {
                clearInterval(interval);
                setIsSpinning(false);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            }
        }, 100);
    };

    return (
        <View className="flex-1 items-center justify-center px-4 bg-black/60">
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <View className="flex-row items-center justify-between mb-8">
                    <View className="flex-row items-center gap-2">
                        <Dice5 color="#a1a1aa" size={20} />
                        <Text className="font-medium text-zinc-400">Randomizer</Text>
                    </View>
                    <Pressable onPress={() => router.back()} className="p-1">
                        <X color="#71717a" size={20} />
                    </Pressable>
                </View>

                <View className="flex-col items-center justify-center space-y-8 min-h-[160px]">
                    <Animated.Text
                        style={{ opacity: fadeAnim }}
                        className="text-2xl font-semibold leading-tight text-zinc-50 text-center mb-8"
                    >
                        {decision}
                    </Animated.Text>

                    <Pressable
                        onPress={handleSpin}
                        disabled={isSpinning}
                        className={`w-full py-4 rounded-2xl items-center justify-center ${isSpinning ? 'bg-zinc-300' : 'bg-zinc-100 active:bg-white'}`}
                    >
                        <Text className={`font-semibold text-lg ${isSpinning ? 'text-zinc-500' : 'text-zinc-950'}`}>
                            Spin Again
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
