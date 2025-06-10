package JavaProjects.TicketMasterProject;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Scanner;

/**
 *
 */

public class TicketMasterDriver {
    private static final int SORT_A_Z = 1;
    private static final int SORT_Z_A = 2;
    private static final int PRICE_LOW_HIGH = 3;
    private static final int PRICE_HIGH_LOW = 4;
    private static final int CITY_SEARCH = 5;
    private static final int QUIT = 6;
    private static boolean runtime = true;
    private static Scanner kb;

    public static void main(String[] args) throws FileNotFoundException {
        kb = new Scanner(System.in);
        TicketMaster site = new TicketMaster();
        System.out.println("WELCOME TO TICKETMASTER!!!");
        site.printMenu();
        loopMenu();
    }


    /**
     *
     * Description: Handles all logic; loops each time an option is selected and displays appropriate output
     *
     * @throws FileNotFoundException
     */
    public static void loopMenu() throws FileNotFoundException{
        TicketMaster site = new TicketMaster();
        while(runtime){
            try{
                int input = kb.nextInt();
                if (input == SORT_A_Z){
                    ArrayList<Show> results = site.alphaSort();
                    site.formatter();
                    for (Show show : results){
                        System.out.print(show);
                    }
                    site.printMenu();
                }
                else if (input == SORT_Z_A){
                    ArrayList<Show> results = site.alphaSortReverse();
                    site.formatter();
                    for (Show show : results){
                        System.out.print(show);
                    }
                    site.printMenu();
                }
                else if (input == PRICE_LOW_HIGH){
                    ArrayList<Show> results = site.priceLowHigh();
                    site.formatter();
                    for (Show show : results){
                        System.out.print(show);
                    }
                    site.printMenu();
                }
                else if (input == PRICE_HIGH_LOW){
                    ArrayList<Show> results = site.priceHighLow();
                    site.formatter();
                    for (Show show : results){
                        System.out.print(show);
                    }
                    site.printMenu();
                }
                else if (input == CITY_SEARCH){
                    kb.nextLine();
                    System.out.println("Enter a city to search for:");
                    try {
                        String city = kb.nextLine();
                        ArrayList<Show> results = site.citySearch(city);
                        if (results.isEmpty()){
                            System.out.println("There are no shows available in that city. Please try again.");
                            site.printMenu();
                        }
                        else{
                            site.formatter();
                            for (Show show : results){
                                System.out.print(show);
                            }
                            site.printMenu();
                        }
                    }
                    catch (Exception e){
                        System.out.println("An error occurred. Please try again");
                    }
                }
                else if (input == QUIT) runtime = false;
                else {
                    System.out.println("Please enter a NUMBER from 1 - 6");
                    kb.nextLine();
                }
            }
            catch (Exception e){
                System.out.println("Please enter a INTEGER from 1 - 6");
                kb.nextLine();
            }
        };
    }
}
