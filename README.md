# Projects

In this repository, you can find all of the projects that I have worked on over the years.

| Project | What it is | Built with |
|---|---|---|
| [PathFinder](PathFinder) | Team project (4 people): a web app that finds real local volunteer and internship opportunities for students, ranks them with AI, and drafts outreach emails in one click. I built the backend (web search, scraping and AI) and have kept developing it since | React, FastAPI (Python), OpenAI API |
| [SnapCook](SnapCook) | Mobile app that detects ingredients in a photo and suggests healthy recipes you can make with them, plus an AI chef chat ([demo video](https://www.youtube.com/watch?v=vym1n1f9fgc)) | React Native, Expo, Roboflow, Gemini API |
| [LeafLens](LeafLens) | Team project (3 people): a plant app that identifies plants and detects diseases from a photo, with scan history, plant search, a community feed and a map. I built the AI scan and scan history | React Native, Expo Router, Supabase, Plant.id API |
| [Country Trivia](JS_Projects/APCSPptproject.html) | AP Computer Science Principles project: a browser quiz on countries with easy and hard modes, hints, and a results screen | HTML, CSS, JavaScript |
| [Pirate Trivia Game](JavaProjects/PirateTriviaGame) | Pirate-themed geography quiz that loads multiple-choice questions from a file and awards gold by difficulty | Java |
| [TicketMaster](JavaProjects/TicketMasterProject) | Console app that loads a list of concerts from a file, then sorts them by name or price and searches by city | Java |
| [Video Games](JavaProjects/VideoGames) | Interactive console games built on a class hierarchy (`VideoGame` → `RobloxGame` → `Deepwoken`, and `Minecraft`) to practise inheritance and polymorphism | Java |

## Running the projects

**PathFinder:** see [PathFinder/README.md](PathFinder/README.md).

**SnapCook:** see [SnapCook/README.md](SnapCook/README.md), or watch the [demo video](https://www.youtube.com/watch?v=vym1n1f9fgc).

**LeafLens:** see [LeafLens/README.md](LeafLens/README.md).

**Country Trivia:** open `JS_Projects/APCSPptproject.html` in a browser.

**Java projects:** run from the top of this repository, because the programs read
`triviaQuestions.txt` and `UpdatedTicketListWithNewShows.txt` from here:

```bash
javac -d out JavaProjects/TicketMasterProject/*.java
java -cp out JavaProjects.TicketMasterProject.TicketMasterDriver
```

Swap in `PirateTriviaGame` / `TriviaDriver` or `VideoGames` / `VideoGameTester`
to run the others.
