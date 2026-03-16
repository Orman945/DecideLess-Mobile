import { Stack } from 'expo-router';

export default function HistoryLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#09090b' },
                headerTintColor: '#ffffff',
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: '#09090b' },
            }}
        />
    );
}
