package JavaProjects.VideoGames;/*
Aayan Syed, Ayaan Khan
Denna
Period: 8

Functions as a Minecraft game
 */

import java.util.Scanner;
import java.util.concurrent.TimeUnit;

public class Minecraft extends VideoGame{
    private boolean isMultiplayer;
    private int blocksMined;
    private String toolTier;
    private int toolTierNum;

    /**
     * Constructor that only takes numPlayers and automatically initializes rules,
     * currency, and name. Checks for multiplayer and sets instance variables
     * to a default value.
     * @param numPlrs The number of players playing
     */
    public Minecraft(int numPlrs){
        super("Minecraft", "Welcome to Minecraft! To play, you can go mining" +
                        " to increase the blocks you have mined and also you can get" +
                        " diamonds with it. With diamonds, you can upgrade your tool tier."
                , numPlrs,0);
        if(numPlrs ==1){isMultiplayer = false;} else {isMultiplayer = true;}
        blocksMined = 0;
        toolTier = "Wooden";
        toolTierNum = 1;
    }

    @Override
    /**
     * Description Returns a string with the currency in diamonds
     * @return String with currency in diamonds
     */
    public String listCurrency(){
        return getCurrency() + " diamonds.";
    }


    /**
     * Description: Starts the game by displaying a menu of options of asking for help, listing stats,
     * mining , upgrading tools, or quitting
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void startGame() throws InterruptedException {
        final int HELP = 1;
        final int LIST = 2;
        final int MINE = 3;
        final int UPGRADE = 4;
        final int QUIT = 5;
        super.startGame();
        int choice = 0;
        Scanner kb = new Scanner(System.in);
        while(choice != QUIT){
            System.out.println("Controls :" +
                    " \n type 1 to list the information of the game presented" +
                    " at the beginning" +
                    "\n type 2 to list your stats \n type 3 to go mining \n" +
                    " type 4 to upgrade your tools \n type 5 to quit");

            choice = validateInput(kb, 5);
            if(choice == HELP){

                System.out.println(toString());

            }
            else if(choice == LIST){
                System.out.println(blocksMined + " blocks mined.\n" + toolTier +" tier tools.");
            }
            else if(choice == MINE){
                goMining();
            }
            else if(choice == UPGRADE){
                upgradeTools(kb);
            }
        }
        System.out.println("Saving Game and Exiting...\n");
        TimeUnit.SECONDS.sleep(3);
    }

    /**
     * Description: Returns a String with game information
     * @return A String listing the name, rules, multiplayer status, number of blocks mined,
     *          and diamond count.
     */
    @Override
    public String toString() {
        String m = "";
        if(isMultiplayer){m = "multiplayer";} else {m = "singleplayer";}
        return super.toString() + "\nYou are playing a session of Minecraft that is " +
                m +".\nSo far, "+ blocksMined +
                " blocks have been mined, you" +
                "are on " + toolTier +" tool tier.";
    }


    /**
     * Description: Simulate mining capability of the game. Helper method of startGame()
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void goMining() throws InterruptedException {
        boolean inCave = false;
        double rand = Math.random();
        if(rand>.6) inCave = true;
        int mined = 0;
        if(inCave) {
            System.out.println("You found a cave to mine in!");
            mined = (int)(Math.random()*256*toolTierNum);
        }
        if(!inCave){
            System.out.println("You didn't find any cave to mine in, instead deciding to just stripmine underground.");
            mined = (int)(Math.random()*128*toolTierNum);
        }
        TimeUnit.SECONDS.sleep(1);
        int minedDiamonds = mined /((int) (Math.random()*15)+15);
        System.out.println("Congratulations! You mined " + mined + " blocks and mined " + minedDiamonds + " diamonds.");
        TimeUnit.SECONDS.sleep(1);
        blocksMined += mined;
        setCurrency(getCurrency() + minedDiamonds);

    }

    /**
     * Description: Simulates tools upgrading capability of the game based on in-game
     *              currency and stats. Helper method of startGame()
     * @throws InterruptedException This is due to using sleep() to delay code execution
     */
    public void upgradeTools(Scanner kb) throws InterruptedException {
        String nextTier = "";
        if(toolTierNum == 1){
            nextTier = "Stone";
        } else if (toolTierNum ==2) {
            nextTier = "Iron";
        } else if (toolTierNum == 3) {
            nextTier = "Diamond";
        } else if (toolTierNum ==4) {
            nextTier = "Netherite";
        }

        System.out.println("Welcome to the upgrade shop! Your current tier is " +toolTier + ".");
        if(toolTier.equals("Netherite")){
            System.out.println(" You already have the highest tier tools! You can't upgrade further.");

        }
        else if(getCurrency() >= (toolTierNum*30)){
            System.out.println("To upgrade to " + nextTier + " you need" + (toolTierNum*30) + " diamonds. You currently have " + listCurrency()
            + " You have enough to upgrade. Would you like to upgrade? (y/n)");
            String choice =  "";

            while (!(choice.equals("Y") || choice.equals("N"))){
                try {
                    choice = kb.next().toUpperCase();
                    if(!(choice.equals("Y") || choice.equals("N"))){
                        System.out.println("Reply with the letter y or n.");
                    }

                } catch (Exception e) {
                    System.out.println("Reply with the letter y or n.");
                    kb.nextLine();
                }
            }
            if(choice.equals("Y")){
                System.out.println("You have upgraded from " + toolTier + " tier to " + nextTier + " tier!" );
                toolTier = nextTier;
                toolTierNum ++;
                setCurrency(getCurrency() -(toolTierNum*30));
            }

        }
        else {
            System.out.println("To upgrade to " + nextTier + " you need" + (toolTierNum*30) + " diamonds. You currently have " + listCurrency()
                    + " You do not have enough to upgrade. Please come again when you do.");

        }
        System.out.println("Now exiting shop...");
        TimeUnit.SECONDS.sleep(1);

    }



}
