import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { ChevronLeft, Bookmark, Check } from 'lucide-react-native';
import { colors, radius } from '../theme';
import { BottomNav } from '../components/BottomNav';
import {getuser } from "../controller/oauth"
import {getCources} from "../controller/cources"
import {getQuiz, FinisQuiz, getQuizResult} from "../controller/quiz"
import { Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {LoadingSpinner} from "./loading"
import { useCalendarEvents } from '../data/CalendarContext';


const choices = [
  { id: 'a', label: 'A linked list' },
  { id: 'b', label: 'A binary tree' },
  { id: 'c', label: 'A hash table', correct: true },
  { id: 'd', label: 'A stack' },
];

export function QuizScreen() {
  const { refreshEvents } = useCalendarEvents();

  const [selected, setSelected] = useState<string | null>(null);
  const [currentCources, setCurrentCources] = useState<string[]>(["comp1100", "Maths10"])  
  const [quesionNumber, setQuestionNumber] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [answer, setAnswer] = useState("") 
  const [subject, setSubject] = useState("")
  const [quizStarted, setQuizStarted] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false)
  const [quizWhole, setQuizWhole] = useState({})
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [lockedAnswer, setLockedAnswer] = useState<string | null>(null);
  const [evalScreen, setEvalScreen] = useState(false)
  const [score, setScore] = useState(0)
  const [summary, setSummary] = useState("")
  const [resultId, setResultId] = useState<number | null>(null)
  const [summaryReady, setSummaryReady] = useState(false)
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const Nav = useNavigation()




  useEffect(() => {
    const retreieveCources = async () => {
      try{
        setLoading(true)
        const data = await getCources()
        setCoursesData(data);  // store full objects
        const courseArray = []
        for(let i=0; i < data.length; i++){
          courseArray.push(data[i].Course_code ? data[i].Course_code : data[i].Course_name)
        }
        setCurrentCources(courseArray)
      }catch(e){
        throw e
      } finally{
        setLoading(false)
      }
    }
    retreieveCources()
  }, [])

  const onHome = () => {
    Nav.navigate("home")          
  }

  const handleSelectAnswer = (choice) => {
    if (lockedAnswer) return;
    setSelected(choice.id);
    setLockedAnswer(choice.id);

    setAnswers(prev => ({
      ...prev,
      [`question_${quesionNumber}`]: {
        question: currentQuestion,
        userAnswer: choice.label,
        correctAnswer: answer,
        correct: choice.correct,
      }
    }));
  };

  const getQuestions = async () => {
    try {
      console.log(selectedCourse)
      setLoading(true)
      const startdate = coursesData.find(c => c.Course_code === selectedCourse)?.start_date
      const quizfetch = await getQuiz(selectedCourse, startdate)
      console.log(quizfetch)

      const apiOutput = "```json\n{\n  \"quiz\": {\n    \"question_1\": {\n      \"question\": \"Evaluate the limit: lim (x->0) (sin(3x) / x)\",\n      \"answer_1\": \"0\",\n      \"answer_2\": \"1\",\n      \"answer_3\": \"3\",\n      \"answer_4\": \"The limit does not exist\",\n      \"correct_answer\": \"3\",\n      \"subject\": \"Limits and Continuity\"\n    },\n    \"question_2\": {\n      \"question\": \"Find the derivative of f(x) = ln(x^2 + 4) with respect to x.\",\n      \"answer_1\": \"1 / (x^2 + 4)\",\n      \"answer_2\": \"2x / (x^2 + 4)\",\n      \"answer_3\": \"ln(2x)\",\n      \"answer_4\": \"x / (x^2 + 4)\",\n      \"correct_answer\": \"2x / (x^2 + 4)\",\n      \"subject\": \"Differentiation (Chain Rule)\"\n    },\n    \"question_3\": {\n      \"question\": \"A 13-meter ladder is leaning against a wall. The bottom of the ladder is pulled away from the wall at a rate of 0.5 m/s. How fast is the top of the ladder sliding down the wall when the base is 5 meters from the wall?\",\n      \"answer_1\": \"-0.25 m/s\",\n      \"answer_2\": \"-0.5 m/s\",\n      \"answer_3\": \"-5/12 m/s\",\n      \"answer_4\": \"-13/10 m/s\",\n      \"correct_answer\": \"-5/12 m/s\",\n      \"subject\": \"Applications of Differentiation (Related Rates)\"\n    },\n    \"question_4\": {\n      \"question\": \"Evaluate the definite integral: ∫ from 0 to π/4 of sec^2(x) dx.\",\n      \"answer_1\": \"0\",\n      \"answer_2\": \"1\",\n      \"answer_3\": \"√2\",\n      \"answer_4\": \"π/4\",\n      \"correct_answer\": \"1\",\n      \"subject\": \"Definite Integrals\"\n    },\n    \"question_5\": {\n      \"question\": \"Evaluate the indefinite integral: ∫ x cos(x) dx.\",\n      \"answer_1\": \"x sin(x) + cos(x) + C\",\n      \"answer_2\": \"x sin(x) - cos(x) + C\",\n      \"answer_3\": \"-x sin(x) + cos(x) + C\",\n      \"answer_4\": \"x^2/2 sin(x) + C\",\n      \"correct_answer\": \"x sin(x) + cos(x) + C\",\n      \"subject\": \"Techniques of Integration (Integration by Parts)\"\n    },\n    \"question_6\": {\n      \"question\": \"Find the area of the region bounded by the curves y = x^2 and y = 2x.\",\n      \"answer_1\": \"4/3\",\n      \"answer_2\": \"2/3\",\n      \"answer_3\": \"8/3\",\n      \"answer_4\": \"1/3\",\n      \"correct_answer\": \"4/3\",\n      \"subject\": \"Applications of Integration (Area Between Curves)\"\n    },\n    \"question_7\": {\n      \"question\": \"What is the sum of the infinite geometric series: 3 + 3/2 + 3/4 + 3/8 + ...?\",\n      \"answer_1\": \"3\",\n      \"answer_2\": \"6\",\n      \"answer_3\": \"9\",\n      \"answer_4\": \"The series diverges\",\n      \"correct_answer\": \"6\",\n      \"subject\": \"Sequences and Series (Geometric Series)\"\n    }\n  }\n}\n```"      
      const cleanJsonText = apiOutput.replace(/^```json\s*|```\s*$/g, "").trim();
      const backup = JSON.parse(cleanJsonText);

      let quiz = backup
      if (quizfetch) {
        try {
          const clean = quizfetch.replace(/^```json\s*|```\s*$/g, "").trim();
          quiz = JSON.parse(clean)
        } catch {
          quiz = backup
        }
      }

      // start quiz directly with the data, don't rely on state
      const q = quiz.quiz['question_1']
      setQuizWhole(quiz)
      setQuestionNumber(1)
      setCurrentQuestion(q.question)
      setOptionA(q.answer_1)
      setOptionB(q.answer_2)
      setOptionC(q.answer_3)
      setOptionD(q.answer_4)
      setAnswer(q.correct_answer)
      setSubject(q.subject)
      setQuizStarted(true)
    } catch (e) {
      throw e
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = (b) => {
    const nextNumber = quesionNumber + b;
    setQuestionNumber(nextNumber);

    const q = quizWhole.quiz[`question_${nextNumber}`];
    setCurrentQuestion(q.question);
    setOptionA(q.answer_1);
    setOptionB(q.answer_2);
    setOptionC(q.answer_3);
    setOptionD(q.answer_4);
    setAnswer(q.correct_answer);
    setSubject(q.subject);

    // Restore using the object key
    const previousAnswer = answers[`question_${nextNumber}`];
    if (previousAnswer) {
      const choiceIds = ['a', 'b', 'c', 'd'];
      const options = [q.answer_1, q.answer_2, q.answer_3, q.answer_4];
      const restoredId = choiceIds[options.indexOf(previousAnswer.userAnswer)];
      setSelected(restoredId);
      setLockedAnswer(restoredId);
    } else {
      setSelected(null);
      setLockedAnswer(null);
    }
    console.log(answers)
  };

  

  const handleStartQuiz = () => {
    const nextNumber = 1;
    setQuestionNumber(nextNumber);

    const q = quizWhole.quiz[`question_${nextNumber}`];
    setCurrentQuestion(q.question);
    setOptionA(q.answer_1);
    setOptionB(q.answer_2);
    setOptionC(q.answer_3);
    setOptionD(q.answer_4);
    setAnswer(q.correct_answer);
    setSubject(q.subject);
    setQuizStarted(true);
    console.log(quizWhole)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      // evaluate returns immediately with { score, result_id }
      const response = await FinisQuiz(answers, selectedCourse)
      setScore(response.score)
      setResultId(response.result_id)
      setEvalScreen(true)
      // Refresh events so priority changes show immediately
      await refreshEvents()
      // Start polling for the AI summary in the background
      pollForSummary(response.result_id)
    } catch(e) {
      console.error("Submit error:", e)
    } finally {
      setLoading(false)
    }
  }

  const pollForSummary = async (id: number) => {
    // Poll every 3 seconds until summary is ready (max 10 attempts = 30s)
    for (let i = 0; i < 10; i++) {
      await new Promise(res => setTimeout(res, 3000))
      try {
        const result = await getQuizResult(id)
        if (result.ready) {
          setSummary(result.summary)
          setSummaryReady(true)
          return
        }
      } catch (e) {
        console.error("Poll error:", e)
      }
    }
    // Timed out
    setSummary("Summary took too long to generate. Check your weak areas and keep practising!")
    setSummaryReady(true)
  }




  if (loading) {
      return <LoadingSpinner />;
    }

 if (evalScreen) {
    const pct = Math.round((score / 7) * 100);
    const grade =
      score >= 6 ? { emoji: '🏆', label: 'Outstanding' } :
      score >= 5 ? { emoji: '⭐', label: 'Great work' } :
      score >= 3 ? { emoji: '👍', label: 'Good effort' } :
                   { emoji: '📖', label: 'Keep studying' };
 
    return (
      <SafeAreaView style={s.safe}>
        <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 }}>
          <Text style={s.headerTitle}>QUIZ · RESULTS</Text>
        </View>
 
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, gap: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Score circle */}
          <View style={s.circleWrap}>
            <View style={s.circle}>
              <Text style={s.scoreNum}>{score}</Text>
              <Text style={s.scoreOf}>/7</Text>
            </View>
            <Text style={s.gradeEmoji}>{grade.emoji}</Text>
            <Text style={s.gradeLabel}>{grade.label}</Text>
            <Text style={s.pctText}>{pct}% correct</Text>
          </View>
 
          {/* Progress bars */}
          <View style={{ flexDirection: 'row', gap: 6, width: '100%' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={[s.bar, { backgroundColor: i < score ? colors.mint : colors.secondary }]} />
            ))}
          </View>
 
          {/* AI Summary card */}
          <View style={s.qCard}>
            <View style={s.qTag}><Text style={s.qTagText}>AI SUMMARY</Text></View>
            <Text style={[s.qText, { fontSize: 14, fontWeight: '500', lineHeight: 22 }]}>
              {summaryReady ? summary : '✨ Generating your personalised summary…'}
            </Text>
          </View>
        </ScrollView>
 
        <View style={{ paddingHorizontal: 20, paddingBottom: 90, paddingTop: 12 }}>
          <Pressable style={s.next} onPress={onHome}>
            <Text style={s.nextText}>Home</Text>
          </Pressable>
        </View>
 
        <BottomNav active="quiz" />
      </SafeAreaView>
    );
  }

  if (quizStarted){
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Pressable style={s.iconBtn} onPress={() => quesionNumber > 1 ? handleNextQuestion(-1) : null}><ChevronLeft size={16} color={colors.foreground + '99'} strokeWidth={1.8} /></Pressable>
          <Text style={s.headerTitle}>{selectedCourse} · Quiz</Text>
          <Text></Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={s.qLabel}>Question {quesionNumber}/7</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
            <View key={i} style={[s.bar, { backgroundColor: i < quesionNumber ? colors.mint : colors.secondary }]} />
          ))}
          </View>
        </View>

        <View style={s.qCard}>
          <View style={s.qTag}><Text style={s.qTagText}>{subject}</Text></View>
          <Text style={s.qText}>{currentQuestion}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 20, gap: 10 }} style={{ flex: 1 }}>
          {[
            {id:'a', label: optionA, correct: optionA === answer},
            {id:'b', label: optionB, correct: optionB === answer},
            {id:'c', label: optionC, correct: optionC === answer},
            {id:'d', label: optionD, correct: optionD === answer},
          ].map((c) => {
            const isSelected = selected === c.id;
            const isWrong = isSelected && !c.correct;
            const showCorrect = !!lockedAnswer && c.correct; // green after any lock
        return (
              <Pressable
                key={c.id}
                onPress={() => handleSelectAnswer(c)}
                disabled={!!lockedAnswer}
                style={[s.choice,
                  showCorrect ? { backgroundColor: colors.mint, borderColor: 'transparent' } :
                  isWrong     ? { backgroundColor: '#FFD6D6', borderColor: '#E85555' } :
                                { backgroundColor: colors.card, borderColor: colors.border }
                ]}
              >
                <View style={[s.bullet,
                  showCorrect && { backgroundColor: colors.background },
                  isWrong     && { backgroundColor: '#E85555' },
                ]}>
                  {showCorrect ? <Check size={14} color={colors.foreground} strokeWidth={3} /> :
                  isWrong     ? <Text style={[s.bulletText, { color: '#fff' }]}>{c.id.toUpperCase()}</Text> :
                                <Text style={s.bulletText}>{c.id.toUpperCase()}</Text>}
                </View>
                <Text style={s.choiceText}>{c.label}</Text>
                {showCorrect && <View style={s.correctTag}><Text style={s.correctText}>Correct!</Text></View>}
                {isWrong     && <View style={[s.correctTag, { backgroundColor: '#E8555599' }]}><Text style={[s.correctText, { color: '#fff' }]}>Wrong</Text></View>}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, paddingBottom: 90, paddingTop: 12 }}>
          <Pressable onPress={() => quesionNumber < 7 ? handleNextQuestion(1) : handleSubmit()} style={s.next}>
            <Text style={s.nextText}>{quesionNumber === 7 ? "Submit Quiz" : "Next question"}</Text>
          </Pressable>
        </View>

        <BottomNav active="quiz" />
      </SafeAreaView>
    );} else {
  return (
    <SafeAreaView style={s.safe}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>QUIZ</Text>
      </View>

      {/* ── Title ── */}
      <View style={{ paddingHorizontal: 24, marginTop: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.mint, letterSpacing: 1.5, marginBottom: 6 }}>
          READY TO STUDY?
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.foreground, lineHeight: 32, letterSpacing: -0.5 }}>
          Pick a{'\n'}subject
        </Text>
      </View>

      {/* ── Course List ── */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 20 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {currentCources.map((course, i) => {
          const accents = [
            { bg: '#C8F0E0', dot: '#34C789' },
            { bg: '#DDD6F3', dot: '#8B72E8' },
            { bg: '#FFE4CC', dot: '#F5924E' },
            { bg: '#CCE9FF', dot: '#3B9EE8' },
            { bg: '#FFD6D6', dot: '#E85555' },
            { bg: '#FFEFC8', dot: '#D4A017' },
          ];
          const accent = accents[i % accents.length];
          const isActive = selectedCourse === course;
          return (
            <Pressable
              key={course}
              onPress={() => setSelectedCourse(course)}
              style={{
                width: '100%',
                borderRadius: 20,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: isActive ? accent.bg : colors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Color dot */}
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: isActive ? accent.dot : colors.secondary,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 16 }}>📖</Text>
              </View>

              {/* Course name */}
              <Text style={{
                flex: 1, fontSize: 14, fontWeight: '700',
                color: isActive ? '#1A1A2E' : colors.foreground,
              }}>
                {course}
              </Text>

              {/* Check indicator */}
              {isActive && (
                <View style={{
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: accent.dot,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 12, color: '#fff', fontWeight: '800' }}>✓</Text>
                </View>
              )}
            </Pressable>
          );
        })}

        {/* ── Start Quiz Button ── */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
        <Pressable
          style={[s.next, !selectedCourse && { opacity: 0.4 }]}
          disabled={!selectedCourse}
          onPress={() => getQuestions()}
        >
          <Text style={s.nextText}>Start Quiz</Text>
        </Pressable>
      </View>
      </ScrollView>

      

      <BottomNav active="quiz" />
    </SafeAreaView>
  );
}
      }


