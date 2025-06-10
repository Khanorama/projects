package JavaProjects.PirateTriviaGame;

/**
 * Ayaan Khan, Per 8, Denna
 */

public class Question {
    private String question;
    private String a;
    private String b;
    private String c;
    private String d;
    private String correctOption;
    private int pointValue;

    public Question(String question, String a, String b, String c,
                    String d, String correctOption, int pointValue) {
        this.question = question;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.correctOption = correctOption;
        this.pointValue = pointValue;
    }

    /**
     * Description: toString method which neatly formats question and options
     * @return neatly formatted question
     */
    public String toString(){
        String out = question + "\n";
        out += "a) " + a + "\n" + "b) " + b + "\n" + "c) " + c + "\n" + "d) " + d + "\n";
        return out;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public int getPointValue() {
        return pointValue;
    }
}
