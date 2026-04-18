'use client'
import { useState } from 'react'
import Topbar from '@/components/ui/Topbar'
import dynamic from 'next/dynamic'
import { Play, RotateCcw, CheckCircle, XCircle, Code2, ChevronRight, Clock, Star, Filter, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const problems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Table'], acceptance: '49%', solved: true,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }],
    starterCode: { python: 'def twoSum(nums, target):\n    # Write your solution here\n    pass\n', javascript: 'var twoSum = function(nums, target) {\n    // Write your solution here\n};\n', cpp: '#include<vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n}' }
  },
  { id: 2, title: 'Reverse Linked List', difficulty: 'Easy', tags: ['Linked List', 'Recursion'], acceptance: '73%', solved: true,
    description: 'Given the head of a singly linked list, reverse the list and return the reversed list.',
    examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Reverse all pointers' }],
    starterCode: { python: 'def reverseList(head):\n    prev = None\n    curr = head\n    # Write your solution here\n    pass\n', javascript: 'var reverseList = function(head) {\n    // Write your solution here\n};\n', cpp: 'ListNode* reverseList(ListNode* head) {\n    // Write your solution here\n}' }
  },
  { id: 3, title: 'Binary Search', difficulty: 'Easy', tags: ['Array', 'Binary Search'], acceptance: '55%', solved: false,
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
    examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums at index 4' }],
    starterCode: { python: 'def search(nums, target):\n    left, right = 0, len(nums)-1\n    # Write your solution here\n    pass\n', javascript: 'var search = function(nums, target) {\n    // Write your solution here\n};\n', cpp: 'int search(vector<int>& nums, int target) {\n    // Write your solution here\n}' }
  },
  { id: 4, title: 'Maximum Subarray', difficulty: 'Medium', tags: ['Array', 'DP'], acceptance: '50%', solved: false,
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum (Kadane\'s Algorithm).',
    examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has sum 6' }],
    starterCode: { python: 'def maxSubArray(nums):\n    # Implement Kadane\'s Algorithm\n    pass\n', javascript: 'var maxSubArray = function(nums) {\n    // Write your solution here\n};\n', cpp: 'int maxSubArray(vector<int>& nums) {\n    // Write your solution here\n}' }
  },
  { id: 5, title: 'LRU Cache', difficulty: 'Medium', tags: ['Hash Table', 'Linked List', 'Design'], acceptance: '42%', solved: false,
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    examples: [{ input: 'capacity=2, put(1,1), put(2,2), get(1), put(3,3)', output: '1, then evicts key 2', explanation: 'LRU key is 2' }],
    starterCode: { python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        pass\n\n    def get(self, key: int) -> int:\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        pass\n', javascript: 'class LRUCache {\n    constructor(capacity) {}\n    get(key) {}\n    put(key, value) {}\n}\n', cpp: 'class LRUCache {\npublic:\n    LRUCache(int capacity) {}\n    int get(int key) {}\n    void put(int key, int value) {}\n};\n' }
  },
  { id: 6, title: 'Merge K Sorted Lists', difficulty: 'Hard', tags: ['Linked List', 'Heap', 'Divide & Conquer'], acceptance: '49%', solved: false,
    description: 'You are given an array of k linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'Merge all lists' }],
    starterCode: { python: 'def mergeKLists(lists):\n    # Use min-heap for efficiency\n    pass\n', javascript: 'var mergeKLists = function(lists) {\n    // Write your solution here\n};\n', cpp: 'ListNode* mergeKLists(vector<ListNode*>& lists) {\n    // Write your solution here\n}' }
  },
]

const difficultyColor: Record<string, string> = {
  Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444'
}

const testResults = [
  { id: 1, input: 'nums=[2,7,11,15], target=9', expected: '[0,1]', got: '[0,1]', passed: true },
  { id: 2, input: 'nums=[3,2,4], target=6', expected: '[1,2]', got: '[1,2]', passed: true },
  { id: 3, input: 'nums=[3,3], target=6', expected: '[0,1]', got: '[0,1]', passed: true },
]

export default function CodingPage() {
  const [selected, setSelected] = useState(problems[0])
  const [lang, setLang] = useState<'python' | 'javascript' | 'cpp'>('python')
  const [code, setCode] = useState<Record<number, Record<string, string>>>({})
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [tab, setTab] = useState<'description' | 'solution' | 'submissions'>('description')
  const [filterDiff, setFilterDiff] = useState('All')

  const getCode = () => code[selected.id]?.[lang] || selected.starterCode[lang]
  const setCurrentCode = (val: string) => {
    setCode(prev => ({ ...prev, [selected.id]: { ...(prev[selected.id] || {}), [lang]: val } }))
  }

  const runCode = async () => {
    if (!getCode().trim()) { toast.error('Write some code first!'); return }
    setRunning(true)
    await new Promise(r => setTimeout(r, 1500))
    setResults(testResults)
    setRunning(false)
    const passed = testResults.filter(r => r.passed).length
    if (passed === testResults.length) toast.success(`All ${passed} test cases passed! 🎉`)
    else toast.error(`${testResults.length - passed} test case(s) failed`)
  }

  const filtered = filterDiff === 'All' ? problems : problems.filter(p => p.difficulty === filterDiff)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar title="Coding Practice" subtitle="Solve DSA problems with AI hints" />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Problem List */}
        <div style={{ width: '280px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} onClick={() => setFilterDiff(d)}
                  style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', background: filterDiff === d ? (d === 'All' ? '#3b82f6' : difficultyColor[d]) : 'rgba(148,163,184,0.08)', color: filterDiff === d ? 'white' : 'var(--text-secondary)', fontFamily: 'Sora', transition: 'all 0.15s' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filtered.map((p) => (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px', border: `1px solid ${selected.id === p.id ? 'rgba(59,130,246,0.3)' : 'transparent'}`, background: selected.id === p.id ? 'rgba(59,130,246,0.08)' : 'transparent', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (selected.id !== p.id) (e.currentTarget as HTMLElement).style.background = 'rgba(148,163,184,0.05)' }}
                onMouseLeave={e => { if (selected.id !== p.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: selected.id === p.id ? '#60a5fa' : 'var(--text-primary)' }}>{p.id}. {p.title}</span>
                  {p.solved && <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: difficultyColor[p.difficulty], fontWeight: 600 }}>{p.difficulty}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {p.acceptance}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {p.tags.slice(0, 2).map(t => (
                    <span key={t} className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Problem + Editor */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Problem Panel */}
          <div style={{ width: '380px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
              {(['description', 'solution', 'submissions'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '14px 12px', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: tab === t ? '#60a5fa' : 'var(--text-muted)', borderBottom: `2px solid ${tab === t ? '#3b82f6' : 'transparent'}`, fontFamily: 'Sora', textTransform: 'capitalize', transition: 'color 0.15s' }}>
                  {t}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {tab === 'description' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white' }}>{selected.title}</h2>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: difficultyColor[selected.difficulty], background: `${difficultyColor[selected.difficulty]}15`, padding: '3px 10px', borderRadius: '99px' }}>{selected.difficulty}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {selected.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '20px' }}>{selected.description}</p>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>Examples:</p>
                    {selected.examples.map((ex, i) => (
                      <div key={i} style={{ background: 'rgba(148,163,184,0.05)', borderRadius: '10px', padding: '14px', marginBottom: '10px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}><span style={{ color: '#60a5fa', fontWeight: 600 }}>Input:</span> {ex.input}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}><span style={{ color: '#34d399', fontWeight: 600 }}>Output:</span> {ex.output}</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}><span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Explanation:</span> {ex.explanation}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab === 'solution' && (
                <div>
                  <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center' }}>
                    <Zap size={32} style={{ color: '#a78bfa', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Solve the problem first, then unlock the AI solution.</p>
                    <button onClick={() => toast('AI solution feature available with OpenAI key')} className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 20px' }}>
                      <Zap size={14} /> Get AI Solution
                    </button>
                  </div>
                </div>
              )}
              {tab === 'submissions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {results.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>No submissions yet. Run your code!</p>
                  ) : results.map((r, i) => (
                    <div key={i} style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${r.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, background: r.passed ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {r.passed ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <XCircle size={14} style={{ color: '#ef4444' }} />}
                        <span style={{ fontSize: '13px', fontWeight: 600, color: r.passed ? '#34d399' : '#f87171' }}>Test Case {i + 1}: {r.passed ? 'Passed' : 'Failed'}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Input: {r.input}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>Expected: {r.expected} | Got: {r.got}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Editor Toolbar */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.5)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['python', 'javascript', 'cpp'] as const).map(l => (
                  <button key={l} onClick={() => setLang(l)}
                    style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: lang === l ? 'none' : '1px solid var(--border)', background: lang === l ? 'rgba(59,130,246,0.2)' : 'transparent', color: lang === l ? '#60a5fa' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', transition: 'all 0.15s' }}>
                    {l === 'cpp' ? 'C++' : l.charAt(0).toUpperCase() + l.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentCode(selected.starterCode[lang])}
                  style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Sora', transition: 'all 0.15s' }}>
                  <RotateCcw size={13} /> Reset
                </button>
                <button onClick={runCode} disabled={running}
                  style={{ padding: '6px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer', border: 'none', background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Sora', opacity: running ? 0.7 : 1, transition: 'all 0.15s' }}>
                  {running ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Play size={13} fill="white" />}
                  {running ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Monaco */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MonacoEditor
                height="100%"
                language={lang === 'cpp' ? 'cpp' : lang}
                theme="vs-dark"
                value={getCode()}
                onChange={(val) => setCurrentCode(val || '')}
                options={{
                  fontSize: 14, fontFamily: 'JetBrains Mono', minimap: { enabled: false },
                  lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on',
                  padding: { top: 16, bottom: 16 }, smoothScrolling: true,
                  cursorBlinking: 'smooth', bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
