Made as group project for COMP1100 at the University of quensland. 

Demo Video https://youtu.be/aeyixTRWKwU

## Hypotheses (Updated)

**Current accepted hypothesis:**
UQ students struggle to manage and plan their study effectively. They would benefit from a smart, low-friction study task manager that automatically prioritises tasks, splits assignments into smaller steps, and tests their understanding through pop quizzes to give personalised study recommendations.

**Old hypothesis (Rejected):**
Some UQ students have no idea if their electives or study plan will correlate to their dream career.

**Refuted hypothesis (Iteration 2):**
Students would want to track their study hours to visualise their progress. This was overwhelmingly rejected — only ~4 of 25+ students expressed interest. Most found tracking anxiety-inducing or a waste of time.

---

## Customer Segments
> Groups of possible customers that we would target our app to:

1. UQ undergraduate students who already use a personal calendar for their day-to-day life but want a separate dedicated study task manager
2. Students who procrastinate or struggle to prioritise tasks when facing multiple deadlines
3. Students who are anxious not just about how long they study, but whether they actually understand their content
4. Students who have tried planning tools before (Notion, Google Calendar, Microsoft To Do) but abandoned them due to setup friction or maintenance effort

**Edge case / minority segment (not MVP focus):**
Students who actively want to track their study hours and progress in detail — only ~4 of 25+ interviewees expressed this preference.

---

## Value Propositions
> The unique value our app model will help with their problems:

1. **Smart To-Do Planner** — A study-specific task manager that sits alongside a student's existing personal calendar rather than replacing it. Students already use Google Calendar or Apple Calendar for their personal life; they want a separate space just for study tasks.
2. **Automatic Priority Ranking** — Tasks are automatically ranked by deadline proximity and estimated difficulty, removing the burden of deciding what to work on first.
3. **Automatic Task Splitting** — Large assignments are automatically broken into manageable daily goals based on the deadline, without requiring the student to define the steps themselves.
4. **Pop Quiz / Comprehension Checking** — Short quizzes test understanding of course content and feed the recommendation algorithm, replacing the need for manual data entry. Preferred cadence: every few days to once a week, not daily.
5. **Frictionless Onboarding** — Setup takes under 2 minutes and a personalised study plan is shown immediately, so students see value on first use.

**Accepted hypotheses linked to value propositions:**
- ✅ H-IT2-A: Students prefer a to-do list over a study-specific calendar (Accepted)
- ✅ H-IT2-B: Students are willing to do pop quizzes to feed recommendations (Accepted)
- ✅ H-IT2-E: Students want automatic priority ranking and task splitting (Accepted)
- ✅ H-IT2-F: Frictionless setup and low-effort UX is non-negotiable for adoption (Accepted)
- ⚠️ H-IT2-C: Students would manually enter confidence/time data (Partially Accepted — quiz preferred over manual input)
- ❌ H-IT2-D: Students want to track study hours (Rejected)

---

## Channels *(New — Iteration 2)*
> Possible media that we could use to promote our product and raise future customer awareness:

1. **Social Media** : Instagram and TikTok targeting the student demographic
2. **UQ Student Communities** : UQ Facebook groups, Discord servers, and student society channels
3. **App Stores** : iOS App Store and Google Play Store organic search
4. **Word of Mouth** : Peer referrals within cohorts and tutorial groups

---

## Customer Relationships *(New — Iteration 2)*
> The type of relationship we want to establish with our customers:

1. **Self-Service** : We provide the space for students to plan and manage their own study independently
2. **Automated Service** : After initial setup, the app works automatically: it schedules study sessions, sends reminders ahead of deadlines, ranks tasks, and adjusts recommendations based on quiz results
3. **Quiz-Driven Feedback Loop** : Comprehension quizzes allow the app to continuously improve its recommendations without requiring ongoing manual input from the user

---

## Key Partners
> Who helps us deliver our product:

1. UQ (potential course and deadline data / Blackboard API access)
2. App Stores — iOS and Android distribution platforms
3. Third-party advertisers (revenue stream)
4. Study-aid platforms for potential integration (e.g. Quizlet, Notion)

---

## Key Activities
> What we must do to deliver value:

1. Build and maintain the task prioritisation algorithm (deadline + difficulty weighting)
2. Develop the pop-quiz and comprehension checking module
3. Design a frictionless onboarding flow (under 2 minutes to first personalised plan)
4. Build automatic task-splitting engine
5. Ongoing prototype testing and interviews with UQ students

