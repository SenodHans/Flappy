# 🪜 Puzzle Ladder Climb Game

A math puzzle game that integrates with the Heart Game API. Players solve mathematical puzzles to climb a virtual ladder, reaching the top to win!

## 🎮 Game Overview

**Objective**: Solve 10 math puzzles correctly to climb from the bottom to the top of the ladder.

**Gameplay**:
- Each correct answer moves you up one step
- Wrong answers keep you at the current step but you get a new puzzle
- Reach step 10 to win the game
- Score is calculated based on your performance and accuracy

## 🏗️ Architecture & Assignment Requirements

This project demonstrates all four required themes:

### 1️⃣ Software Design Principles (Low Coupling & High Cohesion)

**Modular Architecture**:
- **EventBus.js**: Central event communication system
- **APIService.js**: Handles all external API communication
- **PlayerProfile.js**: Manages player data and statistics
- **UIManager.js**: Handles all UI updates and DOM manipulation
- **GameController.js**: Orchestrates game logic and state
- **main.js**: Application entry point and initialization

**Low Coupling**:
- Modules communicate through events, not direct function calls
- No module directly depends on another module's implementation
- Easy to modify or replace individual modules

**High Cohesion**:
- Each module has a single, well-defined responsibility
- Related functionality is grouped together
- Clear separation of concerns

### 2️⃣ Event-Driven Programming

**Event System**:
- Custom EventBus implementation for publish-subscribe pattern
- All inter-module communication happens through events
- No tight coupling between components

**Key Events**:
- `game:started` - Game initialization
- `game:step:changed` - Player moves up/down ladder
- `game:answer:correct` - Correct answer submitted
- `game:answer:wrong` - Wrong answer submitted
- `game:victory` - Player wins the game
- `puzzle:loaded` - New puzzle fetched from API
- `player:stats:updated` - Player statistics updated
- `achievement:unlocked` - Achievement earned
- `api:request:start/success/error` - API communication events

### 3️⃣ Interoperability

**External API Integration**:
- Integrates with Heart Game API (https://marcconrad.com/uob/heart/api.php)
- Supports multiple response formats (JSON, CSV)
- Error handling and fallback mechanisms
- Image preloading for smooth gameplay

**Data Persistence**:
- localStorage for player profiles and statistics
- JSON data format for easy interoperability
- Can be extended to integrate with backend APIs

**Cross-Platform**:
- Pure HTML/CSS/JavaScript (runs in any modern browser)
- No external dependencies or frameworks required
- Responsive design for desktop and mobile

### 4️⃣ Virtual Identity

**Player Profile System**:
- Unique player usernames
- Persistent identity across game sessions
- Comprehensive statistics tracking

**Tracked Statistics**:
- Games played and won
- Total attempts and correct answers
- Best score and fastest win
- Win streaks (current and longest)
- Accuracy percentage
- Game history (last 10 games)

**Achievement System**:
- First Victory
- Speed Climber (fastest win)
- High Scorer (best score)
- Dedicated Player (10+ games)
- Champion (5+ wins)
- On Fire (3 game win streak)
- Perfectionist (90%+ accuracy)

## 📁 Project Structure

```
puzzle-ladder-climb/
├── index.html              # Main HTML structure
├── styles.css              # All styling and animations
├── js/
│   ├── EventBus.js        # Event system implementation
│   ├── APIService.js      # Heart API integration
│   ├── PlayerProfile.js   # Player identity & stats
│   ├── UIManager.js       # UI updates & DOM manipulation
│   ├── GameController.js  # Game logic & state management
│   └── main.js            # Application entry point
└── README.md              # This file
```

## 🚀 How to Run

1. **Simple Method**: Open `index.html` in a web browser
2. **Local Server** (recommended for API calls):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Navigate to `http://localhost:8000` in your browser

## 🎯 How to Play

1. **Enter Username**: Type your username on the login screen
2. **Start Game**: Click "Start Climbing" to begin
3. **Solve Puzzles**: Look at the puzzle image and determine the hidden number
4. **Submit Answer**: Enter a number (0-9) and click "Submit Answer"
5. **Climb the Ladder**: Correct answers move you up, wrong answers give you a new puzzle
6. **Win**: Reach the top (step 10) to complete the game!

## 🔧 Technical Details

**Technologies Used**:
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Heart Game API
- localStorage API

**Browser Compatibility**:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

**No Dependencies**:
- No npm packages required
- No build process needed
- Pure vanilla JavaScript

## 📊 Code Quality Features

- **Clean Code**: Well-commented and documented
- **Error Handling**: Comprehensive try-catch blocks
- **Validation**: Input validation and sanitization
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Semantic HTML and ARIA labels
- **Performance**: Efficient event handling and DOM updates

## 🎓 Educational Value

This project demonstrates:
- Modern JavaScript patterns (ES6+, async/await, Promises)
- Object-oriented programming principles
- Event-driven architecture
- API integration and error handling
- State management
- Local storage and data persistence
- Responsive web design
- User experience (UX) design

## 📝 Assignment Compliance

✅ **Software Design Principles**: Modular architecture with low coupling and high cohesion  
✅ **Event-Driven Programming**: Custom EventBus with publish-subscribe pattern  
✅ **Interoperability**: Heart API integration, localStorage, JSON data format  
✅ **Virtual Identity**: Player profiles, statistics, achievements, persistent identity  

## 🔮 Future Enhancements

Possible improvements:
- Multiplayer mode with leaderboards
- Different difficulty levels
- Timed challenges
- More puzzle types
- Sound effects and music
- Social sharing features
- Backend API for global leaderboards
- Progressive Web App (PWA) support

## 👨‍💻 Development Notes

**Key Design Decisions**:
1. **No Framework**: Pure vanilla JS to demonstrate core concepts
2. **Singleton Pattern**: Single instances of service modules
3. **Event-Driven**: Loose coupling through events
4. **Separation of Concerns**: Each module has one responsibility
5. **Progressive Enhancement**: Works without API (fallback puzzles)

## 📄 License

This project is created for educational purposes as part of a university assignment.

---

**Created with ❤️ for learning software design principles**
