import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { Mail, Lock, User as UserIcon, GraduationCap } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius } from '../theme';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {getuser, check_email_exists, postLogin} from "../controller/oauth"

export function LoginScreen({ onDone }: { onDone?: () => void }) {

  const Navigation = useNavigation()
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedin] = useState(false)
  const [loading, setloading]= useState(true)
  

  useEffect(() =>{
    const checklogin = async() => {
      setloading(true)
    try{
      const data = await getuser()
      console.log("testing login")
      console.log(`get user in useEffect ${data}`)
      if (data.email){
        setLoggedin(true)
      }
    } catch(error) {
      console.error("Cant determin login status:", error);
    } finally {
      setloading(false)
    } 
  }
  checklogin()
}, [])


  console.log(`logged in : ${loggedIn}`)

  const handle_signup_button = async () => {
    const email_exists = await check_email_exists(email)
    console.log(email_exists)
    if (email.length < 5){
      setEmail("enter valid email")
      return
    }
    if (name.length < 3){
      setEmail("enter name")
      return
    }
    if (password.length < 8){
      setEmail("password must be 8 characters")
      return
    }
    if (email_exists){
      setEmail("user exists")
      return
    }
    Navigation.navigate("onboard", { email: email, password: password, name: name })
  }

  const handleLogin = async() => {
    await postLogin(email, password)
    const user = await getuser()
    if(user.email){
      Navigation.navigate("home")
    }
  }

  if (!loggedIn){ 
    return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.logo}>
          <GraduationCap size={26} color={colors.foreground} strokeWidth={1.8} />
        </View>
        <Text style={s.title}>{mode === 'signup' ? 'Create account' : 'Welcome back'}</Text>
        <Text style={s.sub}>
          {mode === 'signup' ? 'Start studying smarter today.' : 'Sign in to continue.'}
        </Text>
      </View>

      <View style={s.tabs}>
        <Pressable onPress={() => setMode('signup')} style={[s.tab, mode === 'signup' && s.tabActive]}>
          <Text style={[s.tabText, mode === 'signup' && s.tabTextActive]}>Sign up</Text>
        </Pressable>
        <Pressable onPress={() => setMode('login')
        } style={[s.tab, mode === 'login' && s.tabActive]}>
          <Text style={[s.tabText, mode === 'login' && s.tabTextActive]}>Log in</Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, gap: 10 }}>
        {mode === 'signup' && (
          <Field icon={<UserIcon size={16} color={colors.muted} strokeWidth={1.6} />} placeholder="Full name" value={name} onChangeText={setName} />
        )}
        <Field icon={<Mail size={16} color={colors.muted} strokeWidth={1.6} />} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field icon={<Lock size={16} color={colors.muted} strokeWidth={1.6} />} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {/* onld on press was: onDone */}
        <Pressable onPress={mode === 'signup' ? handle_signup_button : handleLogin} style={s.primary}>
          <Text style={s.primaryText}>{mode === 'signup' ? 'Create account' : 'Log in'}</Text>
        </Pressable>
      </View>




      <Text style={s.terms}>By continuing you agree to our Terms.</Text>
    </SafeAreaView>
  );
}
else{
  Navigation.navigate("home")
}
}

function Field(props: any) {
  return (
    <View style={s.field}>
      {props.icon}
      <TextInput
        {...props}
        placeholderTextColor={colors.foreground + '60'}
        style={s.input}
      />
    </View>
  );
}

function GoogleIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.5 12.27c0-.78-.07-1.54-.2-2.27H12v4.3h5.92c-.26 1.37-1.04 2.53-2.22 3.31v2.75h3.59c2.1-1.94 3.31-4.79 3.31-8.09z" />
      <Path fill="#34A853" d="M12 23c3 0 5.51-1 7.35-2.69l-3.59-2.75c-.99.66-2.26 1.06-3.76 1.06-2.89 0-5.34-1.95-6.21-4.57H2.07v2.84A11 11 0 0 0 12 23z" />
      <Path fill="#FBBC05" d="M5.79 14.05A6.6 6.6 0 0 1 5.43 12c0-.71.13-1.4.36-2.05V7.11H2.07A11 11 0 0 0 1 12c0 1.78.43 3.46 1.07 4.89l3.72-2.84z" />
      <Path fill="#EA4335" d="M12 5.38c1.63 0 3.09.56 4.24 1.66l3.18-3.18C17.5 2.09 14.99 1 12 1A11 11 0 0 0 2.07 7.11l3.72 2.84C6.66 7.33 9.11 5.38 12 5.38z" />
    </Svg>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 24 },
  logo: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.lavenderSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.foreground, marginTop: 16, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: colors.muted, marginTop: 4 },
  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginTop: 20, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.secondary, alignItems: 'center' },
  tabActive: { backgroundColor: colors.foreground },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.muted },
  tabTextActive: { color: colors.background },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.pill, gap: 8 },
  input: { flex: 1, fontSize: 13, color: colors.foreground, padding: 0 },
  primary: { backgroundColor: colors.foreground, paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center', marginTop: 6 },
  primaryText: { color: colors.background, fontSize: 14, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { fontSize: 10, color: colors.muted, letterSpacing: 1.5 },
  google: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, borderRadius: radius.pill, backgroundColor: colors.card },
  googleText: { fontSize: 14, fontWeight: '600', color: colors.foreground },
  terms: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 'auto', paddingVertical: 16 },
});
