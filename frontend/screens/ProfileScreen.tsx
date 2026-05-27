/**
 * @file ProfileScreen.tsx
 * @description Displays the logged-in user's profile information and their enrolled courses.
 * Features:
 *  - Fetch and display real user data (name, email, degree) from the backend on mount.
 *  - Fetch and display the user's enrolled courses from the backend on mount.
 *  - Allow the user to add or remove courses in edit mode, syncing changes to the backend immediately.
 *  - Navigate to SettingsScreen via the gear icon in the header.
 * 
 * Backend API Endpoints:
 *  - GET  /oauth/profile     → returns { full_name, email, degree, ... }
 *  - GET  /courses/get       → returns [{ Course_name, user_email, start_date }, ...]
 *  - POST /courses/edit      → accepts { picked: string[] }, replaces all courses for the user
 * 
 * *Note (Farrel - 24//05/2026):  I noticed that this part previously used a hardcoded plaaceholder data.
 *                                In this version, I've implemented the API calls to fetch real user data 
 *                                and courses.           
*/
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Settings, BookOpen, Plus, X, Check } from 'lucide-react-native';
import { colors, radius, tone } from '../theme';
import { BottomNav } from '../components/BottomNav';
import {getuser } from "../controller/oauth" // -> This will be used to fetch user profile info from our backend.
import { getCources, editCourses } from '../controller/cources'; // -> These will be used to fetch and update the user's enrolled courses.


// ==== TYPES ====

type Course = { code: string; name: string; tone: 'lavender' | 'sky' | 'mint' | 'peach' };

// ==== CONSTANTS ====

// ===========================================================================================================
// Note (Farrel - 24/05/2026): We wont need this hardcoded initial courses array anymore since we're fetching 
//                             real courses from the backend. but for now i'll just comment this for reference
//                             
// const initialCourses: Course[] = [
//   { code: 'COMP1100', name: 'Intro to Programming', tone: 'lavender' },
//   { code: 'MATH1051', name: 'Calculus & Linear Algebra', tone: 'sky' },
//   { code: 'PHYS1001', name: 'Physics I', tone: 'mint' },
//   { code: 'ENGL1004', name: 'Academic Writing', tone: 'peach' },
// ];
// ===========================================================================================================

// ==== HELPERS ====

/**
 * Derives a 2-letter avatar string from a full name. This helper is used to replace the hardcoded "AL" avatar text.
 * Examples:
 *  - "Mary Jane" -> "MJ"  (first letter of first + last word)
 *  - "Prince"    -> "PR"  (first 2 letters if single name)
 *  - ""          -> "??"  (fallback shown while data is loading)
 */
function getInitials(fullName: string): string {
  if (!fullName) return '??';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}



// ==== COMPONENT ====

const tones: Course['tone'][] = ['lavender', 'sky', 'mint', 'peach'];

