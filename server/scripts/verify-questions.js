const fs = require('fs');
const path = require('path');

function loadQuestions(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function verifyUniqueQuestions() {
  // Load all question sets
  const mbti8 = loadQuestions('mbti-8-questions.json');
  const mbti24 = loadQuestions('mbti-24-questions.json');
  const mbti100 = loadQuestions('mbti-100-questions.json');

  // Create sets for each category
  const questionSets = {
    EI: new Set(),
    SN: new Set(),
    TF: new Set(),
    JP: new Set()
  };

  // Track duplicates
  const duplicates = [];

  // Function to check and add questions
  function checkQuestions(questions, testType) {
    questions.forEach(q => {
      const normalizedQuestion = q.text.toLowerCase().trim();
      if (questionSets[q.category].has(normalizedQuestion)) {
        duplicates.push({
          category: q.category,
          question: q.text,
          testType
        });
      } else {
        questionSets[q.category].add(normalizedQuestion);
      }
    });
  }

  // Check all test types
  checkQuestions(mbti8, 'mbti-8');
  checkQuestions(mbti24, 'mbti-24');
  checkQuestions(mbti100, 'mbti-100');

  // Report results
  console.log('Question Verification Results:');
  console.log('-----------------------------');
  console.log(`Total unique questions per category:`);
  Object.entries(questionSets).forEach(([category, set]) => {
    console.log(`${category}: ${set.size} questions`);
  });

  if (duplicates.length > 0) {
    console.log('\nDuplicate questions found:');
    duplicates.forEach(d => {
      console.log(`\nCategory: ${d.category}`);
      console.log(`Test Type: ${d.testType}`);
      console.log(`Question: ${d.question}`);
    });
  } else {
    console.log('\nNo duplicate questions found!');
  }
}

verifyUniqueQuestions(); 