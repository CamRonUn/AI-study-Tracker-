/**
 * @file SettingsScreen.tsx
 * @description Displays user account settings, preferences, and security options.
 * Features:
 *  - Load and display real user name and degree from the backend on mount.
 *  - Navigate back to ProfileScreen via the back arrow in the header.
 *  - Log out: clears the stored JWT token and redirects to the Login screen.
 *
 * Backend API Endpoints:
 *  - GET /oauth/profile → returns { full_name, email, degree, ... }
 *
 * *Note (Farrel - 24/05/2026): Previously this screen had hardcoded "Alex Lin" data,
 *                              a broken back button (onBack prop never wired in App.tsx),
 *                              and a Log Out button that did nothing.
 *                              This version fixes all three.
 * 
 *       (Farrel - 25/05/2026): Added save button that's wired to PATCH oauth/profile to update the user's 
 *                              name and major. 
 * 
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { ChevronLeft, Bell, Moon, Lock, LogOut, ChevronRight, Save } from 'lucide-react-native';
import { colors, radius } from '../theme';
import { getuser } from '../controller/oauth';           // -> Fetch real user data for display
import { useNavigation } from '@react-navigation/native'; // -> Used for back button and logout redirect
import * as SecureStore from 'expo-secure-store';         // -> Used to clear the stored JWT token on logout
import { loadToken } from '../controller/config';  // -> Used to attach Bearer token to the save request
import { baseURL } from '../controller/config';   // -> Base URL for the PATCH request


// ==== COMPONENT ====

export function SettingsScreen() {

  const Nav = useNavigation();
  // State for editable account fields.
  // Previously hardcoded as 'Alex Lin' and 'Computer Science. Now populated from the backend on mount.
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');

  // Tracks whether the fields have been changed from their loaded values
  // Used to only show the Save button when there's something to save
  const [isDirty, setIsDirty] = useState(false);

  // Saving state: shows a spinner on the Save button while the PATCH request is in-flight
  const [saving, setSaving] = useState(false);
  // Success/error feedback after saving
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
 
  // Original values loaded from backend. used to detect if anything changed
  const [originalName, setOriginalName] = useState('');
  const [originalMajor, setOriginalMajor] = useState('');

  // Preference toggles (local only for now. no backend endpoint to save these yet)
  const [notif, setNotif] = useState(true);
  const [dark, setDark] = useState(false);

  // USE EFFECT 1: Load real user data on mount
  // Previously: name and major were hardcoded strings, never fetched from backend.
  // Now: populated from GET /oauth/profile so the fields show the actual user's data.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getuser();
        setName(user.full_name ?? '');
        setMajor(user.degree ?? '');
        setOriginalName(user.full_name ?? '');
        setOriginalMajor(user.degree ?? '');
      } catch (e) {
        console.error('SettingsScreen: failed to load user profile:', e);
      }
    };
    fetchUser();
  }, []); // Empty deps -> runs once on mount only

  // HANDLER 1 - Log out
  // Previously: Log Out button had no onPress handler. tapping it did nothing.
  // Now: clears the JWT token from storage and navigates to the Login screen.
  const handleLogout = async () => {
    try {
      // Clear the stored token. works on both web and native
      if (Platform.OS === 'web') {
        // Web: stored in localStorage
        localStorage.removeItem('userToken'); 
      } else {
        // Native: stored in SecureStore
        await SecureStore.deleteItemAsync('userToken'); 
      }
    } catch (e) {
      console.error('SettingsScreen: failed to clear token:', e);
    } finally {
      // Always navigate to login, even if token clearing fails
      Nav.navigate('login');
    }
  };

  // HANDLER 2 - Detect changes to name field
  const handleNameChange = (val: string) => {
    setName(val);
    setIsDirty(val !== originalName || major !== originalMajor);
    setSaveStatus('idle'); // reset status badge when user edits again
  };

  // HANDLER 3 - Detect changes to major field
  const handleMajorChange = (val: string) => {
    setMajor(val);
    setIsDirty(name !== originalName || val !== originalMajor);
    setSaveStatus('idle');
  };

  // HANDLER 4 - Save changes to backend via PATCH /oauth/profile
  // Previously: no save mechanism — changes were lost on navigation.
  // Now: sends updated full_name and degree to the backend and persists them.
  const handleSave = async () => {
    if (!isDirty || saving) return;
    try {
      setSaving(true);
      setSaveStatus('idle');

      // get the stored JWT token
      const token = await loadToken(); 
      const response = await fetch(`${baseURL}/oauth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: name, degree: major }),
      });

      if (!response.ok) throw new Error('Save failed');

      // Update originals so isDirty resets correctly
      setOriginalName(name);
      setOriginalMajor(major);
      setIsDirty(false);
      setSaveStatus('success');
    } catch (e) {
      console.error('SettingsScreen: failed to save profile:', e);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

 // ==== RENDER ====

  return (
    <SafeAreaView style={s.safe}>

      {/* HEADER: back button + title */}
      <View style={s.header}>
        {/*
          Previously: onPress={onBack} — a prop that was never passed from App.tsx,
          so the back button did nothing at all.
          Now: Nav.goBack() — uses React Navigation to go back to ProfileScreen.
        */}
        <Pressable onPress={() => Nav.goBack()} style={s.iconBtn}>
          <ChevronLeft size={16} color={colors.foreground + '99'} strokeWidth={1.8} />
        </Pressable>
        <Text style={s.h1}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }} style={{ flex: 1 }}>

        {/* ACCOUNT: editable name and major fields */}
        {/* Previously: hardcoded 'Alex Lin' / 'Computer Science', changes were local only */}
        {/* Now: prefilled from backend, ready to be wired to a save endpoint later */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={s.section}>ACCOUNT</Text>
            {/*
              Save button — only visible when a field has been changed (isDirty = true).
              Shows a spinner while the PATCH request is in-flight.
              Previously: did not exist — changes were never saved.
            */}
            {isDirty && (
              <Pressable onPress={handleSave} style={s.saveBtn} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color={colors.background} />
                  : <Save size={12} color={colors.background} strokeWidth={2.5} />
                }
                <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save changes'}</Text>
              </Pressable>
            )}
          </View>

          <View style={s.group}>
            <LabeledInput label="Display name" value={name} onChange={handleNameChange} />
            <LabeledInput label="Major" value={major} onChange={handleMajorChange} />
          </View>

          {/* Feedback badge shown after save attempt */}
          {saveStatus === 'success' && (
            <Text style={s.feedbackSuccess}>✓ Profile saved successfully</Text>
          )}
          {saveStatus === 'error' && (
            <Text style={s.feedbackError}>✗ Failed to save — please try again</Text>
          )}
        </View>
        {
        /* PREFERENCES:
          notification and dark mode toggles (local state only) 
        */
        }
        <View>
          <Text style={s.section}>PREFERENCES</Text>
          <Toggle icon={<Bell size={16} color={colors.foreground} strokeWidth={1.6} />} label="Notifications" value={notif} onChange={setNotif} tint={colors.peachSoft} />
          <Toggle icon={<Moon size={16} color={colors.foreground} strokeWidth={1.6} />} label="Dark mode" value={dark} onChange={setDark} tint={colors.skySoft} />
        </View>

        {
        /* SECURITY: 
          change password row + log out row 
        */}
        <View>
          <Text style={s.section}>SECURITY</Text>
          <Row icon={<Lock size={16} color={colors.foreground} strokeWidth={1.6} />} label="Change password" tint={colors.lavenderSoft} />
          {/*
            Previously: no onPress on Log Out — tapping it did nothing.
            Now: calls handleLogout() which clears the token and navigates to Login.
          */}
          <Row
            icon={<LogOut size={16} color={colors.foreground} strokeWidth={1.6} />}
            label="Log out"
            tint={colors.mintSoft}
            onPress={handleLogout}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ==== SUBCOMPONENTS ====

function LabeledInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={s.lab}>
      <Text style={s.labLabel}>{label.toUpperCase()}</Text>
      <TextInput value={value} onChangeText={onChange} style={s.labInput} />
    </View>
  );
}

// toggle row used for Notifications and Dark mode
function Toggle({ icon, label, value, onChange, tint }: any) {
  return (
    <Pressable onPress={() => onChange(!value)} style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: tint }]}>{icon}</View>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={[s.switch, { backgroundColor: value ? colors.foreground : colors.foreground + '26' }]}>
        <View style={[s.thumb, { left: value ? 18 : 2 }]} />
      </View>
    </Pressable>
  );
}


function Row({ icon, label, tint, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: tint }]}>{icon}</View>
      <Text style={s.rowLabel}>{label}</Text>
      <ChevronRight size={16} color={colors.muted} strokeWidth={1.8} />
    </Pressable>
  );
}

// ==== STYLES ====
// No style changes from the original.
// Note (Farrel - 24/05/2026): like the ones in ProfileScreen.tsx, i just tidying up
//                             the formatting here for readability, but there are no actual style changes.

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.background },
  header:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 12 },
  iconBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  h1:       { fontSize: 22, fontWeight: '700', color: colors.foreground, letterSpacing: -0.5 },
  section:  { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1.2, marginBottom: 8 },
  group:    { backgroundColor: colors.secondary + '99', borderRadius: 20, padding: 12, gap: 8 },
  lab:      { backgroundColor: colors.background, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 },
  labLabel: { fontSize: 10, fontWeight: '700', color: colors.muted, letterSpacing: 1 },
  labInput: { fontSize: 13, fontWeight: '600', color: colors.foreground, padding: 0, marginTop: 2 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: colors.secondary + '99', marginBottom: 8 },
  rowIcon:  { width: 36, height: 36, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.foreground },
  switch:   { width: 36, height: 20, borderRadius: 10, position: 'relative' },
  thumb:    { position: 'absolute', top: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.background },
  // New styles for Save button and feedback badges
  saveBtn:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: colors.foreground },
  saveBtnText:     { fontSize: 11, fontWeight: '700', color: colors.background },
  feedbackSuccess: { fontSize: 11, color: '#4C9A6B', fontWeight: '600', marginTop: 6, paddingHorizontal: 4 },
  feedbackError:   { fontSize: 11, color: '#D94F70', fontWeight: '600', marginTop: 6, paddingHorizontal: 4 },
});