export function ProfileScreen({ onOpenSettings }: { onOpenSettings?: () => void }) {
   const Nav = useNavigation(); // -> Used to navigate to 'settings' screen via the gear icon

  // State variables for real user data fetched from the backend.
  // These replace the previously hardcoded "Alex Lin" / "alex.lin@anu.edu.au" values.
  const [userName, setUserName] = useState('');       // <- user.full_name from GET /oauth/profile
  const [userEmail, setUserEmail] = useState('');     // <- user.email from GET /oauth/profile
  const [userDegree, setUserDegree] = useState('');   // <- user.degree from GET /oauth/profile
  const [loadingUser, setLoadingUser] = useState(true); // Shows spinner while user data is being fetched

  // State for the list of enrolled courses.
  // Previously this was initialCourses (a hardcoded array) — now it starts empty and is populated from the backend.
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true); // Shows spinner while courses are being fetched
  const [saving, setSaving] = useState(false);                // Shows inline spinner when syncing changes to backend

  // State for the add-course form (shown in edit mode)
  const [editing, setEditing] = useState(false); // Toggles edit mode on/off
  const [code, setCode] = useState('');           // <- Course code input field, e.g. "COMP1100"
  const [name, setName] = useState('');           // <- Course name input field, e.g. "Intro to Programming"


  //USE EFFECT 1 - Fetch user profile on component mount
  // ----------------------------------------------------------------------------------------------------
  // Previously, getuser() was called but only console.log. the result was never used to update the UI.
  // Now we store the result in state so it actually shows on screen.
  // -------------------------------------------------------------------------------------------------
  useFocusEffect(useCallback(() => {
    const fetchUser = async () => {
      try {
        const user = await getuser();
        setUserName(user.full_name ?? '');
        setUserEmail(user.email ?? '');
        setUserDegree(user.degree ?? '');
      } catch (e) {
        console.error('ProfileScreen: failed to load user profile:', e);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []));

  // USE EFFECT 2 - Fetch enrolled courses on component mount
  // ----------------------------------------------------------------------------------------------------
  // Previously there was no fetch at all — courses came from a hardcoded initialCourses array.
  // Now we load the real courses from the backend for this user.
  // -------------------------------------------------------------------------------------------------
  useFocusEffect(useCallback(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const data = await getCources();
        const mapped: Course[] = data.map((c: any, i: number) => ({
          code: c.Course_code ?? c.Course_name.toUpperCase(),
          name: c.Course_name,
          tone: tones[i % 4],
        }));
        setCourses(mapped);
      } catch (e) {
        console.error('ProfileScreen: failed to load courses:', e);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []));

  // HANDLER 1 - Add a new course
  // ----------------------------------------------------------------------------------------------------
  // Previously: only updated local state (changes lost on app restart)
  // Now: updates local state first (so UI feels instant), then syncs to backend via syncCourses()
  // ----------------------------------------------------------------------------------------------------
  const add = async () => {
    // Guard: both fields must be filled
    if (!code.trim() || !name.trim()) return; 

    const newCourse: Course = {
      code: code.toUpperCase().trim(),
      name: name.trim(),
      tone: tones[courses.length % 4], // -> Pick the next colour in the cycle
    };

    const updated = [...courses, newCourse];
    // UI updates immediately before backend confirms
    setCourses(updated);
    setCode('');
    setName('');
    // Persist to backend
    await syncCourses(updated); 
  };

  const getuserprofile = async () => {
   const user = await getuser()
   console.log(user)
  }

  // HANDLER 2 - Remove a course
  // ----------------------------------------------------------------------------------------------------
  // Previously: inline arrow function in JSX that only updated local state
  // Now: extracted into a named async function that also syncs the removal to backend
  // ----------------------------------------------------------------------------------------------------
  const remove = async (courseCode: string) => {
    const updated = courses.filter((c) => c.code !== courseCode);
    // UI updates immediately before backend confirms
    setCourses(updated); 
    // Persist to backend
    await syncCourses(updated); 
  };

  // HELPER 3 - Persist the full course list to the backend
  // ----------------------------------------------------------------------------------------------------
  // Called by both add() and remove() after updating local state.
  // the backend works by deleting all existing courses for this user, then re-inserting the new list.
  // so we always send the complete updated array, not just the changed item.
  // ---------------------------------------------------------------------------------------------------- 
  const syncCourses = async (updated: Course[]) => {
    try {
      setSaving(true); // Show inline saving spinner next to "Enrolled courses" title
      await editCourses(updated.map((c) => ({ code: c.code, name: c.name }))); // POST /courses/edit — backend expects array of name strings
    } catch (e) {
      console.error('ProfileScreen: failed to save courses:', e);
    } finally {
      setSaving(false); // Hide saving spinner
    }
  };

  // While loadingUser is true, userName is '' so this returns '??'
  const initials = getInitials(userName);

  // ==== RENDER ====
  /**
   * Note (Farrel - 24/05/2026): The render logic is mostly the same as before, but with added conditional 
   *                             rendering to handle loading states and dynamic data from the backend.
   * 
  */
return (
    <SafeAreaView style={s.safe}>

      {/* HEADER — Page title + settings gear icon */}
      <View style={s.header}>
        <Text style={s.h1}>Profile</Text>
        {/*
          Previously: onPress={onOpenSettings} — a prop that was never passed in App.tsx, so the button did nothing.
          Now: Nav.navigate('settings') — uses the React Navigation stack configured in App.tsx.
        */}
        <Pressable onPress={() => Nav.navigate('settings')} style={s.iconBtn}>
          <Settings size={16} color={colors.foreground + '99'} strokeWidth={1.6} />
        </Pressable>
      </View>

      {/* AVATAR + USER INFO — Name, email, degree tag */}
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <View style={s.avatarOuter}>
          <View style={s.avatarInner}>
            {
            /* Previously: hardcoded <Text>AL</Text>
                Now: spinner while loading, then real initials derived from the user's name 
            */
            }
            {loadingUser
              ? <ActivityIndicator size="small" color={colors.foreground} />
              : <Text style={s.avatarText}>{initials}</Text>
            }
          </View>
        </View>

        {/* 
        Previously: hardcoded "Alex Lin" / "alex.lin@anu.edu.au"
        Now: shows '—' as a placeholder while loading, then real values from backend 
        */
        }
        <Text style={s.name}>{loadingUser ? '—' : userName}</Text>
        <Text style={s.email}>{loadingUser ? '—' : userEmail}</Text>

        {
        /* Degree tag: only rendered after user data has loaded.
            Previously showed hardcoded "Year 2", "Major: CS", "GPA 3.8" tags.
            Now only shows the degree field returned by the backend (hidden if empty). 
        */
        }
        {!loadingUser && (
          <View style={s.tags}>
            {userDegree ? (
              <View style={[s.tag, { backgroundColor: colors.mintSoft }]}>
                <Text style={s.tagText}>{userDegree}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      {/* SECTION HEADER: "Enrolled courses" title + saving spinner + Edit/Done toggle */}
      <View style={s.sectionRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={s.section}>Enrolled courses</Text>
          {/* Small spinner shown inline while a course add/remove is being saved to the backend */}
          {saving && <ActivityIndicator size="small" color={colors.muted} />}
        </View>
        <Pressable
          onPress={() => setEditing((e) => !e)}
          style={[s.editBtn, editing && { backgroundColor: colors.foreground }]}
        >
          {editing && <Check size={12} color={colors.background} strokeWidth={2.5} />}
          <Text style={[s.editText, editing && { color: colors.background }]}>
            {editing ? 'Done' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      {/* COURSE LIST */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 8 }} style={{ flex: 1 }}>

        {
        /* 
        Add-course input row — only visible when edit mode is active 
        */
        }
        {editing && (
          <View style={s.addCard}>
            <TextInput value={code} onChangeText={setCode} placeholder="CODE"
              placeholderTextColor={colors.foreground + '4D'} style={[s.addInput, { width: 80 }]} />
            <TextInput value={name} onChangeText={setName} placeholder="Course name"
              placeholderTextColor={colors.foreground + '4D'} style={[s.addInput, { flex: 1 }]} />
            <Pressable onPress={add} style={s.addBtn}>
              <Plus size={14} color={colors.foreground} strokeWidth={2.5} />
            </Pressable>
          </View>
        )}

        {/*
          Three possible states for the course list (previously courses just rendered directly from hardcoded array):
            1. loadingCourses = true  -> show loading spinner
            2. courses.length === 0   -> show empty state card
            3. courses.length > 0     -> render course cards as before, but with real data

            *Note (Farrel - 24/05/2026): previously courses just rendered directly from hardcoded array.  
        */}
        {loadingCourses ? (
          // State 1: Loading (fetching courses from backend)
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            <ActivityIndicator size="large" color={colors.lavender} />
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>Loading courses…</Text>
          </View>
        ) : courses.length === 0 ? (
          // State 2: Empty (user has no enrolled courses yet)
          <View style={s.emptyState}>
            <BookOpen size={28} color={colors.muted} strokeWidth={1.4} />
            <Text style={s.emptyTitle}>No courses yet</Text>
            <Text style={s.emptyHint}>Tap Edit → + to add your first course.</Text>
          </View>
        ) : (
          // State 3: Populated (render one card per course)
          courses.map((c) => (
            <View key={c.code} style={[s.course, { backgroundColor: tone[c.tone].bg }]}>
              <View style={[s.courseIcon, { backgroundColor: tone[c.tone].tag }]}>
                <BookOpen size={16} color={colors.foreground} strokeWidth={1.6} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.courseCode}>{c.code}</Text>
                <Text style={s.courseName}>{c.name}</Text>
              </View>
              {
              /* Remove button: only visible in edit mode.
                  Previously: inline setCourses filter (local only).
                  Now: calls remove() which also syncs deletion to backend. 
              */
              }
              {editing && (
                <Pressable onPress={() => remove(c.code)} style={s.removeBtn}>
                  <X size={14} color={colors.foreground + '99'} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

// ==== STYLES ====

/**
 * Note (Farrel - 24/05/2026): The styles for the profile screen are mostly unchanged, except for the
 *                             addition of new styles to support the empty state when there are no courses.
 *                             also tidied up the styles for better readability
 * 
*/




const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.background },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  h1:          { fontSize: 22, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5 },
  iconBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  avatarOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  avatarText:  { fontSize: 20, fontWeight: '700', color: colors.foreground },
  name:        { fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 8 },
  email:       { fontSize: 11, color: colors.muted },
  tags:        { flexDirection: 'row', gap: 6, marginTop: 12 },
  tag:         { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill },
  tagText:     { fontSize: 11, fontWeight: '700', color: colors.foreground },
  sectionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  section:     { fontSize: 14, fontWeight: '700', color: colors.foreground },
  editBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.secondary },
  editText:    { fontSize: 11, fontWeight: '700', color: colors.muted },
  addCard:     { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, backgroundColor: colors.secondary + '66' },
  addInput:    { backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, fontSize: 11, color: colors.foreground, fontWeight: '700' },
  addBtn:      { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  course:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20 },
  courseIcon:  { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  courseCode:  { fontSize: 13, fontWeight: '700', color: colors.foreground },
  courseName:  { fontSize: 11, color: colors.muted, marginTop: 2 },
  removeBtn:   { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background + 'B3', alignItems: 'center', justifyContent: 'center' },
  emptyState:  { alignItems: 'center', marginTop: 48, gap: 8 },           // New style 1: container for empty state
  emptyTitle:  { fontSize: 14, fontWeight: '700', color: colors.muted },  // New style 2: "No courses yet"
  emptyHint:   { fontSize: 12, color: colors.muted },                     // New style 3: hint text below empty title
});