const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 12, fontWeight: '700', color: colors.muted },
  qLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  qCard: { backgroundColor: colors.lavenderSoft, padding: 20, borderRadius: 24, marginHorizontal: 20, marginTop: 20 },
  qTag: { alignSelf: 'flex-start', backgroundColor: colors.background + 'B3', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  qTagText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  qText: { fontSize: 17, fontWeight: '700', color: colors.foreground, marginTop: 12, lineHeight: 22, letterSpacing: -0.3 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, borderWidth: 2 },
  bullet: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
  bulletText: { fontSize: 12, fontWeight: '700', color: colors.muted },
  choiceText: { fontSize: 14, fontWeight: '600', color: colors.foreground, flex: 1 },
  correctTag: { backgroundColor: colors.background + '99', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  correctText: { fontSize: 10, fontWeight: '700', color: colors.foreground },
  next: { backgroundColor: colors.foreground, paddingVertical: 16, borderRadius: radius.pill, alignItems: 'center' },
  nextText: { color: colors.background, fontSize: 14, fontWeight: '700' },
  // Results screen
  circleWrap: { alignItems: 'center', gap: 8 },
  circle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: colors.lavenderSoft,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  scoreNum: { fontSize: 56, fontWeight: '800', color: colors.foreground, letterSpacing: -2 },
  scoreOf: { fontSize: 22, fontWeight: '600', color: colors.muted },
  gradeEmoji: { fontSize: 28, marginTop: 4 },
  gradeLabel: { fontSize: 18, fontWeight: '800', color: colors.foreground, letterSpacing: -0.4 },
  pctText: { fontSize: 12, fontWeight: '600', color: colors.muted },
});