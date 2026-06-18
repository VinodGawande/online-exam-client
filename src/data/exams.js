// Utility function to shuffle array
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Utility function to get random subset of questions
const getRandomQuestions = (allQuestions, count) => {
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((q, idx) => ({
    ...q,
    id: idx + 1
  }));
};

const mathQuestions = [
  { id: 1, question: "What is the value of π (pi) approximately?", options: ["3.14", "3.1416", "3.14159", "3.1415926535"], correctAnswer: 2 },
  { id: 2, question: "What is the square root of 144?", options: ["10", "11", "12", "13"], correctAnswer: 2 },
  { id: 3, question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctAnswer: 2 },
  { id: 4, question: "What is the area of a circle with radius 7 units? (Use π = 22/7)", options: ["144 sq units", "150 sq units", "154 sq units", "160 sq units"], correctAnswer: 2 },
  { id: 5, question: "Solve for x: 2x + 5 = 17", options: ["4", "5", "6", "7"], correctAnswer: 2 },
  { id: 6, question: "What is the value of 2³?", options: ["4", "6", "8", "10"], correctAnswer: 2 },
  { id: 7, question: "What is the perimeter of a square with side 5 units?", options: ["15 units", "20 units", "25 units", "30 units"], correctAnswer: 1 },
  { id: 8, question: "Simplify: 12 ÷ 4 × 3", options: ["6", "9", "12", "15"], correctAnswer: 1 },
  { id: 9, question: "What is 25% of 80?", options: ["15", "20", "25", "30"], correctAnswer: 1 },
  { id: 10, question: "What is the next number in the sequence: 2, 4, 8, 16, ...?", options: ["24", "28", "32", "36"], correctAnswer: 2 },
  { id: 11, question: "What is the cube root of 27?", options: ["2", "3", "4", "5"], correctAnswer: 1 },
  { id: 12, question: "How many degrees are in a triangle?", options: ["90", "180", "270", "360"], correctAnswer: 1 },
  { id: 13, question: "What is 30% of 150?", options: ["35", "40", "45", "50"], correctAnswer: 2 },
  { id: 14, question: "Solve: 3x - 7 = 11", options: ["4", "5", "6", "7"], correctAnswer: 2 },
  { id: 15, question: "What is the value of 5²?", options: ["10", "20", "25", "30"], correctAnswer: 2 },
  { id: 16, question: "What is the circumference of a circle with radius 5?", options: ["10π", "15π", "20π", "25π"], correctAnswer: 0 },
  { id: 17, question: "What is the LCM of 12 and 18?", options: ["24", "36", "48", "60"], correctAnswer: 1 },
  { id: 18, question: "What is 50% of 90?", options: ["40", "45", "50", "55"], correctAnswer: 1 },
  { id: 19, question: "Solve: x/5 = 10", options: ["25", "50", "75", "100"], correctAnswer: 1 },
  { id: 20, question: "What is the area of a rectangle with length 8 and width 5?", options: ["26", "40", "13", "20"], correctAnswer: 1 },
];