---

## Key Resources
> What we need to operate:

1. Prioritisation and quiz algorithm
2. Mobile and web app infrastructure
3. UQ student interview and testing pipeline
4. Course deadline data source (manual input or LMS integration)

---

## Revenue Streams
> Sources of income:

1. **Freemium subscription** — core features free, premium features behind a subscription
2. **Third-party advertising** — ads served within the free tier

---

## Cost Structure
> What it costs to build and operate:

1. App development and hosting infrastructure
2. Algorithm research and development (priority engine + quiz module)
3. Marketing and social media content creation
4. Ongoing app maintenance and support

---

## Accepted and Refuted Hypotheses Summary

---

### ✅ H-IT2-A — Students prefer a to-do list over a study-specific calendar (Accepted)

Students already use a general calendar (Google, Apple) for their personal life and do not want to merge study tasks into it. They want a separate, dedicated study to-do manager.

**Evidence — Iteration 2 interviews:**

- "I like to-do lists. I'm a list person and I kind of update that daily." — Amy, 2nd yr Science/Arts (CameronTaylor_20260415_2)
- "A to-do list. [...] That would be good." — Postgrad participant (CameronTaylor_20260422_2)
- "I usually use my phone. There's something really satisfying about ticking off a box when I finish a chapter." — Participant (XinnuoLi_2026_04_15_1)
- "Yeah, daily plans. I will make a list on my phone and write the most important thing and the second most important thing, like a to-do list." — Participant (XinnuoLi_2026_04_22_3)
- "I use notes on my phone." — Participant (XinnuoLi_2026_04_22_2)
- "I don't really make weekly plans. But when I have assessments, I plan when to start working on them." — Participant (XinnuoLi_2026_04_22_2)
- Kenny's interview notes (your own): both interviewees confirmed preference for to-do over calendar; most already use a personal calendar for life admin and don't want to mix study tasks in.

**Evidence — Iteration 1 interviews:**

- "I plan my weeks on a physical to-do list on a piece of paper. [...] I find breaking down my tasks in the to-do list useful. When I can check off little tasks, it makes me feel like I've been productive." — 5th yr Arts (CameronTaylor_20260325_1)
- "I usually check my deadlines first, then make a simple to-do list." — Serena (XinnuoLi_2026_03_25_1)
- "I usually plan my study around deadlines. I use a digital calendar or a simple to-do list to map out the big tasks for the week." — Jay (XinnuoLi_2026_03_25_2)
- "I prefer handwritten [...] in one spot. I can keep track of things better." — 2nd yr Arts (CameronTaylor_20260325_2)
- "I use a simple to-do list and check my course deadlines weekly." — Chace (XinnuoLi_2026_03_25_3)
- "Every morning or the night before, I jot down a to-do list of the subjects I need to cover. I prefer physical paper because there's something really satisfying about physically crossing a task off." — Alex (XinnuoLi_2026_03_25_4)

---

### ✅ H-IT2-B — Students are willing to do pop quizzes every few days to feed recommendations (Accepted)

Students are excited about the idea of a pop quiz to test their understanding and get better study recommendations. They prefer this over entering data manually. Preferred frequency: every few days to once a week, not daily.

**Evidence — Iteration 2 interviews:**

- "Would you be willing if it gave you like a pop quiz based on all your subjects and then tried to find weak points? Yeah, that would be good." — Year 2 Notion user (CameronTaylor_20260422_1)
- "The quiz would be a good thing to have where it knows where I need help and how long I might need help on that for." — Same participant (CameronTaylor_20260422_1)
- "Not every day. Every two or three days? Yeah." — Postgrad participant on quiz frequency (CameronTaylor_20260422_2)
- "Would it be interesting if the app gives you a pop quiz at the end of subject? Probably, yeah." — Rafly (RogelioKennyArisandi_2026_04_29_3)
- Kenny's interview notes (your own): both interviewees expressed interest; quizzes generated more excitement than manual data entry.

**Evidence — Iteration 1 interviews:**

