'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen, Search, Heart, Brain, Droplet, Wind, Stethoscope,
  Activity, Shield, AlertCircle, AlertTriangle, Info, CheckCircle, FileText,
  TrendingUp, Users, Calendar, Phone
} from 'lucide-react'

// Types
interface HealthTopic {
  id: string
  title: string
  category: string
  readingLevel: 'basic' | 'intermediate' | 'advanced'
  lastReviewed: string
  overview: string
  symptoms: string[]
  causes: string[]
  riskFactors: string[]
  prevention: string[]
  whenToSeekCare: string[]
  commonQuestions: { question: string; answer: string }[]
  relatedTopics: string[]
}

// Medical Knowledge Base
const KNOWLEDGE_BASE: HealthTopic[] = [
  {
    id: 'heart-disease',
    title: 'Heart Disease (Cardiovascular Disease)',
    category: 'Cardiovascular',
    readingLevel: 'basic',
    lastReviewed: '2024-01',
    overview: 'Heart disease, or cardiovascular disease (CVD), is a group of conditions that affect the heart and blood vessels. It is the leading cause of death in the United States. The most common type is coronary artery disease (CAD), which can lead to heart attacks. Understanding your risk factors and taking preventive measures can significantly reduce your chances of developing heart disease.',
    symptoms: [
      'Chest pain or discomfort (angina)',
      'Shortness of breath',
      'Pain in neck, jaw, throat, or back',
      'Pain in upper abdomen or arms',
      'Fatigue',
      'Lightheadedness or dizziness',
      'Rapid or irregular heartbeat (palpitations)',
      'Swelling in legs, ankles, or feet'
    ],
    causes: [
      'Atherosclerosis (buildup of plaque in arteries)',
      'High blood pressure damaging arteries over time',
      'High cholesterol contributing to plaque formation',
      'Diabetes damaging blood vessels',
      'Smoking causing arterial damage',
      'Inflammation of blood vessels'
    ],
    riskFactors: [
      'Age (men ≥45, women ≥55)',
      'Family history of heart disease',
      'High blood pressure (>130/80 mmHg)',
      'High LDL cholesterol (>100 mg/dL)',
      'Low HDL cholesterol (<40 mg/dL men, <50 mg/dL women)',
      'Smoking or tobacco use',
      'Diabetes or prediabetes',
      'Obesity (BMI ≥30)',
      'Physical inactivity',
      'Unhealthy diet high in saturated fats',
      'Chronic stress',
      'Excessive alcohol consumption'
    ],
    prevention: [
      'Don\'t smoke or use tobacco products',
      'Exercise 150 minutes per week (brisk walking, cycling)',
      'Eat a heart-healthy diet (fruits, vegetables, whole grains, lean proteins)',
      'Maintain healthy weight (BMI 18.5-24.9)',
      'Control blood pressure (<130/80 mmHg)',
      'Manage cholesterol levels',
      'Control diabetes (HbA1c <7%)',
      'Reduce stress through meditation, yoga, or hobbies',
      'Limit alcohol (≤1 drink/day for women, ≤2 drinks/day for men)',
      'Get 7-9 hours of quality sleep',
      'Regular health screenings and checkups'
    ],
    whenToSeekCare: [
      'Chest pain or pressure (call 911 immediately)',
      'Severe shortness of breath',
      'Pain radiating to arm, jaw, or back',
      'Sudden weakness or numbness',
      'Loss of consciousness or severe dizziness',
      'Rapid or irregular heartbeat with chest discomfort'
    ],
    commonQuestions: [
      {
        question: 'What is the difference between a heart attack and cardiac arrest?',
        answer: 'A heart attack occurs when blood flow to part of the heart is blocked, usually by a blood clot. The heart keeps beating but is damaged. Cardiac arrest is when the heart suddenly stops beating due to an electrical problem. A heart attack can lead to cardiac arrest, but they are different conditions requiring different emergency responses.'
      },
      {
        question: 'Can heart disease be reversed?',
        answer: 'While heart disease cannot be completely "cured," it can often be managed and its progression slowed or even partially reversed through lifestyle changes, medications, and procedures. Studies show that comprehensive lifestyle changes (diet, exercise, stress management) can reduce plaque buildup in arteries. Early detection and aggressive treatment of risk factors is key.'
      },
      {
        question: 'Should I take aspirin to prevent heart disease?',
        answer: 'Aspirin for primary prevention (if you haven\'t had a heart attack) is no longer universally recommended. Current guidelines suggest discussing aspirin with your doctor based on your individual risk factors. The bleeding risks may outweigh benefits for many people. Aspirin is still recommended for secondary prevention (after a heart attack or stroke).'
      },
      {
        question: 'How often should I get my heart checked?',
        answer: 'Adults should have blood pressure checked at least every 2 years (more often if elevated). Cholesterol screening should start at age 20 and be repeated every 4-6 years, or more frequently if abnormal. If you have risk factors, your doctor may recommend more frequent monitoring, stress tests, or other cardiac evaluations.'
      }
    ],
    relatedTopics: ['High Blood Pressure', 'High Cholesterol', 'Diabetes', 'Stroke']
  },
  {
    id: 'diabetes-overview',
    title: 'Diabetes Mellitus',
    category: 'Endocrine',
    readingLevel: 'basic',
    lastReviewed: '2024-01',
    overview: 'Diabetes is a chronic condition that affects how your body processes blood sugar (glucose). There are two main types: Type 1 (autoimmune, usually diagnosed in childhood) and Type 2 (most common, related to insulin resistance). Without proper management, diabetes can lead to serious complications affecting the heart, kidneys, eyes, and nerves. However, with lifestyle modifications and appropriate treatment, people with diabetes can live long, healthy lives.',
    symptoms: [
      'Increased thirst and frequent urination',
      'Extreme hunger',
      'Unexplained weight loss (Type 1)',
      'Fatigue and weakness',
      'Blurred vision',
      'Slow-healing sores or frequent infections',
      'Tingling or numbness in hands or feet',
      'Dark skin patches (acanthosis nigricans)'
    ],
    causes: [
      'Type 1: Autoimmune destruction of insulin-producing beta cells',
      'Type 2: Insulin resistance combined with inadequate insulin production',
      'Genetic predisposition',
      'Obesity causing insulin resistance',
      'Physical inactivity',
      'Poor diet high in refined carbohydrates and sugars',
      'Age-related decrease in pancreatic function',
      'Gestational factors (diabetes during pregnancy)'
    ],
    riskFactors: [
      'Family history of diabetes',
      'Overweight or obese (BMI ≥25)',
      'Age ≥45 years',
      'Physical inactivity',
      'Prediabetes (fasting glucose 100-125 mg/dL)',
      'History of gestational diabetes',
      'Polycystic ovary syndrome (PCOS)',
      'High blood pressure (≥140/90 mmHg)',
      'Low HDL cholesterol (<35 mg/dL) or high triglycerides (>250 mg/dL)',
      'African American, Hispanic/Latino, Native American, Pacific Islander ancestry',
      'History of heart disease or stroke'
    ],
    prevention: [
      'Maintain healthy weight (lose 7-10% if overweight)',
      'Exercise at least 150 minutes per week',
      'Eat a balanced diet (vegetables, whole grains, lean proteins)',
      'Reduce refined carbohydrates and sugary drinks',
      'Increase dietary fiber (25-30g per day)',
      'Choose healthy fats (olive oil, nuts, avocados)',
      'Limit red and processed meats',
      'Don\'t smoke',
      'Get adequate sleep (7-9 hours)',
      'Regular screening if at risk (fasting glucose, HbA1c)'
    ],
    whenToSeekCare: [
      'Blood sugar >250 mg/dL persistently',
      'Blood sugar <70 mg/dL with confusion or inability to eat',
      'Symptoms of diabetic ketoacidosis (fruity breath, nausea, vomiting)',
      'Extreme thirst or urination',
      'Sudden vision changes',
      'Foot sores that won\'t heal',
      'Symptoms of infection with elevated blood sugar'
    ],
    commonQuestions: [
      {
        question: 'What is the difference between Type 1 and Type 2 diabetes?',
        answer: 'Type 1 diabetes is an autoimmune condition where the body attacks insulin-producing cells, requiring lifelong insulin therapy. It usually starts in childhood or young adulthood. Type 2 diabetes involves insulin resistance and is often related to lifestyle factors. It typically develops in adults and can sometimes be managed with diet, exercise, and oral medications, though some people eventually need insulin.'
      },
      {
        question: 'Can Type 2 diabetes be reversed?',
        answer: 'Type 2 diabetes can potentially be put into remission through significant weight loss (10-15% of body weight), dietary changes, and exercise. Some people can stop medications and maintain normal blood sugar levels. However, this requires ongoing lifestyle maintenance, and diabetes may return if old habits resume. It\'s better to think of it as "remission" rather than "cure."'
      },
      {
        question: 'How often should I check my blood sugar?',
        answer: 'Frequency depends on your treatment plan. Those on insulin may need to check 4+ times daily. Those on oral medications might check 1-2 times daily or several times per week. People managing with diet alone may check less frequently. Your healthcare provider will give you specific guidance. Continuous glucose monitors (CGMs) provide real-time data throughout the day.'
      },
      {
        question: 'What is HbA1c and why is it important?',
        answer: 'HbA1c (glycated hemoglobin) measures your average blood sugar over the past 2-3 months. It\'s reported as a percentage: <5.7% is normal, 5.7-6.4% is prediabetes, and ≥6.5% indicates diabetes. For most people with diabetes, the goal is <7%. HbA1c is more important than daily glucose readings because it shows long-term control and predicts complication risk.'
      }
    ],
    relatedTopics: ['Prediabetes', 'Heart Disease', 'Kidney Disease', 'Eye Health']
  },
  {
    id: 'mental-health-basics',
    title: 'Mental Health & Well-Being',
    category: 'Mental Health',
    readingLevel: 'basic',
    lastReviewed: '2024-01',
    overview: 'Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act. Mental health is important at every stage of life. Mental health conditions like depression and anxiety are common and treatable. Taking care of your mental health is just as important as taking care of your physical health. There should be no stigma in seeking help for mental health concerns.',
    symptoms: [
      'Persistent sad, anxious, or empty mood',
      'Loss of interest in activities once enjoyed',
      'Changes in appetite or weight',
      'Sleep disturbances (insomnia or sleeping too much)',
      'Fatigue or decreased energy',
      'Difficulty concentrating or making decisions',
      'Feelings of worthlessness or excessive guilt',
      'Irritability or restlessness',
      'Physical symptoms (headaches, digestive issues)',
      'Social withdrawal',
      'Thoughts of death or suicide'
    ],
    causes: [
      'Genetic predisposition',
      'Brain chemistry imbalances (neurotransmitters)',
      'Trauma or adverse childhood experiences',
      'Chronic stress',
      'Major life changes or losses',
      'Chronic medical illness',
      'Substance abuse',
      'Social isolation or lack of support',
      'Hormonal changes',
      'Nutritional deficiencies'
    ],
    riskFactors: [
      'Family history of mental illness',
      'Previous mental health problems',
      'Chronic medical conditions',
      'Traumatic life events',
      'Substance abuse',
      'Social isolation or loneliness',
      'Financial problems or job loss',
      'Relationship difficulties',
      'Being bullied or discriminated against',
      'Childhood abuse or neglect',
      'Lack of access to mental health services'
    ],
    prevention: [
      'Stay connected with friends and family',
      'Exercise regularly (30 minutes daily)',
      'Get adequate sleep (7-9 hours)',
      'Eat a nutritious, balanced diet',
      'Practice stress management (meditation, deep breathing)',
      'Limit alcohol and avoid drugs',
      'Seek help early if experiencing symptoms',
      'Maintain work-life balance',
      'Develop healthy coping strategies',
      'Practice gratitude and mindfulness',
      'Set realistic goals',
      'Engage in activities you enjoy'
    ],
    whenToSeekCare: [
      'Thoughts of suicide or self-harm (call 988 Suicide & Crisis Lifeline)',
      'Symptoms interfering with daily life',
      'Inability to cope with daily problems',
      'Excessive fears or worries',
      'Extreme mood changes',
      'Withdrawal from activities and friends',
      'Significant changes in eating or sleeping habits',
      'Substance abuse',
      'Prolonged depression or anxiety (>2 weeks)'
    ],
    commonQuestions: [
      {
        question: 'Is it normal to feel anxious or depressed sometimes?',
        answer: 'Yes, everyone experiences some anxiety and sadness as normal reactions to life\'s challenges. However, when these feelings are intense, persistent (lasting weeks), interfere with daily activities, or cause significant distress, they may indicate a mental health condition that could benefit from treatment. The key difference is severity, duration, and impact on functioning.'
      },
      {
        question: 'What is the difference between sadness and depression?',
        answer: 'Sadness is a normal emotion that comes and goes in response to life events. Depression is a medical condition characterized by persistent low mood, loss of interest in activities, changes in sleep/appetite, and other symptoms lasting at least 2 weeks. Depression affects your ability to function and doesn\'t improve with positive events. If sadness persists or worsens, it may be depression requiring professional help.'
      },
      {
        question: 'Do I need medication for depression or anxiety?',
        answer: 'Not necessarily. Treatment depends on severity. Mild to moderate cases often respond to psychotherapy (like CBT) alone. Moderate to severe cases usually benefit from a combination of therapy and medication. Medication can be very effective but isn\'t always required. Your healthcare provider will help determine the best approach based on your symptoms, preferences, and medical history.'
      },
      {
        question: 'How long does it take for mental health treatment to work?',
        answer: 'It varies by treatment type. Antidepressants typically take 4-6 weeks to show full effects, though some improvement may occur sooner. Therapy often shows gradual progress over 8-12 sessions. Many people benefit from combining medication and therapy. It\'s important to give treatment adequate time to work and communicate regularly with your healthcare provider about your progress.'
      }
    ],
    relatedTopics: ['Depression', 'Anxiety', 'Stress Management', 'Sleep Disorders']
  }
]

