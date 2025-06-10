package JavaProjects.VideoGames;/*
Aayan Syed, Ayaan Khan
Denna
Period: 8

Functions as the Deepwoken (Roblox) game
 */

import java.util.ArrayList;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class Deepwoken extends RobloxGame {
    private int rankedMatchesWon;
    private int rankedMatchesPlayed;
    private ArrayList<String> unlockedAreas;
    private int level;
    private int experience;

    /**
     * Description: Constructor that only takes numPlayers and automatically initializes rules,
     * currency, and name. Sets instance variables to a generic value
     * @param numPlayers Number of players playing the game
     */
    public Deepwoken(int numPlayers){
        super("Deepwoken", "Welcome to Deepwoken! Fight tourneys to " +
                "win more matches and explore to level up and get more money!", numPlayers,
                0);
        rankedMatchesPlayed = 0;
        rankedMatchesWon = 0;
        level =1;
        unlockedAreas = new ArrayList<>();
        unlockedAreas.add("Erisia");
        experience = 0;
    }

    @Override
    /**
     * Description: Returns a string with the currency in notes
     * @return A string with currency in notes
     */
    public String listCurrency(){
        return getCurrency() + " notes.";
    }

    @Override
    /**
     * Description: Returns a string with information about the game
     * @return A string which calls super and also prints out how many ranked
     *        matches were won and played and also the level of the player.
     */
    public String toString() {
        return super.toString() + "\nSo far, you have won " +
                rankedMatchesWon + " ranked matches out of " + rankedMatchesPlayed +
                " matches played. You are level " + level +".";
    }

    @Override
    /**
     * Description: Displays a message about loading the menu
     */
    public void menuLoader() throws InterruptedException {
        System.out.println("Loading menu...");
        TimeUnit.SECONDS.sleep(2);
        System.out.println("Loaded!");
    }

    @Override
    /**
     * Starts the game by loading it in, displaying a message about latency (from super) and loading up a menu which
     * allows players to ask for help, list stats, fight tourneys, or explore the world, or quitting
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void startGame() throws InterruptedException {
        super.startGame();
        final int HELP = 1;
        final int LIST = 2;
        final int FIGHT = 3;
        final int EXPLORE = 4;
        final int QUIT = 5;
        Scanner kb = new Scanner(System.in);
        int choice = 0;
        while(choice != QUIT){
            System.out.println("Controls: \n Type 1 to list the information of the game" +
                    " presented at the beginning\n Type 2 to list your stats \n Type 3 to go" +
                    " fight a tourney \n Type 4 to explore \n Type 5 to quit");

            choice = validateInput(kb, 5);
            if(choice == HELP){

                System.out.println(toString());

            }
            else if(choice == LIST){
                System.out.println(rankedMatchesWon + " tourneys won out of " + rankedMatchesPlayed +
                        " tourneys played." + "\nLevel is " + level +".\n You have unlocked " +
                        unlockedAreas.size() + " areas.");
            }
            else if(choice == FIGHT){
                fightTourney();
            }
            else if(choice == EXPLORE){
                explore(kb);
            }
        }
        System.out.println("Saving Game and Exiting...\n");
        TimeUnit.SECONDS.sleep(3);
    }


    /**
     * Description: Runs a simulation of a tourney based on the level of the player and updates variables accordingly
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void fightTourney() throws InterruptedException {
        rankedMatchesPlayed++;
        System.out.println("Queing up a tourney...");
        TimeUnit.SECONDS.sleep(1);
        System.out.println("Match found!");
        TimeUnit.SECONDS.sleep(1);
        System.out.println("Fighting match..");
        TimeUnit.SECONDS.sleep(1);
        int winProbability = ((int) (Math.random() *20) + level);
        if(winProbability > 10){
            System.out.println("You won the match!");
            rankedMatchesWon++;
        }
        else {
            System.out.println("Unfortunately you have lost the match.");
        }
        TimeUnit.SECONDS.sleep(1);
    }

    /**
     * Description: Method to explore to gain experience, level up and gain notes.
     * Leveling up causes areas to be gained in the unlockedAreas ArrayList
     * @param kb The scanner passed in to use for the selection menu
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void explore(Scanner kb) throws InterruptedException {
        final int ERISIA = 1;
        final int SONGSEEKER =2;
        final int ARATEL = 3;
        final int SCYPHOZIA =4;
        final int ETERNALGALE = 5;
        final int NEWKYRSA = 6;
        System.out.println("Please select from any of your unlocked areas:");
        for (int i = 0; i < unlockedAreas.size(); i++) {
            System.out.println("\t" +(i+1) + ") " +unlockedAreas.get(i));
        }
        int choice = validateInput(kb, unlockedAreas.size());
        int factor = 0;

        if(choice == ERISIA){

            if(level< 5){
                factor = (int) (Math.random()*10)*2;
                experience += factor;
                System.out.println("You explored Lower Erisia and found items  worth " +(factor *2)+ " notes!");
                setCurrency(getCurrency() + (factor*2));

            }
            else {
                factor = (int) (Math.random()*12)*2;
                experience += factor;
                System.out.println("You explored Upper Erisia and found items  worth " +(factor *2) + " notes!");
                setCurrency(getCurrency() + (factor*2));
            }
        }
        else if (choice ==SONGSEEKER) {
            factor = (int) (Math.random()*15)*2;
            experience += factor;
            System.out.println("You explored Songseeker Wilds and found items  worth " +(factor *2)+ " notes!");
            setCurrency(getCurrency() + (factor*2));
        }
        else if (choice == ARATEL){
            factor = (int) (Math.random()*18)*2;
            experience += factor;
            System.out.println("You explored Aratel and found items  worth " +(factor *2)+ " notes!");
            setCurrency(getCurrency() + (factor*2));
        }
        else if (choice == SCYPHOZIA){
            factor = (int) (Math.random()*25)*2;
            experience += factor;
            System.out.println("You ventured into layer one of the depths and made it back safely and found items  worth " +(factor *2)+ " notes.");
            setCurrency(getCurrency() + (factor*2));
        }
        else if( choice == ETERNALGALE){
            factor = (int) (Math.random()*33)*2;
            experience += factor;
            System.out.println("You took an expedition into the harsh winds of the Eternal Gale and found items  worth " +(factor *3)+ " notes.");
            setCurrency(getCurrency() + (factor*3));
        }
        else if( choice == NEWKYRSA){
            factor = (int) (Math.random()*40)*2;
            experience += factor;
            System.out.println("You took an expedition into the sleeping city of New Kyrsa and found items and artifacts " +
                    " worth " +(factor *4)+ " notes.");
            setCurrency(getCurrency() + (factor*4));
        }
        TimeUnit.SECONDS.sleep(2);
        while(((experience / (Math.pow(level, 1.5))) >= 1) && level < 20){
            System.out.println("You leveled up from level " + level + " to level " + (level +1) + "!");
            experience =(int)( experience - (Math.pow(level, 1.5)));
            level ++;
            if(level ==20){
                System.out.println("You are level 20 and can't level up further.");
            }
        }
        if(level >=5 && unlockedAreas.size()<2){
            System.out.println("You've unlocked the Songseeker Wilds!");
            unlockedAreas.add("Songseeker Wilds");
        }
        if(level >=7 && unlockedAreas.size()<3){
            System.out.println("You've unlocked Aratel Island!");
            unlockedAreas.add("Aratel Island");
        }
        if(level >=12 && unlockedAreas.size()<4){
            System.out.println("You've unlocked the first layer of the Depths:Scyphozia");
            unlockedAreas.add("Scyphozia");
        }
        if(level >=17 && unlockedAreas.size()<5){
            System.out.println("You've unlocked the first part of the second layer of the depths: The Eternal Gale");
            unlockedAreas.add("The Eternal Gale");
        }
        if(level >=19 && unlockedAreas.size()<6){
            System.out.println("You've unlocked the second part of the second layer of the depths: New Kyrsa");
            unlockedAreas.add("New Kyrsa");
        }
        TimeUnit.SECONDS.sleep(1);



    }
}
