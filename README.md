# Projects

In this repository, you can find all of the projects that I have worked on over the years.

| Project | What it is | Built with |
|---|---|---|
| [PathFinder](PathFinder) | Web app that finds real local volunteer and internship opportunities for students, ranks them with AI, and drafts outreach emails in one click | React, FastAPI (Python), OpenAI API |
| [Country Trivia](JS_Projects/APCSPptproject.html) | AP Computer Science Principles project: a browser quiz on countries with easy and hard modes, hints, and a results screen | HTML, CSS, JavaScript |
| [Pirate Trivia Game](JavaProjects/PirateTriviaGame) | Pirate-themed geography quiz that loads multiple-choice questions from a file and awards gold by difficulty | Java |
| [TicketMaster](JavaProjects/TicketMasterProject) | Console app that loads a list of concerts from a file, then sorts them by name or price and searches by city | Java |
| [Video Games](JavaProjects/VideoGames) | Interactive console games built on a class hierarchy (`VideoGame` → `RobloxGame` → `Deepwoken`, and `Minecraft`) to practise inheritance and polymorphism | Java |

## Running the projects

**PathFinder:** see [PathFinder/README.md](PathFinder/README.md).

**Country Trivia:** open `JS_Projects/APCSPptproject.html` in a browser.

**Java projects:** run from the top of this repository, because the programs read
`triviaQuestions.txt` and `UpdatedTicketListWithNewShows.txt` from here:

```bash
javac -d out JavaProjects/TicketMasterProject/*.java
java -cp out JavaProjects.TicketMasterProject.TicketMasterDriver
```

Swap in `PirateTriviaGame` / `TriviaDriver` or `VideoGames` / `VideoGameTester`
to run the others.
