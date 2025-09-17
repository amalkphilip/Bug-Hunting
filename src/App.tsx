import React, { useState, useEffect } from 'react';
import { Play, Code, Clock, Bug, Trophy, RotateCcw, CheckCircle, XCircle, Send, Edit3 } from 'lucide-react';

// Single intermediate question with multiple bugs
const gameQuestion = {
  python: {
    id: 1,
    title: "E-commerce Order Processing System",
    code: `import json
import datetime

class OrderProcessor:
    def __init__(self):
        self.orders = []
        self.inventory = {}
    
    def add_product(self, product_id, quantity, price):
        if product_id == None:  # Bug 1: should use 'is None'
            return False
        
        self.inventory[product_id] = {
            'quantity': quantity,
            'price': price,
            'last_updated': datetime.now()
        }
        return True
    
    def process_order(self, customer_id, items):
        if not items:
            return None
        
        total_cost = 0
        order_items = []
        
        for item in items:
            product_id = item['product_id']
            requested_qty = item['quantity']
            
            if product_id not in self.inventory:  # Bug 2: should check before accessing
                continue
            
            available_qty = self.inventory[product_id]['quantity']
            if requested_qty > available_qty:
                requested_qty = available_qty  # Bug 3: should handle insufficient stock properly
            
            item_cost = requested_qty * self.inventory[product_id]['price']
            total_cost += item_cost
            
            order_items.append({
                'product_id': product_id,
                'quantity': requested_qty,
                'unit_price': self.inventory[product_id]['price'],
                'total_price': item_cost
            })
            
            # Update inventory
            self.inventory[product_id]['quantity'] -= requested_qty
    
        order = {
            'order_id': len(self.orders) + 1,  # Bug 4: not thread-safe ID generation
            'customer_id': customer_id,
            'items': order_items,
            'total_cost': total_cost,
            'status': 'pending',
            'created_at': datetime.now()
        }
        
        self.orders.append(order)
        return order
    
    def get_order_history(self, customer_id):
        customer_orders = []
        for order in self.orders:
            if order['customer_id'] == customer_id:
                customer_orders.append(order)
        
        return customer_orders  # Bug 5: should return copy to prevent modification
    
    def calculate_discount(self, order_total, customer_type):
        discount = 0
        if customer_type == 'premium':
            discount = order_total * 0.1
        elif customer_type == 'vip':
            discount = order_total * 0.15
        
        return order_total - discount  # Bug 6: should return discount amount, not final price
    
    def save_orders_to_file(self, filename):
        try:
            with open(filename, 'w') as f:
                json.dump(self.orders, f)  # Bug 7: datetime objects not JSON serializable
        except Exception as e:
            print(f"Error saving orders: {e}")
            return False
        return True`,
    bugs: [
      { line: 14, description: "Should use 'is None' instead of '== None' for None comparison" },
      { line: 33, description: "Should check if product exists before accessing inventory details" },
      { line: 38, description: "Should properly handle insufficient stock (return error or partial fulfillment)" },
      { line: 54, description: "Order ID generation is not thread-safe, could cause duplicate IDs" },
      { line: 70, description: "Should return a copy of orders to prevent external modification" },
      { line: 79, description: "Should return discount amount, not the final discounted price" },
      { line: 84, description: "datetime objects are not JSON serializable, need custom encoder" }
    ],
    difficulty: "Intermediate"
  },
  java: {
    id: 1,
    title: "Multi-threaded Bank Account System",
    code: `import java.io.*;
import java.util.*;
import java.util.concurrent.*;
import java.math.BigDecimal;

public class BankAccount {
    private String accountNumber;
    private BigDecimal balance;  // Bug 1: not volatile for thread safety
    private List<String> transactionHistory;
    private static int nextAccountNumber = 1000;  // Bug 2: not thread-safe
    
    public BankAccount(String customerName, BigDecimal initialBalance) {
        this.accountNumber = String.valueOf(nextAccountNumber++);
        this.balance = initialBalance;
        this.transactionHistory = new ArrayList<>();
    }
    
    public boolean withdraw(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        
        if (balance.compareTo(amount) >= 0) {  // Bug 3: race condition in balance check
            balance = balance.subtract(amount);
            transactionHistory.add("WITHDRAW: " + amount);
            return true;
        }
        
        return false;
    }
    
    public void deposit(BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
            balance = balance.add(amount);  // Bug 4: not atomic operation
            transactionHistory.add("DEPOSIT: " + amount);
        }
    }
    
    public BigDecimal getBalance() {
        return balance;  // Bug 5: should return copy to prevent external modification
    }
    
    public List<String> getTransactionHistory() {
        return transactionHistory;  // Bug 6: returns mutable reference
    }
    
    public boolean transfer(BankAccount targetAccount, BigDecimal amount) {
        if (this.withdraw(amount)) {  // Bug 7: potential deadlock with concurrent transfers
            targetAccount.deposit(amount);
            return true;
        }
        return false;
    }
    
    public void saveAccountData(String filename) throws IOException {
        FileWriter writer = new FileWriter(filename);  // Bug 8: resource not closed properly
        writer.write("Account: " + accountNumber + "\\n");
        writer.write("Balance: " + balance + "\\n");
        
        for (String transaction : transactionHistory) {
            writer.write(transaction + "\\n");
        }
    }
    
    public static void main(String[] args) {
        BankAccount account1 = new BankAccount("John", new BigDecimal("1000"));
        BankAccount account2 = new BankAccount("Jane", new BigDecimal("500"));
        
        // Simulate concurrent operations
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        for (int i = 0; i < 100; i++) {
            executor.submit(() -> {
                account1.withdraw(new BigDecimal("10"));
                account2.deposit(new BigDecimal("5"));
            });
        }
        
        executor.shutdown();  // Bug 9: doesn't wait for tasks to complete
        System.out.println("Final balance: " + account1.getBalance());
    }
}`,
    bugs: [
      { line: 8, description: "Balance should be volatile or use AtomicReference for thread safety" },
      { line: 9, description: "Static nextAccountNumber is not thread-safe, should use AtomicInteger" },
      { line: 20, description: "Race condition: balance check and withdrawal should be atomic" },
      { line: 28, description: "Balance addition is not atomic, multiple threads can cause data corruption" },
      { line: 34, description: "Should return new BigDecimal(balance.toString()) to prevent external modification" },
      { line: 38, description: "Should return Collections.unmodifiableList() or new ArrayList<>()" },
      { line: 42, description: "Potential deadlock if two threads transfer between same accounts simultaneously" },
      { line: 49, description: "FileWriter should be closed in try-with-resources or finally block" },
      { line: 67, description: "Should call executor.awaitTermination() to wait for tasks completion" }
    ],
    difficulty: "Intermediate"
  },
  c: {
    id: 1,
    title: "Dynamic Memory Management System",
    code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
    int id;
    char* name;
    int* scores;
    int score_count;
} Student;

Student* create_student(int id, const char* name, int score_count) {
    Student* student = malloc(sizeof(Student));  // Bug 1: no null check
    
    student->id = id;
    student->name = malloc(strlen(name) + 1);  // Bug 2: no null check
    strcpy(student->name, name);
    
    student->scores = malloc(score_count * sizeof(int));  // Bug 3: no null check
    student->score_count = score_count;
    
    return student;
}

void add_score(Student* student, int index, int score) {
    if (student == NULL) return;
    
    if (index >= 0 && index < student->score_count) {
        student->scores[index] = score;
    }  // Bug 4: no handling for invalid index
}

double calculate_average(Student* student) {
    if (student == NULL || student->scores == NULL) {
        return 0.0;
    }
    
    int sum = 0;
    for (int i = 0; i < student->score_count; i++) {
        sum += student->scores[i];  // Bug 5: potential use of uninitialized values
    }
    
    return sum / student->score_count;  // Bug 6: integer division instead of float
}

char* get_student_info(Student* student) {
    if (student == NULL) return NULL;
    
    char* info = malloc(256);  // Bug 7: fixed size, potential overflow
    sprintf(info, "ID: %d, Name: %s, Average: %.2f", 
            student->id, student->name, calculate_average(student));
    
    return info;
}

void free_student(Student* student) {
    if (student != NULL) {
        free(student->name);
        free(student->scores);
        free(student);  // Bug 8: should set pointer to NULL after freeing
    }
}

Student** create_class(int class_size) {
    Student** students = malloc(class_size * sizeof(Student*));
    
    for (int i = 0; i < class_size; i++) {
        students[i] = NULL;  // Initialize to NULL
    }
    
    return students;  // Bug 9: no null check for malloc
}

void print_class_report(Student** students, int class_size) {
    printf("Class Report:\\n");
    printf("=============\\n");
    
    for (int i = 0; i < class_size; i++) {
        if (students[i] != NULL) {
            char* info = get_student_info(students[i]);
            printf("%s\\n", info);
            // Bug 10: memory leak - info not freed
        }
    }
}

int main() {
    Student** class = create_class(3);
    
    class[0] = create_student(1, "Alice", 3);
    class[1] = create_student(2, "Bob", 3);
    class[2] = create_student(3, "Charlie", 3);
    
    // Add some scores
    add_score(class[0], 0, 85);
    add_score(class[0], 1, 92);
    add_score(class[0], 2, 78);
    
    add_score(class[1], 0, 90);
    add_score(class[1], 1, 88);
    add_score(class[1], 2, 95);
    
    print_class_report(class, 3);
    
    // Cleanup
    for (int i = 0; i < 3; i++) {
        free_student(class[i]);
    }
    free(class);
    
    return 0;
}

int count_words(char* text) {
    int count = 0;
    char* token = strtok(text, " ");  // Bug 3: modifies original string
    
    while (token != NULL) {
        count++;
        token = strtok(NULL, " ");
    }
    
    return count;
}

int main() {
    char input[] = "Hello World Programming";
    char* reversed = reverse_string(input);
    
    printf("Original: %s\\n", input);
    printf("Reversed: %s\\n", reversed);
    printf("Word count: %d\\n", count_words(input));  // Bug 4: input modified by strtok
    
    return 0;  // Bug 5: memory leak - reversed not freed
}`,
    bugs: [
      { line: 11, description: "Should check if malloc returns NULL before using student pointer" },
      { line: 14, description: "Should check if malloc returns NULL before using name pointer" },
      { line: 17, description: "Should check if malloc returns NULL before using scores pointer" },
      { line: 26, description: "Should handle invalid index case (print error or return error code)" },
      { line: 35, description: "Using uninitialized values from scores array, should initialize to 0" },
      { line: 38, description: "Integer division loses precision, should cast to double" },
      { line: 43, description: "Fixed buffer size can cause overflow, should use snprintf or dynamic sizing" },
      { line: 52, description: "Should set student pointer to NULL after freeing to prevent double-free" },
      { line: 58, description: "Should check if malloc returns NULL before using students array" },
      { line: 71, description: "Memory leak: info string from get_student_info() is never freed" }
    ],
    difficulty: "Intermediate"
  }
};

type Language = 'python' | 'java' | 'c';
type GameState = 'language-select' | 'playing' | 'review' | 'finished';

interface Bug {
  line: number;
  description: string;
}

interface CodeSnippet {
  id: number;
  title: string;
  code: string;
  bugs: Bug[];
  difficulty: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState>('language-select');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [score, setScore] = useState(0);
  const [selectedBugs, setSelectedBugs] = useState<number[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [clickedLines, setClickedLines] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = selectedLanguage ? gameQuestion[selectedLanguage] : null;

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && gameState === 'playing' && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleSubmit();
    }
  }, [timeLeft, gameStarted, gameState, submitted]);

  const selectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    setGameState('playing');
  };

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameState('language-select');
    setSelectedLanguage(null);
    setTimeLeft(180);
    setScore(0);
    setSelectedBugs([]);
    setGameStarted(false);
    setClickedLines(new Set());
    setSubmitted(false);
    setShowResults(false);
  };

  const handleLineClick = (lineNumber: number) => {
    if (!currentQuestion || submitted) return;

    const newClickedLines = new Set(clickedLines);
    const newSelectedBugs = [...selectedBugs];

    if (clickedLines.has(lineNumber)) {
      // Remove selection
      newClickedLines.delete(lineNumber);
      const index = selectedBugs.indexOf(lineNumber);
      if (index > -1) {
        newSelectedBugs.splice(index, 1);
      }
    } else {
      // Add selection
      newClickedLines.add(lineNumber);
      newSelectedBugs.push(lineNumber);
    }

    setClickedLines(newClickedLines);
    setSelectedBugs(newSelectedBugs);
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;

    setSubmitted(true);
    
    // Calculate score
    let correctCount = 0;
    const actualBugLines = currentQuestion.bugs.map(b => b.line);
    
    selectedBugs.forEach(line => {
      if (actualBugLines.includes(line)) {
        correctCount++;
      }
    });

    const newScore = correctCount * 20; // 20 points per correct bug
    setScore(newScore);
    setShowResults(true);
    
    setTimeout(() => {
      setGameState('finished');
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCodeLine = (line: string, index: number) => {
    const lineNumber = index + 1;
    const hasBug = currentQuestion?.bugs.some(b => b.line === lineNumber);
    const isSelected = clickedLines.has(lineNumber);
    const isCorrect = submitted && hasBug && isSelected;
    const isIncorrect = submitted && !hasBug && isSelected;
    const isMissed = submitted && hasBug && !isSelected;

    return (
      <div
        key={index}
        className={`flex items-start space-x-3 p-2 rounded cursor-pointer transition-all duration-200 ${
          submitted ? 
            (isCorrect ? 'bg-green-900/30 border-l-4 border-green-500' :
             isIncorrect ? 'bg-red-900/30 border-l-4 border-red-500' :
             isMissed ? 'bg-yellow-900/30 border-l-4 border-yellow-500' :
             'hover:bg-gray-700') :
            (isSelected ? 'bg-blue-900/30 border-l-4 border-blue-500' : 'hover:bg-gray-700')
        }`}
        onClick={() => handleLineClick(lineNumber)}
      >
        <span className="text-gray-500 text-sm w-8 text-right select-none">{lineNumber}</span>
        <pre className="text-gray-300 text-sm font-mono flex-1 overflow-x-auto">{line}</pre>
        {submitted && isCorrect && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
        {submitted && isIncorrect && <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
        {submitted && isMissed && <div className="w-4 h-4 bg-yellow-500 rounded-full mt-0.5" />}
        {!submitted && isSelected && <Edit3 className="w-4 h-4 text-blue-400 mt-0.5" />}
      </div>
    );
  };

  if (gameState === 'language-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Bug Hunter Challenge</h1>
            <p className="text-gray-300">Choose your programming language for an intermediate debugging challenge!</p>
          </div>

          <div className="space-y-4">
            {[
              { lang: 'python' as Language, name: 'Python', icon: '🐍', color: 'from-blue-500 to-green-500' },
              { lang: 'java' as Language, name: 'Java', icon: '☕', color: 'from-orange-500 to-red-500' },
              { lang: 'c' as Language, name: 'C', icon: '⚡', color: 'from-gray-500 to-blue-500' }
            ].map(({ lang, name, icon, color }) => (
              <button
                key={lang}
                onClick={() => selectLanguage(lang)}
                className={`w-full p-4 bg-gradient-to-r ${color} rounded-lg text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-3`}
              >
                <span className="text-2xl">{icon}</span>
                <span>{name}</span>
                <Code className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="mt-8 text-center text-gray-400">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-4 h-4" />
              <span>3 minutes to identify all bugs</span>
            </div>
            <div className="text-sm">
              <p>• Click lines to select/deselect bugs</p>
              <p>• Modify your choices before submitting</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const progress = ((180 - timeLeft) / 180) * 100;
    const actualBugLines = currentQuestion?.bugs.map(b => b.line) || [];
    const correctSelections = selectedBugs.filter(line => actualBugLines.includes(line)).length;
    const totalBugs = currentQuestion?.bugs.length || 0;

    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bug className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">Bug Hunter - {selectedLanguage?.toUpperCase()}</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{score} pts</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-500' : 'text-blue-400'}`} />
                <span className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-500' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {!gameStarted && (
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeLeft < 60 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {currentQuestion && gameStarted && (
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Code Panel */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="bg-gray-700 px-4 py-3 rounded-t-lg flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{currentQuestion.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-900 text-yellow-300">
                        {currentQuestion.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {selectedBugs.length} lines selected
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-900">
                    <div className="space-y-1">
                      {currentQuestion.code.split('\n').map((line, index) => 
                        renderCodeLine(line, index)
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={handleSubmit}
                    disabled={submitted || selectedBugs.length === 0}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 mx-auto ${
                      submitted || selectedBugs.length === 0
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>{submitted ? 'Submitted!' : 'Submit Answer'}</span>
                  </button>
                </div>
              </div>

              {/* Info Panel */}
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold mb-3 text-blue-400">Instructions</h4>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Click lines you think contain bugs</li>
                    <li>• Click again to deselect a line</li>
                    <li>• Blue highlight = currently selected</li>
                    <li>• You can modify choices before submitting</li>
                    <li>• Submit when you're confident!</li>
                  </ul>
                </div>

                {/* Current Selections */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold mb-3 text-purple-400">Selected Lines</h4>
                  {selectedBugs.length > 0 ? (
                    <div className="space-y-1">
                      {selectedBugs.sort((a, b) => a - b).map(line => (
                        <div key={line} className="flex items-center justify-between text-sm">
                          <span className="text-blue-300">Line {line}</span>
                          <button
                            onClick={() => handleLineClick(line)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No lines selected yet</p>
                  )}
                </div>

                {/* Results Preview */}
                {showResults && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold mb-3 text-green-400">Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Correct bugs found:</span>
                        <span className="text-green-400">{correctSelections}/{totalBugs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score earned:</span>
                        <span className="text-yellow-400">{score} points</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legend */}
                {submitted && (
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <h4 className="font-semibold mb-3">Legend</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Correct bug found</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Incorrect selection</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <span>Missed bug</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!gameStarted && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-4">Ready for the Challenge?</h2>
              <p className="text-gray-400 mb-6">You'll have 3 minutes to identify all bugs in this intermediate-level code!</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'finished') {
    const totalPossibleScore = currentQuestion ? currentQuestion.bugs.length * 20 : 0;
    const percentage = totalPossibleScore > 0 ? Math.round((score / totalPossibleScore) * 100) : 0;
    const actualBugLines = currentQuestion?.bugs.map(b => b.line) || [];
    const correctSelections = selectedBugs.filter(line => actualBugLines.includes(line)).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-gray-700 text-center">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className="text-gray-300">Here's your debugging performance</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">{score}</div>
              <div className="text-gray-300">Total Score</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-lg font-bold text-green-400">{correctSelections}/{currentQuestion?.bugs.length || 0}</div>
                <div className="text-xs text-gray-400">Bugs Found</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="text-lg font-bold text-blue-400">{percentage}%</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="text-lg font-bold text-purple-400">{selectedLanguage?.toUpperCase()}</div>
              <div className="text-xs text-gray-400">Language Mastered</div>
            </div>
          </div>

          {/* Bug Details */}
          {currentQuestion && (
            <div className="mb-6 text-left">
              <h4 className="font-semibold mb-3 text-center">Bug Details:</h4>
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {currentQuestion.bugs.map((bug, index) => (
                  <div key={index} className={`p-2 rounded ${
                    selectedBugs.includes(bug.line) ? 'bg-green-900/30' : 'bg-red-900/30'
                  }`}>
                    <div className="font-medium">Line {bug.line} {selectedBugs.includes(bug.line) ? '✓' : '✗'}</div>
                    <div className="text-gray-400">{bug.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={resetGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Try Another Challenge</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default App;