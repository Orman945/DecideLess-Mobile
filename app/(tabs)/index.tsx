import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Camera as CameraIcon, Sparkles, Sun, X, Zap, Image as ImageIcon, Clock } from 'lucide-react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWardrobeAi } from '../../hooks/useWardrobeAi';
import { cn } from '../../utils/utils';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const {
    items,
    isUploading,
    suggestedOutfit,
    isThinking,
    currentImageUri,
    processImageUpload,
    getOutfitSuggestion
  } = useWardrobeAi();

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
        await processImageUpload(photo.uri);
      }
    }
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: 100, // padding for bottom tabs
          paddingHorizontal: 24,
          alignItems: 'center', // Center everything
        }}
      >
        <View className="flex-col gap-8 w-full max-w-sm">

          {/* Header Row with Randomize Button */}
          <View className="w-full flex-row items-center justify-between mt-2">
            <Text className="text-3xl font-semibold tracking-tight text-white">Wardrobe.</Text>
            {/* Global Randomize Restored */}
            <Pressable onPress={() => router.push('/randomize')} className="bg-zinc-900 p-2.5 rounded-full active:bg-zinc-800 border border-zinc-800">
              <Zap color="#a1a1aa" size={20} />
            </Pressable>
          </View>

          {/* Subheading / Explanatory Label */}
          <View className="items-center bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/80 mb-2">
            <Text className="text-zinc-300 text-center leading-relaxed">
              Upload your clothes to train your AI. When in doubt, let the engine pick <Text className="text-zinc-50 font-semibold">exactly one</Text> perfect outfit based on today's weather.
            </Text>
          </View>

          {/* Snap & Tag Upload Zone - Split into Camera and Library */}
          <View className="w-full flex-row gap-4">
            <Pressable
              onPress={handleOpenCamera}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 items-center justify-center overflow-hidden active:bg-zinc-800/80"
            >
              {isUploading ? (
                <View className="items-center py-4">
                  <ActivityIndicator color="#a1a1aa" size="large" className="mb-4" />
                  <Text className="text-sm font-medium text-zinc-400">Analyzing...</Text>
                </View>
              ) : (
                <View className="items-center py-4">
                  <View className="w-14 h-14 rounded-full bg-zinc-800 items-center justify-center mb-4">
                    <CameraIcon color="#d4d4d8" size={24} />
                  </View>
                  <Text className="text-base font-medium text-zinc-100 mb-1">Camera</Text>
                  <Text className="text-xs text-zinc-500 text-center">Take a photo</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={async () => {
                const ImagePicker = require('expo-image-picker');
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  processImageUpload(result.assets[0].uri);
                }
              }}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 items-center justify-center overflow-hidden active:bg-zinc-800/80"
            >
              <View className="items-center py-4">
                <View className="w-14 h-14 rounded-full bg-zinc-800 items-center justify-center mb-4">
                  <ImageIcon color="#d4d4d8" size={24} />
                </View>
                <Text className="text-base font-medium text-zinc-100 mb-1">Library</Text>
                <Text className="text-xs text-zinc-500 text-center">Choose photo</Text>
              </View>
            </Pressable>
          </View>

          {/* Decision Engine Button */}
          <Pressable
            onPress={getOutfitSuggestion}
            disabled={items.length === 0 || isThinking}
            className={cn(
              "w-full py-5 rounded-[28px] flex-row items-center justify-center gap-3 overflow-hidden shadow-sm",
              items.length === 0 || isThinking ? 'bg-zinc-100 opacity-50' : 'bg-zinc-100 active:bg-white'
            )}
          >
            {isThinking ? (
              <>
                <ActivityIndicator color="#000000" size="small" />
                <Text className="text-zinc-950 font-semibold text-lg">Curating your look...</Text>
              </>
            ) : (
              <>
                <Sparkles color="#000000" size={22} />
                <Text className="text-zinc-950 font-bold text-lg tracking-wide">What should I wear?</Text>
              </>
            )}
          </Pressable>

          {/* Suggested Outfit View */}
          {suggestedOutfit && !isThinking && (
            <View className="w-full pt-8 border-t border-zinc-800/60 mt-2">
              {currentImageUri && (
                <Image
                  source={{ uri: currentImageUri }}
                  className="rounded-3xl border border-zinc-800 w-full mb-6"
                  style={{ aspectRatio: 4 / 3 }}
                  resizeMode="cover"
                />
              )}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="font-semibold text-xl text-zinc-100">Today's Selection</Text>
                <View className="flex-row items-center bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                  <Sun color="#a1a1aa" size={14} />
                  <Text className="text-sm font-medium text-zinc-400 mt-0.5 ml-1.5">72° Mild</Text>
                </View>
              </View>

              <View className="w-full flex-col gap-4">
                {suggestedOutfit.map((item, index) => {
                  const isTop = item.type === 'top';
                  return (
                    <View
                      key={item.id}
                      className={cn(
                        "relative rounded-3xl overflow-hidden border border-zinc-800 w-full",
                        isTop ? "aspect-[4/3]" : "aspect-[3/2]"
                      )}
                    >
                      <Image source={{ uri: item.imageUrl }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                      <View className="absolute inset-x-0 bottom-0 bg-black/70 p-4 pt-8 rounded-b-3xl">
                        <Text className="text-white text-base font-semibold capitalize">{item.type}</Text>
                        <Text className="text-zinc-400 text-sm mt-1">{item.color}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mt-6">
                <Text className="text-sm text-zinc-300 text-center leading-relaxed">
                  This combination provides a balanced formality suitable for mild conditions today.
                </Text>
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

          {/* Wardrobe Inventory */}
          {items.length > 0 && !suggestedOutfit && (
            <View className="w-full pt-8 flex-col border-t border-zinc-800/60 mt-4">
              <Text className="font-medium text-base text-zinc-400 mb-6 uppercase tracking-wider text-center">Your Wardrobe ({items.length})</Text>
              <View className="flex-row flex-wrap justify-center gap-3">
                {items.map(item => (
                  <View key={item.id} className="relative rounded-2xl overflow-hidden aspect-square border border-zinc-800 w-[47%]">
                    <Image source={{ uri: item.imageUrl }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-x-0 bottom-0 bg-black/60 items-center justify-center p-3 pt-6 rounded-b-2xl">
                      <Text className="text-sm font-semibold text-white capitalize text-shadow-sm">{item.type}</Text>
                      <Text className="text-xs text-zinc-400 text-shadow-sm mt-0.5">{item.weatherSuitability[0]}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    </View>
  );
}
