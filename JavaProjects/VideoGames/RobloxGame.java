package JavaProjects.VideoGames;/*
Aayan Syed, Ayaan Khan
Denna
Period: 8

Functions as a generic Roblox game
 */

import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class RobloxGame extends VideoGame {
    private int serverLatency;

    /**
     * Description: Constructs a Roblox game and automatically sets the title and rules
     * @param numPlayers Number of players the game has
     * @param currency The amount of currency the player starts with
     */
    public RobloxGame(int numPlayers, int currency) {
        super("Untitled Roblox game", numPlayers, currency);
        serverLatency = (int) (Math.random() * 200) + 20;
    }

    /**
     * Description: Constructs a Roblox game and sets the name, rules, numPlayers, and currency
     * @param name Name of the game
     * @param numPlayers Number of players the game has
     * @param currency The amount of currency the player starts with
     * @param rules The rules of the game
     */
    public RobloxGame(String name, String rules, int numPlayers, int currency) {
        super(name, rules, numPlayers, currency);
        serverLatency = (int) (Math.random() * 200) + 20;
    }

    @Override
    /**
     * Description: Returns a string with the currency in robux
     * @return A string with the currency in robux
     */
    public String listCurrency() {
        return getCurrency() + " robux.";
    }

    @Override
    /**
     * Description: Returns a string with information about the game
     * @return A string which lists the name, rules, number of players,
     *          and currency the player has. In addition, prints that
     *          it is a roblox game and the latency.
     */
    public String toString() {
        return super.toString() + "\nThis is a Roblox Game. The ping is " +
                serverLatency + "ms.";
    }

    /**
     * Description: Starts the game by loading it in, displaying a warning method about the
     *              latency, and then calling the menuLoader() function, which loads up a
     *              menu
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void startGame() throws InterruptedException {
        super.startGame();
        System.out.println(toString());
        if (serverLatency > 200) {
            System.out.println("Warning: The game might not play that well." +
                    " Consider moving closer to your router, or changing your" +
                    " WiFi connection.");
        } else if (serverLatency > 150) {
            System.out.println("WARNING, your connection is unstable." +
                    " Consider moving closer to your router, or changing your" +
                    " WiFi connection.");
        } else if (serverLatency > 100) {
            System.out.println("WARNING, your connection is slightly unstable.");
        }

        System.out.println("Starting " + getName() + "...");
        menuLoader();
    }

    /**
     * Description: Displays a message about loading the menu and then calls the genericRobloxMenu() function, which brings up a menu about the roblox game
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void menuLoader() throws InterruptedException {
        System.out.println("Loading menu...");
        TimeUnit.SECONDS.sleep(2);
        System.out.println("Loaded!");
        genericRobloxMenu();
    }

    /**
     * Description: Displays a menu until the user quits that lets the user do certain actions by selecting them
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void genericRobloxMenu() throws InterruptedException {
        final int HELP = 1;
        final int LIST = 2;
        final int FIGHT = 3;
        final int EXPLORE = 4;
        final int QUIT = 5;

        Scanner kb = new Scanner(System.in);

        int choice = 0;
        while (choice != QUIT) {
            System.out.println("Controls: \n Type 1 to list the information of the game presented at the beginning"
                    + "\n Type 2 to list your stats \n Type 3 to go fight a tourney \n Type 4 to explore \n Type 5 to quit");

            choice = validateInput(kb, 5);
            if (choice == HELP) {

                System.out.println(toString());

            } else if (choice == LIST) {
                System.out.println(serverLatency + "ms ping\n" + getName() + " is the name of the game." + "\nYou have " + getCurrency() + " currency units.");
            } else if (choice == FIGHT) {
                System.out.println("Unable to fight in " + getName());
            } else if (choice == EXPLORE) {
                System.out.println("Unable to explore in " + getName());
            }


        }
        System.out.println("Exiting " + getName() + "...\n");
        TimeUnit.SECONDS.sleep(3);

    }

}