const scienceQuestions = [
  { id: 1, question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "N2"], correctAnswer: 0 },
  { id: 2, question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: 1 },
  { id: 3, question: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"], correctAnswer: 1 },
  { id: 4, question: "What is the speed of light in vacuum?", options: ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s", "3 × 10^4 m/s"], correctAnswer: 0 },
  { id: 5, question: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctAnswer: 1 },
  { id: 6, question: "What is the chemical formula for table salt?", options: ["NaCl", "KCl", "CaCl2", "MgCl2"], correctAnswer: 0 },
  { id: 7, question: "Which organ pumps blood in the human body?", options: ["Lungs", "Liver", "Heart", "Kidney"], correctAnswer: 2 },
  { id: 8, question: "What is the boiling point of water at sea level?", options: ["90°C", "95°C", "100°C", "105°C"], correctAnswer: 2 },
  { id: 9, question: "Which force keeps planets in orbit around the sun?", options: ["Magnetic force", "Gravitational force", "Electric force", "Nuclear force"], correctAnswer: 1 },
  { id: 10, question: "What is the basic unit of life?", options: ["Atom", "Molecule", "Cell", "Tissue"], correctAnswer: 2 },
  { id: 11, question: "How many bones are in the human body?", options: ["186", "206", "226", "246"], correctAnswer: 1 },
  { id: 12, question: "What is the freezing point of water?", options: ["0°C", "-10°C", "-40°C", "10°C"], correctAnswer: 0 },
  { id: 13, question: "Which gas do we breathe out?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correctAnswer: 2 },
  { id: 14, question: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Uranus"], correctAnswer: 1 },
  { id: 15, question: "How many chambers does the human heart have?", options: ["2", "3", "4", "5"], correctAnswer: 2 },
  { id: 16, question: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Diribonucleic Acid", "Deoxyribose Nucleic Atom", "Deoxyribonucleic Atom"], correctAnswer: 0 },
  { id: 17, question: "What is the smallest planet in our solar system?", options: ["Mercury", "Venus", "Earth", "Mars"], correctAnswer: 0 },
  { id: 18, question: "How many valves does the human heart have?", options: ["2", "3", "4", "5"], correctAnswer: 2 },
  { id: 19, question: "What element has the atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Beryllium"], correctAnswer: 1 },
  { id: 20, question: "What is the process by which plants make their own food?", options: ["Respiration", "Photosynthesis", "Fermentation", "Decomposition"], correctAnswer: 1 },
];

const csQuestions = [
  { id: 1, question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"], correctAnswer: 0 },
  { id: 2, question: "Which of the following is not a programming language?", options: ["Python", "Java", "HTML", "C++"], correctAnswer: 2 },
  { id: 3, question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], correctAnswer: 1 },
  { id: 4, question: "Which data structure follows LIFO (Last In First Out) principle?", options: ["Queue", "Stack", "Array", "Linked List"], correctAnswer: 1 },
  { id: 5, question: "What does CSS stand for?", options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"], correctAnswer: 2 },
  { id: 6, question: "Which of the following is a high-level programming language?", options: ["Assembly", "Machine Code", "Python", "Binary"], correctAnswer: 2 },
  { id: 7, question: "What does SQL stand for?", options: ["Simple Query Language", "Structured Query Language", "System Query Language", "Standard Query Language"], correctAnswer: 1 },
  { id: 8, question: "Which protocol is used for secure web browsing?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], correctAnswer: 2 },
  { id: 9, question: "What is the purpose of an operating system?", options: ["Run applications", "Manage hardware", "Both A and B", "None of the above"], correctAnswer: 2 },
  { id: 10, question: "Which of the following is not an output device?", options: ["Monitor", "Printer", "Keyboard", "Speaker"], correctAnswer: 2 },
  { id: 11, question: "What does RAM stand for?", options: ["Read-Only Memory", "Random Access Memory", "Rapid Access Memory", "Read Access Memory"], correctAnswer: 1 },
  { id: 12, question: "Which loop executes at least once?", options: ["while loop", "for loop", "do-while loop", "switch loop"], correctAnswer: 2 },
  { id: 13, question: "What is the time complexity of bubble sort?", options: ["O(n)", "O(n log n)", "O(n^2)", "O(1)"], correctAnswer: 2 },
  { id: 14, question: "What does JSON stand for?", options: ["JavaScript Object Notation", "Java Source Object Name", "JavaScript Object Network", "Java Source Object Notation"], correctAnswer: 0 },
  { id: 15, question: "Which of the following is not a web browser?", options: ["Firefox", "Chrome", "Safari", "Windows"], correctAnswer: 3 },
  { id: 16, question: "What is a variable?", options: ["A constant value", "A named storage location", "A function", "A loop"], correctAnswer: 1 },
  { id: 17, question: "What does CPU stand for?", options: ["Central Processing Unit", "Central Program Utility", "Computer Processing Unit", "Central Processor Utility"], correctAnswer: 0 },
  { id: 18, question: "What is the time complexity of linear search?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], correctAnswer: 1 },
  { id: 19, question: "Which language is used for web pages?", options: ["JavaScript", "Python", "Java", "C++"], correctAnswer: 0 },
  { id: 20, question: "What does API stand for?", options: ["Application Programming Interface", "Application Process Interface", "Applied Programming Interface", "Application Processor Interface"], correctAnswer: 0 },
];

const literatureQuestions = [
  { id: 1, question: "Who wrote 'Pride and Prejudice'?", options: ["Emily Brontë", "Jane Austen", "Charlotte Brontë", "George Eliot"], correctAnswer: 1 },
  { id: 2, question: "What is the term for a word that imitates the sound it represents?", options: ["Metaphor", "Onomatopoeia", "Alliteration", "Personification"], correctAnswer: 1 },
  { id: 3, question: "Which Shakespeare play features the characters Romeo and Juliet?", options: ["Hamlet", "Macbeth", "Othello", "Romeo and Juliet"], correctAnswer: 3 },
  { id: 4, question: "What literary device is used when human qualities are given to non-human things?", options: ["Metaphor", "Simile", "Personification", "Hyperbole"], correctAnswer: 2 },
  { id: 5, question: "Who is the author of '1984'?", options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "Margaret Atwood"], correctAnswer: 1 },
  { id: 6, question: "What is the term for a repeated consonant sound at the beginning of words?", options: ["Assonance", "Alliteration", "Consonance", "Rhyme"], correctAnswer: 1 },
  { id: 7, question: "Which novel features the character Jay Gatsby?", options: ["The Great Gatsby", "The Catcher in the Rye", "To Kill a Mockingbird", "Lord of the Flies"], correctAnswer: 0 },
  { id: 8, question: "What is the term for a story within a story?", options: ["Frame narrative", "Flashback", "Foreshadowing", "Irony"], correctAnswer: 0 },
  { id: 9, question: "Who wrote 'The Canterbury Tales'?", options: ["William Shakespeare", "Geoffrey Chaucer", "John Milton", "Edmund Spenser"], correctAnswer: 1 },
  { id: 10, question: "What literary device involves exaggeration for emphasis?", options: ["Understatement", "Litotes", "Hyperbole", "Euphemism"], correctAnswer: 2 },
  { id: 11, question: "Who wrote 'Jane Eyre'?", options: ["Jane Austen", "Charlotte Brontë", "Emily Brontë", "Anne Brontë"], correctAnswer: 1 },
  { id: 12, question: "What is irony?", options: ["Repetition of words", "When something is opposite of what is expected", "A descriptive phrase", "A type of rhyme"], correctAnswer: 1 },
  { id: 13, question: "Who wrote 'Wuthering Heights'?", options: ["Charlotte Brontë", "Emily Brontë", "Jane Austen", "George Eliot"], correctAnswer: 1 },
  { id: 14, question: "What is a metaphor?", options: ["Comparison using 'like' or 'as'", "Direct comparison without using 'like' or 'as'", "Opposite words", "Repeated sounds"], correctAnswer: 1 },
  { id: 15, question: "Who wrote 'The Picture of Dorian Gray'?", options: ["Oscar Wilde", "Charles Dickens", "Thomas Hardy", "George Bernard Shaw"], correctAnswer: 0 },
  { id: 16, question: "What is an allegory?", options: ["A poem", "A story with hidden meanings", "A type of novel", "A speech"], correctAnswer: 1 },
  { id: 17, question: "Who wrote 'Animal Farm'?", options: ["Samuel Beckett", "George Orwell", "Arthur Koestler", "Stephen King"], correctAnswer: 1 },
  { id: 18, question: "What is foreshadowing?", options: ["A flashback", "A hint of something to come", "A plot twist", "The ending"], correctAnswer: 1 },
  { id: 19, question: "Who wrote 'The Great Expectations'?", options: ["Jane Austen", "Charles Dickens", "George Eliot", "Thomas Hardy"], correctAnswer: 1 },
  { id: 20, question: "What is symbolism?", options: ["Using symbols to represent things", "Exaggeration", "Direct comparison", "Opposite meaning"], correctAnswer: 0 },
];

const historyQuestions = [
  { id: 1, question: "In which year did World War II end?", options: ["1944", "1945", "1946", "1947"], correctAnswer: 1 },
  { id: 2, question: "Who was the first President of the United States?", options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"], correctAnswer: 2 },
  { id: 3, question: "Which ancient civilization built the pyramids at Giza?", options: ["Roman", "Greek", "Egyptian", "Mesopotamian"], correctAnswer: 2 },
  { id: 4, question: "The Renaissance began in which country?", options: ["France", "England", "Italy", "Spain"], correctAnswer: 2 },
  { id: 5, question: "Which war was fought between the North and South regions of the United States?", options: ["World War I", "World War II", "Civil War", "Revolutionary War"], correctAnswer: 2 },
  { id: 6, question: "Who was the first emperor of Rome?", options: ["Julius Caesar", "Augustus", "Nero", "Constantine"], correctAnswer: 1 },
  { id: 7, question: "The Industrial Revolution began in which country?", options: ["France", "Germany", "United Kingdom", "United States"], correctAnswer: 2 },
  { id: 8, question: "Which empire was ruled by Genghis Khan?", options: ["Ottoman Empire", "Mongol Empire", "Persian Empire", "Byzantine Empire"], correctAnswer: 1 },
  { id: 9, question: "The Berlin Wall fell in which year?", options: ["1987", "1988", "1989", "1990"], correctAnswer: 2 },
  { id: 10, question: "Who was the first woman to win a Nobel Prize?", options: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace", "Lise Meitner"], correctAnswer: 0 },
  { id: 11, question: "In which year did the Titanic sink?", options: ["1910", "1911", "1912", "1913"], correctAnswer: 2 },
  { id: 12, question: "Who was Napoleon Bonaparte?", options: ["French military leader", "Italian artist", "Spanish explorer", "German philosopher"], correctAnswer: 0 },
  { id: 13, question: "In which year did India gain independence?", options: ["1945", "1947", "1950", "1952"], correctAnswer: 1 },
  { id: 14, question: "Who invented the airplane?", options: ["Thomas Edison", "Alexander Graham Bell", "The Wright brothers", "Nikola Tesla"], correctAnswer: 2 },
  { id: 15, question: "In which year did the American Revolution begin?", options: ["1773", "1774", "1775", "1776"], correctAnswer: 2 },
  { id: 16, question: "Who was Martin Luther King Jr.?", options: ["Civil rights activist", "Religious leader", "Military general", "Political philosopher"], correctAnswer: 0 },
  { id: 17, question: "In which year did World War I end?", options: ["1916", "1917", "1918", "1919"], correctAnswer: 2 },
  { id: 18, question: "Who discovered America?", options: ["Leif Erikson", "Christopher Columbus", "Amerigo Vespucci", "Ferdinand Magellan"], correctAnswer: 1 },
  { id: 19, question: "In which year did the French Revolution begin?", options: ["1787", "1788", "1789", "1790"], correctAnswer: 2 },
  { id: 20, question: "Who was Cleopatra?", options: ["Roman empress", "Egyptian queen", "Greek philosopher", "Persian princess"], correctAnswer: 1 },
];

const exams = [
  {
    id: 1,
    title: "Mathematics Fundamentals",
    description: "Test your knowledge of basic mathematics including algebra, geometry, and arithmetic.",
    duration: 30,
    totalQuestions: 15,
    difficulty: "Medium",
    subject: "Mathematics",
    instructions: "This exam consists of 15 multiple-choice questions. You have 30 minutes to complete it. Each question carries equal marks.",
    questions: getRandomQuestions(mathQuestions, 15)
  },
  {
    id: 2,
    title: "General Science",
    description: "Explore fundamental concepts in physics, chemistry, and biology.",
    duration: 25,
    totalQuestions: 12,
    difficulty: "Easy",
    subject: "Science",
    instructions: "This exam consists of 12 multiple-choice questions covering basic science concepts. You have 25 minutes to complete it.",
    questions: getRandomQuestions(scienceQuestions, 12)
  },
  {
    id: 3,
    title: "Computer Science Basics",
    description: "Test your understanding of fundamental computer science concepts.",
    duration: 35,
    totalQuestions: 18,
    difficulty: "Medium",
    subject: "Computer Science",
    instructions: "This exam consists of 18 multiple-choice questions. You have 35 minutes to complete it. Questions cover programming, algorithms, and computer systems.",
    questions: getRandomQuestions(csQuestions, 18)
  },
  {
    id: 4,
    title: "English Literature",
    description: "Test your knowledge of classic literature and literary devices.",
    duration: 40,
    totalQuestions: 20,
    difficulty: "Hard",
    subject: "English",
    instructions: "This exam consists of 20 multiple-choice questions covering literature from various periods. You have 40 minutes to complete it.",
    questions: getRandomQuestions(literatureQuestions, 20)
  },
  {
    id: 5,
    title: "World History",
    description: "Explore key events and figures that shaped world history.",
    duration: 45,
    totalQuestions: 25,
    difficulty: "Medium",
    subject: "History",
    instructions: "This exam consists of 25 multiple-choice questions covering major historical events and figures. You have 45 minutes to complete it.",
    questions: getRandomQuestions(historyQuestions, 25)
  }
];

export default exams;
