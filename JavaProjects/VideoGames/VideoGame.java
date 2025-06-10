package JavaProjects.VideoGames;/*
Aayan Syed, Ayaan Khan
Denna
Period: 8

Superclass to all VideoGame objects
 */

import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class VideoGame{

    private String name;
    private String rules;
    private int numPlayers;
    private int currency;

    /**
     * Description: Constructor with the name of the game, the number of players, and the currency. Sets the rules to a default.
     * @param name Name of the game
     * @param numPlayers Number of players the game has
     * @param currency The amount of currency the player starts with
     */
    public VideoGame(String name, int numPlayers, int currency) {
        this.name = name;
        this.rules = "Just don't cheat :)";
        this.numPlayers = numPlayers;
        this.currency = currency;
    }

    /**
     * Description: Constructor with the name of the game, the rules of the game, the number of players, and the currency.
     * @param name Name of the game
     * @param numPlayers Number of players the game has
     * @param currency The amount of currency the player starts with
     * @param rules The rules of the game
     */
    public VideoGame(String name, String rules, int numPlayers, int currency) {
        this.name = name;
        this.rules = rules;
        this.numPlayers = numPlayers;
        this.currency = currency;
    }


    /**
     * Description: Prints a description of the game
     * @return A string which lists the name, rules, number of players,
     *          and currency the player has
     */
    public String toString(){
        return "You are playing a session of " + name +
                ". Here are the rules: \n" + rules +
                "\n You are playing with " + numPlayers +
                " players and you have " + listCurrency()
                ;
    }

    /**
     * Description: Lists the currency with units
     * @return A string with currency in units
     */
    public String listCurrency() {
        return currency+ "units of currency.";}

    /**
     * Description: Sets the currency
     * @param currency the new currency to set the old currency to
     */
    public void setCurrency(int currency) {
        this.currency = currency;}

    /**
     * Description: Returns the currency
     * @return The currency
     */
    public int getCurrency() {
        return currency;}

    /**
     * Description: Starts the game. In this version it just loads in the game
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void startGame() throws InterruptedException {
        System.out.println("Loading " + name + "...");
        TimeUnit.SECONDS.sleep(3);
        if (Math.random() * 2 > .5){

            System.out.println(name + " has successfully loaded.\n");
            TimeUnit.SECONDS.sleep(1);
        }
        else {
            System.out.println("An error occured. Trying again...");
            TimeUnit.SECONDS.sleep(3);
        }
    }

    /**
     * Description: Returns the name of the game
     * @return The name of the game
     */
    public String getName() {
        return name;
    }

    /**
     * Description: Method which is used to validate user input and gets a valid integer as user input in range 1-lastNum inclusive
     * @param kb A scanner used to gather user input
     * @param lastNum The last integer that can be accepted as input inclusive
     * @return A valid user input given the parameters
     */
    public int validateInput(Scanner kb, int lastNum){
        int input = 0;
        boolean complete = true;
        while (complete) {
            try {
                input = kb.nextInt();
                if (input >= 1 && input <= lastNum) {
                    complete = false;

                } else {
                    System.out.println("Enter an integer value 1-"+lastNum+" (Your response was not between those)");
                }
            } catch (Exception e) {
                System.out.println("Enter an INTEGER value between 1-4");
                kb.nextLine();
            }

        }
        return input;
    }


}
