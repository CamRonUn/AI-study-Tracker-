import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Home, Bell, Brain, User } from 'lucide-react-native';
import { colors } from '../theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';

export type Tab = 'home' | 'reminders' | 'quiz' | 'profile';

const items: { id: Tab; label: string; Icon: any }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'reminders', label: 'Alerts', Icon: Bell },
  { id: 'quiz', label: 'Quiz', Icon: Brain },
  { id: 'profile', label: 'Profile', Icon: User },
];

type RootStackParamList = {
  home: undefined;      // 'undefined' means this screen doesn't take any parameters
  reminders: undefined;
  quiz: undefined;
  profile: undefined;
};

export function BottomNav({ active, onChange }: { active: Tab; onChange?: (t: Tab) => void }) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();  
    return (
    <View style={s.wrap}>
      {items.map(({ id, label, Icon }) => {
        const isActive = id === active;
        return (
          <Pressable key={id} onPress={() => navigation.navigate(id)} style={[s.item, isActive && s.itemActive]}>
            <Icon size={18} color={isActive ? colors.foreground : colors.foreground + '70'} strokeWidth={1.8} />
            <Text style={[s.label, { color: isActive ? colors.foreground : colors.foreground + '70' }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 18,
    backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
  },
  item: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, gap: 3 },
  itemActive: { backgroundColor: colors.lavenderSoft },
  label: { fontSize: 10, fontWeight: '600' },
});
