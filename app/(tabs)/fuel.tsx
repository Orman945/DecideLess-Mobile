import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { Camera as CameraIcon, Search, Sparkles, Clock, Zap, X, Image as ImageIcon } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFuelAi } from '../../hooks/useFuelAi';
import { cn } from '../../utils/utils';
import { useRouter } from 'expo-router';

export default function FuelScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [permission, requestPermission] = useCameraPermissions();
    const [isCameraActive, setIsCameraActive] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const { isScanning, meals, currentImageUri, simulatePantryScan, resetFuel } = useFuelAi();

    const handleSnapPantry = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            simulatePantryScan({ imageUri: result.assets[0].uri });
        }
    };

    const handleOpenCamera = async () => {
        if (!permission?.granted) {
            await requestPermission();
        }
        setIsCameraActive(true);
    };

    const takePicture = async () => {
        if (cameraRef.current) {
            setIsCameraActive(false);
            const photo = await cameraRef.current.takePictureAsync({
                base64: false,
                quality: 0.8
            });
            if (photo?.uri) {
                simulatePantryScan({ imageUri: photo.uri });
            }
        }
    };

    const handleTextScan = () => {
        if (inputText.trim()) {
            simulatePantryScan({ text: inputText.trim() });
        }
    };

    const handleReset = () => {
        setInputText('');
        resetFuel();
    };

    return (
        <View className="flex-1 bg-zinc-950">
            <ScrollView
                className="flex-1"
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
                        <Text className="text-3xl font-semibold tracking-tight text-white">Fuel.</Text>
                        {/* Global Randomize Restored */}
                        <Pressable onPress={() => router.push('/randomize')} className="bg-zinc-900 p-2.5 rounded-full active:bg-zinc-800 border border-zinc-800">
                            <Zap color="#a1a1aa" size={20} />
                        </Pressable>
                    </View>

                    {/* Subheading / Explanatory Label */}
                    <View className="items-center bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/80 mb-2">
                        <Text className="text-zinc-300 text-center leading-relaxed">
                            Scan your pantry or type 3 ingredients. We'll give you <Text className="text-zinc-50 font-semibold">2</Text> simple meals to eliminate dinner debate.
                        </Text>
                    </View>

                    {!meals && (
                        <View className="flex-col gap-6 w-full">
                            {/* Camera and Library Buttons */}
                            <View className="w-full flex-row gap-4">
                                <Pressable
                                    onPress={handleOpenCamera}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 items-center justify-center overflow-hidden active:bg-zinc-800/80"
                                >
                                    {isScanning ? (
                                        <View className="items-center py-4">
                                            <ActivityIndicator color="#a1a1aa" size="large" className="mb-4" />
                                            <Text className="text-sm font-medium text-zinc-400">Scanning...</Text>
                                        </View>
                                    ) : (
                                        <View className="items-center py-4">
                                            <View className="w-14 h-14 rounded-full bg-zinc-800 items-center justify-center mb-4">
                                                <CameraIcon color="#d4d4d8" size={24} />
                                            </View>
                                            <Text className="text-base font-medium text-zinc-100 mb-1">Camera</Text>
                                            <Text className="text-xs text-zinc-500 text-center">Snap fridge</Text>
                                        </View>
                                    )}
                                </Pressable>

                                <Pressable
                                    onPress={handleSnapPantry}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 items-center justify-center overflow-hidden active:bg-zinc-800/80"
                                >
                                    <View className="items-center py-4">
                                        <View className="w-14 h-14 rounded-full bg-zinc-800 items-center justify-center mb-4">
                                            <ImageIcon color="#d4d4d8" size={24} />
                                        </View>
                                        <Text className="text-base font-medium text-zinc-100 mb-1">Library</Text>
                                        <Text className="text-xs text-zinc-500 text-center">Upload photo</Text>
                                    </View>
                                </Pressable>
                            </View>

                            <View className="flex-row items-center gap-3">
                                <View className="flex-1 relative justify-center">
                                    <TextInput
                                        placeholder="e.g. Eggs, Spinach, Feta"
                                        placeholderTextColor="#71717a"
                                        value={inputText}
                                        onChangeText={setInputText}
                                        onSubmitEditing={handleTextScan}
                                        editable={!isScanning}
                                        className={cn(
                                            "w-full bg-zinc-900 border border-zinc-800 rounded-[24px] py-4 pl-5 pr-12 text-white text-base",
                                            isScanning && "opacity-50"
                                        )}
                                    />
                                    <View className="absolute right-4">
                                        <Search color="#71717a" size={20} />
                                    </View>
                                </View>
                                <Pressable
                                    onPress={handleTextScan}
                                    disabled={isScanning || !inputText.trim()}
                                    className={cn(
                                        "p-4 rounded-[24px] items-center justify-center",
                                        isScanning || !inputText.trim() ? 'bg-zinc-100 opacity-50' : 'bg-zinc-100 active:bg-white'
                                    )}
                                >
                                    {isScanning ? <ActivityIndicator color="#000000" size="small" /> : <Sparkles color="#000000" size={22} />}
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {meals && !isScanning && (
                        <View className="flex-col gap-8 mt-2 w-full">
                            {currentImageUri && (
                                <Image
                                    source={{ uri: currentImageUri }}
                                    className="rounded-3xl border border-zinc-800 w-full"
                                    style={{ aspectRatio: 4 / 3 }}
                                    resizeMode="cover"
                                />
                            )}
                            <View className="flex-col gap-5 w-full">
                                {meals.map((meal) => (
                                    <View key={meal.id} className="bg-zinc-900/80 border border-zinc-800 rounded-[32px] p-6 overflow-hidden w-full">
                                        <View className="flex-row items-start justify-between mb-6">
                                            <Text className="font-semibold text-xl text-zinc-100 flex-1 pr-4 tracking-wide">{meal.name}</Text>
                                            <View className="flex-row items-center gap-1.5 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
                                                <Clock color="#a1a1aa" size={14} />
                                                <Text className="text-sm font-medium text-zinc-400 mt-0.5">{meal.time}</Text>
                                            </View>
                                        </View>

                                        <View className="flex-col gap-5">
                                            {meal.steps.map((step, idx) => (
                                                <View key={idx} className="flex-row gap-4 pr-2">
                                                    <View className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center mt-0.5">
                                                        <Text className="text-xs font-bold text-zinc-300">{idx + 1}</Text>
                                                    </View>
                                                    <Text className="text-base text-zinc-300 leading-relaxed flex-1">{step}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View className="items-center mt-4">
                                <Pressable
                                    onPress={handleReset}
                                    className="bg-zinc-900 py-4 px-8 rounded-[24px] active:bg-zinc-800 border border-zinc-800 w-full items-center"
                                >
                                    <Text className="text-base text-zinc-300 font-medium tracking-wide">Have different ingredients?</Text>
                                </Pressable>
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

            {/* Live Camera Full Screen Modal Overlay */}
            <Modal visible={isCameraActive} transparent={true} animationType="slide">
                <View className="flex-1 bg-transparent">
                    {permission?.granted ? (
                        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
                            <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'column', justifyContent: 'space-between', padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 48 }}>
                                <View className="w-full flex-row justify-end">
                                    <Pressable onPress={() => setIsCameraActive(false)} className="bg-black/50 p-3 rounded-full">
                                        <X color="white" size={24} />
                                    </Pressable>
                                </View>

                                <View className="w-full items-center">
                                    <Pressable
                                        onPress={takePicture}
                                        className="w-20 h-20 rounded-full border-4 border-white/50 items-center justify-center bg-transparent"
                                    >
                                        <View className="w-[66px] h-[66px] rounded-full bg-white" />
                                    </Pressable>
                                </View>
                            </View>
                        </CameraView>
                    ) : (
                        <View className="flex-1 items-center justify-center p-8 bg-zinc-950">
                            <Text className="text-white text-center text-lg font-medium mb-4">We need your permission to use the camera</Text>
                            <Pressable onPress={requestPermission} className="bg-white px-6 py-3 rounded-xl">
                                <Text className="text-black font-semibold">Grant Permission</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </Modal>
        </View >
    );
}
