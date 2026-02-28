import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, addDoc, updateDoc, increment } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import CodeEditor from "../components/CodeEditor";

function ProblemSolver() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [activeTab, setActiveTab] = useState('description');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [runResult, setRunResult] = useState(null);

  const languageIds = {
    java: 62,
    python: 71,
    cpp: 54,
    javascript: 63
  };

  const defaultCode = {
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
        
        sc.close();
    }
}`,
    python: `# Write your code here
`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
    javascript: `// Write your code here
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

`
  };

  useEffect(() => {
    loadProblem();
  }, [problemId]);

  useEffect(() => {
    setCode(defaultCode[language] || '');
  }, [language]);

  const loadProblem = async () => {
    try {
      setLoading(true);
      const problemDoc = await getDoc(doc(db, "problems", problemId));
      
      if (!problemDoc.exists()) {
        alert("Problem not found");
        navigate("/contests");
        return;
      }

      setProblem({
        id: problemDoc.id,
        ...problemDoc.data()
      });
      
      setCode(defaultCode[language]);
    } catch (error) {
      console.error("Error loading problem:", error);
      alert("Failed to load problem");
    } finally {
      setLoading(false);
    }
  };

  const executeCode = async (input) => {
    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    
    if (!apiKey || apiKey === 'your_rapidapi_key_here') {
      throw new Error('⚠️ Judge0 API key not configured!\n\nPlease:\n1. Get API key from rapidapi.com/judge0-official/api/judge0-ce\n2. Add to .env file: VITE_RAPIDAPI_KEY=your_key');
    }

    const options = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        language_id: languageIds[language],
        source_code: btoa(unescape(encodeURIComponent(code))),
        stdin: btoa(unescape(encodeURIComponent(input || ''))),
        cpu_time_limit: (problem?.timeLimit || 2000) / 1000,
        memory_limit: (problem?.memoryLimit || 256) * 1024
      })
    };

    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false', options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No submission token received from Judge0');
      }
      
      // Poll for result
      let result;
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const resultResponse = await fetch(
          `https://judge0-ce.p.rapidapi.com/submissions/${data.token}?base64_encoded=true`,
          {
            headers: {
              'X-RapidAPI-Key': apiKey,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
          }
        );
        
        if (!resultResponse.ok) {
          throw new Error(`API Error: ${resultResponse.status}`);
        }
        
        result = await resultResponse.json();
        
        // Status: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error
        if (result.status.id > 2) break;
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Code execution timeout - please try again');
      }
      
      return result;
    } catch (error) {
      console.error('Execute error:', error);
      throw error;
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      alert('❌ Please write some code first!');
      return;
    }

    setIsRunning(true);
    setRunResult(null);
    setTestResults([]);
    setActiveTab('results');
    
    try {
      // Get non-hidden test cases from problem.testCases
      const nonHiddenTestCases = (problem?.testCases || []).filter(tc => !tc.isHidden);
      
      // Decide what to run:
      // 1. If there are non-hidden test cases, run those
      // 2. Otherwise, run sample input/output
      if (nonHiddenTestCases.length > 0) {
        // Run all non-hidden test cases and show full details
        const results = [];
        
        for (let i = 0; i < nonHiddenTestCases.length; i++) {
          const testCase = nonHiddenTestCases[i];
          const result = await executeCode(testCase.input);
          
          const actualOutput = result.status.id === 3 && result.stdout 
            ? decodeURIComponent(escape(atob(result.stdout))).trim() 
            : '';
          const expectedOutput = testCase.output.trim();
          const passed = result.status.id === 3 && actualOutput === expectedOutput;
          
          results.push({
            testCase: i + 1,
            passed,
            hidden: false,
            statusId: result.status.id,
            error: result.status.id !== 3 ? (
              result.compile_output ? decodeURIComponent(escape(atob(result.compile_output))) :
              result.stderr ? decodeURIComponent(escape(atob(result.stderr))) :
              result.status.description
            ) : null,
            input: testCase.input,
            expected: expectedOutput,
            output: actualOutput,
            time: result.time || 0,
            memory: result.memory || 0
          });
        }
        
        setTestResults(results);
      } else {
        // No non-hidden test cases, run sample input/output
        const input = customInput || problem?.sampleInput || '';
        const expectedOutput = problem?.sampleOutput?.trim() || '';
        const result = await executeCode(input);
        
        let runOutput = {
          success: false,
          output: '',
          error: null,
          time: null,
          memory: null,
          passed: false,
          expectedOutput: expectedOutput,
          hasExpectedOutput: !!expectedOutput
        };

        if (result.status.id === 3) {
          // Accepted
          const stdout = result.stdout ? decodeURIComponent(escape(atob(result.stdout))) : '';
          const actualOutput = stdout.trim();
          const time = result.time ? `${(parseFloat(result.time) * 1000).toFixed(0)}ms` : 'N/A';
          const memory = result.memory ? `${Math.round(result.memory / 1024)}MB` : 'N/A';
          
          runOutput = {
            success: true,
            output: actualOutput || '(no output)',
            time,
            memory,
            passed: actualOutput === expectedOutput,
            expectedOutput: expectedOutput,
            hasExpectedOutput: !!expectedOutput
          };
        } else if (result.status.id === 6) {
          // Compilation Error
          const error = result.compile_output ? decodeURIComponent(escape(atob(result.compile_output))) : 'Compilation failed';
          runOutput.error = `Compilation Error:\n\n${error}`;
        } else if (result.status.id === 5) {
          // Time Limit Exceeded
          runOutput.error = `Time Limit Exceeded\n\nYour code took too long to execute.\nLimit: ${problem?.timeLimit || 2000}ms`;
        } else if (result.status.id === 11 || result.status.id === 12) {
          // Runtime Error
          const stderr = result.stderr ? decodeURIComponent(escape(atob(result.stderr))) : 'Runtime error occurred';
          runOutput.error = `Runtime Error:\n\n${stderr}`;
        } else {
          // Other errors
          const message = result.message || result.status.description || 'Unknown error';
          runOutput.error = `Error: ${message}`;
        }

        setRunResult(runOutput);
      }
    } catch (error) {
      setRunResult({
        success: false,
        error: `Execution Failed:\n\n${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      alert('❌ Please write some code before submitting!');
      return;
    }

    if (!currentUser) {
      alert('🔒 Please login to submit your solution!');
      return;
    }

    const confirmed = window.confirm('🚀 Ready to submit your solution?\n\nYour code will be tested against all test cases including hidden ones.');
    if (!confirmed) return;

    setIsSubmitting(true);
    setTestResults([]);
    setRunResult(null);
    setActiveTab('results');
    
    try {
      // Get hidden and non-hidden test cases from problem.testCases
      const allTestCases = problem?.testCases || [];
      const hiddenTestCases = allTestCases.filter(tc => tc.isHidden);
      const nonHiddenTestCases = allTestCases.filter(tc => !tc.isHidden);
      
      // Decide what to run:
      // 1. If there are hidden test cases, run those
      // 2. Otherwise, run non-hidden test cases
      const testCasesToRun = hiddenTestCases.length > 0 ? hiddenTestCases : nonHiddenTestCases;
      const isRunningHidden = hiddenTestCases.length > 0;
      
      const results = [];
      
      for (let i = 0; i < testCasesToRun.length; i++) {
        const testCase = testCasesToRun[i];
        const result = await executeCode(testCase.input);
        
        const actualOutput = result.status.id === 3 && result.stdout 
          ? decodeURIComponent(escape(atob(result.stdout))).trim() 
          : '';
        const expectedOutput = testCase.output.trim();
        const passed = result.status.id === 3 && actualOutput === expectedOutput;
        
        results.push({
          testCase: i + 1,
          passed,
          hidden: isRunningHidden, // Mark as hidden if we're running hidden test cases
          statusId: result.status.id,
          error: result.status.id !== 3 ? (
            result.compile_output ? decodeURIComponent(escape(atob(result.compile_output))) :
            result.stderr ? decodeURIComponent(escape(atob(result.stderr))) :
            result.status.description
          ) : null,
          expected: isRunningHidden ? null : expectedOutput, // Don't show expected for hidden tests
          output: isRunningHidden ? null : actualOutput, // Don't show output for hidden tests
          time: result.time || 0,
          memory: result.memory || 0
        });
      }
      
      setTestResults(results);
      
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      const allPassed = passedCount === totalCount;
      
      await saveSubmission(results, allPassed);
      
      if (allPassed) {
        alert(`🎉 ACCEPTED!\n\nAll ${totalCount} test cases passed!\n+${problem.points} points`);
      } else {
        alert(`⚠️ Wrong Answer\n\n${passedCount}/${totalCount} test cases passed\n\nCheck the Results tab for details.`);
      }
    } catch (error) {
      alert(`❌ Submission Error:\n\n${error.message}`);
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveSubmission = async (results, accepted) => {
    try {
      console.log('🔥 Starting saveSubmission...', { accepted, userId: currentUser.uid });
      
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      // Save submission
      const submissionData = {
        userId: currentUser.uid,
        username: currentUser.username || currentUser.email,
        problemId: problemId,
        problemTitle: problem.title,
        contestId: problem.contestId || null,
        contestTitle: problem.contestTitle || 'Practice',
        code,
        language,
        status: accepted ? 'Accepted' : 'Wrong Answer',
        passedTests: passedCount,
        totalTests: totalCount,
        submittedAt: new Date(),
        points: accepted ? problem.points : 0,
        difficulty: problem.difficulty || 'medium'
      };
      
      console.log('📝 Saving submission to Firestore...', submissionData);
      await addDoc(collection(db, 'submissions'), submissionData);
      console.log('✅ Submission saved successfully');
      
      // Update user stats
      const userRef = doc(db, 'users', currentUser.uid);
      console.log('📊 Fetching user data...');
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() || {};
      console.log('Current user data:', userData);
      
      const userUpdates = {
        totalSubmissions: increment(1)
      };
      
      // Update difficulty-based problem count
      if (accepted) {
        userUpdates.problemsSolved = increment(1);
        userUpdates.totalPoints = increment(problem.points || 0);
        
        // Track problems by difficulty
        const difficulty = (problem.difficulty || 'medium').toLowerCase();
        userUpdates[`problemsByDifficulty.${difficulty}`] = increment(1);
        console.log(`✨ Updating ${difficulty} problems count`);
      }
      
      // Track contest participation
      if (problem.contestId) {
        const participatedContests = userData.participatedContests || [];
        if (!participatedContests.includes(problem.contestId)) {
          userUpdates.participatedContests = [...participatedContests, problem.contestId];
          userUpdates.contestsParticipated = increment(1);
          console.log('🏆 New contest participation recorded');
        }
      }
      
      // Update recent activities (keep last 10)
      const newActivity = {
        problemId: problemId,
        problemTitle: problem.title,
        contestId: problem.contestId || null,
        contestTitle: problem.contestTitle || 'Practice',
        status: accepted ? 'Accepted' : 'Wrong Answer',
        passedTests: passedCount,
        totalTests: totalCount,
        submittedAt: new Date(),
        difficulty: problem.difficulty || 'medium'
      };
      
      const recentActivities = userData.recentActivities || [];
      const updatedActivities = [newActivity, ...recentActivities].slice(0, 10);
      userUpdates.recentActivities = updatedActivities;
      
      console.log('🔄 Updating user stats...', userUpdates);
      await updateDoc(userRef, userUpdates);
      console.log('✅ User stats updated successfully');
      
      // Update problem stats
      const problemRef = doc(db, 'problems', problemId);
      const problemUpdates = {
        totalSubmissions: increment(1)
      };
      
      if (accepted) {
        problemUpdates.acceptedSubmissions = increment(1);
      }
      
      console.log('📈 Updating problem stats...');
      await updateDoc(problemRef, problemUpdates);
      console.log('✅ Problem stats updated successfully');
      
      console.log('🎉 All updates completed successfully!');
    } catch (error) {
      console.error('❌ Error saving submission:', error);
      console.error('Error details:', error.message, error.code);
      alert(`Failed to save submission: ${error.message}`);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case "easy": return "#22c55e";
      case "medium": return "#f59e0b";
      case "hard": return "#ef4444";
      default: return "var(--text-secondary)";
    }
  };

  if (loading) {
    return (
      <div id="problem-solver">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loader"></div>
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Loading problem...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!problem) return null;

  // Calculate hidden test stats
  const hiddenTests = testResults.filter(r => r.hidden);
  const hiddenPassed = hiddenTests.filter(r => r.passed).length;
  const hiddenTotal = hiddenTests.length;

  return (
    <div id="problem-solver">
      <div className="solver-container">
        {/* Problem Panel */}
        <div className="problem-panel">
          <div className="problem-panel-header">
            <button className="btn-back-small" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div className="problem-title-bar">
              <h2>{problem.title}</h2>
              <span 
                className="difficulty-badge"
                style={{ 
                  background: getDifficultyColor(problem.difficulty),
                  color: "white"
                }}
              >
                {problem.difficulty}
              </span>
            </div>
          </div>

          <div className="problem-tabs">
            <button 
              className={`problem-tab ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              📖 Description
            </button>
            <button 
              className={`problem-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              📊 Results {(testResults.length > 0 || runResult) && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
            </button>
          </div>

          <div className="problem-content">
            {activeTab === 'description' ? (
              <>
                <div className="problem-section problem-section-bg">
                  <p style={{ lineHeight: '1.9', fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0 }}>
                    {problem.description}
                  </p>
                </div>

                {problem.inputFormat && (
                  <div className="problem-section problem-section-bg">
                    <h3>📥 Input Format</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', margin: 0 }}>{problem.inputFormat}</p>
                  </div>
                )}

                {problem.outputFormat && (
                  <div className="problem-section problem-section-bg">
                    <h3>📤 Output Format</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', margin: 0 }}>{problem.outputFormat}</p>
                  </div>
                )}

                {problem.constraints && (
                  <div className="problem-section problem-section-bg">
                    <h3>⚙️ Constraints</h3>
                    <pre className="sample-code" style={{ margin: 0 }}>
                      {problem.constraints}
                    </pre>
                  </div>
                )}

                {(problem.sampleInput || problem.sampleOutput) && (
                  <div className="problem-section">
                    <h3>💡 Sample Test Case</h3>
                    <div className="sample-io">
                      <div>
                        <strong>Input:</strong>
                        <pre className="sample-code">{problem.sampleInput}</pre>
                      </div>
                      <div>
                        <strong>Output:</strong>
                        <pre className="sample-code">{problem.sampleOutput}</pre>
                      </div>
                    </div>
                    {problem.sampleExplanation && (
                      <div style={{ 
                        marginTop: '16px', 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
                        borderRadius: '12px', 
                        borderLeft: '4px solid var(--primary)' 
                      }}>
                        <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                          💡 Explanation:
                        </strong>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                          {problem.sampleExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="problem-section" style={{ background: 'var(--card-bg-alt)', padding: '20px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0 }}>🏆 Points</h3>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {problem.points}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    <span><strong>⏱️ Time:</strong> {problem.timeLimit}ms</span>
                    <span><strong>💾 Memory:</strong> {problem.memoryLimit}MB</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="results-panel">
                {!runResult && testResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📊</div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No results yet</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Run or submit your code to see results</p>
                  </div>
                ) : (
                  <>
                    {/* Run results - shows when runCode is executed */}
                    {runResult && (
                      <div className={`run-result-card ${runResult.success ? 'success' : 'error'}`}>
                        <h3 style={{ margin: '0 0 16px 0' }}>
                          {runResult.success ? (
                            runResult.hasExpectedOutput ? (
                              runResult.passed ? '✅ Sample Test Case Passed' : '❌ Sample Test Case Failed'
                            ) : '✅ Code Executed Successfully'
                          ) : '❌ Execution Failed'}
                        </h3>
                        {runResult.success ? (
                          <>
                            {runResult.hasExpectedOutput && (
                              <div style={{
                                padding: '12px',
                                background: runResult.passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: `1px solid ${runResult.passed ? '#22c55e' : '#ef4444'}`
                              }}>
                                <strong style={{ color: runResult.passed ? '#22c55e' : '#ef4444' }}>
                                  {runResult.passed ? 'Your output matches the expected output!' : 'Your output does not match the expected output'}
                                </strong>
                              </div>
                            )}
                            
                            {runResult.hasExpectedOutput && !runResult.passed && (
                              <div className="test-output">
                                <strong>Expected Output:</strong>
                                <pre>{runResult.expectedOutput}</pre>
                              </div>
                            )}
                            
                            <div className="test-output">
                              <strong>{runResult.hasExpectedOutput ? 'Your Output:' : 'Output:'}</strong>
                              <pre>{runResult.output}</pre>
                            </div>
                            <div className="test-metrics">
                              <span>⏱️ {runResult.time}</span>
                              <span>💾 {runResult.memory}</span>
                            </div>
                          </>
                        ) : (
                          <div className="test-error">
                            <pre>{runResult.error}</pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Test results - shows when runCode executes non-hidden tests OR when submitCode executes any tests */}
                    {testResults.length > 0 && (
                      <div className="test-results">
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '20px',
                          padding: '16px',
                          background: 'var(--card-bg)',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                              {testResults[0]?.hidden ? 'Submission Results' : 'Run Results'}
                            </h3>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                              Test cases: {testResults.filter(r => r.passed).length}/{testResults.length} passed
                            </p>
                          </div>
                          <div style={{
                            fontSize: '2.5rem'
                          }}>
                            {testResults.every(r => r.passed) ? '🎉' : '💪'}
                          </div>
                        </div>
                        
                        {/* Show detailed results for non-hidden test cases (from runCode) */}
                        {!testResults[0]?.hidden && testResults.map((result, idx) => (
                          <div key={idx} className={`test-result-card ${result.passed ? 'passed' : 'failed'}`}>
                            <div className="test-result-header">
                              <span className="test-number">
                                📝 Test Case {result.testCase}
                              </span>
                              <span className={`test-status ${result.passed ? 'passed' : 'failed'}`}>
                                {result.passed ? '✅ Passed' : '❌ Failed'}
                              </span>
                            </div>
                            
                            {result.error ? (
                              <div className="test-error">
                                <strong>Error:</strong>
                                <pre>{result.error}</pre>
                              </div>
                            ) : (
                              <>
                                {result.input && (
                                  <div className="test-output">
                                    <strong>Input:</strong>
                                    <pre>{result.input}</pre>
                                  </div>
                                )}
                                
                                <div className="test-output">
                                  <strong>Expected Output:</strong>
                                  <pre>{result.expected}</pre>
                                </div>
                                
                                <div className="test-output">
                                  <strong>Your Output:</strong>
                                  <pre>{result.output || '(no output)'}</pre>
                                </div>
                                
                                {result.passed && (
                                  <div style={{ 
                                    padding: '12px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '8px',
                                    marginTop: '12px',
                                    color: '#22c55e',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                  }}>
                                    ✓ Output matches perfectly!
                                  </div>
                                )}
                              </>
                            )}
                            
                            <div className="test-metrics">
                              <span>⏱️ {(result.time * 1000).toFixed(0)}ms</span>
                              <span>💾 {(result.memory / 1024).toFixed(2)}MB</span>
                            </div>
                          </div>
                        ))}

                        {/* Show summary for hidden test cases (from submitCode) */}
                        {testResults[0]?.hidden && (
                          <div className={`test-result-card ${testResults.every(r => r.passed) ? 'passed' : 'failed'}`} style={{
                            background: testResults.every(r => r.passed)
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%)'
                              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%)'
                          }}>
                            <div className="test-result-header">
                              <span className="test-number" style={{ fontSize: '1rem' }}>
                                🔒 Hidden Test Cases
                              </span>
                              <span className={`test-status ${testResults.every(r => r.passed) ? 'passed' : 'failed'}`} style={{
                                fontSize: '1.1rem',
                                fontWeight: '700'
                              }}>
                                {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                              </span>
                            </div>
                            
                            <div style={{ 
                              marginTop: '16px',
                              padding: '14px',
                              background: 'var(--card-bg)',
                              borderRadius: '8px',
                              border: `1px solid ${testResults.every(r => r.passed) ? '#22c55e' : '#ef4444'}`
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: testResults.every(r => r.passed) ? '0' : '10px'
                              }}>
                                <span style={{ fontSize: '1.5rem' }}>
                                  {testResults.every(r => r.passed) ? '🎊' : '⚠️'}
                                </span>
                                <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                                  {testResults.every(r => r.passed)
                                    ? 'All hidden test cases passed!' 
                                    : `${testResults.length - testResults.filter(r => r.passed).length} hidden test case(s) failed`
                                  }
                                </p>
                              </div>
                              {!testResults.every(r => r.passed) && (
                                <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                  💡 Review your logic and edge cases. Try debugging with custom inputs.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="editor-panel">
          <div className="editor-header">
            <div className="language-selector">
              <label>Language:</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="java">☕ Java</option>
                <option value="python">🐍 Python 3</option>
                <option value="cpp">⚡ C++</option>
                <option value="javascript">💛 JavaScript</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-editor-action btn-run"
                onClick={runCode}
                disabled={isRunning || isSubmitting}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px',
                  background: isRunning ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isRunning ? '⏳ Running...' : 'Run Code'}
              </button>
              <button 
                className="btn-editor-action btn-submit"
                onClick={submitCode}
                disabled={isSubmitting || isRunning}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px',
                  background: isSubmitting ? '#94a3b8' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isSubmitting ? '⏳ Submitting...' : 'Submit Code'}
              </button>
            </div>
          </div>

          <CodeEditor 
            code={code}
            setCode={setCode}
            language={language}
          />

          <div className="custom-input-section">
            <label>
              <span style={{ fontWeight: '700' }}>🔧 Custom Input</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400, marginLeft: '8px' }}>
                (Optional - Uses sample input if empty)
              </span>
            </label>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter test input here..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemSolver;
