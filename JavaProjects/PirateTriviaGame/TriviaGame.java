package JavaProjects.PirateTriviaGame;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

/**
 *
 */

public class TriviaGame {
    private Question[] questions;
    private String name;
    private String correctOption;

    public TriviaGame(){
        questions = new Question[12];
    }


    /**
     * Description: Prints out greeting, using keyboard input to gather the user's name
     */
    public void printGreeting(){
        Scanner kb = new Scanner(System.in);
        System.out.println("*** Welcome to PIRATE'S BOOTY GEOGRAPHY ***");
        System.out.println("Now pirate, what is your good name?");
        name = kb.nextLine();
        System.out.println("Ahoy " + name + "!\n" +
                "You can earn 50, 100, 200, or 300 Gold \n" +
                "based on the difficulty of the question." +
                "\nWatch out for the Bilge Rat!\n" +
                "Lets get this ship sailing!");
        for (int i = 0; i < 32; i++) {
            System.out.print('-');
        }
        System.out.println();
    }

    /**
     * Description: Reads question, options, correct option, and point value
     *              from triviaQuestions.txt file and creates a Question object
     *              which is added to questions array
     * @throws FileNotFoundException
     */
    public void qReader() throws FileNotFoundException{
        Scanner inF = new Scanner(new File("triviaQuestions.txt"));
        for (int i = 0; i < questions.length; i++) {
            String question = inF.nextLine();
            String a = inF.nextLine();
            String b = inF.nextLine();
            String c = inF.nextLine();
            String d = inF.nextLine();
            correctOption = inF.nextLine();
            int pointValue = inF.nextInt();
            if (inF.hasNextLine()) inF.nextLine();
            Question q = new Question(question, a, b, c, d, correctOption, pointValue);
            questions[i] = q;
        }
    }


    public String getName() {
        return name;
    }

    public Question[] getQuestions() {
        return questions;
    }
}
