import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { GraduationCap, Check, Plus, X } from 'lucide-react-native';
import { colors, radius } from '../theme';
import { useRoute } from '@react-navigation/native';
import {post_sign_up} from "../controller/oauth"
import {editCourses} from "../controller/cources"
import { useNavigation } from '@react-navigation/native';
import {addSingletask} from "../controller/tasks";



const degrees = ['Computer Science', 'Engineering', 'Business', 'Psychology', 'Design', 'Mathematics'];
const suggested = [
  { code: 'COMP1100', name: 'Introduction to Programming' },
  { code: 'MATH1051', name: 'Calculus & Linear Algebra I' },
  { code: 'PHYS1001', name: 'Mechanics & Thermal Physics' },
  { code: 'ENGL1004', name: 'Introduction to English Literature' },
  { code: 'STAT1003', name: 'Introduction to Statistics' },
  { code: 'INFO1110', name: 'Introduction to Programming' }
]

export function OnboardingScreen() {
  const Nav = useNavigation()
  const route = useRoute();
  const { name, email, password } = route.params;
  const [step, setStep] = useState<1 | 2>(1);
  const [degree, setDegree] = useState('Computer Science');
  const [picked, setPicked] = useState<{ code: string; name: string }[]>([
    { code: 'COMP1100', name: 'Introduction to Programming' },
    { code: 'MATH1051', name: 'Calculus & Linear Algebra I' }
  ]);
  const today = new Date()
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const dd = String(today.getDate()).padStart(2, '0');

  const formattedToday = `${yyyy}-${mm}-${dd}`;

  const toggle = (course: { code: string; name: string }) =>
  setPicked((p) =>
    p.some((x) => x.code === course.code)
      ? p.filter((x) => x.code !== course.code)
      : [...p, course]
  );

  const handleSignup = async (name, email, password) => {
    try {
        // post_sign_up handles token storage (SecureStore on mobile, localStorage on web)
        const tokenData = await post_sign_up(name, email, password, degree);
        if (tokenData && tokenData.access_token) {
            console.log(picked)
            // Token is already saved inside post_sign_up — safe to call editCourses now
            await editCourses(picked)
            
            const initialTask = {
              id: Date.now(),
              title: "Complete Quiz", 
              type: "revision", 
              course: "to get AI Study Recomendations", 
              completed: false, 
              dueDate: formattedToday, 
              createdDate: formattedToday
            };

            await addSingletask(initialTask);
            Nav.navigate("home", { initialOnboardingTask: initialTask });         
        }
    } catch (error) {
        console.error(error);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[s.bar, { backgroundColor: step >= 1 ? colors.foreground : colors.secondary }]} />
          <View style={[s.bar, { backgroundColor: step >= 2 ? colors.foreground : colors.secondary }]} />
        </View>
        <View style={s.icon}>
          <GraduationCap size={26} color={colors.foreground} strokeWidth={1.8} />
        </View>
        <Text style={s.title}>{step === 1 ? 'What are you studying?' : 'Pick your courses'}</Text>
        <Text style={s.sub}>
          {step === 1 ? 'Choose your degree to personalise Studyo.' : "Add the units you're enrolled in this term."}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} style={{ flex: 1 }}>
        {step === 1
          ? degrees.map((d) => {
              const active = degree === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDegree(d)}
                  style={[s.row, { backgroundColor: active ? colors.lavenderSoft : colors.secondary }]}
                >
                  <Text style={s.rowText}>{d}</Text>
                  {active && (
                    <View style={s.check}>
                      <Check size={12} color={colors.background} strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })
          : (
            <>
              {picked.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {picked.map((c) => (
                    // FIXED: c is an object now, so use c.code for key, toggle, and display text
                    <Pressable key={c.code} onPress={() => toggle(c)} style={s.chip}>
                      <Text style={s.chipText}>{c.code}</Text> 
                      <X size={12} color={colors.foreground} strokeWidth={2.5} />
                    </Pressable>
                  ))}
                </View>
              )}
              
              <Text style={s.section}>SUGGESTED</Text>
              {suggested.map((c) => {
                // FIXED: Check object array by matching properties using .some()
                const active = picked.some((x) => x.code === c.code); 
                return (
                  <Pressable
                    key={c.code}
                    // FIXED: Pass the entire object 'c' to the updated toggle function
                    onPress={() => toggle(c)} 
                    style={[s.row, { backgroundColor: active ? colors.mintSoft : colors.secondary }]}
                  >
                    <Text style={s.rowText}>{c.code}</Text>
                    <View style={[s.bubble, { backgroundColor: active ? colors.foreground : colors.background }]}>
                      {active ? (
                        <Check size={14} color={colors.background} strokeWidth={3} />
                      ) : (
                        <Plus size={14} color={colors.foreground + '80'} strokeWidth={2} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}
      </ScrollView>

      <View style={s.footer}>
        <Pressable
          onPress={() => (step === 1 ? setStep(2) : handleSignup(name, email, password))}
          style={s.primary}
        >
          <Text style={s.primaryText}>{step === 1 ? 'Continue' : 'Get started'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.mintSoft, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginTop: 12, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.lg, marginBottom: 8 },
  rowText: { fontSize: 13, fontWeight: '600', color: colors.foreground },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.foreground, alignItems: 'center', justifyContent: 'center' },
  bubble: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.mint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  chipText: { fontSize: 11, fontWeight: '700', color: colors.foreground },
  section: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1.2, marginBottom: 8 },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, padding: 16, backgroundColor: colors.background },
  primary: { backgroundColor: colors.foreground, paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center' },
  primaryText: { color: colors.background, fontSize: 14, fontWeight: '700' },
});