- "I use AI to give me some questions and test and test me. Like, I asked it to help me better understand and ask them if I have already understood based on my progress." — Meera (RogelioKennyArisandi_26_03_2026_4)
- "I try to explain it in my own words or do some practice questions to check my understanding." — Serena (XinnuoLi_2026_03_25_1)
- "I usually do a 'brain dump' — I take a blank piece of paper and write down everything I remember from the last hour without looking at my notes." — Participant (XinnuoLi_2026_04_15_1)
- "I know I'm done when I can explain the core concepts to someone else without looking at my notes." — Jay (XinnuoLi_2026_03_25_2)
- "I use a simpler version of the Feynman Technique. I try to explain the concept out loud [...] If I can explain a complex biology process in simple terms without checking my notes, then I know I've actually understood it." — Alex (XinnuoLi_2026_03_25_4)

---

### ✅ H-IT2-E — Students want automatic priority ranking and task splitting (Accepted)

Students default to working on whatever is due soonest without considering difficulty or time required. They want an app to handle prioritisation automatically, but with the ability to override it.

**Evidence — Iteration 2 interviews:**

- "I hope it can automatically arrange the priorities for the things I need to do first." — Participant (XinnuoLi_2026_04_22_3)
- "I usually start with the easiest tasks, because it motivates me. After that, I move on to more difficult assignments." — 3rd yr Psych/Econ (XinnuoLi_2026_04_22_1)
- "I would like it to link to apps like Blackboard and automatically schedule all of my assessments." — Participant (XinnuoLi_2026_04_14_1)
- "I go by highest priority first, usually the deadline, but also I sort it out by how heavy the task is." — Ray (RogelioKennyArisandi_2026_04_29_2)
- "I do that a lot. I like to separate heavy assignments into different phases so I can finish small parts one by one." — Ray on task splitting (RogelioKennyArisandi_2026_04_29_2)
- "I don't really think about [priority] [...] if they all fall on the same day, it just depends on what I want to do first." — Deborah (RogelioKennyArisandi_2026_04_29_1)
- "Would you find it useful if it gave you reminders like four weeks out? [...] Yeah, I can see how that'd be helpful." — Year 2 Notion user (CameronTaylor_20260422_1)

**Evidence — Iteration 1 interviews:**

- "I prioritise difficulty — anything more difficult and taking longer, I do that first." — 4th yr Law/Science (CameronTaylor_20260326_1)
- "I focus on the assignment I don't understand as much, even if that deadline is still further away." — Meera (RogelioKennyArisandi_26_03_2026_4)
- "I usually [...] break things up, try to plan in advance. But yeah, it often comes down to just one task at a time." — 3rd yr International Studies (CameronTaylor_20260415_3)
- "I will try to finish the one that has an earlier deadline first, but if one assignment has bigger marks, I will do that first." — Shafa (RogelioKennyArisandi_26_03_2026_3)
- "I look at two things: the deadline and the effort required. I usually knock out the quickest, easiest tasks first to build some momentum." — Jay (XinnuoLi_2026_03_25_2)
- "I start with urgent and difficult tasks first." — Chace (XinnuoLi_2026_03_25_3)
- "Yes, especially if it can organize deadlines and break tasks into steps." — Chace on wanting an app (XinnuoLi_2026_03_25_3)
- "If there was an app that could automatically break down a big project into daily mini-tasks based on deadlines, that would be amazing." — Alex (XinnuoLi_2026_03_25_4)

---

### ✅ H-IT2-F — Frictionless setup and low-effort UX is non-negotiable (Accepted)

Students who tried tools before (Notion, Forest, Microsoft To Do) abandoned them when the setup or ongoing maintenance felt like too much effort. The app must show value on first use.

**Evidence — Iteration 2 interviews:**

- "Notion was too complicated for me to understand. You have to actually make your own and stuff. [...] The simpler, the better." — Deborah (RogelioKennyArisandi_2026_04_29_1)
- "Something I hate when apps have paid subscriptions or like extra stuff that they make you do. That's not helpful." — 1st yr Journalism/Arts (CameronTaylor_20260415_1)
- "I prefer simple app because the track progress thing, I can do it my own." — Ray (RogelioKennyArisandi_2026_04_29_2)
- "If it can replace multiple apps, I would definitely use it. I'd probably pay around $5–$10 a month." — Participant (XinnuoLi_2026_04_15_1)
- "If it's not too expensive. For example, around $10 would be okay." — Participant (XinnuoLi_2026_04_14_1)

**Evidence — Iteration 1 interviews:**

