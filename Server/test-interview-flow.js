#!/usr/bin/env node

/**
 * Interview Session Start Flow Test
 * 
 * This script documents the expected flow when a candidate starts an interview.
 * Run this after ensuring templates exist in the database.
 */

const http = require('http');

// Test configuration
const API_BASE = 'http://localhost:5000';
const TEMPLATE_TOKEN = 'test-token-123'; // Replace with actual template token

/**
 * Test 1: Get template info (public endpoint)
 */
function testGetTemplateInfo() {
  return fetch(`${API_BASE}/api/interview/session/${TEMPLATE_TOKEN}/info`)
    .then(res => res.json())
    .then(data => {
      console.log('✅ Template Info Loaded:');
      console.log(JSON.stringify(data, null, 2));
      return data.data;
    })
    .catch(err => {
      console.error('❌ Failed to fetch template info:', err.message);
      throw err;
    });
}

/**
 * Test 2: Start interview session (normalization test)
 * 
 * Expected behavior:
 * 1. Template values are read (may be "Frontend", "Behavioral", etc.)
 * 2. Values are normalized to lowercase ("frontend", "behavioral", etc.)
 * 3. Normalized values are validated against allowed values
 * 4. Interview record is created with lowercase enum values
 * 5. Success response includes sessionId and questions
 */
function testStartInterview() {
  const payload = {
    candidateName: 'Test Candidate',
    candidateEmail: 'test@example.com',
  };

  console.log('\n📤 Starting interview with payload:');
  console.log(JSON.stringify(payload, null, 2));

  return fetch(`${API_BASE}/api/interview/session/${TEMPLATE_TOKEN}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then(res => {
      const status = res.status;
      return res.json().then(data => ({ status, data }));
    })
    .then(({ status, data }) => {
      if (status === 201) {
        console.log('\n✅ Interview Session Started Successfully:');
        console.log(JSON.stringify(data, null, 2));
        return data.data;
      } else if (status === 400) {
        console.error('\n❌ Validation Error (400):');
        console.error(JSON.stringify(data, null, 2));
        throw new Error(data.message || 'Interview configuration invalid');
      } else {
        console.error(`\n❌ Error (${status}):`, data.message);
        throw new Error(data.message);
      }
    })
    .catch(err => {
      console.error('❌ Failed to start interview:', err.message);
      throw err;
    });
}

/**
 * Run tests
 */
async function runTests() {
  console.log('🧪 Interview Session Flow Test\n');
  console.log('================================\n');

  try {
    console.log('Test 1: Fetch Template Info');
    console.log('--------------------------');
    const templateInfo = await testGetTemplateInfo();

    console.log('\n\nTest 2: Start Interview Session');
    console.log('-------------------------------');
    const interviewData = await testStartInterview();

    console.log('\n\n✅ All tests passed!');
    console.log('\nExpected response structure:');
    console.log(JSON.stringify({
      success: true,
      message: 'Interview session started',
      data: {
        sessionId: 'interview-id',
        interviewId: 'interview-id',
        questions: ['question1', 'question2'],
        numberOfQuestions: 2,
        jobRole: 'frontend',
        experienceLevel: 'senior',
        interviewType: 'behavioral',
        difficultyLevel: 'easy',
      },
    }, null, 2));

  } catch (err) {
    console.error('\n\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testGetTemplateInfo, testStartInterview };