export function MedicalKnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<HealthTopic | null>(KNOWLEDGE_BASE[0])
  const [activeTab, setActiveTab] = useState('overview')

  // Filter topics by search
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return KNOWLEDGE_BASE

    const query = searchQuery.toLowerCase()
    return KNOWLEDGE_BASE.filter(topic =>
      topic.title.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query) ||
      topic.overview.toLowerCase().includes(query) ||
      topic.symptoms.some(s => s.toLowerCase().includes(query))
    )
  }, [searchQuery])

  // Group by category
  const categories = Array.from(new Set(KNOWLEDGE_BASE.map(t => t.category)))

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Cardiovascular': <Heart className="h-5 w-5" />,
      'Endocrine': <Droplet className="h-5 w-5" />,
      'Mental Health': <Brain className="h-5 w-5" />,
      'Respiratory': <Wind className="h-5 w-5" />,
    }
    return icons[category] || <Stethoscope className="h-5 w-5" />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Medical Knowledge Base
        </h1>
        <p className="text-muted-foreground">
          Evidence-based health information for patient education
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search health topics, symptoms, or conditions..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Topics List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Health Topics ({filteredTopics.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTopics.map(topic => (
                  <Button
                    key={topic.id}
                    variant={selectedTopic?.id === topic.id ? 'default' : 'outline'}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => {
                      setSelectedTopic(topic)
                      setActiveTab('overview')
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getCategoryIcon(topic.category)}
                      <div>
                        <div className="font-semibold text-sm">{topic.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {topic.category}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Details */}
        <div className="md:col-span-3">
          {selectedTopic && (
            <div className="space-y-4">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(selectedTopic.category)}
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{selectedTopic.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge>{selectedTopic.category}</Badge>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {selectedTopic.readingLevel}
                        </Badge>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Reviewed {selectedTopic.lastReviewed}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                  <TabsTrigger value="prevention">Prevention</TabsTrigger>
                  <TabsTrigger value="care">When to Seek Care</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {selectedTopic.overview}
                      </p>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Causes */}
                        <div>
                          <h4 className="font-semibold mb-3">Common Causes:</h4>
                          <ul className="space-y-2">
                            {selectedTopic.causes.map((cause, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Risk Factors */}
                        <div>
                          <h4 className="font-semibold mb-3">Risk Factors:</h4>
                          <ul className="space-y-2">
                            {selectedTopic.riskFactors.slice(0, 6).map((factor, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                                {factor}
                              </li>
                            ))}
                            {selectedTopic.riskFactors.length > 6 && (
                              <li className="text-sm text-muted-foreground pl-6">
                                +{selectedTopic.riskFactors.length - 6} more risk factors
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Symptoms */}
                <TabsContent value="symptoms">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Signs & Symptoms
                      </CardTitle>
                      <CardDescription>
                        Common symptoms to watch for - not everyone experiences all of these
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        {selectedTopic.symptoms.map((symptom, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{symptom}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Symptoms can vary from person to person. Some people may have
                          few or no symptoms, especially in early stages. If you\'re concerned about any symptoms,
                          consult with your healthcare provider.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Prevention */}
                <TabsContent value="prevention">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Prevention & Risk Reduction
                      </CardTitle>
                      <CardDescription>
                        Evidence-based strategies to lower your risk
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedTopic.prevention.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-semibold">
                              {idx + 1}
                            </div>
                            <span className="text-sm pt-0.5">{tip}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Small Changes, Big Impact
                        </h4>
                        <p className="text-sm text-green-800">
                          You don\'t have to implement all of these at once. Start with 1-2 changes that
                          feel manageable, then gradually add more over time. Consistency is more important
                          than perfection.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* When to Seek Care */}
                <TabsContent value="care">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        When to Seek Medical Care
                      </CardTitle>
                      <CardDescription>
                        Warning signs that require professional evaluation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedTopic.whenToSeekCare.map((warning, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-red-800">{warning}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
                        <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Emergency Numbers
                        </h4>
                        <div className="grid gap-2 md:grid-cols-3 text-sm">
                          <div>
                            <p className="font-semibold text-red-900">Emergency</p>
                            <p className="text-2xl font-bold text-red-700">911</p>
                          </div>
                          <div>
                            <p className="font-semibold text-red-900">Suicide Crisis</p>
                            <p className="text-xl font-bold text-red-700">988</p>
                          </div>
                          <div>
                            <p className="font-semibold text-red-900">Poison Control</p>
                            <p className="text-xl font-bold text-red-700">1-800-222-1222</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* FAQ */}
                <TabsContent value="faq">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Frequently Asked Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {selectedTopic.commonQuestions.map((qa, idx) => (
                          <div key={idx} className="border-b pb-4 last:border-0">
                            <h4 className="font-semibold mb-2 text-blue-900">
                              Q: {qa.question}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              A: {qa.answer}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Have more questions?</strong> Discuss these topics with your healthcare provider
                          for personalized advice based on your specific situation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Related Topics */}
              {selectedTopic.relatedTopics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedTopic.relatedTopics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Disclaimer */}
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Medical Disclaimer:</strong> This information is for educational purposes only and
                    is not a substitute for professional medical advice, diagnosis, or treatment. Always seek
                    the advice of your physician or other qualified health provider with any questions you may
                    have regarding a medical condition. Never disregard professional medical advice or delay
                    seeking it because of something you have read here.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
