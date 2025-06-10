package JavaProjects.PirateTriviaGame;

import java.io.FileNotFoundException;
import java.util.Scanner;

/**
 *
 */

public class TriviaDriver {
    private static int totalGold = 0;
    private static int totalCorrect = 0;
    private static int totalIncorrect = 0;
    private static int streak = 0;
    private static boolean cont = true;

    public static void main(String[] args) throws FileNotFoundException {
        TriviaGame game = new TriviaGame();
        game.printGreeting();
        game.qReader();
        Question[] qArr = game.getQuestions();
        Scanner kb = new Scanner(System.in);
        Question[] arr = new Question[12];
        int index = 0;
        while (cont) {
            String option = "";
            int randIndex = (int) (Math.random() * 12);
            Question q = qArr[randIndex];
            boolean contains = false;
            for (Question qr : arr) {
                if (qr == q) {
                    contains = true;
                    break;
                }
            }
            if (!contains) {
                arr[index] = q;
                index++;
                System.out.println(q);
                System.out.println("Enter your choice (a,b,c,d):");
                option = kb.nextLine();
                if (option.toLowerCase().equals(q.getCorrectOption())){
                    totalCorrect++;
                    streak++;
                    totalGold += q.getPointValue();
                    System.out.println("Ahoy " + game.getName() + "! We struck gold! " + q.getPointValue() +
                            " Gold has been acquired! ");
                }
                else{
                    System.out.println("Aargh " + game.getName() + "! The answer was incorrect! The answer was (" + q.getCorrectOption() + ").");
                    totalIncorrect++;
                    streak = 0;
                }
                System.out.println(
                                "\nTotal Gold:      " + totalGold +
                                "\nTotal Correct:    " + totalCorrect +
                                "\nTotal Incorrect:    " + totalIncorrect +
                                "\nCurrent Streak:      " + streak + "\n"
                );
                if(totalCorrect+totalIncorrect != 12){
                    System.out.println(
                            "Would you like to sail on?\n" +
                                    "(Type yes to continue, no to quit game)"
                    );
                    String contQ = kb.nextLine();
                    if (contQ.toLowerCase().equals("no")){
                        cont = false;
                    }
                }
                else cont = false;
            }
        }
        System.out.println(
                "*** Alas, the voyage is over. Pleasure to sail with you, matey! ***" +
                        "\nTotal Gold:      " + totalGold +
                        "\nTotal Correct:    " + totalCorrect +
                        "\nTotal Incorrect:    " + totalIncorrect +
                        "\nPercent Correct:     " + ((double)totalCorrect/(totalIncorrect+totalCorrect))*100 + "%"
        );
    }
}