- "I forgot I set [Notion] up and didn't touch it again." — 2nd yr Arts (CameronTaylor_20260325_2)
- "I stopped [Forest app] at the end of last year after exams and haven't gotten back into studying habits." — 1st yr Engineering (CameronTaylor_20260415_4)
- "I tried Notion, but I stopped using it because it took too much time to maintain." — Chace (XinnuoLi_2026_03_25_3)
- "I sometimes stop when the maintenance becomes too much. If I spend more time organising the app than actually studying, it feels counterproductive." — Jay (XinnuoLi_2026_03_25_2)
- "I think they can be helpful if they are simple and not too complicated." — Serena (XinnuoLi_2026_03_25_1)
- "It would need to be automated and simple. If it could sync with my course syllabus and send me smart reminders based on my actual progress, that would be a game-changer." — Jay (XinnuoLi_2026_03_25_2)

---

### ⚠️ H-IT2-C — Students would manually enter confidence level or time spent (Partially Accepted)

Some willingness exists but pop quizzes are consistently preferred. Manual input is only acceptable if it is extremely frictionless. Tracking hours specifically was rejected by the majority.

**Evidence — Iteration 2 interviews:**

- "I feel like it'd be a good option to have if you did want to add that information, but if you had the option to use it without [having to], that would be helpful." — Year 2 Notion user (CameronTaylor_20260422_1)
- "It's fine, I guess. Kind of useful — if you miss something you can really readjust it." — Rafly on app using behaviour data (RogelioKennyArisandi_2026_04_29_3)
- "I don't really like [how Notion was set out]. I'd probably like it more visually — the task and then underneath that, maybe little dots." — Amy on wanting simple but functional UX (CameronTaylor_20260415_2)

**Evidence — Iteration 1 interviews:**

- "Not really. I care more about finishing tasks, because I don't think time always shows how efficient I am." — Serena on not tracking time (XinnuoLi_2026_03_25_1)
- "I just do it until I'm bored or tired." — Raja on not tracking hours (RogelioKennyArisandi_24_03_2026_1)
- "I would just kind of go sit at a library for a period of time and try to get as much work done as I can." — 1st yr Engineering (CameronTaylor_20260415_4)
- "I kind of track the time that I study. If I feel like I've already studied up to 4 or 5 hours per day, I tend to ease up." — Fayza, one of the minority who tracked (RogelioKennyArisandi_24_03_2026_2)

---

### ❌ H-IT2-D — Students want to track their study hours (Rejected)

Overwhelmingly rejected. Only ~4 of 25+ students expressed interest. Tracking perceived as anxiety-inducing and a waste of time. The one student who wanted full tracking (CameronTaylor_20260422_2) is an acknowledged edge case. Study-hour tracking will not be included in the MVP.

**Evidence — Iteration 2 interviews:**

- "Not really, because it might create more pressure if I can't reach 100%." — Participant on progress bars (XinnuoLi_2026_04_14_1)
- "Which tracks my progress and all that will be really good." — Postgrad outlier, the only one who wanted full tracking (CameronTaylor_20260422_2) — acknowledged minority

**Evidence — Iteration 1 interviews:**

- "Would you ever track [hours]? Probably not." — 4th yr Law/Science (CameronTaylor_20260326_1)
- "I would never track time. It would probably be mortifying how much time I spend studying." — 5th yr Arts (CameronTaylor_20260325_1)
- "I don't track my hours of studying. I just do it until I'm bored or tired." — Raja (RogelioKennyArisandi_24_03_2026_1)
- "I can't really track it." — 2nd yr Arts (CameronTaylor_20260325_2)
- "I focus more on tracking progress rather than just time. I find it more rewarding to see actual results than just counting how many hours I sat at my desk." — Jay (XinnuoLi_2026_03_25_2)
- "I don't really track every single minute with a stopwatch, because that makes me feel too stressed." — Alex (XinnuoLi_2026_03_25_4)
- Kenny's interview notes (your own): only ~4 of 25+ students willing to track; one interested student is an outlier.

---

### ❌ H-OLD — Students have no idea if their electives or study plan correlates to their dream career (Rejected — Original idea)

Rejected in Iteration 1 as the core problem. Pivoted to study planning and time management as the primary focus after interviews showed students were more concerned with managing deadlines and understanding content than with career path alignment.
